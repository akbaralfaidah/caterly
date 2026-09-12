import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { PageProps, Region } from '@/types';

interface Merchant {
    id: number;
    company_name: string;
    description: string | null;
    minimum_portions: number;
    menu_count: number;
    service_area: string | null;
    menus_preview: { id: number; name: string; price_idr: number; image_path: string | null }[];
}

interface Props extends PageProps {
    merchants: { data: Merchant[] };
    regions: Region[];
    filters: {
        region_id: string;
        date: string;
        portions: string;
    };
}

export default function MarketplaceIndex({ merchants, regions, filters }: Props) {
    const { data, setData, get } = useForm({
        region_id: filters.region_id || '',
        date: filters.date || '',
        portions: filters.portions || '',
    });

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        get('/marketplace', { preserveState: true });
    };

    const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <GuestLayout>
            <Head title="Cari Katering" />

            {/* Hero Section */}
            <div className="bg-primary -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-10 px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
                <div className="max-w-[1000px] mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                        Temukan Katering Terbaik untuk Perusahaan Anda
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
                        Pesan makan siang berkualitas untuk karyawan dengan mudah. Transparan, efisien, dan tepat waktu.
                    </p>

                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl max-w-4xl mx-auto">
                        <form onSubmit={search} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 text-left">
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">Area Pengiriman</label>
                                <select 
                                    value={data.region_id}
                                    onChange={e => setData('region_id', e.target.value)}
                                    className="w-full h-12 px-4 border border-border rounded-xl text-text-primary focus:border-primary focus:ring-1 focus:ring-primary bg-white font-medium"
                                >
                                    <option value="">Semua Area</option>
                                    {regions.map(r => <option key={r.id} value={r.id}>{r.city_name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 text-left">
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">Tanggal</label>
                                <input 
                                    type="date"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    min={minDate}
                                    className="w-full h-12 px-4 border border-border rounded-xl text-text-primary focus:border-primary focus:ring-1 focus:ring-primary bg-white font-medium"
                                />
                            </div>
                            <div className="flex-1 text-left">
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">Jumlah Porsi</label>
                                <input 
                                    type="number"
                                    value={data.portions}
                                    onChange={e => setData('portions', e.target.value)}
                                    min="1"
                                    placeholder="Contoh: 50"
                                    className="w-full h-12 px-4 border border-border rounded-xl text-text-primary focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                                />
                            </div>
                            <div className="md:pt-6">
                                <button type="submit" className="w-full md:w-auto h-12 px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg active:scale-95">
                                    Cari Katering
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Merchant List */}
            <div className="max-w-[1200px] mx-auto pb-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Rekomendasi Katering</h2>
                        <p className="text-text-secondary mt-1">Daftar katering yang sesuai dengan kriteria pencarian Anda.</p>
                    </div>
                    <div className="text-sm font-semibold text-text-secondary bg-surface px-4 py-2 rounded-lg">
                        {merchants.data.length} katering ditemukan
                    </div>
                </div>

                {merchants.data.length === 0 ? (
                    <div className="bg-white border border-border rounded-2xl shadow-sm p-16 text-center">
                        <div className="text-6xl mb-6 grayscale opacity-50">🍱</div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Tidak ada katering ditemukan</h3>
                        <p className="text-text-secondary">Silakan ubah kriteria pencarian Anda (area, tanggal, atau jumlah porsi).</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {merchants.data.map(merchant => (
                            <Link key={merchant.id} href={`/marketplace/${merchant.id}`} className="group block bg-white border border-border rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/30 transition-all overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-border">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">{merchant.company_name}</h3>
                                        <span className="shrink-0 bg-primary-light text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                                            Min. {merchant.minimum_portions} porsi
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed h-10 mb-4">{merchant.description}</p>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {merchant.service_area && (
                                            <span className="text-xs font-semibold text-text-secondary bg-surface px-2.5 py-1 rounded-md border border-border">
                                                📍 {merchant.service_area}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-6 bg-surface/30 flex-1 flex flex-col">
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Sample Menu</p>
                                    {merchant.menus_preview.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                                            {merchant.menus_preview.map(menu => (
                                                <div key={menu.id} className="text-center group-hover:transform group-hover:scale-[1.02] transition-transform">
                                                    <div className="aspect-square bg-white border border-border rounded-xl mb-2 flex items-center justify-center overflow-hidden shadow-sm">
                                                        {menu.image_path ? (
                                                            <img src={`/storage/${menu.image_path}`} alt={menu.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-3xl">🍱</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-bold text-text-primary truncate">{menu.name}</p>
                                                    <p className="text-[10px] text-text-secondary font-medium">{formatRupiah(menu.price_idr)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-text-secondary italic flex-1">Belum ada menu yang ditampilkan.</p>
                                    )}
                                    
                                    <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                                        <span className="text-sm font-semibold text-text-secondary">
                                            {merchant.menu_count} total pilihan menu
                                        </span>
                                        <span className="text-sm font-bold text-primary group-hover:underline">
                                            Lihat Detail &rarr;
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}

