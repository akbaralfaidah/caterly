import { Head, useForm, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useInteractiveDialog } from '@/Components/InteractiveDialog';
import { PageProps, Address, Region } from '@/types';
import { FormEvent, useState } from 'react';

interface Props extends PageProps {
    profile: {
        company_name: string;
        pic_name: string;
        phone: string;
        email: string;
    };
    addresses: Address[];
    regions: Region[];
    requires_address: boolean;
}

export default function Profile({ profile, addresses, regions, requires_address: requiresAddress }: Props) {
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const { confirm: confirmDialog } = useInteractiveDialog();

    const { data: profileData, setData: setProfileData, patch: updateProfile, processing: profileProcessing, errors: profileErrors } = useForm({
        company_name: profile.company_name || '',
        pic_name: profile.pic_name || '',
        phone: profile.phone || '',
    });

    const { data: addrData, setData: setAddrData, post: submitAddr, patch: updateAddr, processing: addrProcessing, errors: addrErrors, reset: resetAddr, clearErrors: clearAddrErrors } = useForm({
        label: '',
        receiver: '',
        phone: '',
        region_id: '',
        address: '',
        notes: '',
    });

    const handleProfileSubmit = (e: FormEvent) => {
        e.preventDefault();
        updateProfile('/customer/profile', { preserveScroll: true });
    };

    const openAddressModal = (address: Address | null = null) => {
        setEditingAddress(address);
        if (address) {
            setAddrData({
                label: address.label,
                receiver: address.receiver,
                phone: address.phone,
                region_id: address.region_id.toString(),
                address: address.address,
                notes: address.notes || '',
            });
        } else {
            resetAddr();
            setAddrData('receiver', profile.pic_name);
            setAddrData('phone', profile.phone);
        }
        clearAddrErrors();
        setIsAddressModalOpen(true);
    };

    const handleAddressSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editingAddress) {
            updateAddr(`/customer/addresses/${editingAddress.id}`, {
                preserveScroll: true,
                onSuccess: () => setIsAddressModalOpen(false),
            });
        } else {
            submitAddr('/customer/addresses', {
                preserveScroll: true,
                onSuccess: () => setIsAddressModalOpen(false),
            });
        }
    };

    const setAsDefault = (id: number) => {
        router.post(`/customer/addresses/${id}/default`, {}, { preserveScroll: true });
    };

    const deleteAddress = async (id: number) => {
        const confirmed = await confirmDialog({
            title: 'Hapus alamat?',
            message: 'Alamat ini akan dihapus dari daftar tujuan pengiriman Anda.',
            confirmLabel: 'Hapus alamat',
            tone: 'danger',
        });

        if (!confirmed) return;

        router.delete(`/customer/addresses/${id}`, { preserveScroll: true });
    };

    return (
        <GuestLayout>
            <Head title="Profil & Alamat Kantor" />
            
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Profil & Alamat Kantor</h1>
                    <p className="text-text-secondary">Kelola informasi perusahaan dan tujuan pengiriman pesanan Anda.</p>
                </div>

                {requiresAddress && (
                    <div className="mb-8 rounded-2xl border border-accent/40 bg-accent-light p-5">
                        <p className="font-extrabold text-accent-dark">Satu langkah lagi sebelum memilih katering</p>
                        <p className="mt-1 text-sm text-text-secondary">Tambahkan minimal satu alamat perusahaan. Marketplace akan otomatis menampilkan katering sesuai kota alamat utama Anda.</p>
                        <button onClick={() => openAddressModal()} className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-accent-dark">
                            Tambah alamat sekarang
                        </button>
                    </div>
                )}

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Profil Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-border bg-surface/50">
                                <h2 className="font-bold text-text-primary">Profil Perusahaan</h2>
                            </div>
                            <div className="p-5">
                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Email (Login)</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="w-full h-11 px-3 border border-border rounded-lg text-[15px] bg-surface text-text-secondary cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Nama Perusahaan</label>
                                        <input
                                            type="text"
                                            value={profileData.company_name}
                                            onChange={e => setProfileData('company_name', e.target.value)}
                                            className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary"
                                        />
                                        {profileErrors.company_name && <p className="text-error text-sm mt-1">{profileErrors.company_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Nama PIC Pemesan</label>
                                        <input
                                            type="text"
                                            value={profileData.pic_name}
                                            onChange={e => setProfileData('pic_name', e.target.value)}
                                            className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary"
                                        />
                                        {profileErrors.pic_name && <p className="text-error text-sm mt-1">{profileErrors.pic_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Nomor Telepon/WA PIC</label>
                                        <input
                                            type="text"
                                            value={profileData.phone}
                                            onChange={e => setProfileData('phone', e.target.value)}
                                            className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary"
                                        />
                                        {profileErrors.phone && <p className="text-error text-sm mt-1">{profileErrors.phone}</p>}
                                    </div>
                                    <div className="pt-2">
                                        <button 
                                            type="submit"
                                            disabled={profileProcessing}
                                            className="w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                                        >
                                            {profileProcessing ? 'Menyimpan...' : 'Simpan Profil'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Alamat List */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-border bg-surface/50 flex justify-between items-center">
                                <h2 className="font-bold text-text-primary">Daftar Alamat Pengiriman</h2>
                                <button 
                                    onClick={() => openAddressModal()}
                                    className="text-sm font-semibold text-primary hover:underline"
                                >
                                    + Tambah Alamat
                                </button>
                            </div>
                            <div className="p-5">
                                {addresses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-text-secondary mb-3">Belum ada alamat pengiriman.</p>
                                        <button 
                                            onClick={() => openAddressModal()}
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            Tambah alamat sekarang
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className={`p-4 rounded-xl border ${addr.is_default ? 'border-primary bg-primary-light/30' : 'border-border bg-white'} relative`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-text-primary">{addr.label}</span>
                                                        {addr.is_default && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-white rounded uppercase tracking-wider">Utama</span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openAddressModal(addr)} className="text-sm font-semibold text-primary hover:underline">Edit</button>
                                                        {!addr.is_default && (
                                                            <button onClick={() => deleteAddress(addr.id)} className="text-sm font-semibold text-error hover:underline">Hapus</button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-[15px] text-text-primary mb-1">
                                                    <span className="font-semibold">{addr.receiver}</span> <span className="text-text-secondary">({addr.phone})</span>
                                                </div>
                                                <p className="text-[15px] text-text-secondary leading-relaxed mb-3">
                                                    {addr.address}<br/>
                                                    {addr.region?.city_name}
                                                </p>
                                                {addr.notes && (
                                                    <p className="text-sm text-text-secondary bg-surface p-2 rounded-lg inline-block mb-3">
                                                        Catatan: {addr.notes}
                                                    </p>
                                                )}
                                                
                                                {!addr.is_default && (
                                                    <div className="pt-3 mt-3 border-t border-border">
                                                        <button 
                                                            onClick={() => setAsDefault(addr.id)}
                                                            className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
                                                        >
                                                            Jadikan Alamat Utama
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
                            <h3 className="text-lg font-bold text-text-primary">
                                {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                            </h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <div className="p-5 overflow-y-auto">
                            <form id="address-form" onSubmit={handleAddressSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Label Alamat</label>
                                    <input
                                        type="text"
                                        value={addrData.label}
                                        onChange={e => setAddrData('label', e.target.value)}
                                        placeholder="Contoh: Kantor Pusat, Cabang Sudirman"
                                        className="w-full h-11 px-3 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
                                    />
                                    {addrErrors.label && <p className="text-error text-sm mt-1">{addrErrors.label}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Nama Penerima</label>
                                        <input
                                            type="text"
                                            value={addrData.receiver}
                                            onChange={e => setAddrData('receiver', e.target.value)}
                                            className="w-full h-11 px-3 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                        {addrErrors.receiver && <p className="text-error text-sm mt-1">{addrErrors.receiver}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">No. Telepon Penerima</label>
                                        <input
                                            type="text"
                                            value={addrData.phone}
                                            onChange={e => setAddrData('phone', e.target.value)}
                                            className="w-full h-11 px-3 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
                                        />
                                        {addrErrors.phone && <p className="text-error text-sm mt-1">{addrErrors.phone}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Kota/Kabupaten</label>
                                    <select
                                        value={addrData.region_id}
                                        onChange={e => setAddrData('region_id', e.target.value)}
                                        className="w-full h-11 px-3 border border-border rounded-lg bg-white focus:outline-none focus:border-primary text-sm"
                                    >
                                        <option value="">Pilih kota/kabupaten...</option>
                                        {regions.map(r => (
                                            <option key={r.id} value={r.id}>{r.city_name}</option>
                                        ))}
                                    </select>
                                    {addrErrors.region_id && <p className="text-error text-sm mt-1">{addrErrors.region_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Alamat Lengkap</label>
                                    <textarea
                                        value={addrData.address}
                                        onChange={e => setAddrData('address', e.target.value)}
                                        rows={3}
                                        placeholder="Nama jalan, gedung, lantai, patokan..."
                                        className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-primary resize-y text-sm"
                                    />
                                    {addrErrors.address && <p className="text-error text-sm mt-1">{addrErrors.address}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Catatan Kurir (Opsional)</label>
                                    <input
                                        type="text"
                                        value={addrData.notes}
                                        onChange={e => setAddrData('notes', e.target.value)}
                                        placeholder="Contoh: Titip di resepsionis lobi utama"
                                        className="w-full h-11 px-3 border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-5 border-t border-border flex justify-end gap-3 shrink-0 bg-surface rounded-b-xl">
                            <button
                                type="button"
                                onClick={() => setIsAddressModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="address-form"
                                disabled={addrProcessing}
                                className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                            >
                                {addrProcessing ? 'Menyimpan...' : 'Simpan Alamat'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
