<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Category;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $menus = Menu::where('merchant_id', auth()->id())
            ->with('category')
            ->orderBy('category_id')
            ->orderBy('name')
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'description' => $m->description,
                'price_idr' => $m->price_idr,
                'image_path' => $m->image_path,
                'is_active' => $m->is_active,
                'category_id' => $m->category_id,
                'category' => $m->category ? $m->category->name : null,
            ]);
            
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Merchant/Menus', [
            'menus' => $menus,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price_idr' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:2048',
        ]);

        $menu = new Menu($validated);
        $menu->merchant_id = auth()->id();
        $menu->is_active = true;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menus', 'public');
            $menu->image_path = $path;
        }

        $menu->save();

        return back()->with('success', 'Menu berhasil ditambahkan.');
    }

    public function update(Request $request, Menu $menu)
    {
        if ($menu->merchant_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price_idr' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:2048',
        ]);

        $menu->fill($validated);

        if ($request->hasFile('image')) {
            if ($menu->image_path) {
                Storage::disk('public')->delete($menu->image_path);
            }
            $path = $request->file('image')->store('menus', 'public');
            $menu->image_path = $path;
        }

        $menu->save();

        return back()->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(Menu $menu)
    {
        if ($menu->merchant_id !== auth()->id()) abort(403);
        
        $menu->delete();
        return back()->with('success', 'Menu berhasil dihapus.');
    }

    public function toggle(Menu $menu)
    {
        if ($menu->merchant_id !== auth()->id()) abort(403);
        
        $menu->is_active = !$menu->is_active;
        $menu->save();
        
        $status = $menu->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Menu berhasil {$status}.");
    }
}