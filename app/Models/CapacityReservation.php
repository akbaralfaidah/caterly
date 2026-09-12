<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CapacityReservation extends Model
{
    protected $fillable = [
        'order_id',
        'capacity_date_id',
        'portions',
        'released_at',
    ];

    protected function casts(): array
    {
        return [
            'portions' => 'integer',
            'released_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function dateCapacity(): BelongsTo
    {
        return $this->belongsTo(MerchantDateCapacity::class, 'capacity_date_id');
    }

    public function isActive(): bool
    {
        return is_null($this->released_at);
    }
}
