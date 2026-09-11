<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class)->withTrashed();
    }
}