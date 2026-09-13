<?php

namespace Tests\Feature;

use App\Models\MerchantProfile;
use App\Models\MerchantServiceArea;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DemoAccountsSeederTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_demo_accounts_have_complete_profiles_addresses_menus_and_regional_distribution(): void
    {
        $this->seed();

        $this->assertSame(15, User::query()->where('role', 'merchant')->count());
        $this->assertSame(5, User::query()->where('role', 'customer')->count());
        $this->assertSame(15, MerchantProfile::query()
            ->where('publication_status', 'published')
            ->whereNotNull('address')
            ->whereNotNull('phone')
            ->whereNotNull('description')
            ->whereNotNull('bank_name')
            ->whereNotNull('bank_account_name')
            ->whereNotNull('bank_account_number')
            ->count());

        $merchantProfiles = MerchantProfile::query()->withCount('menus')->get();
        $this->assertTrue($merchantProfiles->every(fn (MerchantProfile $profile): bool => $profile->menus_count >= 5));

        $customers = User::query()->where('role', 'customer')->with('customerProfile', 'customerAddresses')->get();
        $this->assertTrue($customers->every(
            fn (User $customer): bool => $customer->customerProfile !== null
                && $customer->customerAddresses->isNotEmpty()
                && $customer->customerAddresses->contains('is_default', true),
        ));

        $distribution = MerchantServiceArea::query()
            ->join('regions', 'regions.id', '=', 'merchant_service_areas.region_id')
            ->selectRaw('regions.code, COUNT(DISTINCT merchant_service_areas.merchant_id) as total')
            ->groupBy('regions.code')
            ->orderBy('regions.code')
            ->pluck('total', 'code')
            ->map(fn ($total): int => (int) $total)
            ->all();

        $this->assertSame([
            'BDGKOTA' => 4,
            'JAKPUS' => 2,
            'JAKSEL' => 2,
            'JAMBI' => 4,
            'SBYKT' => 3,
        ], $distribution);

        $this->assertTrue(Hash::check(
            'CaterlyDemo123!',
            User::query()->where('email', 'faza@caterly.test')->value('password'),
        ));
    }
}
