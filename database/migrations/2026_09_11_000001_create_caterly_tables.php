<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Modify users table to add role and company fields
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'merchant'])->after('email');
            $table->string('company_name')->after('role');
            $table->string('phone', 20)->nullable()->after('company_name');
        });

        // Regions reference table
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('city_name');
            $table->string('province_name');
        });

        // Categories reference table
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
        });

        // Merchant profiles
        Schema::create('merchant_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->text('address')->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('description')->nullable();
            $table->enum('publication_status', ['draft', 'published'])->default('draft');
            $table->unsignedInteger('minimum_portions')->default(10);
            $table->unsignedInteger('default_daily_capacity')->default(100);
            $table->string('bank_name')->nullable();
            $table->string('bank_account_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->timestamps();
        });

        // Customer profiles
        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->string('pic_name');
            $table->string('phone', 20)->nullable();
            $table->timestamps();
        });

        // Merchant service areas
        Schema::create('merchant_service_areas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('merchant_id');
            $table->foreignId('region_id')->constrained();
            $table->unsignedInteger('delivery_fee')->default(0);
            $table->timestamps();
            $table->unique(['merchant_id', 'region_id']);
            $table->foreign('merchant_id')->references('id')->on('users');
        });

        // Merchant operating days
        Schema::create('merchant_operating_days', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('merchant_id');
            $table->unsignedTinyInteger('weekday'); // 0=Sunday, 1=Monday...6=Saturday
            $table->boolean('is_open')->default(true);
            $table->timestamps();
            $table->unique(['merchant_id', 'weekday']);
            $table->foreign('merchant_id')->references('id')->on('users');
        });

        // Merchant date capacities
        Schema::create('merchant_date_capacities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('merchant_id');
            $table->date('delivery_date');
            $table->unsignedInteger('capacity')->default(100);
            $table->unsignedInteger('reserved_portions')->default(0);
            $table->boolean('is_closed')->default(false);
            $table->boolean('is_override')->default(false);
            $table->timestamps();
            $table->unique(['merchant_id', 'delivery_date']);
            $table->foreign('merchant_id')->references('id')->on('users');
        });

        // Menus
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('merchant_id');
            $table->foreignId('category_id')->constrained();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->unsignedInteger('price_idr');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['merchant_id', 'is_active', 'category_id']);
            $table->foreign('merchant_id')->references('id')->on('users');
        });

        // Customer addresses
        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->foreignId('region_id')->constrained();
            $table->string('label');
            $table->string('receiver');
            $table->string('phone', 20);
            $table->text('address');
            $table->text('notes')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->foreign('customer_id')->references('id')->on('users');
        });

        // Carts
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id')->unique();
            $table->unsignedBigInteger('merchant_id')->nullable();
            $table->date('delivery_date')->nullable();
            $table->foreignId('region_id')->nullable()->constrained();
            $table->timestamps();
            $table->foreign('customer_id')->references('id')->on('users');
            $table->foreign('merchant_id')->references('id')->on('users');
        });

        // Cart items
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();
            $table->unique(['cart_id', 'menu_id']);
        });

        // Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('merchant_id');
            $table->foreignId('region_id')->constrained();
            $table->date('delivery_date');
            $table->string('delivery_slot', 30)->default('11:00-12:00 WIB');
            $table->enum('order_status', [
                'pending_confirmation', 'accepted', 'rejected',
                'cancelled', 'expired', 'preparing', 'delivering', 'completed'
            ])->default('pending_confirmation');
            $table->enum('payment_status', ['unpaid', 'pending_review', 'paid'])->default('unpaid');
            $table->unsignedInteger('total_portions');
            $table->unsignedBigInteger('subtotal_idr');
            $table->unsignedInteger('delivery_fee_idr');
            $table->unsignedBigInteger('total_idr');
            $table->timestamp('expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('customer_snapshot');
            $table->json('merchant_snapshot');
            $table->json('address_snapshot');
            $table->json('bank_snapshot')->nullable();
            $table->string('idempotency_key', 64)->nullable();
            $table->string('request_fingerprint', 64)->nullable();
            $table->timestamps();
            $table->foreign('customer_id')->references('id')->on('users');
            $table->foreign('merchant_id')->references('id')->on('users');
            $table->unique(['customer_id', 'idempotency_key']);
            $table->index(['merchant_id', 'delivery_date', 'order_status']);
            $table->index(['customer_id', 'created_at']);
            $table->index(['order_status', 'expires_at']);
        });

        // Order items (snapshots)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('menu_id')->nullable();
            $table->string('menu_name_snapshot', 100);
            $table->string('category_snapshot')->nullable();
            $table->unsignedInteger('unit_price_idr');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('line_total_idr');
            $table->timestamps();
            $table->foreign('menu_id')->references('id')->on('menus')->nullOnDelete();
        });

        // Capacity reservations
        Schema::create('capacity_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('capacity_date_id')->constrained('merchant_date_capacities');
            $table->unsignedInteger('portions');
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
        });

        // Invoices
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('invoice_number', 30)->unique();
            $table->timestamp('issued_at');
            $table->enum('status', ['issued', 'void'])->default('issued');
            $table->timestamp('voided_at')->nullable();
            $table->timestamps();
        });

        // Payment proofs
        Schema::create('payment_proofs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->string('storage_path');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 50);
            $table->enum('status', ['submitted', 'approved', 'rejected'])->default('submitted');
            $table->unsignedBigInteger('submitted_by');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->foreign('submitted_by')->references('id')->on('users');
            $table->foreign('reviewed_by')->references('id')->on('users');
        });

        // Order status events (audit log)
        Schema::create('order_status_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->text('reason')->nullable();
            $table->string('event_key', 100)->unique();
            $table->timestamps();
            $table->foreign('actor_id')->references('id')->on('users');
        });

        // App notifications
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('type', 50);
            $table->string('title');
            $table->text('message');
            $table->string('resource_type', 50)->nullable();
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->string('event_key', 100)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users');
            $table->unique(['user_id', 'event_key']);
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
        Schema::dropIfExists('order_status_events');
        Schema::dropIfExists('payment_proofs');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('capacity_reservations');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('merchant_date_capacities');
        Schema::dropIfExists('merchant_operating_days');
        Schema::dropIfExists('merchant_service_areas');
        Schema::dropIfExists('customer_profiles');
        Schema::dropIfExists('merchant_profiles');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('regions');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'company_name', 'phone']);
        });
    }
};