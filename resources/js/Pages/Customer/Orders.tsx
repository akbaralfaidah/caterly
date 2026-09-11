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