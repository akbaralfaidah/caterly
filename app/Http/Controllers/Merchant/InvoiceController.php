<?php

namespace App\Http\Controllers\Merchant;

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
            ->where('merchant_id', $request->user()->id)
            ->whereHas('invoice')
            ->with(['invoice', 'items'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Merchant/Invoices', ['orders' => $orders]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->merchant_id === $request->user()->id, 404);
        $order->load(['items', 'paymentProofs', 'invoice']);

        return Inertia::render('Invoice', ['order' => $order, 'is_merchant' => true]);
    }

    public function print(Request $request, Invoice $invoice): Response
    {
        $invoice->loadMissing('order');
        abort_unless($invoice->order->merchant_id === $request->user()->id, 404);
        $invoice->order->load(['items', 'paymentProofs', 'invoice']);

        return Inertia::render('Invoice', [
            'order' => $invoice->order,
            'is_merchant' => true,
            'print_mode' => true,
        ]);
    }
}
