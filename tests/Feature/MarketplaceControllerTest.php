<?php

namespace Tests\Feature;

use App\Models\CustomerProfile;
use App\Models\MerchantProfile;
use App\Models\Region;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MarketplaceControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_marketplace_renders_published_merchants_without_relation_type_error(): void
    {
        $this->seed();

        $this->get('/marketplace')->assertOk();
    }

    public function test_marketplace_allows_same_day_delivery_after_four_pm(): void
    {
        $this->travelTo(Carbon::parse('2026-09-15 20:00:00', 'Asia/Jakarta'));
        $this->seed();
        $region = Region::query()->where('code', 'JAMBI')->firstOrFail();

        $response = $this->get("/marketplace?region_id={$region->id}&delivery_date=2026-09-15&portions=10");

        $response->assertInertia(fn (Assert $page): Assert => $page
            ->component('Marketplace/Index')
            ->where('merchants.data.0.availability.available', true)
            ->etc());
    }

    public function test_customer_marketplace_only_lists_merchants_for_the_default_company_address(): void
    {
        $this->seed();
        $customer = User::query()->where('email', 'faza@caterly.test')->firstOrFail();
        $jambi = Region::query()->where('code', 'JAMBI')->firstOrFail();

        $response = $this->actingAs($customer)->get('/marketplace');

        $response->assertInertia(fn (Assert $page): Assert => $page
            ->component('Marketplace/Index')
            ->where('requires_address', false)
            ->where('filters.region_id', $jambi->id)
            ->where('merchants.total', 4)
            ->has('merchants.data', 4)
            ->etc());
    }

    public function test_customer_cannot_filter_marketplace_to_a_region_without_a_company_address(): void
    {
        $this->seed();
        $customer = User::query()->where('email', 'faza@caterly.test')->firstOrFail();
        $jambi = Region::query()->where('code', 'JAMBI')->firstOrFail();
        $jakarta = Region::query()->where('code', 'JAKPUS')->firstOrFail();

        $response = $this->actingAs($customer)->get("/marketplace?region_id={$jakarta->id}");

        $response->assertInertia(fn (Assert $page): Assert => $page
            ->where('filters.region_id', $jambi->id)
            ->where('merchants.total', 4)
            ->etc());
    }

    public function test_customer_without_an_address_sees_onboarding_instead_of_merchants(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
            'company_name' => 'PT Tanpa Alamat',
            'phone' => '081234567800',
        ]);
        CustomerProfile::query()->create([
            'user_id' => $customer->id,
            'company_name' => $customer->company_name,
            'pic_name' => $customer->name,
            'phone' => $customer->phone,
        ]);

        $response = $this->actingAs($customer)->get('/marketplace');

        $response->assertInertia(fn (Assert $page): Assert => $page
            ->where('requires_address', true)
            ->where('merchants.total', 0)
            ->has('regions', 0)
            ->etc());
    }

    public function test_customer_is_redirected_from_a_merchant_outside_their_address_region(): void
    {
        $this->seed();
        $customer = User::query()->where('email', 'faza@caterly.test')->firstOrFail();
        $jambi = Region::query()->where('code', 'JAMBI')->firstOrFail();
        $jakartaMerchant = MerchantProfile::query()->where('company_name', 'Dapur Menteng')->firstOrFail();

        $response = $this->actingAs($customer)->get("/marketplace/{$jakartaMerchant->user_id}?region_id={$jambi->id}");

        $response
            ->assertRedirectToRoute('marketplace.index', ['region_id' => $jambi->id])
            ->assertSessionHas('error', 'Katering tersebut tidak melayani area alamat perusahaan yang dipilih.');
    }
}
