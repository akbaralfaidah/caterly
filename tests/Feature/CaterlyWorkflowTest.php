<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomerAddress;
use App\Models\Invoice;
use App\Models\Menu;
use App\Models\MerchantDateCapacity;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CaterlyWorkflowTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_role_middleware_forbids_access_to_the_other_role_area(): void
    {
        $this->seed();
        $customer = User::query()->where('email', 'nadia@caterly.test')->firstOrFail();
        $merchant = User::query()->where('email', 'dapur@caterly.test')->firstOrFail();

        $this->actingAs($customer)->get('/merchant/dashboard')->assertForbidden();
        $this->actingAs($merchant)->get('/customer/cart')->assertForbidden();
    }

    public function test_checkout_atomically_creates_complete_order_records(): void
    {
        [$customer, $merchant, $address, $capacity] = $this->arrangeCart();

        $response = $this->actingAs($customer)->post('/customer/checkout', [
            'address_id' => $address->id,
            'notes' => 'Hubungi PIC saat tiba.',
            'checkout_token' => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        ]);

        $order = Order::query()->sole();
        $response->assertRedirectToRoute('customer.orders.show', $order);
        $this->assertSame($customer->id, $order->customer_id);
        $this->assertSame($merchant->id, $order->merchant_id);
        $this->assertSame(10, $order->total_portions);
        $this->assertSame(305000, $order->total_idr);
        $this->assertDatabaseHas('capacity_reservations', ['order_id' => $order->id, 'portions' => 10, 'released_at' => null]);
        $this->assertDatabaseHas('invoices', ['order_id' => $order->id, 'status' => 'issued']);
        $this->assertDatabaseHas('order_status_events', ['order_id' => $order->id, 'to_status' => 'pending_confirmation']);
        $this->assertDatabaseHas('app_notifications', ['user_id' => $merchant->id, 'resource_id' => $order->id]);
        $this->assertDatabaseMissing('carts', ['customer_id' => $customer->id]);
        $this->assertSame(10, $capacity->refresh()->reserved_portions);
    }

    public function test_checkout_rolls_back_when_capacity_is_insufficient(): void
    {
        [$customer, , $address, $capacity] = $this->arrangeCart();
        $capacity->update(['capacity' => 5]);

        $response = $this->actingAs($customer)->from('/customer/cart')->post('/customer/checkout', [
            'address_id' => $address->id,
            'checkout_token' => 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        ]);

        $response->assertRedirect('/customer/cart')->assertSessionHas('error', 'Kapasitas tersisa 5 porsi.');
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('invoices', 0);
        $this->assertDatabaseCount('capacity_reservations', 0);
        $this->assertDatabaseHas('carts', ['customer_id' => $customer->id]);
        $this->assertSame(0, $capacity->refresh()->reserved_portions);
    }

    public function test_customer_cancellation_releases_capacity_once_and_voids_invoice(): void
    {
        [$customer, , $address, $capacity] = $this->arrangeCart();
        $this->actingAs($customer)->post('/customer/checkout', [
            'address_id' => $address->id,
            'checkout_token' => 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        ]);
        $order = Order::query()->sole();

        $this->actingAs($customer)->post("/customer/orders/{$order->id}/cancel")->assertSessionHas('success');
        $this->actingAs($customer)->post("/customer/orders/{$order->id}/cancel")->assertSessionHas('error');

        $this->assertSame('cancelled', $order->refresh()->order_status);
        $this->assertSame(0, $capacity->refresh()->reserved_portions);
        $this->assertNotNull($order->capacityReservation->released_at);
        $this->assertSame('void', Invoice::query()->where('order_id', $order->id)->value('status'));
        $this->assertDatabaseCount('order_status_events', 2);
    }

    public function test_payment_proof_pdf_can_be_approved_by_the_order_merchant(): void
    {
        Storage::fake('local');
        [$customer, $merchant, $address] = $this->arrangeCart();
        $this->actingAs($customer)->post('/customer/checkout', [
            'address_id' => $address->id,
            'checkout_token' => 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        ]);
        $order = Order::query()->sole();
        $this->actingAs($merchant)->post("/merchant/orders/{$order->id}/accept")->assertSessionHas('success');

        $this->actingAs($customer)->post("/customer/orders/{$order->id}/payment", [
            'proof' => UploadedFile::fake()->create('transfer.pdf', 100, 'application/pdf'),
        ])->assertSessionHas('success');

        $proof = PaymentProof::query()->sole();
        Storage::disk('local')->assertExists($proof->storage_path);
        $this->assertSame('pending_review', $order->refresh()->payment_status);
        $this->assertSame($customer->id, $proof->submitted_by);

        $this->actingAs($merchant)->post("/merchant/orders/{$order->id}/payment/approve")
            ->assertSessionHas('success');

        $this->assertSame('paid', $order->refresh()->payment_status);
        $this->assertSame('approved', $proof->refresh()->status);
        $this->assertSame($merchant->id, $proof->reviewed_by);
        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $customer->id,
            'event_key' => "order:{$order->id}:payment:approved:{$proof->id}",
        ]);
    }

    public function test_expiration_job_releases_capacity_and_voids_invoice(): void
    {
        [$customer, , $address, $capacity] = $this->arrangeCart();
        $this->actingAs($customer)->post('/customer/checkout', [
            'address_id' => $address->id,
            'checkout_token' => 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        ]);
        $order = Order::query()->sole();
        $this->travel(3)->hours();

        $this->artisan('orders:expire')
            ->expectsOutput('Berhasil mengakhiri 1 pesanan kedaluwarsa.')
            ->assertSuccessful();

        $this->assertSame('expired', $order->refresh()->order_status);
        $this->assertSame(0, $capacity->refresh()->reserved_portions);
        $this->assertSame('void', $order->invoice->status);
    }

    /**
     * @return array{User, User, CustomerAddress, MerchantDateCapacity}
     */
    private function arrangeCart(): array
    {
        $this->travelTo(Carbon::parse('2026-09-14 10:00:00', 'Asia/Jakarta'));
        $this->seed();

        $customer = User::query()->where('email', 'nadia@caterly.test')->firstOrFail();
        $merchant = User::query()->where('email', 'dapur@caterly.test')->firstOrFail();
        $address = CustomerAddress::query()->where('customer_id', $customer->id)->firstOrFail();
        $menu = Menu::query()->where('merchant_id', $merchant->id)->orderBy('id')->firstOrFail();
        $capacity = MerchantDateCapacity::query()
            ->where('merchant_id', $merchant->id)
            ->whereDate('delivery_date', '2026-09-16')
            ->firstOrFail();
        $cart = Cart::query()->create([
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'delivery_date' => '2026-09-16',
            'region_id' => $address->region_id,
        ]);
        CartItem::query()->create(['cart_id' => $cart->id, 'menu_id' => $menu->id, 'quantity' => 10]);

        return [$customer, $merchant, $address, $capacity];
    }
}
