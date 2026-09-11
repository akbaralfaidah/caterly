<?php
$files = [];

// ===== Customer Profile Page =====
$files['resources/js/Pages/Customer/Profile.tsx'] = <<<'TSX'
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Profile() {
    return (
        <GuestLayout>
            <Head title="Profil & Alamat Kantor" />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-text-primary mb-6">Pengaturan Profil & Alamat</h1>
                
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-8 text-center">
                        <p className="text-lg font-semibold text-text-primary mb-2">Profil Perusahaan</p>
                        <p className="text-text-secondary">Kelola informasi perusahaan dan alamat pengiriman di sini.</p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
TSX;

// ===== Customer Cart Page =====
$files['resources/js/Pages/Customer/Cart.tsx'] = <<<'TSX'
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Cart() {
    return (
        <GuestLayout>
            <Head title="Keranjang" />
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-text-primary mb-6">Keranjang Pesanan</h1>
                
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-8 text-center">
                        <p className="text-lg font-semibold text-text-primary mb-2">Keranjang belanja kosong</p>
                        <p className="text-text-secondary">Silakan jelajahi katering dan tambahkan menu ke keranjang Anda.</p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
TSX;

// ===== Customer Orders Page =====
$files['resources/js/Pages/Customer/Orders.tsx'] = <<<'TSX'
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Orders() {
    return (
        <GuestLayout>
            <Head title="Daftar Pesanan" />
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-text-primary mb-6">Riwayat Pesanan</h1>
                
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-8 text-center">
                        <p className="text-lg font-semibold text-text-primary mb-2">Belum ada pesanan</p>
                        <p className="text-text-secondary">Pesanan yang Anda buat akan muncul di sini.</p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
TSX;

foreach ($files as $path => $content) {
    file_put_contents($path, $content);
}
echo "Customer UI OK";