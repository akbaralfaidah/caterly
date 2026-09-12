<?php

use App\Support\OrderLifecycle;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('orders:expire', function (OrderLifecycle $lifecycle): void {
    $expiredCount = $lifecycle->expireDue();

    $this->info("Berhasil mengakhiri {$expiredCount} pesanan kedaluwarsa.");
})->purpose('Expire overdue Caterly orders and release their capacity');

Schedule::command('orders:expire')
    ->everyMinute()
    ->withoutOverlapping(5);
