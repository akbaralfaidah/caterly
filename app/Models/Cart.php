<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'customer_id',
        'merchant_id',
        'delivery_date',
        'region_id',
    ];

    protected function casts(): array
    {
        return ['delivery_date' => 'date'];
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}