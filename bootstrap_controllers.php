<?php
/**
 * Caterly Controllers & Seeder Generator
 */

$files = [];

// ===== DATABASE SEEDER =====
$files['database/seeders/DatabaseSeeder.php'] = <<<'PHP'
<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\MerchantProfile;
use App\Models\CustomerProfile;
use App\Models\CustomerAddress;
use App\Models\Region;
use App\Models\Category;
use App\Models\Menu;
use App\Models\MerchantServiceArea;
use App\Models\MerchantOperatingDay;
use App\Models\MerchantDateCapacity;
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
            if ($dow == 0 || $dow == 6) continue;
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
            if ($dow == 0 || $dow == 6) continue;
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
    }
}
PHP;

// ===== AUTH CONTROLLERS =====
$files['app/Http/Controllers/Auth/LoginController.php'] = <<<'PHP'
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Rate limiting
        $throttleKey = strtolower($request->input('email')) . '|' . $request->ip();
        if (app('Illuminate\Cache\RateLimiter')->tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages([
                'email' => 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
            ]);
        }

        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            app('Illuminate\Cache\RateLimiter')->hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        app('Illuminate\Cache\RateLimiter')->clear($throttleKey);
        $request->session()->regenerate();

        $user = Auth::user();
        $redirect = $user->isMerchant() ? '/merchant/dashboard' : '/marketplace';

        return redirect()->intended($redirect);
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
PHP;

