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
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAccountsSeeder extends Seeder
{
    use WithoutModelEvents;

    private const PASSWORD = 'CaterlyDemo123!';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regions = $this->seedRegions();
        $categories = $this->seedCategories();
        $menuTemplates = $this->menuTemplates();

        foreach ($this->merchantDefinitions() as $merchantIndex => $definition) {
            $user = User::query()->updateOrCreate(
                ['email' => $definition['email']],
                [
                    'name' => $definition['pic_name'],
                    'password' => Hash::make(self::PASSWORD),
                    'role' => 'merchant',
                    'company_name' => $definition['company_name'],
                    'phone' => $definition['phone'],
                ],
            );

            MerchantProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name' => $definition['company_name'],
                    'address' => $definition['address'],
                    'phone' => $definition['phone'],
                    'description' => $definition['description'],
                    'publication_status' => 'published',
                    'minimum_portions' => $definition['minimum_portions'],
                    'default_daily_capacity' => $definition['daily_capacity'],
                    'bank_name' => $definition['bank_name'],
                    'bank_account_name' => $definition['company_name'],
                    'bank_account_number' => $definition['bank_account_number'],
                ],
            );

            $region = $regions->get($definition['region_code']);
            MerchantServiceArea::query()->updateOrCreate(
                ['merchant_id' => $user->id, 'region_id' => $region->id],
                ['delivery_fee' => $definition['delivery_fee']],
            );

            foreach (range(0, 6) as $weekday) {
                MerchantOperatingDay::query()->updateOrCreate(
                    ['merchant_id' => $user->id, 'weekday' => $weekday],
                    ['is_open' => ! in_array($weekday, [0, 6], true)],
                );
            }

            foreach (range(1, 30) as $dayOffset) {
                $deliveryDate = today()->addDays($dayOffset);

                if ($deliveryDate->isWeekend()) {
                    continue;
                }

                $dateCapacity = MerchantDateCapacity::query()
                    ->where('merchant_id', $user->id)
                    ->whereDate('delivery_date', $deliveryDate->toDateString())
                    ->firstOrNew();

                $dateCapacity->fill([
                    'merchant_id' => $user->id,
                    'delivery_date' => $deliveryDate->toDateString(),
                    'capacity' => $definition['daily_capacity'],
                    'is_closed' => false,
                    'is_override' => false,
                ])->save();
            }

            foreach (range(0, 4) as $menuOffset) {
                $template = $menuTemplates[($merchantIndex * 2 + $menuOffset) % count($menuTemplates)];
                Menu::withTrashed()->updateOrCreate(
                    ['merchant_id' => $user->id, 'name' => $template['name']],
                    [
                        'category_id' => $categories->get($template['category_slug'])->id,
                        'description' => $template['description'],
                        'price_idr' => $template['price_idr'] + (($merchantIndex % 4) * 1000),
                        'is_active' => true,
                        'deleted_at' => null,
                    ],
                );
            }
        }

        $this->seedCustomers($regions);
    }

    private function seedRegions(): Collection
    {
        $definitions = [
            ['code' => 'JAMBI', 'city_name' => 'Kota Jambi', 'province_name' => 'Jambi'],
            ['code' => 'JAKPUS', 'city_name' => 'Jakarta Pusat', 'province_name' => 'DKI Jakarta'],
            ['code' => 'JAKSEL', 'city_name' => 'Jakarta Selatan', 'province_name' => 'DKI Jakarta'],
            ['code' => 'BDGKOTA', 'city_name' => 'Kota Bandung', 'province_name' => 'Jawa Barat'],
            ['code' => 'SBYKT', 'city_name' => 'Kota Surabaya', 'province_name' => 'Jawa Timur'],
        ];

        foreach ($definitions as $definition) {
            Region::query()->updateOrCreate(
                ['code' => $definition['code']],
                $definition,
            );
        }

        return Region::query()
            ->whereIn('code', array_column($definitions, 'code'))
            ->get()
            ->keyBy('code');
    }

    private function seedCategories(): Collection
    {
        $definitions = [
            ['name' => 'Nasi Box', 'slug' => 'nasi-box'],
            ['name' => 'Menu Nusantara', 'slug' => 'menu-nusantara'],
            ['name' => 'Vegetarian', 'slug' => 'vegetarian'],
            ['name' => 'Snack Box', 'slug' => 'snack-box'],
            ['name' => 'Prasmanan', 'slug' => 'prasmanan'],
        ];

        foreach ($definitions as $definition) {
            Category::query()->updateOrCreate(
                ['slug' => $definition['slug']],
                $definition,
            );
        }

        return Category::query()
            ->whereIn('slug', array_column($definitions, 'slug'))
            ->get()
            ->keyBy('slug');
    }

    private function merchantDefinitions(): array
    {
        return [
            [
                'company_name' => 'Dapur Selaras', 'pic_name' => 'Ayu Lestari', 'email' => 'dapur@caterly.test', 'phone' => '081234567890',
                'region_code' => 'JAMBI', 'address' => 'Jl. Sultan Thaha No. 42, Pasar Jambi, Kota Jambi',
                'description' => 'Katering makan siang kantor dengan masakan Nusantara segar, kemasan higienis, dan pengiriman tepat waktu di Kota Jambi.',
                'minimum_portions' => 10, 'daily_capacity' => 180, 'delivery_fee' => 25000,
                'bank_name' => 'BCA', 'bank_account_number' => '0201884101',
            ],
            [
                'company_name' => 'Sajian Ibu', 'pic_name' => 'Rina Marlina', 'email' => 'sajian@caterly.test', 'phone' => '082345678901',
                'region_code' => 'JAMBI', 'address' => 'Jl. Kapten Pattimura No. 15, Telanaipura, Kota Jambi',
                'description' => 'Masakan rumahan khas ibu dengan porsi mengenyangkan, bahan pilihan, dan paket langganan perusahaan yang fleksibel.',
                'minimum_portions' => 15, 'daily_capacity' => 150, 'delivery_fee' => 20000,
                'bank_name' => 'Bank Mandiri', 'bank_account_number' => '1120018892101',
            ],
            [
                'company_name' => 'Rasa Batanghari', 'pic_name' => 'Dedi Saputra', 'email' => 'batanghari@caterly.test', 'phone' => '081377110203',
                'region_code' => 'JAMBI', 'address' => 'Jl. Orang Kayo Hitam No. 18, Jelutung, Kota Jambi',
                'description' => 'Spesialis nasi box bercita rasa Melayu Jambi untuk rapat, pelatihan, dan kebutuhan makan rutin karyawan.',
                'minimum_portions' => 12, 'daily_capacity' => 140, 'delivery_fee' => 22000,
                'bank_name' => 'BRI', 'bank_account_number' => '020601009887503',
            ],
            [
                'company_name' => 'Selera Angso Duo', 'pic_name' => 'Maya Fitri', 'email' => 'angsoduo@caterly.test', 'phone' => '085267901104',
                'region_code' => 'JAMBI', 'address' => 'Jl. H. Agus Salim No. 76, Kota Baru, Kota Jambi',
                'description' => 'Penyedia katering korporat dengan pilihan menu harian, snack rapat, dan prasmanan khas Sumatra.',
                'minimum_portions' => 20, 'daily_capacity' => 220, 'delivery_fee' => 28000,
                'bank_name' => 'BNI', 'bank_account_number' => '1178800421',
            ],
            [
                'company_name' => 'Dapur Menteng', 'pic_name' => 'Farah Anindita', 'email' => 'menteng@caterly.test', 'phone' => '081298760205',
                'region_code' => 'JAKPUS', 'address' => 'Jl. HOS Cokroaminoto No. 31, Menteng, Jakarta Pusat',
                'description' => 'Katering premium untuk perkantoran pusat Jakarta dengan menu Indonesia modern dan pengantaran terjadwal.',
                'minimum_portions' => 15, 'daily_capacity' => 250, 'delivery_fee' => 30000,
                'bank_name' => 'BCA', 'bank_account_number' => '0201884105',
            ],
            [
                'company_name' => 'Katering Monas', 'pic_name' => 'Rizky Ramadhan', 'email' => 'monas@caterly.test', 'phone' => '081510220306',
                'region_code' => 'JAKPUS', 'address' => 'Jl. Cideng Timur No. 52, Gambir, Jakarta Pusat',
                'description' => 'Paket makan kantor praktis dengan rotasi menu lengkap, layanan tepat waktu, dan dukungan acara perusahaan.',
                'minimum_portions' => 10, 'daily_capacity' => 300, 'delivery_fee' => 32000,
                'bank_name' => 'Bank Mandiri', 'bank_account_number' => '1120018892106',
            ],
            [
                'company_name' => 'Rasa Kemang', 'pic_name' => 'Nabila Putri', 'email' => 'kemang@caterly.test', 'phone' => '082110330407',
                'region_code' => 'JAKSEL', 'address' => 'Jl. Kemang Raya No. 88, Mampang Prapatan, Jakarta Selatan',
                'description' => 'Menu kantor sehat dan modern, tersedia pilihan vegetarian, snack box, serta paket prasmanan untuk acara.',
                'minimum_portions' => 12, 'daily_capacity' => 210, 'delivery_fee' => 35000,
                'bank_name' => 'CIMB Niaga', 'bank_account_number' => '800118874006',
            ],
            [
                'company_name' => 'Dapur Cilandak', 'pic_name' => 'Bagus Prakoso', 'email' => 'cilandak@caterly.test', 'phone' => '081911440508',
                'region_code' => 'JAKSEL', 'address' => 'Jl. TB Simatupang No. 21, Cilandak, Jakarta Selatan',
                'description' => 'Katering harian perusahaan dengan menu bergizi, lauk bervariasi, dan standar dapur yang higienis.',
                'minimum_portions' => 20, 'daily_capacity' => 280, 'delivery_fee' => 33000,
                'bank_name' => 'PermataBank', 'bank_account_number' => '09722188408',
            ],
            [
                'company_name' => 'Pawon Priangan', 'pic_name' => 'Tia Kusumah', 'email' => 'priangan@caterly.test', 'phone' => '081223550609',
                'region_code' => 'BDGKOTA', 'address' => 'Jl. Buah Batu No. 119, Lengkong, Kota Bandung',
                'description' => 'Sajian khas Sunda dan menu nasional untuk kantor, dibuat segar setiap hari dengan bahan dari pemasok lokal.',
                'minimum_portions' => 10, 'daily_capacity' => 190, 'delivery_fee' => 24000,
                'bank_name' => 'BJB', 'bank_account_number' => '0011884209',
            ],
            [
                'company_name' => 'Dapur Braga', 'pic_name' => 'Yoga Mahendra', 'email' => 'braga@caterly.test', 'phone' => '085722660710',
                'region_code' => 'BDGKOTA', 'address' => 'Jl. Braga No. 64, Sumur Bandung, Kota Bandung',
                'description' => 'Katering urban Bandung dengan nasi box, coffee break, dan prasmanan untuk meeting maupun acara kantor.',
                'minimum_portions' => 15, 'daily_capacity' => 170, 'delivery_fee' => 26000,
                'bank_name' => 'BCA', 'bank_account_number' => '0201884110',
            ],
            [
                'company_name' => 'Sajian Dago', 'pic_name' => 'Nisa Rahma', 'email' => 'dago@caterly.test', 'phone' => '082129770811',
                'region_code' => 'BDGKOTA', 'address' => 'Jl. Ir. H. Juanda No. 145, Coblong, Kota Bandung',
                'description' => 'Paket makan siang dan snack kantor dengan rasa rumahan, presentasi rapi, serta layanan pelanggan responsif.',
                'minimum_portions' => 12, 'daily_capacity' => 160, 'delivery_fee' => 25000,
                'bank_name' => 'Bank Mandiri', 'bank_account_number' => '1120018892111',
            ],
            [
                'company_name' => 'Katering Parahyangan', 'pic_name' => 'Gilang Permana', 'email' => 'parahyangan@caterly.test', 'phone' => '081320880912',
                'region_code' => 'BDGKOTA', 'address' => 'Jl. Sukajadi No. 201, Sukajadi, Kota Bandung',
                'description' => 'Solusi katering skala menengah hingga besar untuk perusahaan dengan kapasitas stabil dan menu berganti setiap hari.',
                'minimum_portions' => 25, 'daily_capacity' => 320, 'delivery_fee' => 27000,
                'bank_name' => 'BNI', 'bank_account_number' => '1178800432',
            ],
            [
                'company_name' => 'Dapur Tunjungan', 'pic_name' => 'Intan Prameswari', 'email' => 'tunjungan@caterly.test', 'phone' => '081331990113',
                'region_code' => 'SBYKT', 'address' => 'Jl. Tunjungan No. 97, Genteng, Kota Surabaya',
                'description' => 'Katering kantor khas Surabaya dengan rasa berani, pilihan paket komplet, dan pengiriman untuk pusat bisnis kota.',
                'minimum_portions' => 15, 'daily_capacity' => 230, 'delivery_fee' => 28000,
                'bank_name' => 'Bank Jatim', 'bank_account_number' => '0011884313',
            ],
            [
                'company_name' => 'Rasa Surabaya', 'pic_name' => 'Fajar Nugroho', 'email' => 'rasasurabaya@caterly.test', 'phone' => '082242100214',
                'region_code' => 'SBYKT', 'address' => 'Jl. Raya Darmo No. 55, Wonokromo, Kota Surabaya',
                'description' => 'Menu Nusantara dan Jawa Timur untuk kebutuhan makan rutin, rapat, gathering, serta jamuan perusahaan.',
                'minimum_portions' => 10, 'daily_capacity' => 200, 'delivery_fee' => 30000,
                'bank_name' => 'BRI', 'bank_account_number' => '020601009887514',
            ],
            [
                'company_name' => 'Pawon Pahlawan', 'pic_name' => 'Laras Wulandari', 'email' => 'pahlawan@caterly.test', 'phone' => '085155210315',
                'region_code' => 'SBYKT', 'address' => 'Jl. Pahlawan No. 38, Bubutan, Kota Surabaya',
                'description' => 'Katering higienis untuk tim kantor dengan menu seimbang, snack box, dan prasmanan yang mudah disesuaikan.',
                'minimum_portions' => 18, 'daily_capacity' => 260, 'delivery_fee' => 29000,
                'bank_name' => 'BCA', 'bank_account_number' => '0201884115',
            ],
        ];
    }

    private function menuTemplates(): array
    {
        return [
            [
                'category_slug' => 'nasi-box',
                'name' => 'Nasi Ayam Bakar',
                'description' => 'Nasi putih, ayam bakar kecap, tumis sayur, lalapan, sambal, kerupuk, dan air mineral.',
                'price_idr' => 28000,
            ],
            [
                'category_slug' => 'menu-nusantara',
                'name' => 'Nasi Rendang Komplit',
                'description' => 'Nasi putih, rendang sapi empuk, sayur nangka, telur balado, sambal hijau, dan kerupuk.',
                'price_idr' => 35000,
            ],
            [
                'category_slug' => 'nasi-box',
                'name' => 'Rice Bowl Ayam Teriyaki',
                'description' => 'Nasi pulen, ayam teriyaki, telur, salad segar, wijen, dan saus mayo dalam kemasan praktis.',
                'price_idr' => 31000,
            ],
            [
                'category_slug' => 'menu-nusantara',
                'name' => 'Nasi Liwet Sunda',
                'description' => 'Nasi liwet gurih, ayam goreng, tahu tempe, ikan asin, lalapan, dan sambal terasi.',
                'price_idr' => 30000,
            ],
            [
                'category_slug' => 'vegetarian',
                'name' => 'Paket Gado-Gado Sehat',
                'description' => 'Sayuran rebus segar, tahu, tempe, telur, lontong, saus kacang, dan kerupuk tanpa daging.',
                'price_idr' => 25000,
            ],
            [
                'category_slug' => 'vegetarian',
                'name' => 'Bento Tempe Lada Hitam',
                'description' => 'Nasi merah, tempe lada hitam, tumis brokoli wortel, buah potong, dan sambal.',
                'price_idr' => 27000,
            ],
            [
                'category_slug' => 'snack-box',
                'name' => 'Snack Box Premium',
                'description' => 'Tiga pilihan kue manis dan gurih, buah potong, air mineral, tisu, dan kemasan premium.',
                'price_idr' => 22000,
            ],
            [
                'category_slug' => 'snack-box',
                'name' => 'Coffee Break Meeting',
                'description' => 'Dua kudapan pilihan dengan kopi atau teh siap saji untuk rapat dan pelatihan kantor.',
                'price_idr' => 18000,
            ],
            [
                'category_slug' => 'prasmanan',
                'name' => 'Prasmanan Nusantara',
                'description' => 'Nasi, dua lauk utama, dua sayur, sambal, kerupuk, buah, minuman, dan perlengkapan saji.',
                'price_idr' => 65000,
            ],
            [
                'category_slug' => 'prasmanan',
                'name' => 'Prasmanan Eksekutif',
                'description' => 'Paket prasmanan premium dengan tiga lauk, sup, sayur, dessert, buah, dan minuman.',
                'price_idr' => 85000,
            ],
        ];
    }

    private function seedCustomers(Collection $regions): void
    {
        $customers = [
            [
                'company_name' => 'PT Sinar Karya Nusantara', 'pic_name' => 'Faza Pratama', 'email' => 'faza@caterly.test', 'phone' => '081122334455',
                'region_code' => 'JAMBI', 'label' => 'Kantor Pusat Jambi',
                'address' => 'Jl. Jenderal Sudirman No. 100, Lantai 3, The Hok, Kota Jambi',
                'notes' => 'Masuk dari lobi utama dan hubungi resepsionis lantai 3.',
            ],
            [
                'company_name' => 'PT Cakrawala Digital Indonesia', 'pic_name' => 'Budi Santoso', 'email' => 'budi@caterly.test', 'phone' => '081566778899',
                'region_code' => 'JAKPUS', 'label' => 'Kantor Jakarta Pusat',
                'address' => 'Menara Cakrawala Lantai 12, Jl. MH Thamrin No. 9, Jakarta Pusat',
                'notes' => 'Pengantaran melalui loading dock dan registrasi di meja keamanan.',
            ],
            [
                'company_name' => 'PT Arunika Kreatif Mandiri', 'pic_name' => 'Sinta Maharani', 'email' => 'sinta@caterly.test', 'phone' => '081288450231',
                'region_code' => 'JAKSEL', 'label' => 'Studio Jakarta Selatan',
                'address' => 'Gedung Arunika Lantai 5, Jl. Wolter Monginsidi No. 27, Jakarta Selatan',
                'notes' => 'Titipkan di pantry lantai 5 jika PIC sedang rapat.',
            ],
            [
                'company_name' => 'CV Bandung Teknologi Bersama', 'pic_name' => 'Raka Aditya', 'email' => 'raka@caterly.test', 'phone' => '082118760342',
                'region_code' => 'BDGKOTA', 'label' => 'Kantor Bandung',
                'address' => 'Bandung Tech Hub Lantai 4, Jl. Asia Afrika No. 81, Kota Bandung',
                'notes' => 'Parkir kurir tersedia di sisi timur gedung.',
            ],
            [
                'company_name' => 'PT Surya Timur Logistik', 'pic_name' => 'Maya Anggraini', 'email' => 'maya@caterly.test', 'phone' => '085173620453',
                'region_code' => 'SBYKT', 'label' => 'Kantor Surabaya',
                'address' => 'Surya Business Center Lantai 7, Jl. Basuki Rahmat No. 106, Kota Surabaya',
                'notes' => 'Hubungi PIC sepuluh menit sebelum tiba.',
            ],
        ];

        foreach ($customers as $definition) {
            $user = User::query()->updateOrCreate(
                ['email' => $definition['email']],
                [
                    'name' => $definition['pic_name'],
                    'password' => Hash::make(self::PASSWORD),
                    'role' => 'customer',
                    'company_name' => $definition['company_name'],
                    'phone' => $definition['phone'],
                ],
            );

            CustomerProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name' => $definition['company_name'],
                    'pic_name' => $definition['pic_name'],
                    'phone' => $definition['phone'],
                ],
            );

            $region = $regions->get($definition['region_code']);
            $address = CustomerAddress::query()
                ->where('customer_id', $user->id)
                ->orderByDesc('is_default')
                ->orderBy('id')
                ->first();
            $attributes = [
                'region_id' => $region->id,
                'label' => $definition['label'],
                'receiver' => $definition['pic_name'],
                'phone' => $definition['phone'],
                'address' => $definition['address'],
                'notes' => $definition['notes'],
                'is_default' => true,
            ];

            if ($address) {
                CustomerAddress::query()
                    ->where('customer_id', $user->id)
                    ->whereKeyNot($address->id)
                    ->update(['is_default' => false]);

                $address->update($attributes);
            } else {
                CustomerAddress::query()
                    ->where('customer_id', $user->id)
                    ->update(['is_default' => false]);

                CustomerAddress::query()->create([
                    ...$attributes,
                    'customer_id' => $user->id,
                ]);
            }
        }
    }
}
