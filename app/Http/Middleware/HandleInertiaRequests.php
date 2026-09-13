<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'company_name' => $request->user()->company_name,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'celebration' => fn () => $request->session()->get('celebration'),
            ],
            'celebration' => fn () => $this->merchantCelebration($request),
        ];
    }

    /**
     * @return array{id: string, audience: string, title: string, message: string, order_number: string|null}|null
     */
    private function merchantCelebration(Request $request): ?array
    {
        $user = $request->user();

        if (! $user?->isMerchant()) {
            return null;
        }

        $notification = Notification::query()
            ->where('user_id', $user->id)
            ->where('type', 'order_status')
            ->where('title', 'Pesanan selesai')
            ->where('event_key', 'like', 'order:%:status:completed:user:%')
            ->latest('id')
            ->first();

        if (! $notification) {
            return null;
        }

        $orderNumber = null;
        if (preg_match('/^Pesanan ([^:]+):/', $notification->message, $matches) === 1) {
            $orderNumber = $matches[1];
        }

        return [
            'id' => "merchant-notification-{$notification->id}",
            'audience' => 'merchant',
            'title' => 'Yeay, pesanan diterima!',
            'message' => 'Terima kasih sudah bekerja keras.',
            'order_number' => $orderNumber,
        ];
    }
}