$files['app/Http/Controllers/Auth/RegisterController.php'] = <<<'PHP'
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\MerchantProfile;
use App\Models\CustomerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|in:customer,merchant',
            'company_name' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Password::min(12)],
        ], [
            'email.unique' => 'Email sudah terdaftar.',
            'password.min' => 'Password minimal 12 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => strtolower(trim($request->email)),
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'company_name' => $request->company_name,
            'phone' => $request->phone,
        ]);

        if ($user->isMerchant()) {
            MerchantProfile::create([
                'user_id' => $user->id,
                'company_name' => $request->company_name,
                'phone' => $request->phone,
            ]);
        } else {
            CustomerProfile::create([
                'user_id' => $user->id,
                'company_name' => $request->company_name,
                'pic_name' => $request->name,
                'phone' => $request->phone,
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect($user->isMerchant() ? '/merchant/dashboard' : '/marketplace');
    }
}
PHP;

// ===== MARKETPLACE CONTROLLER =====
$files['app/Http/Controllers/MarketplaceController.php'] = <<<'PHP'
<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Region;
use App\Models\Category;
use App\Models\MerchantProfile;
use App\Models\MerchantServiceArea;
use App\Models\MerchantDateCapacity;
use App\Models\MerchantOperatingDay;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    public function index(Request $request)
    {
        $regions = Region::orderBy('city_name')->get();
        $categories = Category::orderBy('name')->get();

        $query = MerchantProfile::where('publication_status', 'published')
            ->with(['user', 'serviceAreas.region', 'menus' => function ($q) {
                $q->where('is_active', true)->with('category');
            }]);

        $regionId = $request->input('region_id');
        $deliveryDate = $request->input('delivery_date');
        $portions = $request->input('portions');
        $categoryId = $request->input('category_id');
        $search = $request->input('search');
        $maxBudget = $request->input('max_budget');
        $sort = $request->input('sort', 'default');

        // Filter by region (service area)
        if ($regionId) {
            $merchantIds = MerchantServiceArea::where('region_id', $regionId)
                ->pluck('merchant_id');
            $query->whereIn('user_id', $merchantIds);
        }

        // Search by name
        if ($search) {
            $query->where('company_name', 'like', '%' . $search . '%');
        }

        $merchants = $query->paginate(12)->withQueryString();

        // Transform merchants for frontend
        $merchants->getCollection()->transform(function ($merchant) use ($regionId, $deliveryDate, $portions, $categoryId, $maxBudget) {
            $menus = $merchant->menus;

            if ($categoryId) {
                $menus = $menus->where('category_id', $categoryId);
            }
            if ($maxBudget) {
                $menus = $menus->where('price_idr', '<=', (int) $maxBudget);
            }

            $serviceArea = $regionId
                ? $merchant->serviceAreas->where('region_id', $regionId)->first()
                : $merchant->serviceAreas->first();

            $startingPrice = $menus->min('price_idr');

            // Availability check
            $availability = null;
            if ($deliveryDate && $regionId) {
                $availability = $this->checkAvailability(
                    $merchant->user_id, $deliveryDate, (int)($portions ?? 0)
                );
            }

            return [
                'id' => $merchant->user_id,
                'company_name' => $merchant->company_name,
                'description' => $merchant->description,
                'minimum_portions' => $merchant->minimum_portions,
                'starting_price' => $startingPrice,
                'delivery_fee' => $serviceArea?->delivery_fee,
                'service_area' => $serviceArea?->region?->city_name,
                'menu_count' => $menus->count(),
                'categories' => $menus->pluck('category.name')->unique()->values(),
                'availability' => $availability,
                'menus_preview' => $menus->take(3)->map(fn($m) => [
                    'id' => $m->id,
                    'name' => $m->name,
                    'price_idr' => $m->price_idr,
                    'image_path' => $m->image_path,
                    'category' => $m->category?->name,
                ]),
            ];
        });

        return Inertia::render('Marketplace/Index', [
            'merchants' => $merchants,
            'regions' => $regions,
            'categories' => $categories,
            'filters' => [
                'region_id' => $regionId,
                'delivery_date' => $deliveryDate,
                'portions' => $portions,
                'category_id' => $categoryId,
                'search' => $search,
                'max_budget' => $maxBudget,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(Request $request, int $merchantId)
    {
        $merchant = MerchantProfile::where('user_id', $merchantId)
            ->where('publication_status', 'published')
            ->with(['user', 'serviceAreas.region', 'operatingDays'])
            ->firstOrFail();

        $menus = Menu::where('merchant_id', $merchantId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->with('category')
            ->orderBy('category_id')
            ->orderBy('name')
            ->get();

        $categories = Category::orderBy('name')->get();
        $regions = Region::orderBy('city_name')->get();

        // Get user cart if logged in
        $cart = null;
        if (auth()->check() && auth()->user()->isCustomer()) {
            $cart = auth()->user()->cart()->with('items.menu')->first();
        }

        return Inertia::render('Marketplace/MerchantDetail', [
            'merchant' => [
                'id' => $merchant->user_id,
                'company_name' => $merchant->company_name,
                'address' => $merchant->address,
                'phone' => $merchant->phone,
                'description' => $merchant->description,
                'minimum_portions' => $merchant->minimum_portions,
                'service_areas' => $merchant->serviceAreas->map(fn($sa) => [
                    'region_id' => $sa->region_id,
                    'region_name' => $sa->region->city_name,
                    'delivery_fee' => $sa->delivery_fee,
                ]),
                'operating_days' => $merchant->operatingDays->map(fn($od) => [
                    'weekday' => $od->weekday,
                    'is_open' => $od->is_open,
                ]),
            ],
            'menus' => $menus->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'description' => $m->description,
                'image_path' => $m->image_path,
                'price_idr' => $m->price_idr,
                'category' => $m->category?->name,
                'category_id' => $m->category_id,
                'is_active' => $m->is_active,
            ]),
            'categories' => $categories,
            'regions' => $regions,
            'cart' => $cart ? [
                'merchant_id' => $cart->merchant_id,
                'delivery_date' => $cart->delivery_date?->toDateString(),
                'items' => $cart->items->map(fn($i) => [
                    'menu_id' => $i->menu_id,
                    'quantity' => $i->quantity,
                    'menu' => $i->menu ? [
                        'id' => $i->menu->id,
                        'name' => $i->menu->name,
                        'price_idr' => $i->menu->price_idr,
                    ] : null,
                ]),
                'total_portions' => $cart->items->sum('quantity'),
            ] : null,
        ]);
    }

    private function checkAvailability(int $merchantId, string $date, int $portions): array
    {
        $dateObj = \Carbon\Carbon::parse($date);
        $now = now();

        // Check cutoff (16:00 WIB day before)
        $cutoff = $dateObj->copy()->subDay()->setHour(16)->setMinute(0)->setSecond(0);
        if ($now->gte($cutoff)) {
            return ['available' => false, 'reason' => 'Melewati batas pemesanan (16:00 WIB sehari sebelumnya)'];
        }

        // Check horizon (30 days)
        if ($dateObj->gt($now->copy()->addDays(30))) {
            return ['available' => false, 'reason' => 'Melebihi batas pemesanan 30 hari ke depan'];
        }

        // Check operating day
        $dayOfWeek = $dateObj->dayOfWeek;
        $opDay = MerchantOperatingDay::where('merchant_id', $merchantId)
            ->where('weekday', $dayOfWeek)->first();
        if ($opDay && !$opDay->is_open) {
            return ['available' => false, 'reason' => 'Katering tidak beroperasi pada hari ini'];
        }

        // Check capacity
        $capacity = MerchantDateCapacity::where('merchant_id', $merchantId)
            ->where('delivery_date', $date)->first();
        if ($capacity) {
            if ($capacity->is_closed) {
                return ['available' => false, 'reason' => 'Tanggal ini ditutup oleh katering'];
            }
            $remaining = $capacity->remainingCapacity();
            if ($portions > 0 && $portions > $remaining) {
                return ['available' => false, 'reason' => "Sisa kapasitas hanya {$remaining} porsi"];
            }
            return ['available' => true, 'remaining' => $remaining];
        }

        // No capacity record yet - use default
        $profile = MerchantProfile::where('user_id', $merchantId)->first();
        return ['available' => true, 'remaining' => $profile?->default_daily_capacity ?? 100];
    }
}
PHP;

// ===== CART CONTROLLER =====
$files['app/Http/Controllers/Customer/CartController.php'] = <<<'PHP'
<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = $this->getCart($request);

        if (!$cart || !$cart->merchant_id) {
            return Inertia::render('Customer/Cart', ['cart' => null]);
        }

        $cart->load(['items.menu.category', 'merchant.merchantProfile.serviceAreas.region', 'region']);

        $serviceArea = $cart->merchant?->merchantProfile
            ?->serviceAreas->where('region_id', $cart->region_id)->first();

        return Inertia::render('Customer/Cart', [
            'cart' => [
                'id' => $cart->id,
                'merchant_id' => $cart->merchant_id,
                'merchant_name' => $cart->merchant?->merchantProfile?->company_name,
                'delivery_date' => $cart->delivery_date?->toDateString(),
                'region_id' => $cart->region_id,
                'region_name' => $cart->region?->city_name,
                'delivery_fee' => $serviceArea?->delivery_fee ?? 0,
                'minimum_portions' => $cart->merchant?->merchantProfile?->minimum_portions ?? 10,
                'items' => $cart->items->map(fn($item) => [
                    'id' => $item->id,
                    'menu_id' => $item->menu_id,
                    'name' => $item->menu?->name ?? 'Menu tidak tersedia',
                    'price_idr' => $item->menu?->price_idr ?? 0,
                    'quantity' => $item->quantity,
                    'is_active' => $item->menu?->is_active ?? false,
                    'category' => $item->menu?->category?->name,
                ]),
                'total_portions' => $cart->items->sum('quantity'),
                'subtotal' => $cart->items->sum(fn($i) => ($i->menu?->price_idr ?? 0) * $i->quantity),
            ],
            'addresses' => auth()->user()->customerAddresses()
                ->with('region')->orderByDesc('is_default')->get(),
        ]);
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1|max:10000',
            'merchant_id' => 'required|exists:users,id',
            'delivery_date' => 'nullable|date|after:today',
            'region_id' => 'nullable|exists:regions,id',
            'replace_cart' => 'nullable|boolean',
        ]);

        $menu = Menu::where('id', $request->menu_id)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->firstOrFail();

        $cart = $this->getCart($request);

        // Check if switching merchant
        if ($cart && $cart->merchant_id && $cart->merchant_id != $request->merchant_id) {
            if (!$request->boolean('replace_cart')) {
                return back()->with('error', 'DIFFERENT_MERCHANT');
            }
            // Clear cart for new merchant
            $cart->items()->delete();
            $cart->update([
                'merchant_id' => $request->merchant_id,
                'delivery_date' => $request->delivery_date,
                'region_id' => $request->region_id,
            ]);
        }

        if (!$cart) {
            $cart = Cart::create([
                'customer_id' => auth()->id(),
                'merchant_id' => $request->merchant_id,
                'delivery_date' => $request->delivery_date,
                'region_id' => $request->region_id,
            ]);
        } else {
            if (!$cart->merchant_id) {
                $cart->update([
                    'merchant_id' => $request->merchant_id,
                    'delivery_date' => $request->delivery_date,
                    'region_id' => $request->region_id,
                ]);
            }
            if ($request->delivery_date) {
                $cart->update(['delivery_date' => $request->delivery_date]);
            }
            if ($request->region_id) {
                $cart->update(['region_id' => $request->region_id]);
            }
        }

        // Upsert cart item
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('menu_id', $request->menu_id)
            ->first();

        if ($cartItem) {
            $cartItem->update(['quantity' => $cartItem->quantity + $request->quantity]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'menu_id' => $request->menu_id,
                'quantity' => $request->quantity,
            ]);
        }

        return back()->with('success', 'Menu ditambahkan ke keranjang');
    }

    public function updateItem(Request $request, int $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1|max:10000',
        ]);

        $item = CartItem::whereHas('cart', fn($q) => $q->where('customer_id', auth()->id()))
            ->findOrFail($itemId);

        $item->update(['quantity' => $request->quantity]);
        return back()->with('success', 'Jumlah diperbarui');
    }

    public function removeItem(int $itemId)
    {
        $item = CartItem::whereHas('cart', fn($q) => $q->where('customer_id', auth()->id()))
            ->findOrFail($itemId);

        $item->delete();

        // If cart is empty, clear merchant
        $cart = Cart::where('customer_id', auth()->id())->first();
        if ($cart && $cart->items()->count() === 0) {
            $cart->update(['merchant_id' => null]);
        }

        return back()->with('success', 'Menu dihapus dari keranjang');
    }

    public function clear()
    {
        $cart = Cart::where('customer_id', auth()->id())->first();
        if ($cart) {
            $cart->items()->delete();
            $cart->update(['merchant_id' => null, 'delivery_date' => null, 'region_id' => null]);
        }
        return back()->with('success', 'Keranjang dikosongkan');
    }

    private function getCart(Request $request): ?Cart
    {
        return Cart::where('customer_id', auth()->id())->first();
    }
}
PHP;

// Write all files
foreach ($files as $path => $content) {
    $dir = dirname($path);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($path, $content);
}

echo count($files) . " files created.\n";