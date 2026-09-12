<?php

namespace App\Support;

use App\Models\CapacityReservation;
use App\Models\Invoice;
use App\Models\MerchantDateCapacity;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderStatusEvent;
use DomainException;
use Illuminate\Support\Facades\DB;

class OrderLifecycle
{
    /**
     * @param  list<string>  $allowedFrom
     */
    public function transition(
        Order $order,
        string $toStatus,
        array $allowedFrom,
        ?int $actorId,
        ?string $reason = null,
    ): Order {
        return DB::transaction(function () use ($order, $toStatus, $allowedFrom, $actorId, $reason): Order {
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);

            if (! in_array($lockedOrder->order_status, $allowedFrom, true)) {
                throw new DomainException('Status pesanan tidak valid untuk tindakan ini.');
            }

            if ($toStatus === 'accepted' && $lockedOrder->expires_at?->isPast()) {
                $this->applyTransition($lockedOrder, 'expired', null, 'Batas waktu konfirmasi telah berakhir.');

                return $lockedOrder->refresh();
            }

            $this->applyTransition($lockedOrder, $toStatus, $actorId, $reason);

            return $lockedOrder->refresh();
        }, 3);
    }

    public function expireDue(int $limit = 100): int
    {
        $expiredCount = 0;

        Order::query()
            ->where('order_status', 'pending_confirmation')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->orderBy('id')
            ->limit($limit)
            ->pluck('id')
            ->each(function (int $orderId) use (&$expiredCount): void {
                DB::transaction(function () use ($orderId, &$expiredCount): void {
                    $order = Order::query()->lockForUpdate()->find($orderId);

                    if (! $order || $order->order_status !== 'pending_confirmation' || $order->expires_at?->isFuture()) {
                        return;
                    }

                    $this->applyTransition($order, 'expired', null, 'Batas waktu konfirmasi telah berakhir.');
                    $expiredCount++;
                }, 3);
            });

        return $expiredCount;
    }

    private function applyTransition(Order $order, string $toStatus, ?int $actorId, ?string $reason): void
    {
        $fromStatus = $order->order_status;

        $order->update(['order_status' => $toStatus]);

        OrderStatusEvent::query()->firstOrCreate(
            ['event_key' => "order:{$order->id}:status:{$toStatus}"],
            [
                'order_id' => $order->id,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'actor_id' => $actorId,
                'reason' => $reason,
            ],
        );

        if (in_array($toStatus, ['rejected', 'cancelled', 'expired'], true)) {
            $this->releaseCapacity($order);
            $this->voidInvoice($order);
        }

        $this->notifyTransition($order, $toStatus, $actorId);
    }

    private function releaseCapacity(Order $order): void
    {
        $reservation = CapacityReservation::query()
            ->where('order_id', $order->id)
            ->lockForUpdate()
            ->first();

        if (! $reservation || $reservation->released_at !== null) {
            return;
        }

        $capacity = MerchantDateCapacity::query()
            ->lockForUpdate()
            ->find($reservation->capacity_date_id);

        if ($capacity) {
            $capacity->update([
                'reserved_portions' => max(0, $capacity->reserved_portions - $reservation->portions),
            ]);
        }

        $reservation->update(['released_at' => now()]);
    }

    private function voidInvoice(Order $order): void
    {
        Invoice::query()
            ->where('order_id', $order->id)
            ->where('status', 'issued')
            ->update(['status' => 'void', 'voided_at' => now()]);
    }

    private function notifyTransition(Order $order, string $status, ?int $actorId): void
    {
        $labels = [
            'accepted' => 'Pesanan diterima',
            'rejected' => 'Pesanan ditolak',
            'cancelled' => 'Pesanan dibatalkan',
            'expired' => 'Pesanan kedaluwarsa',
            'preparing' => 'Pesanan sedang disiapkan',
            'delivering' => 'Pesanan sedang dikirim',
            'completed' => 'Pesanan selesai',
        ];

        $title = $labels[$status] ?? 'Status pesanan diperbarui';
        $recipientIds = $actorId === $order->customer_id
            ? [$order->merchant_id]
            : [$order->customer_id];

        if ($actorId === null) {
            $recipientIds = [$order->customer_id, $order->merchant_id];
        }

        foreach (array_unique($recipientIds) as $recipientId) {
            Notification::query()->firstOrCreate(
                [
                    'user_id' => $recipientId,
                    'event_key' => "order:{$order->id}:status:{$status}:user:{$recipientId}",
                ],
                [
                    'type' => 'order_status',
                    'title' => $title,
                    'message' => "Pesanan {$order->order_number}: {$title}.",
                    'resource_type' => 'order',
                    'resource_id' => $order->id,
                ],
            );
        }
    }
}
