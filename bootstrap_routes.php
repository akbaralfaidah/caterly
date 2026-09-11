<?php
/**
 * Caterly Routes & Frontend Files Generator
 */
$files = [];

// ===== ROUTES =====
$files['routes/web.php'] = <<<'PHP'
<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ProfileController as CustomerProfileController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\InvoiceController as CustomerInvoiceController;
use App\Http\Controllers\Merchant\DashboardController;
use App\Http\Controllers\Merchant\MenuController;
use App\Http\Controllers\Merchant\OrderController as MerchantOrderController;
use App\Http\Controllers\Merchant\ProfileController as MerchantProfileController;
use App\Http\Controllers\Merchant\CapacityController;
use App\Http\Controllers\Merchant\InvoiceController as MerchantInvoiceController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

// Public
Route::get('/', fn() => redirect('/marketplace'));
Route::get('/marketplace', [MarketplaceController::class, 'index'])->name('marketplace.index');
Route::get('/marketplace/{merchant}', [MarketplaceController::class, 'show'])->name('merchants.show');

// Guest only
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});

// Auth
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

// Customer routes
Route::middleware(['auth'])->prefix('customer')->name('customer.')->group(function () {
    // Cart
    Route::get('/cart', [CartController::class, 'show'])->name('cart');
    Route::post('/cart/add', [CartController::class, 'addItem'])->name('cart.add');
    Route::patch('/cart/items/{item}', [CartController::class, 'updateItem'])->name('cart.update');
    Route::delete('/cart/items/{item}', [CartController::class, 'removeItem'])->name('cart.remove');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');

    // Checkout
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout');

    // Orders
    Route::get('/orders', [CustomerOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [CustomerOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [CustomerOrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/orders/{order}/confirm-received', [CustomerOrderController::class, 'confirmReceived'])->name('orders.confirm-received');
    Route::post('/orders/{order}/reorder', [CustomerOrderController::class, 'reorder'])->name('orders.reorder');

    // Payment
    Route::post('/orders/{order}/payment', [CustomerOrderController::class, 'uploadPayment'])->name('orders.payment.upload');

    // Invoices
    Route::get('/invoices', [CustomerInvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}', [CustomerInvoiceController::class, 'show'])->name('invoices.show');
    Route::get('/invoices/{invoice}/print', [CustomerInvoiceController::class, 'print'])->name('invoices.print');

    // Profile
    Route::get('/profile', [CustomerProfileController::class, 'edit'])->name('profile');
    Route::patch('/profile', [CustomerProfileController::class, 'update'])->name('profile.update');

    // Addresses
    Route::get('/addresses', [AddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::patch('/addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::post('/addresses/{address}/default', [AddressController::class, 'setDefault'])->name('addresses.default');
});

// Merchant routes
Route::middleware(['auth'])->prefix('merchant')->name('merchant.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Menu
    Route::get('/menus', [MenuController::class, 'index'])->name('menus.index');
    Route::get('/menus/create', [MenuController::class, 'create'])->name('menus.create');
    Route::post('/menus', [MenuController::class, 'store'])->name('menus.store');
    Route::get('/menus/{menu}/edit', [MenuController::class, 'edit'])->name('menus.edit');
    Route::patch('/menus/{menu}', [MenuController::class, 'update'])->name('menus.update');
    Route::delete('/menus/{menu}', [MenuController::class, 'destroy'])->name('menus.destroy');
    Route::patch('/menus/{menu}/toggle', [MenuController::class, 'toggle'])->name('menus.toggle');

    // Orders
    Route::get('/orders', [MerchantOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [MerchantOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/accept', [MerchantOrderController::class, 'accept'])->name('orders.accept');
    Route::post('/orders/{order}/reject', [MerchantOrderController::class, 'reject'])->name('orders.reject');
    Route::post('/orders/{order}/cancel', [MerchantOrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/orders/{order}/prepare', [MerchantOrderController::class, 'prepare'])->name('orders.prepare');
    Route::post('/orders/{order}/deliver', [MerchantOrderController::class, 'deliver'])->name('orders.deliver');

    // Payment review
    Route::post('/orders/{order}/payment/approve', [MerchantOrderController::class, 'approvePayment'])->name('orders.payment.approve');
    Route::post('/orders/{order}/payment/reject', [MerchantOrderController::class, 'rejectPayment'])->name('orders.payment.reject');
    Route::get('/payment-proof/{proof}', [MerchantOrderController::class, 'viewProof'])->name('payment.proof');

    // Capacity
    Route::get('/capacity', [CapacityController::class, 'index'])->name('capacity.index');
    Route::post('/capacity/override', [CapacityController::class, 'override'])->name('capacity.override');
    Route::patch('/operating-days', [CapacityController::class, 'updateOperatingDays'])->name('operating-days.update');

    // Profile
    Route::get('/profile', [MerchantProfileController::class, 'edit'])->name('profile');
    Route::patch('/profile', [MerchantProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/publish', [MerchantProfileController::class, 'publish'])->name('profile.publish');
    Route::post('/profile/service-areas', [MerchantProfileController::class, 'updateServiceAreas'])->name('profile.service-areas');

    // Invoice
    Route::get('/invoices', [MerchantInvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}', [MerchantInvoiceController::class, 'show'])->name('invoices.show');
    Route::get('/invoices/{invoice}/print', [MerchantInvoiceController::class, 'print'])->name('invoices.print');

    // Production
    Route::get('/production', [DashboardController::class, 'production'])->name('production');
});

// Notifications
Route::middleware('auth')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
});
PHP;

// ===== BOOTSTRAP/APP.PHP - Add Inertia middleware =====
$files['bootstrap/app.php'] = <<<'PHP'
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
PHP;

// ===== APP.TSX Entry Point =====
$files['resources/js/app.tsx'] = <<<'TSX'
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
    title: (title) => title ? `${title} — Caterly` : 'Caterly',
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx')
        ),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#016039',
        showSpinner: true,
    },
});
TSX;

// ===== TypeScript Types =====
$files['resources/js/types/index.ts'] = <<<'TS'
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'merchant';
    company_name: string;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
}

export interface Region {
    id: number;
    code: string;
    city_name: string;
    province_name: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    image_path: string | null;
    price_idr: number;
    category: string;
    category_id: number;
    is_active: boolean;
}

export interface MerchantCard {
    id: number;
    company_name: string;
    description: string;
    minimum_portions: number;
    starting_price: number | null;
    delivery_fee: number | null;
    service_area: string | null;
    menu_count: number;
    categories: string[];
    availability: { available: boolean; reason?: string; remaining?: number } | null;
    menus_preview: { id: number; name: string; price_idr: number; image_path: string | null; category: string }[];
}

export interface CartData {
    id: number;
    merchant_id: number;
    merchant_name: string;
    delivery_date: string | null;
    region_id: number | null;
    region_name: string | null;
    delivery_fee: number;
    minimum_portions: number;
    items: CartItemData[];
    total_portions: number;
    subtotal: number;
}

export interface CartItemData {
    id: number;
    menu_id: number;
    name: string;
    price_idr: number;
    quantity: number;
    is_active: boolean;
    category: string | null;
}

export interface Address {
    id: number;
    label: string;
    receiver: string;
    phone: string;
    address: string;
    notes: string | null;
    is_default: boolean;
    region?: Region;
    region_id: number;
}

export interface OrderData {
    id: number;
    order_number: string;
    delivery_date: string;
    delivery_slot: string;
    order_status: string;
    payment_status: string;
    total_portions: number;
    subtotal_idr: number;
    delivery_fee_idr: number;
    total_idr: number;
    expires_at: string | null;
    notes: string | null;
    created_at: string;
    customer_snapshot: any;
    merchant_snapshot: any;
    address_snapshot: any;
    bank_snapshot: any;
    items: OrderItemData[];
    invoice: InvoiceData | null;
    status_events: StatusEvent[];
    payment_proofs: PaymentProofData[];
}

export interface OrderItemData {
    id: number;
    menu_name_snapshot: string;
    category_snapshot: string;
    unit_price_idr: number;
    quantity: number;
    line_total_idr: number;
}

export interface InvoiceData {
    id: number;
    invoice_number: string;
    issued_at: string;
    status: 'issued' | 'void';
    voided_at: string | null;
}

export interface StatusEvent {
    id: number;
    from_status: string | null;
    to_status: string;
    reason: string | null;
    created_at: string;
}

export interface PaymentProofData {
    id: number;
    status: 'submitted' | 'approved' | 'rejected';
    original_name: string;
    created_at: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export function formatRupiah(amount: number): string {
    return 'Rp' + amount.toLocaleString('id-ID');
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }) + ' WIB';
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
    pending_confirmation: 'Menunggu Konfirmasi',
    accepted: 'Diterima',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
    expired: 'Kedaluwarsa',
    preparing: 'Dipersiapkan',
    delivering: 'Dikirim',
    completed: 'Selesai',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
    unpaid: 'Belum Dibayar',
    pending_review: 'Menunggu Verifikasi',
    paid: 'Lunas',
};
TS;

foreach ($files as $path => $content) {
    $dir = dirname($path);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($path, $content);
}

echo count($files) . " files created.\n";