<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerProfile;
use App\Models\CustomerAddress;
use App\Models\Region;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $profile = CustomerProfile::where('user_id', auth()->id())->first();
        $addresses = CustomerAddress::where('customer_id', auth()->id())
            ->with('region')
            ->orderBy('is_default', 'desc')
            ->get();
        $regions = Region::orderBy('city_name')->get();

        return Inertia::render('Customer/Profile', [
            'profile' => [
                'company_name' => $profile->company_name,
                'pic_name' => $profile->pic_name,
                'phone' => $profile->phone,
                'email' => auth()->user()->email,
            ],
            'addresses' => $addresses,
            'regions' => $regions,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'pic_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        $profile = CustomerProfile::where('user_id', auth()->id())->first();
        $profile->update($validated);
        
        auth()->user()->update([
            'name' => $validated['pic_name'],
            'phone' => $validated['phone'],
            'company_name' => $validated['company_name'],
        ]);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}