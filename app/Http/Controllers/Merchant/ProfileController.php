<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MerchantOperatingDay;
use App\Models\MerchantProfile;
use App\Models\MerchantServiceArea;
use App\Models\Order;
use App\Models\Region;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Merchant/Profile', [
            'profile' => MerchantProfile::query()->where('user_id', $request->user()->id)->firstOrFail(),
            'serviceAreas' => MerchantServiceArea::query()
                ->where('merchant_id', $request->user()->id)
                ->with('region')
                ->orderBy('region_id')
                ->get(),
            'regions' => Region::query()->orderBy('city_name')->get(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:2000'],
            'description' => ['required', 'string', 'max:2000'],
            'minimum_portions' => ['required', 'integer', 'min:1', 'max:100000'],
            'default_daily_capacity' => ['required', 'integer', 'min:1', 'max:100000'],
            'bank_name' => ['required', 'string', 'max:255'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'bank_account_number' => ['required', 'string', 'max:100'],
        ]);

        DB::transaction(function () use ($request, $validated): void {
            MerchantProfile::query()
                ->where('user_id', $request->user()->id)
                ->lockForUpdate()
                ->firstOrFail()
                ->update($validated);

            $request->user()->update([
                'company_name' => $validated['company_name'],
                'phone' => $validated['phone'],
            ]);
        }, 3);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function publish(Request $request): RedirectResponse
    {
        $profile = MerchantProfile::query()->where('user_id', $request->user()->id)->firstOrFail();
        $newStatus = $profile->isPublished() ? 'draft' : 'published';

        if ($newStatus === 'published') {
            $profileComplete = collect([
                $profile->company_name,
                $profile->phone,
                $profile->address,
                $profile->description,
                $profile->bank_name,
                $profile->bank_account_name,
                $profile->bank_account_number,
            ])->every(fn (?string $value): bool => filled($value));
            $hasMenu = Menu::query()
                ->where('merchant_id', $request->user()->id)
                ->where('is_active', true)
                ->exists();
            $hasArea = MerchantServiceArea::query()
                ->where('merchant_id', $request->user()->id)
                ->exists();
            $hasCompleteSchedule = MerchantOperatingDay::query()
                ->where('merchant_id', $request->user()->id)
                ->count() === 7;
            $hasOpenDay = MerchantOperatingDay::query()
                ->where('merchant_id', $request->user()->id)
                ->where('is_open', true)
                ->exists();

            if (! $profileComplete || ! $hasMenu || ! $hasArea || ! $hasCompleteSchedule || ! $hasOpenDay) {
                return back()->with(
                    'error',
                    'Lengkapi profil, rekening, menu aktif, area layanan, dan tujuh hari jadwal sebelum ditayangkan.',
                );
            }
        }

        $profile->update(['publication_status' => $newStatus]);

        return back()->with(
            'success',
            $newStatus === 'published' ? 'Katering berhasil ditayangkan!' : 'Katering disimpan sebagai draft.',
        );
    }

    public function updateServiceAreas(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'areas' => ['present', 'array', 'max:100'],
            'areas.*.region_id' => ['required', 'integer', 'distinct', 'exists:regions,id'],
            'areas.*.delivery_fee' => ['required', 'integer', 'min:0', 'max:10000000'],
        ]);
        $newRegionIds = collect($validated['areas'])->pluck('region_id')->map(fn ($id): int => (int) $id);

        DB::transaction(function () use ($newRegionIds, $request, $validated): void {
            $removedRegionIds = MerchantServiceArea::query()
                ->where('merchant_id', $request->user()->id)
                ->whereNotIn('region_id', $newRegionIds)
                ->lockForUpdate()
                ->pluck('region_id');

            $hasAffectedOrders = Order::query()
                ->where('merchant_id', $request->user()->id)
                ->whereIn('region_id', $removedRegionIds)
                ->where('delivery_date', '>=', today())
                ->whereIn('order_status', ['pending_confirmation', 'accepted', 'preparing', 'delivering'])
                ->exists();

            if ($hasAffectedOrders) {
                throw ValidationException::withMessages([
                    'areas' => 'Area dengan pesanan aktif mendatang tidak dapat dihapus.',
                ]);
            }

            MerchantServiceArea::query()
                ->where('merchant_id', $request->user()->id)
                ->whereNotIn('region_id', $newRegionIds)
                ->delete();

            foreach ($validated['areas'] as $area) {
                MerchantServiceArea::query()->updateOrCreate(
                    [
                        'merchant_id' => $request->user()->id,
                        'region_id' => $area['region_id'],
                    ],
                    ['delivery_fee' => $area['delivery_fee']],
                );
            }
        }, 3);

        return back()->with('success', 'Area layanan berhasil diperbarui.');
    }
}
