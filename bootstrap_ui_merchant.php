<?php
$files = [];

// ===== Merchant Dashboard Page =====
$files['resources/js/Pages/Merchant/Dashboard.tsx'] = <<<'TSX'
import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';

export default function Dashboard() {
    return (
        <MerchantLayout title="Ringkasan">
            <Head title="Ringkasan Merchant" />
            <div className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                        <p className="text-sm text-text-secondary font-medium mb-1">Pesanan menunggu konfirmasi</p>
                        <p className="text-2xl font-bold text-text-primary">0</p>
                    </div>
                    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                        <p className="text-sm text-text-secondary font-medium mb-1">Bukti pembayaran menunggu</p>
                        <p className="text-2xl font-bold text-text-primary">0</p>
                    </div>
                    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                        <p className="text-sm text-text-secondary font-medium mb-1">Produksi hari ini</p>
                        <p className="text-2xl font-bold text-text-primary">0 porsi</p>
                    </div>
                </div>
                <div className="bg-white border border-border rounded-xl p-8 text-center shadow-sm">
                    <p className="text-lg font-semibold text-text-primary mb-2">Belum ada pesanan aktif</p>
                    <p className="text-text-secondary">Pesanan baru dari kantor akan muncul di sini.</p>
                </div>
            </div>
        </MerchantLayout>
    );
}
TSX;

// ===== Merchant Menu Page =====
$files['resources/js/Pages/Merchant/Menus.tsx'] = <<<'TSX'
import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';

export default function Menus() {
    return (
        <MerchantLayout title="Daftar Menu">
            <Head title="Daftar Menu" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text-primary">Katalog Menu</h2>
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                    + Tambah Menu
                </button>
            </div>
            
            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 text-center">
                    <p className="text-lg font-semibold text-text-primary mb-2">Belum ada menu</p>
                    <p className="text-text-secondary">Silakan tambah menu agar kantor bisa mulai memesan.</p>
                </div>
            </div>
        </MerchantLayout>
    );
}
TSX;

// ===== Merchant Orders Page =====
$files['resources/js/Pages/Merchant/Orders.tsx'] = <<<'TSX'
import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';

export default function Orders() {
    return (
        <MerchantLayout title="Pesanan">
            <Head title="Daftar Pesanan" />
            
            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 text-center">
                    <p className="text-lg font-semibold text-text-primary mb-2">Belum ada pesanan</p>
                    <p className="text-text-secondary">Daftar pesanan dari pelanggan akan tampil di sini.</p>
                </div>
            </div>
        </MerchantLayout>
    );
}
TSX;

// ===== Merchant Profile Page =====
$files['resources/js/Pages/Merchant/Profile.tsx'] = <<<'TSX'
import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';

export default function Profile() {
    return (
        <MerchantLayout title="Profil Usaha">
            <Head title="Profil Usaha Merchant" />
            
            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 text-center">
                    <p className="text-lg font-semibold text-text-primary mb-2">Pengaturan Profil</p>
                    <p className="text-text-secondary">Informasi usaha katering Anda.</p>
                </div>
            </div>
        </MerchantLayout>
    );
}
TSX;

foreach ($files as $path => $content) {
    file_put_contents($path, $content);
}
echo "Merchant UI OK";