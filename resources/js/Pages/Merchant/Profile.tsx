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