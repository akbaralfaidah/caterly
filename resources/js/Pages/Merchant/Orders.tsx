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