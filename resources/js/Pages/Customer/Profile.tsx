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