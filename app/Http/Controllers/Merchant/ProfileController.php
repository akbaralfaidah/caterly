<?php
namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\MerchantProfile;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $profile = MerchantProfile::where('user_id', auth()->id())->first();

        return Inertia::render('Merchant/Profile', [
            'profile' => $profile
        ]);
    }
}