<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\CustomerProfile;
use App\Models\MerchantProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|in:customer,merchant',
            'company_name' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Password::min(12)],
        ], [
            'email.unique' => 'Email sudah terdaftar.',
            'password.min' => 'Password minimal 12 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = DB::transaction(function () use ($request): User {
            $user = User::query()->create([
                'name' => $request->string('name')->toString(),
                'email' => $request->string('email')->trim()->lower()->toString(),
                'password' => Hash::make($request->string('password')->toString()),
                'role' => $request->string('role')->toString(),
                'company_name' => $request->string('company_name')->toString(),
                'phone' => $request->string('phone')->toString(),
            ]);

            if ($user->isMerchant()) {
                MerchantProfile::query()->create([
                    'user_id' => $user->id,
                    'company_name' => $user->company_name,
                    'phone' => $user->phone,
                ]);
            } else {
                CustomerProfile::query()->create([
                    'user_id' => $user->id,
                    'company_name' => $user->company_name,
                    'pic_name' => $user->name,
                    'phone' => $user->phone,
                ]);
            }

            return $user;
        }, 3);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect($user->isMerchant() ? '/merchant/dashboard' : '/marketplace');
    }
}
