<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'menu_id',
        'menu_name_snapshot',
        'category_snapshot',
        'unit_price_idr',
        'quantity',
        'line_total_idr',
    ];

    protected function casts(): array
    {
        return [
            'unit_price_idr' => 'integer',
            'quantity' => 'integer',
            'line_total_idr' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class)->withTrashed();
    }
}
