<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $merchantId = auth()->id();
        
        $pendingCount = Order::where('merchant_id', $merchantId)
            ->where('order_status', 'pending_confirmation')
            ->count();
            
        $paymentCount = Order::where('merchant_id', $merchantId)
            ->where('payment_status', 'pending_review')
            ->count();
            
        $todayProduction = Order::where('merchant_id', $merchantId)
            ->where('delivery_date', date('Y-m-d'))
            ->whereIn('order_status', ['accepted', 'preparing', 'delivering', 'completed'])
            ->sum('total_portions');

        $activeOrders = Order::where('merchant_id', $merchantId)
            ->whereNotIn('order_status', ['cancelled', 'rejected', 'expired', 'completed'])
            ->orderBy('delivery_date')
            ->with(['items'])
            ->take(5)
            ->get();

        return Inertia::render('Merchant/Dashboard', [
            'stats' => [
                'pending_confirmation' => $pendingCount,
                'pending_payment' => $paymentCount,
                'today_production' => $todayProduction,
            ],
            'active_orders' => $activeOrders
        ]);
    }
}