<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Menu;
use App\Models\MerchantDateCapacity;
use App\Models\MerchantOperatingDay;
use App\Models\MerchantProfile;
use App\Models\MerchantServiceArea;
use App\Models\Region;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'region_id' => ['nullable', 'integer', 'exists:regions,id'],
            'delivery_date' => ['nullable', 'date'],
            'portions' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'search' => ['nullable', 'string', 'max:100'],
            'max_budget' => ['nullable', 'integer', 'min:1', 'max:100000000'],
            'sort' => ['nullable', Rule::in(['default', 'name_asc', 'price_asc', 'price_desc'])],
        ]);

        $menuFilter = function (Builder $query) use ($filters): void {
            $query->where('is_active', true);

            if (! empty($filters['category_id'])) {
                $query->where('category_id', $filters['category_id']);
            }

            if (! empty($filters['max_budget'])) {
                $query->where('price_idr', '<=', $filters['max_budget']);
            }
        };

        $query = MerchantProfile::query()
            ->where('publication_status', 'published')
            ->whereHas('menus', $menuFilter)
            ->with([
                'user',
                'serviceAreas.region',
                'menus' => fn (Builder $query) => $menuFilter($query->with('category')),
            ]);

        if (! empty($filters['region_id'])) {
            $query->whereHas(
                'serviceAreas',
                fn (Builder $areaQuery) => $areaQuery->where('region_id', $filters['region_id']),
            );
        }

        if (! empty($filters['search'])) {
            $query->where('company_name', 'like', '%'.$filters['search'].'%');
        }

        $sort = $filters['sort'] ?? 'default';
        if (in_array($sort, ['price_asc', 'price_desc'], true)) {
            $query->withMin(['menus as filtered_starting_price' => $menuFilter], 'price_idr')
                ->orderBy('filtered_starting_price', $sort === 'price_asc' ? 'asc' : 'desc');
        } elseif ($sort === 'name_asc') {
            $query->orderBy('company_name');
        } else {
            $query->orderByDesc('updated_at');
        }
        $query->orderBy('user_id');

        $merchants = $query->paginate(12)->withQueryString();
        $merchants->getCollection()->transform(function (MerchantProfile $merchant) use ($filters): array {
            $serviceArea = ! empty($filters['region_id'])
                ? $merchant->serviceAreas->firstWhere('region_id', (int) $filters['region_id'])
                : $merchant->serviceAreas->first();
            $availability = null;

            if (! empty($filters['delivery_date']) && ! empty($filters['region_id'])) {
                $availability = $this->checkAvailability(
                    $merchant,
                    $filters['delivery_date'],
                    (int) ($filters['portions'] ?? 0),
                );
            }

            return [
                'id' => $merchant->user_id,
                'company_name' => $merchant->company_name,
                'description' => $merchant->description,
                'minimum_portions' => $merchant->minimum_portions,
                'starting_price' => $merchant->menus->min('price_idr'),
                'delivery_fee' => $serviceArea?->delivery_fee,
                'service_area' => $serviceArea?->region?->city_name,
                'menu_count' => $merchant->menus->count(),
                'categories' => $merchant->menus->pluck('category.name')->filter()->unique()->values(),
                'availability' => $availability,
                'menus_preview' => $merchant->menus->take(3)->map(fn (Menu $menu): array => [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'price_idr' => $menu->price_idr,
                    'image_path' => $menu->image_path,
                    'category' => $menu->category?->name,
                ])->values(),
            ];
        });

        return Inertia::render('Marketplace/Index', [
            'merchants' => $merchants,
            'regions' => Region::query()->orderBy('city_name')->get(),
            'categories' => Category::query()->orderBy('name')->get(),
            'filters' => [
                'region_id' => $filters['region_id'] ?? null,
                'delivery_date' => $filters['delivery_date'] ?? null,
                'portions' => $filters['portions'] ?? null,
                'category_id' => $filters['category_id'] ?? null,
                'search' => $filters['search'] ?? null,
                'max_budget' => $filters['max_budget'] ?? null,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(Request $request, int $merchant): Response
    {
        $profile = MerchantProfile::query()
            ->where('user_id', $merchant)
            ->where('publication_status', 'published')
            ->with(['user', 'serviceAreas.region', 'operatingDays'])
            ->firstOrFail();
        $menus = Menu::query()
            ->where('merchant_id', $merchant)
            ->where('is_active', true)
            ->with('category')
            ->orderBy('category_id')
            ->orderBy('name')
            ->get();

        $cart = null;
        if ($request->user()?->isCustomer()) {
            $cart = $request->user()->cart()
                ->with(['merchant', 'region', 'items.menu.category'])
                ->first();
        }

        $cartServiceArea = $cart?->region_id
            ? MerchantServiceArea::query()
                ->where('merchant_id', $cart->merchant_id)
                ->where('region_id', $cart->region_id)
                ->first()
            : null;
        $cartProfile = $cart
            ? MerchantProfile::query()->where('user_id', $cart->merchant_id)->first()
            : null;

        return Inertia::render('Marketplace/MerchantDetail', [
            'merchant' => [
                'id' => $profile->user_id,
                'company_name' => $profile->company_name,
                'address' => $profile->address,
                'phone' => $profile->phone,
                'description' => $profile->description,
                'minimum_portions' => $profile->minimum_portions,
                'service_areas' => $profile->serviceAreas->map(fn (MerchantServiceArea $area): array => [
                    'region_id' => $area->region_id,
                    'region_name' => $area->region->city_name,
                    'delivery_fee' => $area->delivery_fee,
                ]),
                'operating_days' => $profile->operatingDays->map(fn (MerchantOperatingDay $day): array => [
                    'weekday' => $day->weekday,
                    'is_open' => $day->is_open,
                ]),
            ],
            'menus' => $menus->map(fn (Menu $menu): array => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'image_path' => $menu->image_path,
                'price_idr' => $menu->price_idr,
                'category' => $menu->category?->name,
                'category_id' => $menu->category_id,
                'is_active' => $menu->is_active,
            ]),
            'categories' => Category::query()->orderBy('name')->get(),
            'regions' => Region::query()->orderBy('city_name')->get(),
            'cart' => $cart ? [
                'id' => $cart->id,
                'merchant_id' => $cart->merchant_id,
                'merchant_name' => $cart->merchant?->company_name ?? '-',
                'delivery_date' => $cart->delivery_date?->toDateString(),
                'region_id' => $cart->region_id,
                'region_name' => $cart->region?->city_name,
                'delivery_fee' => $cartServiceArea?->delivery_fee ?? 0,
                'minimum_portions' => $cartProfile?->minimum_portions ?? 0,
                'total_portions' => (int) $cart->items->sum('quantity'),
                'subtotal' => (int) $cart->items->sum(
                    fn ($item): int => $item->quantity * ($item->menu?->price_idr ?? 0),
                ),
                'items' => $cart->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'menu_id' => $item->menu_id,
                    'name' => $item->menu?->name ?? 'Menu dihapus',
                    'price_idr' => $item->menu?->price_idr ?? 0,
                    'quantity' => $item->quantity,
                    'is_active' => $item->menu?->is_active ?? false,
                    'category' => $item->menu?->category?->name,
                ]),
            ] : null,
        ]);
    }

    private function checkAvailability(MerchantProfile $merchant, string $date, int $portions): array
    {
        $deliveryDate = Carbon::parse($date)->startOfDay();

        if (! $deliveryDate->isAfter(today())) {
            return ['available' => false, 'reason' => 'Tanggal pengiriman harus mulai besok'];
        }

        if ($deliveryDate->isAfter(today()->addDays(30))) {
            return ['available' => false, 'reason' => 'Melebihi batas pemesanan 30 hari'];
        }

        if (now()->greaterThanOrEqualTo($deliveryDate->copy()->subDay()->setTime(16, 0))) {
            return ['available' => false, 'reason' => 'Melewati batas pemesanan pukul 16.00 WIB pada H-1'];
        }

        $isOperating = MerchantOperatingDay::query()
            ->where('merchant_id', $merchant->user_id)
            ->where('weekday', $deliveryDate->dayOfWeek)
            ->where('is_open', true)
            ->exists();

        if (! $isOperating) {
            return ['available' => false, 'reason' => 'Katering tidak beroperasi pada hari ini'];
        }

        $capacity = MerchantDateCapacity::query()
            ->where('merchant_id', $merchant->user_id)
            ->whereDate('delivery_date', $deliveryDate)
            ->first();

        if ($capacity?->is_closed) {
            return ['available' => false, 'reason' => 'Tanggal ini ditutup oleh katering'];
        }

        $remaining = $capacity?->remainingCapacity() ?? $merchant->default_daily_capacity;
        if ($portions > $remaining) {
            return ['available' => false, 'reason' => "Sisa kapasitas hanya {$remaining} porsi"];
        }

        return ['available' => true, 'remaining' => $remaining];
    }
}
