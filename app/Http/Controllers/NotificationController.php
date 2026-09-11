<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Inertia\Inertia;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(15);
            
        return Inertia::render('Notifications', [
            'notifications' => $notifications
        ]);
    }
}