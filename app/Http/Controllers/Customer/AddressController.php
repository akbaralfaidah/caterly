<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('customer.profile');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateAddress($request);

        DB::transaction(function () use ($request, $validated): void {
            $hasAddress = CustomerAddress::query()
                ->where('customer_id', $request->user()->id)
                ->lockForUpdate()
                ->exists();

            CustomerAddress::query()->create([
                ...$validated,
                'customer_id' => $request->user()->id,
                'is_default' => ! $hasAddress,
            ]);
        }, 3);

        return back()->with('success', 'Alamat berhasil ditambahkan.');
    }

    public function update(Request $request, CustomerAddress $address): RedirectResponse
    {
        $this->ensureOwner($request, $address);
        $address->update($this->validateAddress($request));

        return back()->with('success', 'Alamat berhasil diperbarui.');
    }

    public function destroy(Request $request, CustomerAddress $address): RedirectResponse
    {
        $this->ensureOwner($request, $address);

        $deleted = DB::transaction(function () use ($address, $request): bool {
            $addresses = CustomerAddress::query()
                ->where('customer_id', $request->user()->id)
                ->lockForUpdate()
                ->get();

            if ($addresses->count() === 1) {
                return false;
            }

            $lockedAddress = CustomerAddress::query()->lockForUpdate()->findOrFail($address->id);
            $wasDefault = $lockedAddress->is_default;
            $lockedAddress->delete();

            if ($wasDefault) {
                CustomerAddress::query()
                    ->where('customer_id', $request->user()->id)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->first()
                    ?->update(['is_default' => true]);
            }

            return true;
        }, 3);

        if (! $deleted) {
            return back()->with('error', 'Perusahaan wajib memiliki minimal satu alamat pengiriman.');
        }

        return back()->with('success', 'Alamat berhasil dihapus.');
    }

    public function setDefault(Request $request, CustomerAddress $address): RedirectResponse
    {
        $this->ensureOwner($request, $address);

        DB::transaction(function () use ($address, $request): void {
            CustomerAddress::query()
                ->where('customer_id', $request->user()->id)
                ->lockForUpdate()
                ->get();

            CustomerAddress::query()
                ->where('customer_id', $request->user()->id)
                ->update(['is_default' => false]);
            CustomerAddress::query()
                ->whereKey($address->id)
                ->update(['is_default' => true]);
        }, 3);

        return back()->with('success', 'Alamat utama berhasil diubah.');
    }

    /**
     * @return array{label: string, receiver: string, phone: string, region_id: int|string, address: string, notes?: string|null}
     */
    private function validateAddress(Request $request): array
    {
        return $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'receiver' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'region_id' => ['required', 'integer', 'exists:regions,id'],
            'address' => ['required', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);
    }

    private function ensureOwner(Request $request, CustomerAddress $address): void
    {
        abort_unless($address->customer_id === $request->user()->id, 404);
    }
}
