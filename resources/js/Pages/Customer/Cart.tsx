import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { PageProps, CartData, Address, formatRupiah, formatDateTime } from '@/types';

interface Props extends PageProps {
    cart: CartData | null;
    addresses: Address[];
}

export default function Cart({ cart, addresses }: Props) {
    const updateQuantity = (itemId: number, newQty: number) => {
        if (newQty < 1) return;
        router.patch(`/customer/cart/items/${itemId}`, { quantity: newQty }, { preserveScroll: true });
    };

    const removeItem = (itemId: number) => {
        router.delete(`/customer/cart/items/${itemId}`, { preserveScroll: true });
    };

    const clearCart = () => {
        if (confirm('Yakin ingin mengosongkan keranjang?')) {
            router.delete('/customer/cart', { preserveScroll: true });
        }
    };

    const checkout = () => {
        router.post('/customer/checkout', {}, { preserveScroll: true });
    };

    if (!cart) {
        return (
            <GuestLayout>
                <Head title="Keranjang" />
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="text-6xl mb-6">🛒</div>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Keranjang masih kosong</h1>
                    <p className="text-text-secondary mb-8">Anda belum menambahkan menu apapun ke keranjang.</p>
                    <Link href="/marketplace" className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
                        Cari Katering Sekarang
                    </Link>
                </div>
            </GuestLayout>
        );
    }

    const defaultAddress = addresses.find(a => a.is_default);
    const subtotal = cart.subtotal;
    const total = subtotal + cart.delivery_fee;
    const meetsMinimum = cart.total_portions >= cart.minimum_portions;

    return (
        <GuestLayout>
            <Head title="Keranjang Pesanan" />
            
            <div className="bg-surface border-b border-border py-8">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary mb-1">Keranjang Pesanan</h1>
                            <p className="text-text-secondary">Review pesanan Anda sebelum checkout</p>
                        </div>
                        <button onClick={clearCart} className="text-sm font-semibold text-error hover:underline">
                            Kosongkan
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Item List */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-border bg-surface/30 flex justify-between items-center">
                                <Link href={`/marketplace/${cart.merchant_id}`} className="font-bold text-lg text-primary hover:underline">
                                    {cart.merchant_name}
                                </Link>
                                <span className="text-sm font-semibold text-text-secondary">
                                    Total {cart.total_portions} porsi
                                </span>
                            </div>
                            
                            <div className="divide-y divide-border">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="p-5 flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <h3 className="font-bold text-text-primary">{item.name}</h3>
                                                <span className="font-bold tabular-nums text-text-primary">
                                                    {formatRupiah(item.price_idr * item.quantity)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-text-secondary mb-3">{formatRupiah(item.price_idr)} / porsi</p>
                                            
                                            {!item.is_active && (
                                                <p className="text-xs text-error font-semibold mb-3">Menu ini sudah tidak aktif/dihapus oleh katering.</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="flex items-center border border-border rounded-lg bg-white overflow-hidden">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-9 h-9 flex items-center justify-center text-text-secondary hover:bg-surface transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="w-10 text-center font-semibold text-sm tabular-nums">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-9 h-9 flex items-center justify-center text-text-secondary hover:bg-surface transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="text-text-secondary hover:text-error p-2 rounded-md hover:bg-error-light transition-colors"
                                                title="Hapus"
                                            >
                                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!meetsMinimum && (
                            <div className="bg-accent-light border border-accent rounded-xl p-4 flex gap-3 text-accent-dark text-sm">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <p className="font-bold mb-1">Belum mencapai minimal pesanan</p>
                                    <p>Katering ini mensyaratkan minimal pesanan {cart.minimum_portions} porsi. Silakan tambah {cart.minimum_portions - cart.total_portions} porsi lagi.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="w-full lg:w-[380px] shrink-0 space-y-6">
                        {/* Pengiriman */}
                        <div className="bg-white border border-border rounded-xl shadow-sm p-5">
                            <h3 className="font-bold text-text-primary mb-4">Informasi Pengiriman</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-text-secondary mb-1">Tanggal Pengiriman</p>
                                    <p className="font-medium text-[15px]">{cart.delivery_date ? new Date(cart.delivery_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <p className="text-xs font-semibold text-text-secondary">Alamat Tujuan</p>
                                        <Link href="/customer/profile" className="text-xs font-semibold text-primary hover:underline">Ubah</Link>
                                    </div>
                                    {defaultAddress ? (
                                        <div className="text-sm">
                                            <p className="font-bold mb-0.5">{defaultAddress.label}</p>
                                            <p className="text-text-secondary line-clamp-2">{defaultAddress.address}, {defaultAddress.region?.city_name}</p>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-error bg-error-light p-2 rounded-md">
                                            Anda belum mengatur alamat utama. <Link href="/customer/profile" className="font-bold underline">Atur sekarang</Link>.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ringkasan Biaya */}
                        <div className="bg-white border border-border rounded-xl shadow-sm p-5">
                            <h3 className="font-bold text-text-primary mb-4">Ringkasan Pembayaran</h3>
                            
                            <div className="space-y-3 mb-4 pb-4 border-b border-border text-[15px]">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Subtotal ({cart.total_portions} porsi)</span>
                                    <span className="font-medium tabular-nums">{formatRupiah(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Ongkos Kirim</span>
                                    <span className="font-medium tabular-nums">{cart.delivery_fee > 0 ? formatRupiah(cart.delivery_fee) : 'Gratis'}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-lg text-text-primary">Total Pembayaran</span>
                                <span className="font-bold text-xl text-primary tabular-nums">{formatRupiah(total)}</span>
                            </div>

                            <button 
                                onClick={checkout}
                                disabled={!meetsMinimum || !defaultAddress}
                                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Buat Pesanan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}