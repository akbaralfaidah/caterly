<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\InvoiceController as CustomerInvoiceController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ProfileController as CustomerProfileController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\Merchant\CapacityController;
use App\Http\Controllers\Merchant\DashboardController;
use App\Http\Controllers\Merchant\InvoiceController as MerchantInvoiceController;
use App\Http\Controllers\Merchant\MenuController;
use App\Http\Controllers\Merchant\OrderController as MerchantOrderController;
use App\Http\Controllers\Merchant\ProfileController as MerchantProfileController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

// Public
Route::get('/', fn () => redirect('/marketplace'));
Route::get('/marketplace', [MarketplaceController::class, 'index'])->name('marketplace.index');
Route::get('/marketplace/{merchant}', [MarketplaceController::class, 'show'])->name('merchants.show');

// Guest only
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:5,1');
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->middleware('throttle:5,1');
});

// Auth
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

// Customer routes
Route::middleware(['auth', 'role:customer'])->prefix('customer')->name('customer.')->group(function () {
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
    Route::post('/orders/{order}/payment', [CustomerOrderController::class, 'uploadPayment'])
        ->middleware('throttle:10,1')
        ->name('orders.payment.upload');

    // Invoices
    Route::get('/invoices', [CustomerInvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/orders/{order}/invoice', [CustomerInvoiceController::class, 'show'])->name('orders.invoice');
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
Route::middleware(['auth', 'role:merchant'])->prefix('merchant')->name('merchant.')->group(function () {
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
    Route::get('/orders/{order}/invoice', [MerchantInvoiceController::class, 'show'])->name('orders.invoice');
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
