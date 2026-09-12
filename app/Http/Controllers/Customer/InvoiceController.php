<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('customer_id', $request->user()->id)
            ->whereHas('invoice')
            ->with(['invoice', 'items'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Customer/Invoice', [
            'orders' => $orders->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'invoice_number' => $order->invoice?->invoice_number,
                'issued_at' => $order->invoice?->issued_at?->toDateString(),
                'status' => $order->invoice?->status,
                'merchant_name' => $order->merchant_snapshot['company_name'] ?? $order->merchant_snapshot['name'] ?? '-',
                'delivery_date' => $order->delivery_date?->toDateString(),
                'total_idr' => $order->total_idr,
                'order_status' => $order->order_status,
                'items_count' => $order->items->count(),
            ]),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->customer_id === $request->user()->id, 404);
        $order->load(['items', 'paymentProofs', 'invoice']);

        return Inertia::render('Invoice', ['order' => $order, 'is_merchant' => false]);
    }

    public function print(Request $request, Invoice $invoice): Response
    {
        $invoice->loadMissing('order');
        abort_unless($invoice->order->customer_id === $request->user()->id, 404);
        $invoice->order->load(['items', 'paymentProofs', 'invoice']);

        return Inertia::render('Invoice', [
            'order' => $invoice->order,
            'is_merchant' => false,
            'print_mode' => true,
        ]);
    }
}
