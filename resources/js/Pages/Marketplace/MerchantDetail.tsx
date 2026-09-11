import { Head, Link, useForm, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { PageProps, MenuItem, formatRupiah, Region, CartData } from '@/types';
import { useState } from 'react';

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
}

export default function MerchantDetail({ merchant, menus, cart }: Props) {
    const [selectedDate, setSelectedDate] = useState(cart?.delivery_date || '');

    const { post, processing } = useForm({
        menu_id: '',
        quantity: 1,
        delivery_date: selectedDate,
    });

    const addToCart = (menu: MenuItem) => {
        if (!selectedDate) {
            alert('Silakan pilih tanggal pengiriman terlebih dahulu.');
            return;
        }

        router.post('/customer/cart/add', {
            menu_id: menu.id,
            quantity: 1,
            delivery_date: selectedDate,
        }, {
            preserveScroll: true,
            onSuccess: () => alert(`${menu.name} ditambahkan ke keranjang.`),
        });
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <GuestLayout>
            <Head title={merchant.company_name} />
            
            <div className="bg-surface border-b border-border">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-text-primary mb-3">{merchant.company_name}</h1>
                            <p className="text-text-secondary text-lg mb-4 max-w-3xl">{merchant.description}</p>
                            
                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-secondary">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📍</span> {merchant.address || 'Alamat tidak tersedia'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📞</span> {merchant.phone}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📦</span> Min. {merchant.minimum_portions} porsi
                                </div>
                            </div>
                        </div>

                        {/* Booking card */}
                        <div className="w-full lg:w-80 bg-white border border-border rounded-xl p-5 shadow-sm shrink-0">
                            <h3 className="font-bold text-text-primary mb-4">Mulai Pesanan</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Tanggal Pengiriman</label>
                                    <input 
                                        type="date" 
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={minDate}
                                        className="w-full h-11 px-3 border border-border rounded-lg focus:border-primary focus:outline-none text-[15px]"
                                    />
                                    <p className="text-xs text-text-secondary mt-1">Pesan maksimal H-1 jam 16:00 WIB.</p>
                                </div>
                                
                                {cart && cart.merchant_id === merchant.id && (
                                    <Link 
                                        href="/customer/cart"
                                        className="block w-full text-center py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        Lihat Keranjang ({cart.total_portions} item)
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Pilihan Menu</h2>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menus.map((menu) => (
                        <div key={menu.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="aspect-video bg-surface">
                                {menu.image_path ? (
                                    <img src={`/storage/${menu.image_path}`} alt={menu.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-primary-light">🍱</div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-text-primary mb-1">{menu.name}</h3>
                                <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-1">{menu.description}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                    <p className="text-lg font-bold text-text-primary tabular-nums">
                                        {formatRupiah(menu.price_idr)}
                                    </p>
                                    <button 
                                        onClick={() => addToCart(menu)}
                                        className="px-4 py-2 bg-primary-light text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
                                    >
                                        + Tambah
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </GuestLayout>
    );
}