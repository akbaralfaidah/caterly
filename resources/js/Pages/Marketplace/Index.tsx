import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Search, MapPin, Calendar, Users, ChevronRight, Utensils } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import MerchantLayout from '@/Layouts/MerchantLayout';

interface Merchant {
    id: number;
    company_name: string;
    description: string | null;
    minimum_portions: number;
    menu_count: number;
    service_area: string | null;
    menus_preview: { id: number; name: string; price_idr: number; image_path: string | null }[];
    starting_price: number | null;
}

interface Region {
    id: number;
    city_name: string;
}

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            role: string;
        } | null;
    };
}

interface Props extends PageProps {
    merchants: {
        data: Merchant[];
    };
    regions: Region[];
    filters: {
        region_id: string;
        delivery_date: string;
        portions: string;
    };
}

export default function MarketplaceIndex({ auth, merchants, regions, filters }: Props) {
    const { data, setData, get } = useForm({
        region_id: filters.region_id || '',
        delivery_date: filters.delivery_date || '',
        portions: filters.portions || '',
    });

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        get('/marketplace', { preserveState: true });
    };

    const Layout = auth.user && auth.user.role === 'merchant' ? MerchantLayout : GuestLayout;

    return (
        <Layout>
            <Head title="Cari Katering" />

            {/* Hero Section */}
            <div className="relative bg-gray-900 pt-20 pb-28 md:pt-28 md:pb-36 px-4">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" 
                        alt="Catering Hero" 
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-gray-900/90 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                        Temukan Katering Terbaik <br className="hidden md:block"/> untuk Perusahaan Anda
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-medium">
                        Pesan makan siang berkualitas untuk karyawan dengan mudah. Transparan, efisien, dan tepat waktu.
                    </p>

                    {/* Search Form - Glassmorphism */}
                    <div className="glass p-3 md:p-4 rounded-2xl md:rounded-full max-w-5xl mx-auto shadow-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 relative bg-white/10 rounded-xl md:rounded-full px-4 py-3 border border-white/20 focus-within:bg-white/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-white/70" size={20} />
                                    <select
                                        value={data.region_id}
                                        onChange={e => setData('region_id', e.target.value)}
                                        className="w-full bg-transparent text-white placeholder-white/50 border-none focus:ring-0 appearance-none font-semibold cursor-pointer outline-none"
                                    >
                                        <option value="" className="text-gray-900">Semua Area</option>
                                        {regions.map(r => (
                                            <option key={r.id} value={r.id} className="text-gray-900">{r.city_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex-1 relative bg-white/10 rounded-xl md:rounded-full px-4 py-3 border border-white/20 focus-within:bg-white/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-white/70" size={20} />
                                    <input
                                        type="date"
                                        value={data.delivery_date}
                                        onChange={e => setData('delivery_date', e.target.value)}
                                        className="w-full bg-transparent text-white placeholder-white/50 border-none focus:ring-0 outline-none font-semibold cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 relative bg-white/10 rounded-xl md:rounded-full px-4 py-3 border border-white/20 focus-within:bg-white/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Users className="text-white/70" size={20} />
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Jumlah porsi (Misal: 50)"
                                        value={data.portions}
                                        onChange={e => setData('portions', e.target.value)}
                                        className="w-full bg-transparent text-white placeholder-white/50 border-none focus:ring-0 outline-none font-semibold placeholder:font-medium"
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                className="bg-accent hover:bg-accent-dark text-white px-8 py-3.5 rounded-xl md:rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(244,131,23,0.39)] shrink-0"
                            >
                                <Search size={20} />
                                Cari
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">Katering Tersedia</h2>
                        <p className="text-text-secondary text-lg">Pilih dari mitra katering terbaik yang sesuai dengan kriteria Anda.</p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-surface px-4 py-2 rounded-full border border-border font-semibold text-text-secondary">
                        {merchants.data.length} katering ditemukan
                    </div>
                </div>

                {merchants.data.length === 0 ? (
                    <div className="text-center py-24 bg-surface rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Utensils className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Tidak ada katering ditemukan</h3>
                        <p className="text-text-secondary max-w-md mx-auto">
                            Coba sesuaikan filter pencarian Anda, pilih area yang berbeda, atau hapus beberapa kriteria.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {merchants.data.map(merchant => (
                            <Link 
                                href={`/marketplace/${merchant.id}`} 
                                key={merchant.id}
                                className="group bg-white rounded-3xl border border-border overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary/20 transition-all duration-300 flex flex-col"
                            >
                                {/* Cover Header (Gradient fallback) */}
                                <div className="h-28 bg-gradient-to-br from-primary/10 to-accent/10 relative p-6 flex flex-col justify-end">
                                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm border border-white">
                                        Min. {merchant.minimum_portions} Porsi
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-text-primary group-hover:text-primary transition-colors">{merchant.company_name}</h3>
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-4">
                                        {merchant.service_area && (
                                            <span className="flex items-center gap-1 text-xs font-semibold text-text-secondary bg-surface px-3 py-1.5 rounded-full border border-border">
                                                <MapPin size={12} className="text-primary"/> 
                                                {merchant.service_area}
                                            </span>
                                        )}
                                        <span className="text-xs font-semibold text-text-secondary bg-surface px-3 py-1.5 rounded-full border border-border">
                                            {merchant.menu_count} Menu
                                        </span>
                                    </div>
                                    
                                    <p className="text-text-secondary text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                                        {merchant.description || 'Penyedia layanan katering korporat profesional.'}
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Preview Menu</h4>
                                        <div className="space-y-2">
                                            {merchant.menus_preview.map((menu, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-surface p-2.5 rounded-xl border border-border group-hover:bg-primary/5 transition-colors">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                                            <img 
                                                                src={menu.image_path ? `/storage/${menu.image_path}` : `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80`} 
                                                                alt={menu.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold text-text-primary truncate">{menu.name}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-primary shrink-0 ml-2">
                                                        Rp {(menu.price_idr / 1000).toLocaleString('id-ID')}k
                                                    </span>
                                                </div>
                                            ))}
                                            {merchant.menus_preview.length === 0 && (
                                                <div className="text-sm text-text-secondary italic p-2 bg-surface rounded-lg">Belum ada menu yang aktif</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                                        <div>
                                            <div className="text-xs text-text-secondary font-semibold mb-0.5">Mulai dari</div>
                                            <div className="text-lg font-extrabold text-text-primary">
                                                {merchant.starting_price 
                                                    ? `Rp ${merchant.starting_price.toLocaleString('id-ID')}`
                                                    : '-'}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}