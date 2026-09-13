<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $merchantId = $request->user()->id;

        $activeOrders = Order::query()
            ->where('merchant_id', $merchantId)
            ->whereNotIn('order_status', ['cancelled', 'rejected', 'expired', 'completed'])
            ->with('items')
            ->orderBy('delivery_date')
            ->orderBy('id')
            ->limit(5)
            ->get();

        return Inertia::render('Merchant/Dashboard', [
            'stats' => [
                'pending_confirmation' => Order::query()
                    ->where('merchant_id', $merchantId)
                    ->where('order_status', 'pending_confirmation')
                    ->count(),
                'pending_payment' => Order::query()
                    ->where('merchant_id', $merchantId)
                    ->where('payment_status', 'pending_review')
                    ->count(),
                'today_production' => Order::query()
                    ->where('merchant_id', $merchantId)
                    ->whereDate('delivery_date', today())
                    ->withVerifiedDeposit()
                    ->whereIn('order_status', ['accepted', 'preparing', 'delivering', 'completed'])
                    ->sum('total_portions'),
            ],
            'active_orders' => $activeOrders,
        ]);
    }

    public function production(Request $request): Response
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date'],
        ]);
        $date = $validated['date'] ?? today()->toDateString();

        $orders = Order::query()
            ->where('merchant_id', $request->user()->id)
            ->whereDate('delivery_date', $date)
            ->withVerifiedDeposit()
            ->whereIn('order_status', ['accepted', 'preparing', 'delivering', 'completed'])
            ->with('items')
            ->orderBy('order_number')
            ->get();

        $menuTotals = OrderItem::query()
            ->whereHas('order', fn ($query) => $query
                ->where('merchant_id', $request->user()->id)
                ->whereDate('delivery_date', $date)
                ->withVerifiedDeposit()
                ->whereIn('order_status', ['accepted', 'preparing', 'delivering', 'completed']))
            ->selectRaw('menu_name_snapshot, category_snapshot, SUM(quantity) AS total_quantity')
            ->groupBy('menu_name_snapshot', 'category_snapshot')
            ->orderBy('category_snapshot')
            ->orderBy('menu_name_snapshot')
            ->get();

        return Inertia::render('Merchant/Production', [
            'date' => $date,
            'orders' => $orders,
            'menu_totals' => $menuTotals,
            'total_portions' => (int) $orders->sum('total_portions'),
        ]);
    }
}
