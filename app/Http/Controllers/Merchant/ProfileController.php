<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\MerchantProfile;
use App\Models\MerchantServiceArea;
use App\Models\Region;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $profile = MerchantProfile::where('user_id', auth()->id())->first();
        $serviceAreas = MerchantServiceArea::where('merchant_id', auth()->id())
            ->with('region')
            ->get();
        $regions = Region::orderBy('city_name')->get();

        return Inertia::render('Merchant/Profile', [
            'profile' => $profile,
            'serviceAreas' => $serviceAreas,
            'regions' => $regions,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'description' => 'required|string',
            'minimum_portions' => 'required|integer|min:1',
            'default_daily_capacity' => 'required|integer|min:1',
        ]);

        $profile = MerchantProfile::where('user_id', auth()->id())->first();
        $profile->update($validated);

        // Update user company name too
        auth()->user()->update(['company_name' => $validated['company_name'], 'phone' => $validated['phone']]);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function publish(Request $request)
    {
        $profile = MerchantProfile::where('user_id', auth()->id())->first();
        $newStatus = $profile->publication_status === 'published' ? 'draft' : 'published';
        
        if ($newStatus === 'published') {
            // Check if they have menus and service areas
            $menusCount = \App\Models\Menu::where('merchant_id', auth()->id())->where('is_active', true)->count();
            $areasCount = MerchantServiceArea::where('merchant_id', auth()->id())->count();
            
            if ($menusCount === 0 || $areasCount === 0) {
                return back()->with('error', 'Anda harus memiliki minimal 1 menu aktif dan 1 area layanan untuk bisa ditayangkan.');
            }
        }

        $profile->update(['publication_status' => $newStatus]);
        return back()->with('success', $newStatus === 'published' ? 'Katering berhasil ditayangkan!' : 'Katering di-draft.');
    }

    public function updateServiceAreas(Request $request)
    {
        $validated = $request->validate([
            'areas' => 'array',
            'areas.*.region_id' => 'required|exists:regions,id',
            'areas.*.delivery_fee' => 'required|numeric|min:0',
        ]);

        // Delete existing that are not in the new list
        $newRegionIds = collect($request->areas)->pluck('region_id')->toArray();
        MerchantServiceArea::where('merchant_id', auth()->id())
            ->whereNotIn('region_id', $newRegionIds)
            ->delete();

        // Update or create
        foreach ($request->areas as $area) {
            MerchantServiceArea::updateOrCreate(
                ['merchant_id' => auth()->id(), 'region_id' => $area['region_id']],
                ['delivery_fee' => $area['delivery_fee']]
            );
        }

        return back()->with('success', 'Area layanan berhasil diperbarui.');
    }
}