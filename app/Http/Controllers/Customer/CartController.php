<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Menu;
use App\Models\CustomerAddress;
use App\Models\MerchantServiceArea;
use App\Models\MerchantDateCapacity;
use App\Models\MerchantProfile;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = Cart::where('customer_id', auth()->id())
            ->with(['merchant', 'items.menu.category', 'region'])
            ->first();

        $addresses = CustomerAddress::where('user_id', auth()->id())
            ->with('region')
            ->get();

        $cartData = null;
        if ($cart) {
            $deliveryFee = 0;
            if ($cart->region_id) {
                $serviceArea = MerchantServiceArea::where('merchant_id', $cart->merchant_id)
                    ->where('region_id', $cart->region_id)
                    ->first();
                $deliveryFee = $serviceArea ? $serviceArea->delivery_fee : 0;
            }

            $merchantProfile = MerchantProfile::where('user_id', $cart->merchant_id)->first();
            $subtotal = $cart->items->sum(fn($i) => $i->quantity * ($i->menu ? $i->menu->price_idr : 0));

            $cartData = [
                'id' => $cart->id,
                'merchant_id' => $cart->merchant_id,
                'merchant_name' => $cart->merchant->company_name,
                'delivery_date' => $cart->delivery_date?->toDateString(),
                'region_id' => $cart->region_id,
                'region_name' => $cart->region?->city_name,
                'delivery_fee' => $deliveryFee,
                'minimum_portions' => $merchantProfile?->minimum_portions ?? 0,
                'total_portions' => $cart->items->sum('quantity'),
                'subtotal' => $subtotal,
                'items' => $cart->items->map(fn($i) => [
                    'id' => $i->id,
                    'menu_id' => $i->menu_id,
                    'name' => $i->menu ? $i->menu->name : 'Menu Dihapus',
                    'price_idr' => $i->menu ? $i->menu->price_idr : 0,
                    'quantity' => $i->quantity,
                    'is_active' => $i->menu ? $i->menu->is_active : false,
                    'category' => $i->menu?->category?->name,
                ]),
            ];
        }

        return Inertia::render('Customer/Cart', [
            'cart' => $cartData,
            'addresses' => $addresses,
        ]);
    }

    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1',
            'delivery_date' => 'required|date|after:today',
        ]);

        $menu = Menu::findOrFail($validated['menu_id']);
        if (!$menu->is_active) {
            return back()->with('error', 'Menu ini sedang tidak aktif.');
        }

        $cart = Cart::firstOrCreate(
            ['customer_id' => auth()->id()],
            ['merchant_id' => $menu->merchant_id, 'delivery_date' => $validated['delivery_date']]
        );

        if ($cart->merchant_id !== $menu->merchant_id) {
            // clear cart if different merchant
            $cart->items()->delete();
            $cart->update([
                'merchant_id' => $menu->merchant_id,
                'delivery_date' => $validated['delivery_date']
            ]);
        } else if ($cart->delivery_date?->toDateString() !== $validated['delivery_date']) {
            $cart->update(['delivery_date' => $validated['delivery_date']]);
        }

        $item = CartItem::where('cart_id', $cart->id)
            ->where('menu_id', $menu->id)
            ->first();

        if ($item) {
            $item->increment('quantity', $validated['quantity']);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'menu_id' => $menu->id,
                'quantity' => $validated['quantity'],
            ]);
        }

        return back()->with('success', 'Menu ditambahkan ke keranjang.');
    }

    public function updateItem(Request $request, CartItem $item)
    {
        if ($item->cart->customer_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item->update(['quantity' => $validated['quantity']]);

        return back()->with('success', 'Keranjang diperbarui.');
    }

    public function removeItem(CartItem $item)
    {
        if ($item->cart->customer_id !== auth()->id()) abort(403);
        
        $item->delete();
        
        if ($item->cart->items()->count() === 0) {
            $item->cart->delete();
        }

        return back()->with('success', 'Menu dihapus dari keranjang.');
    }

    public function clear(Request $request)
    {
        Cart::where('customer_id', auth()->id())->delete();
        return back()->with('success', 'Keranjang dikosongkan.');
    }
}