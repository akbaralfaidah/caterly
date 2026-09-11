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