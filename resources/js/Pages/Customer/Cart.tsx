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