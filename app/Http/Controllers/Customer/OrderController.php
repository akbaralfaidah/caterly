<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomerAddress;
use App\Models\Menu;
use App\Models\MerchantOperatingDay;
use App\Models\Notification;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Support\OrderLifecycle;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('customer_id', $request->user()->id)
            ->with('items')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Customer/Orders', ['orders' => $orders]);
    }

    public function show(Request $request, Order $order): Response
    {
        $this->ensureOwner($request, $order);
        $order->load(['items', 'invoice', 'statusEvents', 'paymentProofs']);

        return Inertia::render('Customer/OrderDetail', ['order' => $order]);
    }

    public function cancel(Request $request, Order $order, OrderLifecycle $lifecycle): RedirectResponse
    {
        $this->ensureOwner($request, $order);

        try {
            $lifecycle->transition(
                $order,
                'cancelled',
                ['pending_confirmation'],
                $request->user()->id,
                'Dibatalkan oleh pelanggan.',
            );
        } catch (DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Pesanan berhasil dibatalkan.');
    }

    public function confirmReceived(Request $request, Order $order, OrderLifecycle $lifecycle): RedirectResponse
    {
        $this->ensureOwner($request, $order);

        try {
            $lifecycle->transition(
                $order,
                'completed',
                ['delivering'],
                $request->user()->id,
                'Pesanan diterima pelanggan.',
            );
        } catch (DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Pesanan selesai. Terima kasih!');
    }

    public function reorder(Request $request, Order $order): RedirectResponse
    {
        $this->ensureOwner($request, $order);
        $validated = $request->validate([
            'delivery_date' => ['required', 'date', 'after:today', 'before_or_equal:'.today()->addDays(30)->toDateString()],
            'replace_cart' => ['required', 'accepted'],
        ]);

        if ($order->order_status !== 'completed') {
            return back()->with('error', 'Hanya pesanan selesai yang dapat dipesan ulang.');
        }

        $deliveryDate = Carbon::parse($validated['delivery_date'])->startOfDay();
        if (now()->greaterThanOrEqualTo($deliveryDate->copy()->subDay()->setTime(16, 0))) {
            return back()->with('error', 'Batas pemesanan pukul 16.00 WIB pada H-1 telah lewat.');
        }

        $isOperating = MerchantOperatingDay::query()
            ->where('merchant_id', $order->merchant_id)
            ->where('weekday', $deliveryDate->dayOfWeek)
            ->where('is_open', true)
            ->exists();

        if (! $isOperating) {
            return back()->with('error', 'Katering tidak beroperasi pada tanggal tersebut.');
        }

        $order->load('items');
        $availableMenus = Menu::query()
            ->where('merchant_id', $order->merchant_id)
            ->where('is_active', true)
            ->whereIn('id', $order->items->pluck('menu_id')->filter())
            ->get()
            ->keyBy('id');

        if ($availableMenus->isEmpty()) {
            return back()->with('error', 'Semua menu pada pesanan lama sudah tidak tersedia.');
        }

        DB::transaction(function () use ($availableMenus, $deliveryDate, $order, $request): void {
            $existingCart = Cart::query()
                ->where('customer_id', $request->user()->id)
                ->lockForUpdate()
                ->first();
            $existingCart?->delete();

            $defaultAddress = CustomerAddress::query()
                ->where('customer_id', $request->user()->id)
                ->where('is_default', true)
                ->first();

            $cart = Cart::query()->create([
                'customer_id' => $request->user()->id,
                'merchant_id' => $order->merchant_id,
                'delivery_date' => $deliveryDate,
                'region_id' => $defaultAddress?->region_id,
            ]);

            foreach ($order->items as $oldItem) {
                if ($oldItem->menu_id && $availableMenus->has($oldItem->menu_id)) {
                    CartItem::query()->create([
                        'cart_id' => $cart->id,
                        'menu_id' => $oldItem->menu_id,
                        'quantity' => $oldItem->quantity,
                    ]);
                }
            }
        }, 3);

        return redirect()->route('customer.cart')
            ->with('success', 'Menu yang masih tersedia telah dimasukkan ke keranjang.');
    }

    public function uploadPayment(Request $request, Order $order): RedirectResponse
    {
        $this->ensureOwner($request, $order);
        $request->validate([
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'extensions:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ]);

        $path = null;

        try {
            DB::transaction(function () use (&$path, $order, $request): void {
                $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);

                if ($lockedOrder->order_status !== 'accepted') {
                    throw ValidationException::withMessages([
                        'proof' => 'Bukti pembayaran hanya dapat diunggah setelah pesanan diterima.',
                    ]);
                }

                if ($lockedOrder->payment_status === 'paid') {
                    throw ValidationException::withMessages(['proof' => 'Pesanan ini sudah lunas.']);
                }

                $hasPendingProof = PaymentProof::query()
                    ->where('order_id', $lockedOrder->id)
                    ->where('status', 'submitted')
                    ->exists();

                if ($hasPendingProof) {
                    throw ValidationException::withMessages([
                        'proof' => 'Bukti sebelumnya masih menunggu pemeriksaan.',
                    ]);
                }

                $file = $request->file('proof');
                $path = $file->store("payment-proofs/{$lockedOrder->id}", 'local');

                PaymentProof::query()->create([
                    'order_id' => $lockedOrder->id,
                    'storage_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                    'status' => 'submitted',
                    'submitted_by' => $request->user()->id,
                ]);

                $lockedOrder->update(['payment_status' => 'pending_review']);

                Notification::query()->firstOrCreate(
                    [
                        'user_id' => $lockedOrder->merchant_id,
                        'event_key' => "order:{$lockedOrder->id}:payment:submitted",
                    ],
                    [
                        'type' => 'payment',
                        'title' => 'Bukti pembayaran baru',
                        'message' => "Bukti pembayaran {$lockedOrder->order_number} menunggu pemeriksaan.",
                        'resource_type' => 'order',
                        'resource_id' => $lockedOrder->id,
                    ],
                );
            }, 3);
        } catch (Throwable $exception) {
            if ($path) {
                Storage::disk('local')->delete($path);
            }

            throw $exception;
        }

        return back()->with('success', 'Bukti pembayaran berhasil diunggah dan menunggu verifikasi.');
    }

    private function ensureOwner(Request $request, Order $order): void
    {
        abort_unless($order->customer_id === $request->user()->id, 404);
    }
}
