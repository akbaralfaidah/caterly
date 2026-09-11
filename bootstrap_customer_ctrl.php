<?php
$files = [];

// ===== Customer Order Controller =====
$files['app/Http/Controllers/Customer/OrderController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('customer_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Customer/Orders', [
            'orders' => $orders
        ]);
    }
}
PHP;

// ===== Customer Profile Controller =====
$files['app/Http/Controllers/Customer/ProfileController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerProfile;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $profile = CustomerProfile::where('user_id', auth()->id())->first();

        return Inertia::render('Customer/Profile', [
            'profile' => $profile
        ]);
    }
}
PHP;

// ===== Address Controller =====
$files['app/Http/Controllers/Customer/AddressController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    // API logic will go here
}
PHP;

// ===== Checkout Controller =====
$files['app/Http/Controllers/Customer/CheckoutController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    // Implementation will go here
}
PHP;

// ===== Customer Invoice Controller =====
$files['app/Http/Controllers/Customer/InvoiceController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Customer/Invoices');
    }
}
PHP;

// ===== Notification Controller =====
$files['app/Http/Controllers/NotificationController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Inertia\Inertia;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(15);
            
        return Inertia::render('Notifications', [
            'notifications' => $notifications
        ]);
    }
}
PHP;

foreach ($files as $path => $content) {
    $dir = dirname($path);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($path, $content);
}
echo "Customer Controllers OK";