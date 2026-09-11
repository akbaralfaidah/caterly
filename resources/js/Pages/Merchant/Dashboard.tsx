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