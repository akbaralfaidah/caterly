<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantDateCapacity extends Model
{
    protected $fillable = [
        'merchant_id',
        'delivery_date',
        'capacity',
        'reserved_portions',
        'is_closed',
        'is_override',
    ];

    protected function casts(): array
    {
        return [
            'delivery_date' => 'date',
            'capacity' => 'integer',
            'reserved_portions' => 'integer',
            'is_closed' => 'boolean',
            'is_override' => 'boolean',
        ];
    }

    public function remainingCapacity(): int
    {
        return max(0, $this->capacity - $this->reserved_portions);
    }
}