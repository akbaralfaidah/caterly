<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CustomerAddress;
use App\Models\CustomerProfile;
use App\Models\Menu;
use App\Models\MerchantDateCapacity;
use App\Models\MerchantOperatingDay;
use App\Models\MerchantProfile;
use App\Models\MerchantServiceArea;
use App\Models\Region;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Regions
        $regions = [
            ['code' => 'JAMBI', 'city_name' => 'Kota Jambi', 'province_name' => 'Jambi'],
            ['code' => 'JAKPUS', 'city_name' => 'Jakarta Pusat', 'province_name' => 'DKI Jakarta'],
            ['code' => 'JAKSEL', 'city_name' => 'Jakarta Selatan', 'province_name' => 'DKI Jakarta'],
            ['code' => 'BDGKOTA', 'city_name' => 'Kota Bandung', 'province_name' => 'Jawa Barat'],
            ['code' => 'SBYKT', 'city_name' => 'Kota Surabaya', 'province_name' => 'Jawa Timur'],
        ];
        foreach ($regions as $r) {
            Region::create($r);
        }

        // Categories
        $categories = [
            ['name' => 'Nasi Box', 'slug' => 'nasi-box'],
            ['name' => 'Menu Nusantara', 'slug' => 'menu-nusantara'],
            ['name' => 'Vegetarian', 'slug' => 'vegetarian'],
            ['name' => 'Snack Box', 'slug' => 'snack-box'],
            ['name' => 'Prasmanan', 'slug' => 'prasmanan'],
        ];
        foreach ($categories as $c) {
            Category::create($c);
        }

        // ===== Merchant 1: Dapur Selaras =====
        $merchant1 = User::create([
            'name' => 'Dapur Selaras',
            'email' => 'dapur@caterly.test',
            'password' => Hash::make('password1234'),
            'role' => 'merchant',
            'company_name' => 'Dapur Selaras',
            'phone' => '081234567890',
        ]);

        MerchantProfile::create([
            'user_id' => $merchant1->id,
            'company_name' => 'Dapur Selaras',
            'address' => 'Jl. Sultan Thaha No. 42, Kota Jambi',
            'phone' => '081234567890',
            'description' => 'Katering makan siang untuk kantor dengan menu masakan Nusantara segar setiap hari. Kami menggunakan bahan-bahan berkualitas dan bumbu pilihan.',
            'publication_status' => 'published',
            'minimum_portions' => 10,
            'default_daily_capacity' => 100,
            'bank_name' => 'Bank Demo',
            'bank_account_name' => 'CV Dapur Selaras',
            'bank_account_number' => '1234567890 (DEMO)',
        ]);

        $jambiRegion = Region::where('code', 'JAMBI')->first();
        MerchantServiceArea::create([
            'merchant_id' => $merchant1->id,
            'region_id' => $jambiRegion->id,
            'delivery_fee' => 25000,
        ]);

        // Operating days (Mon-Fri)
        for ($d = 1; $d <= 5; $d++) {
            MerchantOperatingDay::create([
                'merchant_id' => $merchant1->id,
                'weekday' => $d,
                'is_open' => true,
            ]);
        }
        // Weekend closed
        foreach ([0, 6] as $d) {
            MerchantOperatingDay::create([
                'merchant_id' => $merchant1->id,
                'weekday' => $d,
                'is_open' => false,
            ]);
        }

        // Capacity for next 14 days (business days)
        $today = now()->addDay();
        for ($i = 0; $i < 14; $i++) {
            $date = $today->copy()->addDays($i);
            $dow = $date->dayOfWeek;
            if ($dow == 0 || $dow == 6) {
                continue;
            }
            MerchantDateCapacity::create([
                'merchant_id' => $merchant1->id,
                'delivery_date' => $date->toDateString(),
                'capacity' => 100,
                'reserved_portions' => 0,
                'is_closed' => false,
                'is_override' => false,
            ]);
        }

        // Menus for Dapur Selaras
        $nasiBox = Category::where('slug', 'nasi-box')->first();
        $nusantara = Category::where('slug', 'menu-nusantara')->first();

        Menu::create([
            'merchant_id' => $merchant1->id,
            'category_id' => $nasiBox->id,
            'name' => 'Nasi Ayam Bakar',
            'description' => 'Nasi putih hangat disajikan dengan ayam bakar kecap manis, lalapan segar, sambal terasi, dan kerupuk udang.',
            'price_idr' => 28000,
            'is_active' => true,
        ]);

        Menu::create([
            'merchant_id' => $merchant1->id,
            'category_id' => $nusantara->id,
            'name' => 'Nasi Ikan Sambal',
            'description' => 'Nasi putih dengan ikan dori goreng tepung, sambal balado merah, sayur tumis buncis, dan bakwan jagung.',
            'price_idr' => 30000,
            'is_active' => true,
        ]);

        Menu::create([
            'merchant_id' => $merchant1->id,
            'category_id' => $nasiBox->id,
            'name' => 'Nasi Rendang Sapi',
            'description' => 'Nasi putih dengan rendang sapi empuk, sayur nangka, telur balado, dan kerupuk.',
            'price_idr' => 35000,
            'is_active' => true,
        ]);

        Menu::create([
            'merchant_id' => $merchant1->id,
            'category_id' => $nusantara->id,
            'name' => 'Nasi Uduk Komplit',
            'description' => 'Nasi uduk harum disajikan dengan empal sapi, telur rawis, perkedel kentang, sambal kacang, dan kerupuk.',
            'price_idr' => 32000,
            'is_active' => true,
        ]);

        // ===== Merchant 2: Sajian Ibu =====
        $merchant2 = User::create([
            'name' => 'Sajian Ibu',
            'email' => 'sajian@caterly.test',
            'password' => Hash::make('password1234'),
            'role' => 'merchant',
            'company_name' => 'Sajian Ibu',
            'phone' => '082345678901',
        ]);

        MerchantProfile::create([
            'user_id' => $merchant2->id,
            'company_name' => 'Sajian Ibu',
            'address' => 'Jl. Kapten Pattimura No. 15, Kota Jambi',
            'phone' => '082345678901',
            'description' => 'Masakan rumahan khas ibu dengan cita rasa otentik. Porsi mengenyangkan dengan harga terjangkau.',
            'publication_status' => 'published',
            'minimum_portions' => 15,
            'default_daily_capacity' => 80,
            'bank_name' => 'Bank Demo',
            'bank_account_name' => 'UD Sajian Ibu',
            'bank_account_number' => '0987654321 (DEMO)',
        ]);

        MerchantServiceArea::create([
            'merchant_id' => $merchant2->id,
            'region_id' => $jambiRegion->id,
            'delivery_fee' => 20000,
        ]);

        for ($d = 1; $d <= 5; $d++) {
            MerchantOperatingDay::create([
                'merchant_id' => $merchant2->id,
                'weekday' => $d,
                'is_open' => true,
            ]);
        }
        foreach ([0, 6] as $d) {
            MerchantOperatingDay::create([
                'merchant_id' => $merchant2->id,
                'weekday' => $d,
                'is_open' => false,
            ]);
        }

        for ($i = 0; $i < 14; $i++) {
            $date = $today->copy()->addDays($i);
            $dow = $date->dayOfWeek;
            if ($dow == 0 || $dow == 6) {
                continue;
            }
            MerchantDateCapacity::create([
                'merchant_id' => $merchant2->id,
                'delivery_date' => $date->toDateString(),
                'capacity' => 80,
                'reserved_portions' => 0,
                'is_closed' => false,
                'is_override' => false,
            ]);
        }

        Menu::create([
            'merchant_id' => $merchant2->id,
            'category_id' => $nasiBox->id,
            'name' => 'Nasi Gudeg Yogya',
            'description' => 'Nasi dengan gudeg nangka muda, telur pindang, krecek, dan sambal goreng kering.',
            'price_idr' => 27000,
            'is_active' => true,
        ]);

        Menu::create([
            'merchant_id' => $merchant2->id,
            'category_id' => $nusantara->id,
            'name' => 'Nasi Pecel Lele',
            'description' => 'Lele goreng garing dengan nasi hangat, sambal lalapan, dan lauk tempe penyet.',
            'price_idr' => 25000,
            'is_active' => true,
        ]);

        // ===== Customer 1: PT Sinar Karya =====
        $customer1 = User::create([
            'name' => 'Nadia',
            'email' => 'nadia@caterly.test',
            'password' => Hash::make('password1234'),
            'role' => 'customer',
            'company_name' => 'PT Sinar Karya',
            'phone' => '081122334455',
        ]);

        CustomerProfile::create([
            'user_id' => $customer1->id,
            'company_name' => 'PT Sinar Karya',
            'pic_name' => 'Nadia',
            'phone' => '081122334455',
        ]);

        CustomerAddress::create([
            'customer_id' => $customer1->id,
            'region_id' => $jambiRegion->id,
            'label' => 'Kantor Pusat',
            'receiver' => 'Nadia',
            'phone' => '081122334455',
            'address' => 'Jl. Jenderal Sudirman No. 100, Lantai 3, Kota Jambi',
            'notes' => 'Masuk dari lobby utama, lift ke lantai 3',
            'is_default' => true,
        ]);

        // ===== Customer 2: CV Maju Bersama =====
        $customer2 = User::create([
            'name' => 'Budi',
            'email' => 'budi@caterly.test',
            'password' => Hash::make('password1234'),
            'role' => 'customer',
            'company_name' => 'CV Maju Bersama',
            'phone' => '081566778899',
        ]);

        CustomerProfile::create([
            'user_id' => $customer2->id,
            'company_name' => 'CV Maju Bersama',
            'pic_name' => 'Budi',
            'phone' => '081566778899',
        ]);

        CustomerAddress::create([
            'customer_id' => $customer2->id,
            'region_id' => $jambiRegion->id,
            'label' => 'Kantor Cabang',
            'receiver' => 'Budi',
            'phone' => '081566778899',
            'address' => 'Jl. Hayam Wuruk No. 55, Kota Jambi',
            'is_default' => true,
        ]);

        $this->call(DemoAccountsSeeder::class);
    }
}
