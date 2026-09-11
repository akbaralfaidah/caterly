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