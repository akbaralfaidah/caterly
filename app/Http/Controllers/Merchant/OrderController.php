<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('merchant_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Merchant/Orders', [
            'orders' => $orders
        ]);
    }
}