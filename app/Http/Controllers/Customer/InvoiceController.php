<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Invoice;
use Inertia\Inertia;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('customer_id', auth()->id())
            ->whereHas('invoice')
            ->with(['invoice', 'items'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Customer/Invoice', [
            'orders' => $orders->map(fn($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'invoice_number' => $o->invoice?->invoice_number,
                'issued_at' => $o->invoice?->issued_at?->toDateString(),
                'status' => $o->invoice?->status,
                'merchant_name' => $o->merchant_snapshot['company_name'] ?? '-',
                'delivery_date' => $o->delivery_date?->toDateString(),
                'total_idr' => $o->total_idr,
                'order_status' => $o->order_status,
                'items_count' => $o->items->count(),
            ]),
        ]);
    }

    public function show(Order $order)
    {
        if ($order->customer_id !== auth()->id()) abort(403);
        $order->load(['items', 'paymentProofs', 'invoice']);

        return Inertia::render('Invoice', [
            'order' => $order,
            'is_merchant' => false
        ]);
    }

    public function print(Invoice $invoice)
    {
        $order = $invoice->order;
        if ($order->customer_id !== auth()->id()) abort(403);
        $order->load(['items', 'paymentProofs']);

        return Inertia::render('Invoice', [
            'order' => $order,
            'is_merchant' => false,
            'print_mode' => true,
        ]);
    }
}