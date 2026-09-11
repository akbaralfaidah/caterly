<?php
namespace App\Http\Controllers\Customer;

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
        $orders = Order::where('customer_id', auth()->id())
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Customer/Orders', [
            'orders' => $orders
        ]);
    }

    public function show(Order $order)
    {
        if ($order->customer_id !== auth()->id()) abort(403);

        $order->load(['items', 'statusEvents', 'paymentProofs']);

        return Inertia::render('Customer/OrderDetail', [
            'order' => $order
        ]);
    }

    public function cancel(Request $request, Order $order)
    {
        if ($order->customer_id !== auth()->id()) abort(403);
        if ($order->order_status !== 'pending_confirmation') {
            return back()->with('error', 'Pesanan tidak dapat dibatalkan saat ini.');
        }

        $order->update(['order_status' => 'cancelled']);
        
        OrderStatusEvent::create([
            'order_id' => $order->id,
            'to_status' => 'cancelled',
            'reason' => 'Dibatalkan oleh pelanggan',
        ]);

        return back()->with('success', 'Pesanan berhasil dibatalkan.');
    }

    public function confirmReceived(Request $request, Order $order)
    {
        if ($order->customer_id !== auth()->id()) abort(403);
        if ($order->order_status !== 'delivering') {
            return back()->with('error', 'Pesanan belum dikirim.');
        }

        $order->update(['order_status' => 'completed']);
        
        OrderStatusEvent::create([
            'order_id' => $order->id,
            'to_status' => 'completed',
            'reason' => 'Pesanan diterima pelanggan',
        ]);

        return back()->with('success', 'Pesanan selesai! Terima kasih.');
    }

    public function uploadPayment(Request $request, Order $order)
    {
        if ($order->customer_id !== auth()->id()) abort(403);
        if ($order->order_status === 'cancelled' || $order->order_status === 'rejected' || $order->order_status === 'expired') {
            return back()->with('error', 'Pesanan tidak aktif.');
        }

        $request->validate([
            'proof' => 'required|image|max:5120', // 5MB max
        ]);

        $path = $request->file('proof')->store('payments', 'private');

        PaymentProof::create([
            'order_id' => $order->id,
            'status' => 'submitted',
            'original_name' => $request->file('proof')->getClientOriginalName(),
            'file_path' => $path,
        ]);

        $order->update(['payment_status' => 'pending_review']);

        return back()->with('success', 'Bukti pembayaran berhasil diunggah dan menunggu verifikasi.');
    }
}