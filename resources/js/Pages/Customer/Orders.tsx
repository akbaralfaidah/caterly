import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { PageProps, PaginatedData, OrderData, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatRupiah, formatDateTime, formatDate } from '@/types';

interface Props extends PageProps {
    orders: PaginatedData<OrderData>;
}

export default function Orders({ orders }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending_confirmation': return 'bg-accent-light text-accent-dark border-accent-light';
            case 'accepted': return 'bg-info-light text-info border-info-light';
            case 'preparing': return 'bg-info-light text-info border-info-light';
            case 'delivering': return 'bg-primary-light text-primary border-primary-light';
            case 'completed': return 'bg-primary text-white border-primary';
            case 'rejected':
            case 'cancelled':
            case 'expired': return 'bg-error-light text-error border-error-light';
            default: return 'bg-surface text-text-secondary border-border';
        }
    };

    return (
        <GuestLayout>
            <Head title="Riwayat Pesanan" />
            
            <div className="bg-surface border-b border-border py-8">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-text-primary mb-1">Riwayat Pesanan</h1>
                    <p className="text-text-secondary">Pantau status pesanan katering Anda</p>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {orders.data.length === 0 ? (
                    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden p-12 text-center">
                        <div className="text-5xl mb-4">📦</div>
                        <p className="text-lg font-bold text-text-primary mb-2">Belum ada pesanan</p>
                        <p className="text-text-secondary mb-6">Anda belum pernah membuat pesanan. Temukan katering terbaik untuk Anda sekarang.</p>
                        <Link href="/marketplace" className="inline-block bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors">
                            Cari Katering
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {orders.data.map(order => (
                            <div key={order.id} className="bg-white border border-border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 sm:p-5 border-b border-border bg-surface/30 flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-bold text-text-primary">{order.merchant_snapshot?.name || 'Katering'}</span>
                                            <span className="text-sm text-text-secondary">&bull;</span>
                                            <span className="text-sm font-semibold text-text-secondary">{order.order_number}</span>
                                        </div>
                                        <div className="text-sm text-text-secondary">
                                            Dipesan pada {formatDateTime(order.created_at)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getStatusColor(order.order_status)}`}>
                                            {ORDER_STATUS_LABELS[order.order_status]}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-text-secondary mb-1">Pengiriman:</p>
                                        <p className="font-bold text-text-primary mb-2">
                                            {formatDate(order.delivery_date)}
                                        </p>
                                        <p className="text-sm text-text-primary">
                                            {order.total_portions} porsi &bull; {order.items?.length || 0} macam menu
                                        </p>
                                    </div>
                                    
                                    <div className="flex-1 sm:text-right">
                                        <p className="text-sm font-semibold text-text-secondary mb-1">Total Belanja:</p>
                                        <p className="text-lg font-bold text-primary tabular-nums mb-2">
                                            {formatRupiah(order.total_idr)}
                                        </p>
                                        <p className="text-xs font-semibold text-text-secondary">
                                            Status Bayar: <span className={order.payment_status === 'paid' ? 'text-primary' : 'text-accent-dark'}>{PAYMENT_STATUS_LABELS[order.payment_status]}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2">
                                        <Link 
                                            href={`/customer/orders/${order.id}`}
                                            className="w-full sm:w-auto text-center px-5 py-2 bg-primary-light text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                                        >
                                            Lihat Detail
                                        </Link>
                                        {order.order_status === 'completed' && (
                                            <button className="w-full sm:w-auto text-center px-5 py-2 border border-border text-text-primary font-semibold rounded-lg hover:bg-surface transition-colors">
                                                Pesan Lagi
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex justify-center gap-1 mt-8">
                                {orders.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-3.5 py-2 text-sm rounded-lg font-medium ${
                                            link.active
                                                ? 'bg-primary text-white'
                                                : link.url
                                                    ? 'text-text-secondary hover:bg-surface'
                                                    : 'text-border cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveState
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}