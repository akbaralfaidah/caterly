<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('customer_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Customer/Orders', [
            'orders' => $orders
        ]);
    }
}