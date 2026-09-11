<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function show(Order $order)
    {
        if ($order->merchant_id !== auth()->id()) abort(403);
        $order->load(['items', 'paymentProofs']);

        return Inertia::render('Invoice', [
            'order' => $order,
            'is_merchant' => true
        ]);
    }
}