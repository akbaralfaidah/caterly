<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\MerchantDateCapacity;
use App\Models\MerchantProfile;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CapacityController extends Controller
{
    public function index(Request $request)
    {
        $merchantId = auth()->id();
        $profile = MerchantProfile::where('user_id', $merchantId)->first();
        
        $start = now()->startOfMonth()->toDateString();
        $end = now()->addMonths(2)->endOfMonth()->toDateString();

        $capacities = MerchantDateCapacity::where('merchant_id', $merchantId)
            ->whereBetween('delivery_date', [$start, $end])
            ->get();

        return Inertia::render('Merchant/Capacity', [
            'default_capacity' => $profile->default_daily_capacity,
            'capacities' => $capacities
        ]);
    }

    public function override(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'is_closed' => 'required|boolean',
            'override_capacity' => 'nullable|integer|min:0'
        ]);

        $capacity = MerchantDateCapacity::firstOrCreate(
            ['merchant_id' => auth()->id(), 'delivery_date' => $validated['date']],
            ['reserved_capacity' => 0]
        );

        if ($validated['is_closed']) {
            $capacity->update(['is_closed' => true, 'override_capacity' => null]);
        } else {
            $capacity->update([
                'is_closed' => false,
                'override_capacity' => $validated['override_capacity']
            ]);
        }

        return back()->with('success', 'Kapasitas tanggal berhasil diperbarui.');
    }
}