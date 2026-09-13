<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY payment_status ENUM('unpaid', 'pending_review', 'partially_paid', 'paid') NOT NULL DEFAULT 'unpaid'");
        }

        DB::table('orders')
            ->where('payment_status', 'paid')
            ->whereRaw('(SELECT COALESCE(SUM(payment_proofs.amount_idr), 0) FROM payment_proofs WHERE payment_proofs.order_id = orders.id AND payment_proofs.status = ?) = 0', ['approved'])
            ->update(['payment_status' => 'unpaid']);

        DB::table('orders')
            ->where('payment_status', 'paid')
            ->whereRaw('(SELECT COALESCE(SUM(payment_proofs.amount_idr), 0) FROM payment_proofs WHERE payment_proofs.order_id = orders.id AND payment_proofs.status = ?) > 0', ['approved'])
            ->whereRaw('(SELECT COALESCE(SUM(payment_proofs.amount_idr), 0) FROM payment_proofs WHERE payment_proofs.order_id = orders.id AND payment_proofs.status = ?) < orders.total_idr', ['approved'])
            ->update(['payment_status' => 'partially_paid']);
    }

    public function down(): void
    {
        DB::table('orders')
            ->where('payment_status', 'partially_paid')
            ->update(['payment_status' => 'unpaid']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY payment_status ENUM('unpaid', 'pending_review', 'paid') NOT NULL DEFAULT 'unpaid'");
        }
    }
};
