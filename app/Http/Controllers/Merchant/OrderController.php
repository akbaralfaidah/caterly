<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\OrderStatusEvent;
use Inertia\Inertia;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('merchant_id', auth()->id())
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Merchant/Orders', [
            'orders' => $orders
        ]);
    }

    public function accept(Request $request, Order $order)
    {
        if ($order->merchant_id !== auth()->id()) abort(403);
        if ($order->order_status !== 'pending_confirmation') return back()->with('error', 'Status tidak valid');

        $order->update(['order_status' => 'accepted']);
        OrderStatusEvent::create(['order_id' => $order->id, 'to_status' => 'accepted', 'reason' => 'Diterima Merchant']);
        return back()->with('success', 'Pesanan diterima.');
    }

    public function reject(Request $request, Order $order)
    {
        if ($order->merchant_id !== auth()->id()) abort(403);
        if ($order->order_status !== 'pending_confirmation') return back()->with('error', 'Status tidak valid');

        $order->update(['order_status' => 'rejected']);
        OrderStatusEvent::create(['order_id' => $order->id, 'to_status' => 'rejected', 'reason' => $request->input('reason', 'Ditolak Merchant')]);
        
        // Restore capacity
        $capacity = \App\Models\MerchantDateCapacity::where('merchant_id', $order->merchant_id)
            ->where('delivery_date', $order->delivery_date)->first();
        if ($capacity) $capacity->decrement('reserved_capacity', $order->total_portions);

        return back()->with('success', 'Pesanan ditolak.');
    }

    public function cancel(Request $request, Order $order)
    {
        if ($order->merchant_id !== auth()->id()) abort(403);
        if (!in_array($order->order_status, ['accepted', 'preparing'])) return back()->with('error', 'Status tidak valid');

        $order->update(['order_status' => 'cancelled']);
        OrderStatusEvent::create(['order_id' => $order->id, 'to_status' => 'cancelled', 'reason' => $request->input('reason', 'Dibatalkan sepihak oleh Merchant')]);
        
        $capacity = \App\Models\MerchantDateCapacity::where('merchant_id', $order->merchant_id)
            ->where('delivery_date', $order->delivery_date)->first();
        if ($capacity) $capacity->decrement('reserved_capacity', $order->total_portions);

        return back()->with('success', 'Pesanan dibatalkan.');
    }

    public function prepare(Request $request, Order $order)
    {
        if ($order->merchant_id !== auth()->id()) abort(403);
        if ($order->order_status !== 'accepted') return back()->with('error', 'Status tidak valid');
        if ($order->payment_status !== 'paid') return back()->with('error', 'Belum dibayar lunas.');

        $order->update(['order_status' => 'preparing']);
        OrderStatusEvent::create(['order_id' => $order->id, 'to_status' => 'preparing']);
        return back()->with('success', 'Status diubah ke Dipersiapkan.');
    }

    public function deliver(Request $request, Order $order)
    {
        if ($order->merchant_id !== auth()->id()) abort(403);
        if ($order->order_status !== 'preparing') return back()->with('error', 'Status tidak valid');

        $order->update(['order_status' => 'delivering']);
        OrderStatusEvent::create(['order_id' => $order->id, 'to_status' => 'delivering']);
        return back()->with('success', 'Status diubah ke Dikirim.');
    }

    public function approvePayment(Request $request, Order $order)
    {
        if ($order->merchant_id !== auth()->id()) abort(403);
        
        $proof = PaymentProof::where('order_id', $order->id)->latest()->first();
        if (!$proof || $proof->status !== 'submitted') return back()->with('error', 'Bukti tidak ditemukan.');

        $proof->update(['status' => 'approved', 'reviewed_at' => now()]);
        $order->update(['payment_status' => 'paid']);

        return back()->with('success', 'Pembayaran diterima.');
    }

    public function rejectPayment(Request $request, Order $order)
    {
        if ($order->merchant_id !== auth()->id()) abort(403);
        
        $proof = PaymentProof::where('order_id', $order->id)->latest()->first();
        if (!$proof || $proof->status !== 'submitted') return back()->with('error', 'Bukti tidak ditemukan.');

        $proof->update(['status' => 'rejected', 'reviewed_at' => now(), 'rejection_reason' => $request->input('reason', 'Bukti tidak valid')]);
        $order->update(['payment_status' => 'unpaid']);

        return back()->with('success', 'Pembayaran ditolak.');
    }
}