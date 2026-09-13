<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Rate limiting
        $throttleKey = strtolower($request->input('email')).'|'.$request->ip();
        if (app('Illuminate\Cache\RateLimiter')->tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages([
                'email' => 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
            ]);
        }

        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            app('Illuminate\Cache\RateLimiter')->hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        app('Illuminate\Cache\RateLimiter')->clear($throttleKey);
        $request->session()->regenerate();

        $user = Auth::user();

        if ($user->isCustomer() && ! $user->customerAddresses()->exists()) {
            return redirect()->route('customer.profile')
                ->with('error', 'Tambahkan alamat perusahaan terlebih dahulu agar katering di area Anda dapat ditampilkan.');
        }

        $redirect = $user->isMerchant() ? '/merchant/dashboard' : '/marketplace';

        return redirect()->intended($redirect);
    }

    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
