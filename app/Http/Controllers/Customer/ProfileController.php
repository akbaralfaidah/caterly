<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerProfile;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $profile = CustomerProfile::where('user_id', auth()->id())->first();

        return Inertia::render('Customer/Profile', [
            'profile' => $profile
        ]);
    }
}