<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'receiver' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'region_id' => 'required|exists:regions,id',
            'address' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();
        
        $isFirst = CustomerAddress::where('user_id', auth()->id())->count() === 0;
        $validated['is_default'] = $isFirst;

        CustomerAddress::create($validated);

        return back()->with('success', 'Alamat berhasil ditambahkan.');
    }

    public function update(Request $request, CustomerAddress $address)
    {
        if ($address->user_id !== auth()->id()) abort(403);

        $validated = $request->validate([
            'label' => 'required|string|max:100',
            'receiver' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'region_id' => 'required|exists:regions,id',
            'address' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $address->update($validated);

        return back()->with('success', 'Alamat berhasil diperbarui.');
    }

    public function destroy(CustomerAddress $address)
    {
        if ($address->user_id !== auth()->id()) abort(403);
        
        $address->delete();

        // If it was default and others exist, make the first one default
        if ($address->is_default) {
            $next = CustomerAddress::where('user_id', auth()->id())->first();
            if ($next) {
                $next->update(['is_default' => true]);
            }
        }

        return back()->with('success', 'Alamat berhasil dihapus.');
    }

    public function setDefault(CustomerAddress $address)
    {
        if ($address->user_id !== auth()->id()) abort(403);

        CustomerAddress::where('user_id', auth()->id())->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return back()->with('success', 'Alamat utama berhasil diubah.');
    }
}