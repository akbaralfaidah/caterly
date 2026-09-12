<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use App\Models\CustomerProfile;
use App\Models\Region;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
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

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'pic_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        DB::transaction(function () use ($request, $validated): void {
            CustomerProfile::query()
                ->where('user_id', $request->user()->id)
                ->lockForUpdate()
                ->firstOrFail()
                ->update($validated);

            $request->user()->update([
                'name' => $validated['pic_name'],
                'phone' => $validated['phone'],
                'company_name' => $validated['company_name'],
            ]);
        }, 3);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}
