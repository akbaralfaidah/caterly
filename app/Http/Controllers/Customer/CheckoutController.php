<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CapacityReservation;
use App\Models\Cart;
use App\Models\CustomerAddress;
use App\Models\Invoice;
use App\Models\MerchantDateCapacity;
use App\Models\MerchantOperatingDay;
use App\Models\MerchantProfile;
use App\Models\MerchantServiceArea;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusEvent;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class CheckoutController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'address_id' => ['required', 'integer', 'exists:customer_addresses,id'],
            'notes' => ['nullable', 'string', 'max:500'],
            'checkout_token' => ['required', 'uuid'],
        ]);

        $customerId = (int) $request->user()->id;
        $fingerprint = hash('sha256', $validated['address_id'].'|'.trim((string) ($validated['notes'] ?? '')));

        $existingOrder = Order::query()
            ->where('customer_id', $customerId)
            ->where('idempotency_key', $validated['checkout_token'])
            ->first();

        if ($existingOrder) {
            if (! hash_equals((string) $existingOrder->request_fingerprint, $fingerprint)) {
                return back()->with('error', 'Token checkout sudah digunakan untuk permintaan yang berbeda.');
            }

            return redirect()->route('customer.orders.show', $existingOrder)
                ->with('success', 'Pesanan sebelumnya berhasil ditemukan.');
        }

        try {
            $order = DB::transaction(function () use ($customerId, $fingerprint, $request, $validated): Order {
                $cart = Cart::query()
                    ->where('customer_id', $customerId)
                    ->lockForUpdate()
                    ->first();

                if (! $cart) {
                    $completedOrder = Order::query()
                        ->where('customer_id', $customerId)
                        ->where('idempotency_key', $validated['checkout_token'])
                        ->first();

                    if ($completedOrder && hash_equals((string) $completedOrder->request_fingerprint, $fingerprint)) {
                        return $completedOrder;
                    }

                    throw new DomainException('Keranjang Anda kosong.');
                }

                $cart->load(['merchant', 'region']);
                $cart->setRelation(
                    'items',
                    $cart->items()->with('menu.category')->lockForUpdate()->get(),
                );

                if ($cart->items->isEmpty()) {
                    throw new DomainException('Keranjang Anda kosong.');
                }

                $address = CustomerAddress::query()
                    ->where('customer_id', $customerId)
                    ->with('region')
                    ->lockForUpdate()
                    ->find($validated['address_id']);

                if (! $address) {
                    throw new DomainException('Alamat pengiriman tidak valid.');
                }

                $merchantProfile = MerchantProfile::query()
                    ->where('user_id', $cart->merchant_id)
                    ->first();

                if (! $merchantProfile?->isPublished()) {
                    throw new DomainException('Katering sedang tidak menerima pesanan.');
                }

                $deliveryDate = $cart->delivery_date?->copy()->startOfDay();
                if (! $deliveryDate || ! $deliveryDate->isAfter(today()) || $deliveryDate->isAfter(today()->addDays(30))) {
                    throw new DomainException('Tanggal pengiriman harus antara besok dan 30 hari ke depan.');
                }

                $isOperating = MerchantOperatingDay::query()
                    ->where('merchant_id', $cart->merchant_id)
                    ->where('weekday', $deliveryDate->dayOfWeek)
                    ->where('is_open', true)
                    ->exists();

                if (! $isOperating) {
                    throw new DomainException('Katering tidak beroperasi pada tanggal tersebut.');
                }

                $serviceArea = MerchantServiceArea::query()
                    ->where('merchant_id', $cart->merchant_id)
                    ->where('region_id', $address->region_id)
                    ->first();

                if (! $serviceArea) {
                    throw new DomainException('Katering tidak melayani area alamat yang dipilih.');
                }

                $totalPortions = (int) $cart->items->sum('quantity');
                if ($totalPortions < $merchantProfile->minimum_portions) {
                    throw new DomainException("Pesanan minimal {$merchantProfile->minimum_portions} porsi.");
                }

                foreach ($cart->items as $item) {
                    if (! $item->menu || ! $item->menu->is_active || $item->menu->merchant_id !== $cart->merchant_id) {
                        throw new DomainException('Salah satu menu sudah tidak tersedia.');
                    }
                }

                $capacityRecord = MerchantDateCapacity::query()->firstOrCreate(
                    [
                        'merchant_id' => $cart->merchant_id,
                        'delivery_date' => $deliveryDate,
                    ],
                    [
                        'capacity' => $merchantProfile->default_daily_capacity,
                        'reserved_portions' => 0,
                        'is_closed' => false,
                        'is_override' => false,
                    ],
                );

                $capacity = MerchantDateCapacity::query()->lockForUpdate()->findOrFail($capacityRecord->id);
                if ($capacity->is_closed) {
                    throw new DomainException('Tanggal pengiriman telah ditutup oleh katering.');
                }

                if ($totalPortions > $capacity->remainingCapacity()) {
                    throw new DomainException("Kapasitas tersisa {$capacity->remainingCapacity()} porsi.");
                }

                $subtotal = (int) $cart->items->sum(
                    fn ($item): int => $item->quantity * $item->menu->price_idr,
                );
                $expiresAt = now()->addHours(2);

                $order = Order::query()->create([
                    'order_number' => $this->uniqueNumber('CTR'),
                    'customer_id' => $customerId,
                    'merchant_id' => $cart->merchant_id,
                    'region_id' => $address->region_id,
                    'delivery_date' => $deliveryDate,
                    'delivery_slot' => '11:00-12:00 WIB',
                    'order_status' => 'pending_confirmation',
                    'payment_status' => 'unpaid',
                    'total_portions' => $totalPortions,
                    'subtotal_idr' => $subtotal,
                    'delivery_fee_idr' => $serviceArea->delivery_fee,
                    'total_idr' => $subtotal + $serviceArea->delivery_fee,
                    'expires_at' => $expiresAt,
                    'notes' => $validated['notes'] ?? null,
                    'customer_snapshot' => [
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'phone' => $request->user()->phone,
                        'company_name' => $request->user()->company_name,
                    ],
                    'merchant_snapshot' => [
                        'name' => $merchantProfile->company_name,
                        'company_name' => $merchantProfile->company_name,
                        'phone' => $merchantProfile->phone,
                        'address' => $merchantProfile->address,
                    ],
                    'address_snapshot' => [
                        'label' => $address->label,
                        'receiver' => $address->receiver,
                        'phone' => $address->phone,
                        'address' => $address->address,
                        'region' => $address->region?->city_name,
                        'notes' => $address->notes,
                    ],
                    'bank_snapshot' => [
                        'bank_name' => $merchantProfile->bank_name,
                        'bank_account_name' => $merchantProfile->bank_account_name,
                        'bank_account_number' => $merchantProfile->bank_account_number,
                    ],
                    'idempotency_key' => $validated['checkout_token'],
                    'request_fingerprint' => $fingerprint,
                ]);

                foreach ($cart->items as $item) {
                    OrderItem::query()->create([
                        'order_id' => $order->id,
                        'menu_id' => $item->menu_id,
                        'menu_name_snapshot' => $item->menu->name,
                        'category_snapshot' => $item->menu->category?->name,
                        'unit_price_idr' => $item->menu->price_idr,
                        'quantity' => $item->quantity,
                        'line_total_idr' => $item->menu->price_idr * $item->quantity,
                    ]);
                }

                $capacity->increment('reserved_portions', $totalPortions);

                CapacityReservation::query()->create([
                    'order_id' => $order->id,
                    'capacity_date_id' => $capacity->id,
                    'portions' => $totalPortions,
                ]);

                Invoice::query()->create([
                    'order_id' => $order->id,
                    'invoice_number' => $this->uniqueNumber('INV'),
                    'issued_at' => now(),
                    'status' => 'issued',
                ]);

                OrderStatusEvent::query()->create([
                    'order_id' => $order->id,
                    'from_status' => null,
                    'to_status' => 'pending_confirmation',
                    'actor_id' => $customerId,
                    'reason' => 'Pesanan baru dibuat.',
                    'event_key' => "order:{$order->id}:status:pending_confirmation",
                ]);

                Notification::query()->create([
                    'user_id' => $order->merchant_id,
                    'type' => 'new_order',
                    'title' => 'Pesanan baru',
                    'message' => "Pesanan {$order->order_number} menunggu konfirmasi.",
                    'resource_type' => 'order',
                    'resource_id' => $order->id,
                    'event_key' => "order:{$order->id}:created:merchant",
                ]);

                $cart->delete();

                return $order;
            }, 3);
        } catch (DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'Checkout gagal diproses. Silakan coba lagi.');
        }

        return redirect()->route('customer.orders.show', $order)
            ->with('success', 'Pesanan berhasil dibuat dan menunggu konfirmasi katering.');
    }

    private function uniqueNumber(string $prefix): string
    {
        do {
            $number = $prefix.'-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (
            $prefix === 'INV'
                ? Invoice::query()->where('invoice_number', $number)->exists()
                : Order::query()->where('order_number', $number)->exists()
        );

        return $number;
    }
}
