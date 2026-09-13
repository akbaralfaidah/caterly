<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\MerchantDateCapacity;
use App\Models\MerchantOperatingDay;
use App\Models\MerchantProfile;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CapacityController extends Controller
{
    public function index(Request $request): Response
    {
        $merchantId = $request->user()->id;
        $profile = MerchantProfile::query()->where('user_id', $merchantId)->firstOrFail();

        $capacities = MerchantDateCapacity::query()
            ->where('merchant_id', $merchantId)
            ->whereBetween('delivery_date', [today()->toDateString(), today()->addDays(60)->toDateString()])
            ->orderBy('delivery_date')
            ->get()
            ->map(fn (MerchantDateCapacity $capacity): array => [
                'id' => $capacity->id,
                'delivery_date' => $capacity->delivery_date->toDateString(),
                'capacity' => $capacity->capacity,
                'reserved_portions' => $capacity->reserved_portions,
                'is_closed' => $capacity->is_closed,
                'is_override' => $capacity->is_override,
            ]);

        $storedDays = MerchantOperatingDay::query()
            ->where('merchant_id', $merchantId)
            ->get()
            ->keyBy('weekday');
        $operatingDays = collect(range(0, 6))->map(fn (int $weekday): array => [
            'weekday' => $weekday,
            'is_open' => (bool) ($storedDays->get($weekday)?->is_open ?? false),
        ]);

        return Inertia::render('Merchant/Capacity', [
            'default_capacity' => $profile->default_daily_capacity,
            'capacities' => $capacities,
            'operating_days' => $operatingDays,
            'calendar_start_date' => today()->toDateString(),
        ]);
    }

    public function override(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today', 'before_or_equal:'.today()->addDays(60)->toDateString()],
            'is_closed' => ['required', 'boolean'],
            'capacity' => ['nullable', 'integer', 'min:0', 'max:100000'],
        ]);

        $profile = MerchantProfile::query()->where('user_id', $request->user()->id)->firstOrFail();
        $deliveryDate = Carbon::parse($validated['date'])->startOfDay();

        DB::transaction(function () use ($deliveryDate, $profile, $request, $validated): void {
            $record = MerchantDateCapacity::query()->firstOrCreate(
                [
                    'merchant_id' => $request->user()->id,
                    'delivery_date' => $deliveryDate,
                ],
                [
                    'capacity' => $profile->default_daily_capacity,
                    'reserved_portions' => 0,
                    'is_closed' => false,
                    'is_override' => false,
                ],
            );
            $capacity = MerchantDateCapacity::query()->lockForUpdate()->findOrFail($record->id);
            $requestedCapacity = $validated['capacity'] ?? $profile->default_daily_capacity;

            if ($request->boolean('is_closed') && $capacity->reserved_portions > 0) {
                throw ValidationException::withMessages([
                    'is_closed' => 'Tanggal dengan reservasi aktif tidak dapat ditutup.',
                ]);
            }

            if (! $request->boolean('is_closed') && $requestedCapacity < $capacity->reserved_portions) {
                throw ValidationException::withMessages([
                    'capacity' => "Kapasitas minimal {$capacity->reserved_portions} karena sudah ada reservasi aktif.",
                ]);
            }

            $capacity->update([
                'capacity' => $requestedCapacity,
                'is_closed' => $request->boolean('is_closed'),
                'is_override' => true,
            ]);
        }, 3);

        return back()->with('success', 'Kapasitas tanggal berhasil diperbarui.');
    }

    public function updateOperatingDays(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'days' => ['required', 'array', 'size:7'],
            'days.*.weekday' => ['required', 'integer', 'between:0,6', 'distinct'],
            'days.*.is_open' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($request, $validated): void {
            foreach ($validated['days'] as $day) {
                if (! $day['is_open']) {
                    $hasActiveOrder = Order::query()
                        ->where('merchant_id', $request->user()->id)
                        ->whereBetween('delivery_date', [today(), today()->addDays(30)])
                        ->whereIn('order_status', ['pending_confirmation', 'accepted', 'preparing', 'delivering'])
                        ->get(['delivery_date'])
                        ->contains(fn (Order $order): bool => $order->delivery_date->dayOfWeek === (int) $day['weekday']);

                    if ($hasActiveOrder) {
                        throw ValidationException::withMessages([
                            'days' => 'Hari operasional dengan pesanan aktif tidak dapat ditutup.',
                        ]);
                    }
                }

                MerchantOperatingDay::query()->updateOrCreate(
                    [
                        'merchant_id' => $request->user()->id,
                        'weekday' => $day['weekday'],
                    ],
                    ['is_open' => $day['is_open']],
                );
            }
        }, 3);

        return back()->with('success', 'Hari operasional berhasil diperbarui.');
    }
}
