<?php

namespace Tests\Feature;

use App\Models\MerchantDateCapacity;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MerchantCapacityTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_capacity_page_matches_reserved_portions_to_the_local_delivery_date(): void
    {
        $this->travelTo(Carbon::parse('2026-09-13 10:00:00', 'Asia/Jakarta'));
        $this->seed();
        $merchant = User::query()->where('email', 'angsoduo@caterly.test')->firstOrFail();
        MerchantDateCapacity::query()
            ->where('merchant_id', $merchant->id)
            ->whereDate('delivery_date', '2026-09-14')
            ->update(['reserved_portions' => 50]);

        $response = $this->actingAs($merchant)->get('/merchant/capacity');

        $response->assertInertia(fn (Assert $page): Assert => $page
            ->component('Merchant/Capacity')
            ->where('calendar_start_date', '2026-09-13')
            ->where('capacities.0.delivery_date', '2026-09-14')
            ->where('capacities.0.reserved_portions', 50)
            ->where('capacities.0.capacity', 220)
            ->etc());
    }
}
