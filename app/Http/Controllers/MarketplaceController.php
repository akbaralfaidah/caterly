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
                $availability = $this->checkAvailability($merchant, $deliveryDate, (int)($portions ?? 0)
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

    private function checkAvailability(\App\Models\MerchantProfile $merchant, string $date, int $portions): array
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
        $opDay = MerchantOperatingDay::where('merchant_id', $merchant->user_id)
            ->where('weekday', $dayOfWeek)->first();
        if ($opDay && !$opDay->is_open) {
            return ['available' => false, 'reason' => 'Katering tidak beroperasi pada hari ini'];
        }

        // Check capacity
        $capacity = MerchantDateCapacity::where('merchant_id', $merchant->user_id)
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
        $profile = $merchant;
        return ['available' => true, 'remaining' => $profile?->default_daily_capacity ?? 100];
    }
}
