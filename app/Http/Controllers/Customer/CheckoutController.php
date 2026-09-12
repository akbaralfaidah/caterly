<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CustomerAddress;
use App\Models\MerchantServiceArea;
use App\Models\MerchantProfile;
use App\Models\MerchantDateCapacity;
use App\Models\OrderStatusEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $customerId = auth()->id();
        
        // Find cart
        $cart = Cart::where('customer_id', $customerId)
            ->with(['merchant', 'items.menu.category', 'region'])
            ->first();

        if (!$cart || $cart->items->count() === 0) {
            return back()->with('error', 'Keranjang Anda kosong.');
        }

        // Get default address
        $address = CustomerAddress::where('customer_id', $customerId)
            ->where('is_default', true)
            ->with('region')
            ->first();

        if (!$address) {
            return back()->with('error', 'Silakan atur alamat pengiriman utama di profil Anda.');
        }

        // Must match service area
        $serviceArea = MerchantServiceArea::where('merchant_id', $cart->merchant_id)
            ->where('region_id', $address->region_id)
            ->first();

        if (!$serviceArea) {
            return back()->with('error', 'Katering tidak melayani area pengiriman Anda. Silakan ganti alamat atau cari katering lain.');
        }

        // Check minimum portions
        $merchantProfile = MerchantProfile::where('user_id', $cart->merchant_id)->first();
        $totalPortions = $cart->items->sum('quantity');
        if ($totalPortions < ($merchantProfile->minimum_portions ?? 1)) {
            return back()->with('error', 'Total pesanan belum memenuhi batas minimum katering.');
        }

        // Generate Idempotency Key or reuse from session
        $idempotencyKey = $request->session()->get("checkout_idempotency_{$cart->id}");
        if (!$idempotencyKey) {
            $idempotencyKey = (string) Str::uuid();
            $request->session()->put("checkout_idempotency_{$cart->id}", $idempotencyKey);
        }

        // Generate Request Fingerprint
        $fingerprint = hash('sha256', $cart->id . $cart->updated_at->timestamp . $totalPortions);

        try {
            $order = DB::transaction(function () use ($cart, $address, $serviceArea, $idempotencyKey, $fingerprint, $merchantProfile, $totalPortions) {
                // 1. Check idempotency
                $existingOrder = Order::where('idempotency_key', $idempotencyKey)
                    ->where('request_fingerprint', $fingerprint)
                    ->first();
                if ($existingOrder) {
                    return $existingOrder; // Return existing if duplicate request
                }

                // 2. Lock capacity row
                $capacity = MerchantDateCapacity::firstOrCreate(
                    ['merchant_id' => $cart->merchant_id, 'delivery_date' => $cart->delivery_date],
                    ['reserved_capacity' => 0]
                );

                // Reload with exclusive lock (pessimistic lock)
                $lockedCapacity = MerchantDateCapacity::where('id', $capacity->id)->lockForUpdate()->first();
                
                if ($lockedCapacity->is_closed) {
                    throw new \Exception('Tanggal pengiriman telah ditutup oleh katering.');
                }

                $maxCapacity = $merchantProfile->default_daily_capacity ?? 100;
                $remaining = $maxCapacity - $lockedCapacity->reserved_capacity;
                if ($totalPortions > $remaining) {
                    throw new \Exception("Kapasitas katering penuh. Sisa kapasitas: {$remaining} porsi.");
                }

                // 3. Create Order
                $subtotal = $cart->items->sum(fn($i) => $i->quantity * $i->menu->price_idr);
                $deliveryFee = $serviceArea->delivery_fee;
                $total = $subtotal + $deliveryFee;

                // Snapshots
                $customerSnapshot = [
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'phone' => auth()->user()->phone,
                    'company_name' => auth()->user()->company_name,
                ];
                $merchantSnapshot = [
                    'name' => $cart->merchant->company_name,
                    'phone' => $merchantProfile->phone ?? $cart->merchant->phone,
                    'address' => $merchantProfile->address ?? '',
                ];
                $addressSnapshot = [
                    'label' => $address->label,
                    'receiver' => $address->receiver,
                    'phone' => $address->phone,
                    'address' => $address->address,
                    'region' => $address->region->city_name,
                    'notes' => $address->notes,
                ];

                $orderNumber = 'ORD-' . strtoupper(Str::random(8));

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'customer_id' => auth()->id(),
                    'merchant_id' => $cart->merchant_id,
                    'idempotency_key' => $idempotencyKey,
                    'request_fingerprint' => $fingerprint,
                    'delivery_date' => $cart->delivery_date,
                    'delivery_slot' => 'lunch', // Default lunch
                    'order_status' => 'pending_confirmation',
                    'payment_status' => 'unpaid',
                    'total_portions' => $totalPortions,
                    'subtotal_idr' => $subtotal,
                    'delivery_fee_idr' => $deliveryFee,
                    'total_idr' => $total,
                    'expires_at' => now()->addHours(2), // Expire if not confirmed/paid in 2 hours
                    'customer_snapshot' => $customerSnapshot,
                    'merchant_snapshot' => $merchantSnapshot,
                    'address_snapshot' => $addressSnapshot,
                ]);

                // 4. Create Order Items
                foreach ($cart->items as $item) {
                    if (!$item->menu->is_active) {
                        throw new \Exception("Menu {$item->menu->name} tidak aktif.");
                    }
                    OrderItem::create([
                        'order_id' => $order->id,
                        'menu_id' => $item->menu_id,
                        'menu_name_snapshot' => $item->menu->name,
                        'category_snapshot' => $item->menu->category->name ?? 'Lainnya',
                        'unit_price_idr' => $item->menu->price_idr,
                        'quantity' => $item->quantity,
                        'line_total_idr' => $item->menu->price_idr * $item->quantity,
                    ]);
                }

                // 5. Update Capacity
                $lockedCapacity->increment('reserved_capacity', $totalPortions);

                // 6. Record Status Event
                OrderStatusEvent::create([
                    'order_id' => $order->id,
                    'to_status' => 'pending_confirmation',
                    'reason' => 'Pesanan baru dibuat',
                ]);

                // 7. Clear Cart
                $cart->items()->delete();
                $cart->delete();

                return $order;
            });

            // Clear idempotency key from session after success
            $request->session()->forget("checkout_idempotency_{$cart->id}");

            return redirect()->route('customer.orders.show', $order->id)
                ->with('success', 'Pesanan berhasil dibuat! Menunggu konfirmasi merchant.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}