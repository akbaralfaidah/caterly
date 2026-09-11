<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantOperatingDay extends Model
{
    protected $fillable = ['merchant_id', 'weekday', 'is_open'];

    protected function casts(): array
    {
        return ['is_open' => 'boolean'];
    }
}