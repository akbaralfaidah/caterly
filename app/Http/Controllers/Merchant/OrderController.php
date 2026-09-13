<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Support\OrderLifecycle;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('merchant_id', $request->user()->id)
            ->with(['items', 'paymentProofs'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Merchant/Orders', ['orders' => $orders]);
    }

    public function show(Request $request, Order $order): Response
    {
        $this->ensureOwner($request, $order);
        $order->load(['customer', 'items', 'invoice', 'statusEvents', 'paymentProofs']);

        return Inertia::render('Merchant/OrderDetail', ['order' => $order]);
    }

    public function accept(Request $request, Order $order, OrderLifecycle $lifecycle): RedirectResponse
    {
        $this->ensureOwner($request, $order);

        try {
            $updatedOrder = $lifecycle->transition(
                $order,
                'accepted',
                ['pending_confirmation'],
                $request->user()->id,
                'Diterima oleh katering.',
            );
        } catch (DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        if ($updatedOrder->order_status === 'expired') {
            return back()->with('error', 'Pesanan sudah kedaluwarsa dan kapasitas telah dilepas.');
        }

        return back()->with('success', 'Pesanan diterima.');
    }

    public function reject(Request $request, Order $order, OrderLifecycle $lifecycle): RedirectResponse
    {
        $this->ensureOwner($request, $order);
        $validated = $request->validate(['reason' => ['required', 'string', 'max:500']]);

        return $this->runTransition(
            $lifecycle,
            $order,
            'rejected',
            ['pending_confirmation'],
            $request->user()->id,
            $validated['reason'],
            'Pesanan ditolak dan kapasitas dilepas.',
        );
    }

    public function cancel(Request $request, Order $order, OrderLifecycle $lifecycle): RedirectResponse
    {
        $this->ensureOwner($request, $order);
        $validated = $request->validate(['reason' => ['required', 'string', 'max:500']]);

        try {
            DB::transaction(function () use ($lifecycle, $order, $request, $validated): void {
                $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);

                if ($lockedOrder->payment_status !== 'unpaid' || $lockedOrder->paymentProofs()->where('status', 'submitted')->exists()) {
                    throw new DomainException('Pesanan dengan pembayaran aktif tidak dapat dibatalkan sepihak.');
                }

                $lifecycle->transition(
                    $lockedOrder,
                    'cancelled',
                    ['accepted'],
                    $request->user()->id,
                    $validated['reason'],
                );
            }, 3);
        } catch (DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Pesanan dibatalkan dan kapasitas dilepas.');
    }

    public function prepare(Request $request, Order $order, OrderLifecycle $lifecycle): RedirectResponse
    {
        $this->ensureOwner($request, $order);

        if ($order->approvedPaymentAmount() < intdiv($order->total_idr + 1, 2)) {
            return back()->with('error', 'DP minimum 50% belum diverifikasi.');
        }

        return $this->runTransition(
            $lifecycle,
            $order,
            'preparing',
            ['accepted'],
            $request->user()->id,
            'Produksi dimulai.',
            'Status diubah ke Dipersiapkan.',
        );
    }

    public function deliver(Request $request, Order $order, OrderLifecycle $lifecycle): RedirectResponse
    {
        $this->ensureOwner($request, $order);

        if ($order->payment_status !== 'paid' || $order->remainingPaymentAmount() > 0) {
            return back()->with('error', 'Pelunasan 100% harus diverifikasi sebelum pesanan dikirim.');
        }

        return $this->runTransition(
            $lifecycle,
            $order,
            'delivering',
            ['preparing'],
            $request->user()->id,
            'Pesanan diserahkan kepada kurir.',
            'Status diubah ke Dikirim.',
        );
    }

    public function approvePayment(Request $request, Order $order): RedirectResponse
    {
        $this->ensureOwner($request, $order);

        try {
            DB::transaction(function () use ($order, $request): void {
                $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
                if (! in_array($lockedOrder->order_status, ['accepted', 'preparing'], true)) {
                    throw new DomainException('Pembayaran hanya dapat diverifikasi saat pesanan diterima atau sedang dipersiapkan.');
                }

                $proof = PaymentProof::query()
                    ->where('order_id', $lockedOrder->id)
                    ->where('status', 'submitted')
                    ->lockForUpdate()
                    ->latest('id')
                    ->first();

                if (! $proof) {
                    throw new DomainException('Bukti yang menunggu pemeriksaan tidak ditemukan.');
                }

                $proof->update([
                    'status' => 'approved',
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => null,
                ]);
                $approvedAmount = $lockedOrder->approvedPaymentAmount();
                $paymentStatus = $approvedAmount >= $lockedOrder->total_idr ? 'paid' : 'partially_paid';
                $lockedOrder->update(['payment_status' => $paymentStatus]);
                $this->notifyPayment($lockedOrder, $proof, 'approved', $paymentStatus === 'paid');
            }, 3);
        } catch (DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        $message = $order->refresh()->payment_status === 'paid'
            ? 'Pelunasan diterima. Pesanan sudah boleh dikirim.'
            : 'DP diterima. Pesanan dapat segera disiapkan.';

        return back()->with('success', $message);
    }

    public function rejectPayment(Request $request, Order $order): RedirectResponse
    {
        $this->ensureOwner($request, $order);
        $validated = $request->validate(['reason' => ['required', 'string', 'max:500']]);

        try {
            DB::transaction(function () use ($order, $request, $validated): void {
                $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
                if (! in_array($lockedOrder->order_status, ['accepted', 'preparing'], true)) {
                    throw new DomainException('Pembayaran hanya dapat diverifikasi saat pesanan diterima atau sedang dipersiapkan.');
                }

                $proof = PaymentProof::query()
                    ->where('order_id', $lockedOrder->id)
                    ->where('status', 'submitted')
                    ->lockForUpdate()
                    ->latest('id')
                    ->first();

                if (! $proof) {
                    throw new DomainException('Bukti yang menunggu pemeriksaan tidak ditemukan.');
                }

                $proof->update([
                    'status' => 'rejected',
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => $validated['reason'],
                ]);
                $lockedOrder->update([
                    'payment_status' => $lockedOrder->approvedPaymentAmount() > 0 ? 'partially_paid' : 'unpaid',
                ]);
                $this->notifyPayment($lockedOrder, $proof, 'rejected');
            }, 3);
        } catch (DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Pembayaran ditolak.');
    }

    public function viewProof(Request $request, PaymentProof $proof): StreamedResponse
    {
        $proof->loadMissing('order');
        abort_unless($proof->order->merchant_id === $request->user()->id, 404);
        abort_unless(Storage::disk('local')->exists($proof->storage_path), 404);

        return Storage::disk('local')->download(
            $proof->storage_path,
            $proof->original_name ?: 'bukti-pembayaran',
            [
                'Content-Type' => $proof->mime_type,
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }

    /**
     * @param  list<string>  $allowedFrom
     */
    private function runTransition(
        OrderLifecycle $lifecycle,
        Order $order,
        string $toStatus,
        array $allowedFrom,
        int $actorId,
        string $reason,
        string $successMessage,
    ): RedirectResponse {
        try {
            $lifecycle->transition($order, $toStatus, $allowedFrom, $actorId, $reason);
        } catch (DomainException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', $successMessage);
    }

    private function notifyPayment(Order $order, PaymentProof $proof, string $status, bool $isFullyPaid = false): void
    {
        $approved = $status === 'approved';

        Notification::query()->firstOrCreate(
            [
                'user_id' => $order->customer_id,
                'event_key' => "order:{$order->id}:payment:{$status}:{$proof->id}",
            ],
            [
                'type' => 'payment',
                'title' => $approved ? ($isFullyPaid ? 'Pelunasan diterima' : 'DP diterima') : 'Pembayaran ditolak',
                'message' => $approved
                    ? ($isFullyPaid
                        ? "Pelunasan {$order->order_number} sebesar Rp".number_format($proof->amount_idr, 0, ',', '.').' telah diverifikasi. Pesanan sudah lunas.'
                        : "DP {$order->order_number} sebesar Rp".number_format($proof->amount_idr, 0, ',', '.').' telah diverifikasi. Silakan lunasi sebelum pengiriman.')
                    : "Bukti pembayaran {$order->order_number} ditolak. Silakan unggah ulang.",
                'resource_type' => 'order',
                'resource_id' => $order->id,
            ],
        );
    }

    private function ensureOwner(Request $request, Order $order): void
    {
        abort_unless($order->merchant_id === $request->user()->id, 404);
    }
}
