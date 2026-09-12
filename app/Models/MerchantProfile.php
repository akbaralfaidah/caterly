<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MerchantProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'address',
        'phone',
        'description',
        'publication_status',
        'minimum_portions',
        'default_daily_capacity',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
    ];

    protected function casts(): array
    {
        return [
            'minimum_portions' => 'integer',
            'default_daily_capacity' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class, 'merchant_id', 'user_id');
    }

    public function serviceAreas(): HasMany
    {
        return $this->hasMany(MerchantServiceArea::class, 'merchant_id', 'user_id');
    }

    public function operatingDays(): HasMany
    {
        return $this->hasMany(MerchantOperatingDay::class, 'merchant_id', 'user_id');
    }

    public function dateCapacities(): HasMany
    {
        return $this->hasMany(MerchantDateCapacity::class, 'merchant_id', 'user_id');
    }

    public function isPublished(): bool
    {
        return $this->publication_status === 'published';
    }

    public function isDraft(): bool
    {
        return $this->publication_status === 'draft';
    }
}
