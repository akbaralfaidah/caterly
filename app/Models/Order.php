<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'customer_id',
        'merchant_id',
        'region_id',
        'delivery_date',
        'delivery_slot',
        'order_status',
        'payment_status',
        'total_portions',
        'subtotal_idr',
        'delivery_fee_idr',
        'total_idr',
        'expires_at',
        'notes',
        'customer_snapshot',
        'merchant_snapshot',
        'address_snapshot',
        'bank_snapshot',
        'idempotency_key',
        'request_fingerprint',
    ];

    protected function casts(): array
    {
        return [
            'delivery_date' => 'date',
            'expires_at' => 'datetime',
            'total_portions' => 'integer',
            'subtotal_idr' => 'integer',
            'delivery_fee_idr' => 'integer',
            'total_idr' => 'integer',
            'customer_snapshot' => 'array',
            'merchant_snapshot' => 'array',
            'address_snapshot' => 'array',
            'bank_snapshot' => 'array',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function paymentProofs(): HasMany
    {
        return $this->hasMany(PaymentProof::class);
    }

    public function statusEvents(): HasMany
    {
        return $this->hasMany(OrderStatusEvent::class)->orderBy('created_at');
    }

    public function approvedPaymentAmount(): int
    {
        return (int) $this->paymentProofs()
            ->where('status', 'approved')
            ->sum('amount_idr');
    }

    public function remainingPaymentAmount(): int
    {
        return max(0, $this->total_idr - $this->approvedPaymentAmount());
    }

    public function scopeWithVerifiedDeposit(Builder $query): Builder
    {
        return $query->whereRaw(
            '(SELECT COALESCE(SUM(payment_proofs.amount_idr), 0) FROM payment_proofs WHERE payment_proofs.order_id = orders.id AND payment_proofs.status = ?) * 2 >= orders.total_idr',
            ['approved'],
        );
    }

    public function capacityReservation(): HasOne
    {
        return $this->hasOne(CapacityReservation::class);
    }

    public function isTerminal(): bool
    {
        return in_array($this->order_status, ['rejected', 'cancelled', 'expired', 'completed']);
    }

    public function isPending(): bool
    {
        return $this->order_status === 'pending_confirmation';
    }

    public function isExpired(): bool
    {
        return $this->order_status === 'expired' ||
            ($this->isPending() && $this->expires_at && now()->gte($this->expires_at));
    }
}
