import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useInteractiveDialog } from '@/Components/InteractiveDialog';
import { PageProps, MenuItem, Region, CartData } from '@/types';
import { useState } from 'react';
import { MapPin, Clock, Calendar, Utensils, Minus, Plus, ShoppingCart, Info, Store, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props extends PageProps {
    merchant: {
        id: number;
        company_name: string;
        address: string | null;
        phone: string;
        description: string | null;
        minimum_portions: number;
        service_areas: { region_id: number; region_name: string; delivery_fee: number }[];
        operating_days: { weekday: number; is_open: boolean }[];
    };
    menus: MenuItem[];
    cart: CartData | null;
    selected_region_id: number | null;
}

export default function MerchantDetail({ auth, merchant, menus, cart, selected_region_id: selectedRegionId }: Props) {
    const [selectedDate, setSelectedDate] = useState(cart?.delivery_date || '');
    const { confirm: confirmDialog } = useInteractiveDialog();
    
    // Manage quantities locally before adding to cart
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    const updateQuantity = (menuId: number, delta: number) => {
        setQuantities(prev => {
            const current = prev[menuId] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [menuId]: next };
        });
    };

    const addToCart = async (menuId: number) => {
        if (!auth.user) {
            toast.error('Silakan masuk (login) terlebih dahulu untuk memesan.');
            router.get('/login');
            return;
        }
        if (auth.user.role !== 'customer') {
            toast.error('Akun merchant tidak dapat membuat pesanan pelanggan.');
            return;
        }

        if (!selectedDate) {
            toast.error('Pilih tanggal pengiriman terlebih dahulu.');
            return;
        }

        const quantity = quantities[menuId] || 0;
        if (quantity < 1) {
            toast.error('Jumlah porsi harus lebih dari 0.');
            return;
        }

        const replaceCart = Boolean(cart && cart.merchant_id !== merchant.id);
        if (replaceCart) {
            const confirmed = await confirmDialog({
                title: 'Ganti isi keranjang?',
                message: `Keranjang Anda berisi menu dari ${cart?.merchant_name}. Seluruh isinya akan diganti dengan menu dari ${merchant.company_name}.`,
                confirmLabel: 'Ganti keranjang',
                tone: 'warning',
            });

            if (!confirmed) return;
        }

        router.post('/customer/cart/add', {
            menu_id: menuId,
            quantity: quantity,
            delivery_date: selectedDate,
            region_id: selectedRegionId,
            replace_cart: replaceCart,
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as PageProps['flash'] | undefined;

                if (flash?.error) return;

                setQuantities(prev => ({ ...prev, [menuId]: 0 }));
            },
            onError: (errors) => {
                toast.error(String(Object.values(errors)[0] || 'Gagal menambahkan ke keranjang.'));
            }
        });
    };

    const Layout = GuestLayout;

    // Filter menus by category for UI grouping
    const categories = Array.from(new Set(menus.map(m => m.category || 'Menu Lainnya')));

    return (
        <Layout>
            <Head title={merchant.company_name} />

            {/* Hero Cover */}
            <div className="h-[250px] md:h-[300px] w-full bg-gradient-to-r from-primary to-accent relative overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop" 
                    alt="Cover" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-24">
                
                {/* Merchant Header Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border flex flex-col md:flex-row gap-6 items-start justify-between mb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                                <Store size={14} /> Mitra Terverifikasi
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3">{merchant.company_name}</h1>
                        <p className="text-text-secondary text-base leading-relaxed max-w-3xl mb-6">
                            {merchant.description || 'Mitra katering profesional yang siap melayani kebutuhan makan siang kantor Anda dengan kualitas terbaik dan pengiriman tepat waktu.'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                            <div className="flex items-center gap-2 text-text-secondary">
                                <MapPin size={18} className="text-primary" />
                                <span className="font-medium text-sm">{merchant.service_areas.map(a => a.region_name).join(', ') || 'Semua Area'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Users size={18} className="text-accent" />
                                <span className="font-medium text-sm">Min. {merchant.minimum_portions} Porsi</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Clock size={18} className="text-info" />
                                <span className="font-medium text-sm">Waktu Fleksibel</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Content - Menus */}
                    <div className="flex-1">
                        {/* Delivery Date Setter */}
                        <div className="bg-surface rounded-2xl p-6 border border-border mb-8">
                            <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                                <div>
                                    <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
                                        <Calendar size={20} className="text-primary"/> Tanggal Pengiriman
                                    </h3>
                                    <p className="text-text-secondary text-sm mt-1">Pilih tanggal untuk melihat ketersediaan menu</p>
                                </div>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                    max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
                                    className="px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none min-w-[200px]"
                                />
                            </div>
                        </div>

                        {categories.map((category, idx) => (
                            <div key={idx} className="mb-10">
                                <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <Utensils className="text-primary" size={24} />
                                    {category}
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {menus.filter(m => (m.category || 'Menu Lainnya') === category).map(menu => (
                                        <div key={menu.id} className="bg-white rounded-2xl p-4 border border-border hover:shadow-md transition-shadow flex gap-4">
                                            <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                                <img 
                                                    src={menu.image_path ? `/storage/${menu.image_path}` : `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80`} 
                                                    alt={menu.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <h4 className="font-bold text-text-primary text-base line-clamp-1">{menu.name}</h4>
                                                <p className="text-xs text-text-secondary line-clamp-2 mt-1 mb-2">
                                                    {menu.description || 'Menu lezat disajikan segar dengan bumbu pilihan.'}
                                                </p>
                                                <div className="mt-auto flex items-end justify-between">
                                                    <span className="font-extrabold text-primary text-lg">
                                                        Rp {(menu.price_idr).toLocaleString('id-ID')}
                                                    </span>
                                                    
                                                    {/* Add Control */}
                                                    <div className="flex flex-col items-end gap-2">
                                                        {(quantities[menu.id] || 0) > 0 ? (
                                                            <div className="flex items-center gap-3 bg-surface rounded-full p-1 border border-border">
                                                                <button onClick={() => updateQuantity(menu.id, -1)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-text-primary hover:bg-gray-100 shadow-sm">
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="font-bold text-sm min-w-[20px] text-center">{quantities[menu.id]}</span>
                                                                <button onClick={() => updateQuantity(menu.id, 1)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-text-primary hover:bg-gray-100 shadow-sm">
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => updateQuantity(menu.id, 1)}
                                                                className="px-4 py-2 bg-primary/10 text-primary font-bold text-sm rounded-full hover:bg-primary hover:text-white transition-colors"
                                                            >
                                                                Tambah
                                                            </button>
                                                        )}
                                                        {(quantities[menu.id] || 0) > 0 && (
                                                            <button onClick={() => addToCart(menu.id)} className="text-xs bg-primary text-white px-3 py-1.5 rounded-full font-bold shadow-sm hover:bg-primary-dark">
                                                                Masukkan
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Content - Sticky Summary */}
                    <div className="lg:w-[320px] shrink-0">
                        <div className="sticky top-24 bg-white rounded-3xl p-6 border border-border shadow-sm">
                            <h3 className="font-extrabold text-xl text-text-primary mb-4 flex items-center gap-2">
                                <ShoppingCart className="text-primary" size={24} /> Keranjang
                            </h3>
                            
                            {cart && cart.items.length > 0 ? (
                                <>
                                    <div className="bg-surface rounded-xl p-3 mb-4 text-sm font-semibold flex items-center gap-2 text-text-secondary border border-border">
                                        <Calendar size={16} className="text-primary"/>
                                        Pengiriman: {cart.delivery_date}
                                    </div>
                                    
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-4">
                                        {cart.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                                                <div>
                                                    <div className="font-bold text-text-primary text-sm line-clamp-1">{item.name}</div>
                                                    <div className="text-xs text-text-secondary mt-1">{item.quantity} porsi x Rp {item.price_idr.toLocaleString('id-ID')}</div>
                                                </div>
                                                <div className="font-bold text-text-primary text-sm shrink-0">
                                                    Rp {(item.price_idr * item.quantity).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="pt-4 border-t border-border flex justify-between items-center mb-6">
                                        <div className="text-sm text-text-secondary font-bold">Total Porsi</div>
                                        <div className="text-lg font-extrabold text-primary">{cart.total_portions} Porsi</div>
                                    </div>

                                    <Link href="/customer/cart" className="w-full block text-center py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold transition-colors shadow-sm">
                                        Lanjut ke Pembayaran
                                    </Link>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 rounded-full bg-surface mx-auto flex items-center justify-center mb-3">
                                        <ShoppingCart size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-text-secondary text-sm font-medium">Keranjang masih kosong.</p>
                                    <p className="text-xs text-text-secondary mt-1">Pilih menu dan tambahkan ke keranjang.</p>
                                </div>
                            )}

                            <div className="mt-6 bg-info-light/50 rounded-xl p-3 flex gap-2 border border-info/20">
                                <Info size={16} className="text-info shrink-0 mt-0.5" />
                                <p className="text-xs text-info leading-relaxed">
                                    Pemesanan minimal {merchant.minimum_portions} porsi untuk katering ini. Pesanan dapat dibuat kapan saja selama tanggal pengiriman masih tersedia.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
}
