<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function show(Order $order)
    {
        if ($order->customer_id !== auth()->id()) abort(403);
        $order->load(['items', 'paymentProofs']);

        return Inertia::render('Invoice', [
            'order' => $order,
            'is_merchant' => false
        ]);
    }
}