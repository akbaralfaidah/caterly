import { Head, Link } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { PageProps, OrderData, ORDER_STATUS_LABELS, formatDate } from '@/types';

interface Props extends PageProps {
    stats: {
        pending_confirmation: number;
        pending_payment: number;
        today_production: number;
    };
    active_orders: OrderData[];
}

export default function Dashboard({ stats, active_orders }: Props) {
    return (
        <MerchantLayout title="Ringkasan">
            <Head title="Ringkasan Merchant" />
            <div className="space-y-8">
                {/* Stats */}
                <div className="grid sm:grid-cols-3 gap-5">
                    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-text-secondary font-semibold mb-1">Menunggu Konfirmasi</p>
                                <p className="text-3xl font-bold text-text-primary tabular-nums">{stats.pending_confirmation}</p>
                            </div>
                            <div className="text-3xl">🛎️</div>
                        </div>
                        {stats.pending_confirmation > 0 && (
                            <Link href="/merchant/orders" className="text-xs font-semibold text-primary hover:underline mt-3 inline-block">
                                Lihat Pesanan &rarr;
                            </Link>
                        )}
                    </div>
                    
                    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-text-secondary font-semibold mb-1">Perlu Verifikasi Bukti</p>
                                <p className="text-3xl font-bold text-text-primary tabular-nums">{stats.pending_payment}</p>
                            </div>
                            <div className="text-3xl">🧾</div>
                        </div>
                        {stats.pending_payment > 0 && (
                            <Link href="/merchant/orders" className="text-xs font-semibold text-primary hover:underline mt-3 inline-block">
                                Verifikasi Sekarang &rarr;
                            </Link>
                        )}
                    </div>
                    
                    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-text-secondary font-semibold mb-1">Produksi Hari Ini</p>
                                <p className="text-3xl font-bold text-text-primary tabular-nums">
                                    {stats.today_production} <span className="text-lg font-medium text-text-secondary">porsi</span>
                                </p>
                            </div>
                            <div className="text-3xl">🧑‍🍳</div>
                        </div>
                    </div>
                </div>

                {/* Active Orders */}
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-border bg-surface/30 flex justify-between items-center">
                        <h2 className="font-bold text-text-primary">Pesanan Aktif Terbaru</h2>
                        <Link href="/merchant/orders" className="text-sm font-semibold text-primary hover:underline">
                            Lihat Semua
                        </Link>
                    </div>
                    
                    {active_orders.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="text-lg font-semibold text-text-primary mb-2">Belum ada pesanan aktif</p>
                            <p className="text-text-secondary text-sm">Pesanan baru dari kantor akan muncul di sini.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {active_orders.map(order => (
                                <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-surface/50 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-text-primary">{order.customer_snapshot?.company_name || 'Pelanggan'}</span>
                                            <span className="text-xs font-bold text-text-secondary">&bull; {order.order_number}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary mb-1">
                                            Kirim: <span className="font-semibold text-text-primary">{formatDate(order.delivery_date)}</span> &bull; {order.total_portions} porsi
                                        </p>
                                        <p className="text-xs text-text-secondary line-clamp-1">{order.address_snapshot?.address}</p>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                            order.order_status === 'pending_confirmation' ? 'bg-accent-light text-accent-dark border-accent-light' : 
                                            order.order_status === 'delivering' ? 'bg-primary-light text-primary border-primary-light' : 
                                            'bg-info-light text-info border-info-light'
                                        }`}>
                                            {ORDER_STATUS_LABELS[order.order_status]}
                                        </span>
                                        <Link href="/merchant/orders" className="ml-auto sm:ml-0 text-sm font-semibold text-primary hover:underline">
                                            Kelola
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MerchantLayout>
    );
}