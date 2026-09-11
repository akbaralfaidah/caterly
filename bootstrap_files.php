<?php
/**
 * Caterly Project Bootstrapper
 * Generates all core application files for the Caterly B2B Catering Marketplace.
 */

$files = [];

// ===== 1. User Model with Role =====
$files['app/Models/User.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'company_name',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function isMerchant(): bool
    {
        return $this->role === 'merchant';
    }

    public function merchantProfile()
    {
        return $this->hasOne(MerchantProfile::class);
    }

    public function customerProfile()
    {
        return $this->hasOne(CustomerProfile::class);
    }

    public function customerAddresses()
    {
        return $this->hasMany(CustomerAddress::class, 'customer_id');
    }

    public function cart()
    {
        return $this->hasOne(Cart::class, 'customer_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id')->orderByDesc('created_at');
    }
}
PHP;

// ===== 2. MerchantProfile Model =====
$files['app/Models/MerchantProfile.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function menus()
    {
        return $this->hasMany(Menu::class, 'merchant_id', 'user_id');
    }

    public function serviceAreas()
    {
        return $this->hasMany(MerchantServiceArea::class, 'merchant_id', 'user_id');
    }

    public function operatingDays()
    {
        return $this->hasMany(MerchantOperatingDay::class, 'merchant_id', 'user_id');
    }

    public function dateCapacities()
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
PHP;

// ===== 3. CustomerProfile Model =====
$files['app/Models/CustomerProfile.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'pic_name',
        'phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function addresses()
    {
        return $this->hasMany(CustomerAddress::class, 'customer_id', 'user_id');
    }
}
PHP;

// ===== 4. Region Model =====
$files['app/Models/Region.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $fillable = ['code', 'city_name', 'province_name'];
    public $timestamps = false;
}
PHP;

// ===== 5. Category Model =====
$files['app/Models/Category.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug'];
    public $timestamps = false;
}
PHP;

// ===== 6. Menu Model =====
$files['app/Models/Menu.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'merchant_id',
        'category_id',
        'name',
        'description',
        'image_path',
        'price_idr',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_idr' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function merchantProfile()
    {
        return $this->belongsTo(MerchantProfile::class, 'merchant_id', 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
PHP;

// ===== 7. MerchantServiceArea Model =====
$files['app/Models/MerchantServiceArea.php'] = <<<'PHP'
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
PHP;

// ===== 8. MerchantOperatingDay Model =====
$files['app/Models/MerchantOperatingDay.php'] = <<<'PHP'
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
PHP;

// ===== 9. MerchantDateCapacity Model =====
$files['app/Models/MerchantDateCapacity.php'] = <<<'PHP'
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
PHP;

// ===== 10. CustomerAddress Model =====
$files['app/Models/CustomerAddress.php'] = <<<'PHP'
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
PHP;

// ===== 11. Cart Model =====
$files['app/Models/Cart.php'] = <<<'PHP'
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
PHP;

// ===== 12. CartItem Model =====
$files['app/Models/CartItem.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = ['cart_id', 'menu_id', 'quantity'];

    protected function casts(): array
    {
        return ['quantity' => 'integer'];
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }
}
PHP;

// ===== 13. Order Model =====
$files['app/Models/Order.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function merchant()
    {
        return $this->belongsTo(User::class, 'merchant_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function paymentProofs()
    {
        return $this->hasMany(PaymentProof::class);
    }

    public function statusEvents()
    {
        return $this->hasMany(OrderStatusEvent::class)->orderBy('created_at');
    }

    public function capacityReservation()
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
PHP;

// ===== 14. OrderItem Model =====
$files['app/Models/OrderItem.php'] = <<<'PHP'
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
PHP;

// ===== 15. Invoice Model =====
$files['app/Models/Invoice.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'order_id',
        'invoice_number',
        'issued_at',
        'status',
        'voided_at',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'voided_at' => 'datetime',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
PHP;

// ===== 16. PaymentProof Model =====
$files['app/Models/PaymentProof.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentProof extends Model
{
    protected $fillable = [
        'order_id',
        'storage_path',
        'original_name',
        'mime_type',
        'status',
        'submitted_by',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime'];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
PHP;

// ===== 17. CapacityReservation Model =====
$files['app/Models/CapacityReservation.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function dateCapacity()
    {
        return $this->belongsTo(MerchantDateCapacity::class, 'capacity_date_id');
    }

    public function isActive(): bool
    {
        return is_null($this->released_at);
    }
}
PHP;

// ===== 18. OrderStatusEvent Model =====
$files['app/Models/OrderStatusEvent.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusEvent extends Model
{
    protected $fillable = [
        'order_id',
        'from_status',
        'to_status',
        'actor_id',
        'reason',
        'event_key',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
PHP;

// ===== 19. Notification Model =====
$files['app/Models/Notification.php'] = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'app_notifications';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'resource_type',
        'resource_id',
        'event_key',
        'read_at',
    ];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isUnread(): bool
    {
        return is_null($this->read_at);
    }
}
PHP;

// Write all model files
foreach ($files as $path => $content) {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents($path, $content);
}

echo count($files) . " model files created.\n";