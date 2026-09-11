<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
    protected $fillable = [
        'customer_id',
        'region_id',
        'label',
        'receiver',
        'phone',
        'address',
        'notes',
        'is_default',
    ];

    protected function casts(): array
    {
        return ['is_default' => 'boolean'];
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