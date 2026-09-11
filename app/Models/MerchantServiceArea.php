<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantServiceArea extends Model
{
    protected $fillable = ['merchant_id', 'region_id', 'delivery_fee'];

    protected function casts(): array
    {
        return ['delivery_fee' => 'integer'];
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }
}