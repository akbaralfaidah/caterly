<?php
$files = [];

// ===== Dashboard Controller =====
$files['app/Http/Controllers/Merchant/DashboardController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Merchant/Dashboard');
    }
}
PHP;

// ===== Menu Controller =====
$files['app/Http/Controllers/Merchant/MenuController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Category;
use Inertia\Inertia;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $menus = Menu::where('merchant_id', auth()->id())
            ->with('category')
            ->orderBy('category_id')
            ->orderBy('name')
            ->get();
            
        $categories = Category::all();

        return Inertia::render('Merchant/Menus', [
            'menus' => $menus,
            'categories' => $categories
        ]);
    }
}
PHP;

// ===== Order Controller =====
$files['app/Http/Controllers/Merchant/OrderController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('merchant_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Merchant/Orders', [
            'orders' => $orders
        ]);
    }
}
PHP;

// ===== Profile Controller =====
$files['app/Http/Controllers/Merchant/ProfileController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\MerchantProfile;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $profile = MerchantProfile::where('user_id', auth()->id())->first();

        return Inertia::render('Merchant/Profile', [
            'profile' => $profile
        ]);
    }
}
PHP;

// ===== Capacity Controller =====
$files['app/Http/Controllers/Merchant/CapacityController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CapacityController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Merchant/Capacity');
    }
}
PHP;

// ===== Invoice Controller =====
$files['app/Http/Controllers/Merchant/InvoiceController.php'] = <<<'PHP'
<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Merchant/Invoices');
    }
}
PHP;

foreach ($files as $path => $content) {
    $dir = dirname($path);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($path, $content);
}
echo "Merchant Controllers OK";