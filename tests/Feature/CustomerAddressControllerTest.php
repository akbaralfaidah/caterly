<?php

namespace Tests\Feature;

use App\Models\CustomerAddress;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class CustomerAddressControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_selecting_the_current_default_address_keeps_it_as_default(): void
    {
        $this->seed();
        $customer = User::query()->where('email', 'nadia@caterly.test')->firstOrFail();
        $address = CustomerAddress::query()
            ->where('customer_id', $customer->id)
            ->where('is_default', true)
            ->firstOrFail();

        $this->actingAs($customer)
            ->post(route('customer.addresses.default', $address))
            ->assertSessionHas('success', 'Alamat utama berhasil diubah.');

        $this->assertDatabaseHas('customer_addresses', [
            'id' => $address->id,
            'is_default' => true,
        ]);
        $this->assertSame(1, CustomerAddress::query()
            ->where('customer_id', $customer->id)
            ->where('is_default', true)
            ->count());
    }

    public function test_customer_cannot_delete_their_last_company_address(): void
    {
        $this->seed();
        $customer = User::query()->where('email', 'maya@caterly.test')->firstOrFail();
        $address = CustomerAddress::query()
            ->where('customer_id', $customer->id)
            ->sole();

        $this->actingAs($customer)
            ->delete(route('customer.addresses.destroy', $address))
            ->assertSessionHas('error', 'Perusahaan wajib memiliki minimal satu alamat pengiriman.');

        $this->assertModelExists($address);
    }

    public function test_customer_without_an_address_is_sent_to_address_onboarding_after_login(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
            'company_name' => 'PT Alamat Wajib',
            'phone' => '081234567890',
        ]);

        $this->post('/login', [
            'email' => $customer->email,
            'password' => 'password',
        ])->assertRedirectToRoute('customer.profile')
            ->assertSessionHas('error', 'Tambahkan alamat perusahaan terlebih dahulu agar katering di area Anda dapat ditampilkan.');
    }
}
