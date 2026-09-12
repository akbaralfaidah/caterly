import { Head, useForm, router } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { PageProps, Region } from '@/types';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

interface Props extends PageProps {
    profile: {
        company_name: string;
        address: string | null;
        phone: string;
        description: string | null;
        minimum_portions: number;
        default_daily_capacity: number;
        bank_name: string | null;
        bank_account_name: string | null;
        bank_account_number: string | null;
        publication_status: 'draft' | 'published';
    };
    serviceAreas: { region_id: number; delivery_fee: number; region: Region }[];
    regions: Region[];
}

export default function Profile({ profile, serviceAreas, regions }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        company_name: profile.company_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        description: profile.description || '',
        minimum_portions: profile.minimum_portions || 10,
        default_daily_capacity: profile.default_daily_capacity || 100,
        bank_name: profile.bank_name || '',
        bank_account_name: profile.bank_account_name || '',
        bank_account_number: profile.bank_account_number || '',
    });

    const [areas, setAreas] = useState<{ region_id: number; delivery_fee: number }[]>(
        serviceAreas.map(a => ({ region_id: a.region_id, delivery_fee: a.delivery_fee }))
    );
    const [areasLoading, setAreasLoading] = useState(false);

    const submitProfile = (e: FormEvent) => {
        e.preventDefault();
        patch('/merchant/profile', {
            preserveScroll: true,
        });
    };

    const saveServiceAreas = () => {
        setAreasLoading(true);
        router.post('/merchant/profile/service-areas', { areas }, {
            preserveScroll: true,
            onFinish: () => setAreasLoading(false),
            onError: errors => toast.error(String(Object.values(errors)[0] || 'Area layanan gagal disimpan.')),
        });
    };

    const addArea = () => {
        setAreas([...areas, { region_id: regions[0]?.id || 0, delivery_fee: 0 }]);
    };

    const removeArea = (index: number) => {
        setAreas(areas.filter((_, i) => i !== index));
    };

    const updateArea = (index: number, field: string, value: string) => {
        const newAreas = [...areas];
        newAreas[index] = { ...newAreas[index], [field]: Number(value) };
        setAreas(newAreas);
    };

    const togglePublish = () => {
        router.post('/merchant/profile/publish', {}, { preserveScroll: true });
    };

    return (
        <MerchantLayout title="Profil Usaha">
            <Head title="Profil Usaha" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">Profil Usaha</h2>
                    <p className="text-sm text-text-secondary">Lengkapi informasi katering Anda agar menarik pelanggan</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-border shadow-sm shrink-0">
                    <span className="text-sm font-medium text-text-secondary">Status Katalog:</span>
                    <span className={`text-sm font-bold ${profile.publication_status === 'published' ? 'text-primary' : 'text-accent-dark'}`}>
                        {profile.publication_status === 'published' ? 'Ditayangkan' : 'Draft'}
                    </span>
                    <button 
                        onClick={togglePublish}
                        className={`ml-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            profile.publication_status === 'published' 
                                ? 'bg-surface text-text-secondary hover:bg-border' 
                                : 'bg-primary text-white hover:bg-primary-dark'
                        }`}
                    >
                        {profile.publication_status === 'published' ? 'Jadikan Draft' : 'Tayangkan'}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Informasi Dasar */}
                    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border bg-surface/50">
                            <h3 className="font-bold text-text-primary">Informasi Dasar</h3>
                        </div>
                        <div className="p-5 sm:p-6">
                            <form onSubmit={submitProfile} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Nama Katering</label>
                                    <input
                                        type="text"
                                        value={data.company_name}
                                        onChange={e => setData('company_name', e.target.value)}
                                        className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary"
                                    />
                                    {errors.company_name && <p className="text-error text-sm mt-1">{errors.company_name}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Tentang Katering</label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows={4}
                                        className="w-full p-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary resize-y"
                                        placeholder="Ceritakan tentang katering Anda, keunggulan, spesialisasi menu..."
                                    />
                                    {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Nomor Telepon/WA</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary"
                                        />
                                        {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Alamat Dapur/Kantor</label>
                                        <input
                                            type="text"
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary"
                                        />
                                        {errors.address && <p className="text-error text-sm mt-1">{errors.address}</p>}
                                    </div>
                                </div>

                                <div className="border-t border-border pt-5">
                                    <h4 className="font-bold text-text-primary mb-4">Rekening Pembayaran</h4>
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Nama Bank</label>
                                            <input
                                                value={data.bank_name}
                                                onChange={event => setData('bank_name', event.target.value)}
                                                className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary"
                                            />
                                            {errors.bank_name && <p className="text-error text-sm mt-1">{errors.bank_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Nomor Rekening</label>
                                            <input
                                                value={data.bank_account_number}
                                                onChange={event => setData('bank_account_number', event.target.value)}
                                                className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary"
                                            />
                                            {errors.bank_account_number && <p className="text-error text-sm mt-1">{errors.bank_account_number}</p>}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Nama Pemilik Rekening</label>
                                            <input
                                                value={data.bank_account_name}
                                                onChange={event => setData('bank_account_name', event.target.value)}
                                                className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary"
                                            />
                                            {errors.bank_account_name && <p className="text-error text-sm mt-1">{errors.bank_account_name}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Minimal Pesanan (Porsi)</label>
                                        <input
                                            type="number"
                                            value={data.minimum_portions}
                                            onChange={e => setData('minimum_portions', parseInt(e.target.value))}
                                            min="1"
                                            className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary tabular-nums"
                                        />
                                        {errors.minimum_portions && <p className="text-error text-sm mt-1">{errors.minimum_portions}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Kapasitas Harian Default (Porsi)</label>
                                        <input
                                            type="number"
                                            value={data.default_daily_capacity}
                                            onChange={e => setData('default_daily_capacity', parseInt(e.target.value))}
                                            min="1"
                                            className="w-full h-11 px-3 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary tabular-nums"
                                        />
                                        {errors.default_daily_capacity && <p className="text-error text-sm mt-1">{errors.default_daily_capacity}</p>}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Area Layanan */}
                    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border bg-surface/50 flex justify-between items-center">
                            <h3 className="font-bold text-text-primary">Area Layanan</h3>
                            <button onClick={addArea} className="text-sm font-semibold text-primary hover:underline">
                                + Tambah Area
                            </button>
                        </div>
                        <div className="p-5">
                            {areas.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-text-secondary mb-3">Belum ada area layanan yang diatur.</p>
                                    <button onClick={saveServiceAreas} disabled={areasLoading} className="text-sm font-bold text-primary">
                                        Simpan daftar kosong
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {areas.map((area, idx) => (
                                        <div key={idx} className="bg-surface p-3 rounded-lg border border-border relative">
                                            <button 
                                                onClick={() => removeArea(idx)}
                                                className="absolute -top-2 -right-2 bg-white border border-border text-error rounded-full p-1 hover:bg-error hover:text-white transition-colors"
                                            >
                                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                                            </button>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-text-secondary mb-1">Kota/Kabupaten</label>
                                                    <select 
                                                        value={area.region_id}
                                                        onChange={(e) => updateArea(idx, 'region_id', e.target.value)}
                                                        className="w-full h-9 px-2 text-sm border border-border rounded-md bg-white focus:border-primary focus:outline-none"
                                                    >
                                                        {regions.map(r => (
                                                            <option key={r.id} value={r.id}>{r.city_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-text-secondary mb-1">Ongkos Kirim (Rp)</label>
                                                    <input 
                                                        type="number"
                                                        value={area.delivery_fee}
                                                        onChange={(e) => updateArea(idx, 'delivery_fee', e.target.value)}
                                                        min="0"
                                                        className="w-full h-9 px-2 text-sm border border-border rounded-md focus:border-primary focus:outline-none"
                                                        placeholder="0 = Gratis Ongkir"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={saveServiceAreas}
                                        disabled={areasLoading}
                                        className="w-full py-2 bg-text-primary text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50 mt-2"
                                    >
                                        {areasLoading ? 'Menyimpan...' : 'Simpan Area Layanan'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
