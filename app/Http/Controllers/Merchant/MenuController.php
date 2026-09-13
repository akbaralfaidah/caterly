<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Menu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(Request $request): Response
    {
        $menus = Menu::query()
            ->where('merchant_id', $request->user()->id)
            ->with('category')
            ->orderBy('category_id')
            ->orderBy('name')
            ->get()
            ->map(fn (Menu $menu): array => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'price_idr' => $menu->price_idr,
                'image_path' => $menu->image_path,
                'is_active' => $menu->is_active,
                'category_id' => $menu->category_id,
                'category' => $menu->category?->name,
            ]);

        return Inertia::render('Merchant/Menus', [
            'menus' => $menus,
            'categories' => Category::query()->orderBy('name')->get(),
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('merchant.menus.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules(), $this->messages());
        $path = $request->hasFile('image')
            ? $request->file('image')->store('menus', 'public')
            : null;

        Menu::query()->create([
            'merchant_id' => $request->user()->id,
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price_idr' => $validated['price_idr'],
            'image_path' => $path,
            'is_active' => true,
        ]);

        return back()->with('success', 'Menu berhasil ditambahkan.');
    }

    public function edit(Request $request, Menu $menu): RedirectResponse
    {
        $this->ensureOwner($request, $menu);

        return redirect()->route('merchant.menus.index');
    }

    public function update(Request $request, Menu $menu): RedirectResponse
    {
        $this->ensureOwner($request, $menu);
        $validated = $request->validate($this->rules(), $this->messages());
        $oldImagePath = $menu->image_path;

        $menu->fill([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price_idr' => $validated['price_idr'],
        ]);

        if ($request->hasFile('image')) {
            $menu->image_path = $request->file('image')->store('menus', 'public');
        }

        $menu->save();

        if ($request->hasFile('image') && $oldImagePath) {
            Storage::disk('public')->delete($oldImagePath);
        }

        return back()->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(Request $request, Menu $menu): RedirectResponse
    {
        $this->ensureOwner($request, $menu);
        $menu->delete();

        return back()->with('success', 'Menu berhasil dihapus.');
    }

    public function toggle(Request $request, Menu $menu): RedirectResponse
    {
        $this->ensureOwner($request, $menu);
        $menu->update(['is_active' => ! $menu->is_active]);
        $status = $menu->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Menu berhasil {$status}.");
    }

    /**
     * @return array<string, list<string>>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:1000'],
            'price_idr' => ['required', 'integer', 'min:1', 'max:10000000'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'extensions:jpg,jpeg,png,webp', 'max:3072'],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function messages(): array
    {
        return [
            'image.image' => 'Foto menu harus berupa gambar.',
            'image.mimes' => 'Foto menu hanya boleh berformat JPG, JPEG, PNG, atau WebP.',
            'image.extensions' => 'Ekstensi foto menu harus .jpg, .jpeg, .png, atau .webp.',
            'image.max' => 'Ukuran foto menu maksimal 3 MB.',
        ];
    }

    private function ensureOwner(Request $request, Menu $menu): void
    {
        abort_unless($menu->merchant_id === $request->user()->id, 404);
    }
}
