<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomerAddress;
use App\Models\Menu;
use App\Models\MerchantOperatingDay;
use App\Models\MerchantProfile;
use App\Models\MerchantServiceArea;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function show(Request $request): Response
    {
        $cart = Cart::query()
            ->where('customer_id', $request->user()->id)
            ->with(['merchant', 'items.menu.category', 'region'])
            ->first();

        $addresses = CustomerAddress::query()
            ->where('customer_id', $request->user()->id)
            ->with('region')
            ->orderByDesc('is_default')
            ->orderBy('id')
            ->get();

        $cartData = null;
        if ($cart) {
            $defaultAddress = $addresses->firstWhere('is_default', true);
            $effectiveRegionId = $cart->region_id ?? $defaultAddress?->region_id;
            $serviceArea = $effectiveRegionId
                ? MerchantServiceArea::query()
                    ->where('merchant_id', $cart->merchant_id)
                    ->where('region_id', $effectiveRegionId)
                    ->with('region')
                    ->first()
                : null;
            $merchantProfile = MerchantProfile::query()->where('user_id', $cart->merchant_id)->first();
            $subtotal = (int) $cart->items->sum(
                fn ($item): int => $item->quantity * ($item->menu?->price_idr ?? 0),
            );
            $sessionKey = "checkout_token_{$cart->id}";
            $checkoutToken = $request->session()->get($sessionKey) ?? (string) Str::uuid();
            $request->session()->put($sessionKey, $checkoutToken);

            $cartData = [
                'id' => $cart->id,
                'merchant_id' => $cart->merchant_id,
                'merchant_name' => $cart->merchant->company_name,
                'delivery_date' => $cart->delivery_date?->toDateString(),
                'region_id' => $effectiveRegionId,
                'region_name' => $serviceArea?->region?->city_name ?? $defaultAddress?->region?->city_name,
                'delivery_fee' => $serviceArea?->delivery_fee ?? 0,
                'minimum_portions' => $merchantProfile?->minimum_portions ?? 0,
                'total_portions' => (int) $cart->items->sum('quantity'),
                'subtotal' => $subtotal,
                'checkout_token' => $checkoutToken,
                'is_serviceable' => $serviceArea !== null,
                'items' => $cart->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'menu_id' => $item->menu_id,
                    'name' => $item->menu?->name ?? 'Menu dihapus',
                    'price_idr' => $item->menu?->price_idr ?? 0,
                    'quantity' => $item->quantity,
                    'is_active' => $item->menu?->is_active ?? false,
                    'category' => $item->menu?->category?->name,
                ]),
            ];
        }

        return Inertia::render('Customer/Cart', [
            'cart' => $cartData,
            'addresses' => $addresses,
        ]);
    }

    public function addItem(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'menu_id' => ['required', 'integer', 'exists:menus,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:10000'],
            'delivery_date' => ['required', 'date', 'after:today', 'before_or_equal:'.today()->addDays(30)->toDateString()],
            'region_id' => ['required', 'integer', 'exists:regions,id'],
            'replace_cart' => ['sometimes', 'boolean'],
        ]);

        $menu = Menu::query()->with('merchantProfile')->findOrFail($validated['menu_id']);
        if (! $menu->is_active || ! $menu->merchantProfile?->isPublished()) {
            return back()->with('error', 'Menu ini sedang tidak tersedia.');
        }

        $deliveryAddress = CustomerAddress::query()
            ->where('customer_id', $request->user()->id)
            ->where('region_id', $validated['region_id'])
            ->orderByDesc('is_default')
            ->orderBy('id')
            ->first();

        if (! $deliveryAddress) {
            return back()->with('error', 'Tambahkan alamat perusahaan di area katering ini sebelum memesan.');
        }

        $isServiceable = MerchantServiceArea::query()
            ->where('merchant_id', $menu->merchant_id)
            ->where('region_id', $deliveryAddress->region_id)
            ->exists();

        if (! $isServiceable) {
            return back()->with('error', 'Katering tidak melayani area alamat perusahaan yang dipilih.');
        }

        $deliveryDate = Carbon::parse($validated['delivery_date'])->startOfDay();
        $isOperating = MerchantOperatingDay::query()
            ->where('merchant_id', $menu->merchant_id)
            ->where('weekday', $deliveryDate->dayOfWeek)
            ->where('is_open', true)
            ->exists();

        if (! $isOperating) {
            return back()->with('error', 'Katering tidak beroperasi pada tanggal tersebut.');
        }

        $cart = DB::transaction(function () use ($deliveryAddress, $deliveryDate, $menu, $request, $validated): Cart {
            $cart = Cart::query()
                ->where('customer_id', $request->user()->id)
                ->lockForUpdate()
                ->first();

            if ($cart && $cart->merchant_id !== $menu->merchant_id && ! $request->boolean('replace_cart')) {
                throw ValidationException::withMessages([
                    'menu_id' => 'Keranjang berisi menu katering lain. Konfirmasi penggantian keranjang.',
                ]);
            }

            if (! $cart) {
                $cart = Cart::query()->create([
                    'customer_id' => $request->user()->id,
                    'merchant_id' => $menu->merchant_id,
                    'delivery_date' => $deliveryDate,
                    'region_id' => $deliveryAddress->region_id,
                ]);
            } elseif ($cart->merchant_id !== $menu->merchant_id) {
                $cart->items()->delete();
                $cart->update([
                    'merchant_id' => $menu->merchant_id,
                    'delivery_date' => $deliveryDate,
                    'region_id' => $deliveryAddress->region_id,
                ]);
            } else {
                $cart->update([
                    'delivery_date' => $deliveryDate,
                    'region_id' => $deliveryAddress->region_id,
                ]);
            }

            $item = CartItem::query()->firstOrNew([
                'cart_id' => $cart->id,
                'menu_id' => $menu->id,
            ]);
            $item->quantity = ($item->exists ? $item->quantity : 0) + $validated['quantity'];

            if ($item->quantity > 10000) {
                throw ValidationException::withMessages([
                    'quantity' => 'Jumlah menu tidak boleh melebihi 10.000 porsi.',
                ]);
            }

            $item->save();

            return $cart;
        }, 3);

        $request->session()->forget("checkout_token_{$cart->id}");

        return back()->with('success', 'Menu ditambahkan ke keranjang.');
    }

    public function updateItem(Request $request, CartItem $item): RedirectResponse
    {
        abort_unless($item->cart->customer_id === $request->user()->id, 404);

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:10000'],
        ]);

        $item->update(['quantity' => $validated['quantity']]);
        $request->session()->forget("checkout_token_{$item->cart_id}");

        return back()->with('success', 'Keranjang diperbarui.');
    }

    public function removeItem(Request $request, CartItem $item): RedirectResponse
    {
        $item->loadMissing('cart');
        abort_unless($item->cart->customer_id === $request->user()->id, 404);

        $cart = $item->cart;
        $item->delete();

        if (! $cart->items()->exists()) {
            $cart->delete();
        }

        $request->session()->forget("checkout_token_{$cart->id}");

        return back()->with('success', 'Menu dihapus dari keranjang.');
    }

    public function clear(Request $request): RedirectResponse
    {
        $cart = Cart::query()->where('customer_id', $request->user()->id)->first();
        $cart?->delete();

        if ($cart) {
            $request->session()->forget("checkout_token_{$cart->id}");
        }

        return back()->with('success', 'Keranjang dikosongkan.');
    }
}
