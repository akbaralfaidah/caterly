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