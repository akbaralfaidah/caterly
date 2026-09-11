import { Head, Link, router } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
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

    const action = (orderId: number, path: string, method: 'post' | 'patch' | 'delete' = 'post', data = {}) => {
        if (confirm('Apakah Anda yakin?')) {
            router[method](`/merchant/orders/${orderId}/${path}`, data, { preserveScroll: true });
        }
    };

    return (
        <MerchantLayout title="Daftar Pesanan">
            <Head title="Daftar Pesanan" />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">Daftar Pesanan</h2>
                    <p className="text-sm text-text-secondary">Kelola pesanan dari pelanggan</p>
                </div>
            </div>

            {orders.data.length === 0 ? (
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden p-12 text-center">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="text-lg font-bold text-text-primary mb-2">Belum ada pesanan</p>
                    <p className="text-text-secondary">Pesanan yang masuk akan tampil di sini.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.data.map(order => (
                        <div key={order.id} className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row">
                            <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r border-border">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-text-primary">{order.customer_snapshot?.company_name || 'Pelanggan'}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getStatusColor(order.order_status)}`}>
                                                {ORDER_STATUS_LABELS[order.order_status]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary">PIC: {order.customer_snapshot?.name} ({order.customer_snapshot?.phone})</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-text-primary">{order.order_number}</p>
                                        <p className="text-xs text-text-secondary">{formatDateTime(order.created_at)}</p>
                                    </div>
                                </div>
                                
                                <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm bg-surface/50 p-3 rounded-lg border border-border">
                                    <div>
                                        <p className="font-semibold text-text-secondary mb-0.5 text-xs">Pengiriman</p>
                                        <p className="font-bold text-text-primary">{formatDate(order.delivery_date)}</p>
                                        <p className="text-text-secondary line-clamp-1" title={order.address_snapshot?.address}>{order.address_snapshot?.address}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-secondary mb-0.5 text-xs">Pembayaran</p>
                                        <p className="font-bold text-primary tabular-nums">{formatRupiah(order.total_idr)}</p>
                                        <p className="text-text-secondary flex items-center gap-1">
                                            Status: <span className={`font-semibold ${order.payment_status === 'paid' ? 'text-primary' : 'text-accent-dark'}`}>{PAYMENT_STATUS_LABELS[order.payment_status]}</span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-semibold text-text-primary mb-2 text-sm border-b border-border pb-1">Detail Menu ({order.total_portions} porsi)</p>
                                    <ul className="text-sm space-y-1.5 text-text-secondary">
                                        {order.items?.map((item, i) => (
                                            <li key={i} className="flex justify-between">
                                                <span>{item.quantity}x {item.menu_name_snapshot}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Actions Column */}
                            <div className="w-full lg:w-64 p-5 bg-surface/30 flex flex-col justify-center gap-3">
                                {order.order_status === 'pending_confirmation' && (
                                    <>
                                        <button onClick={() => action(order.id, 'accept')} className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                                            Terima Pesanan
                                        </button>
                                        <button onClick={() => {
                                            const reason = prompt('Alasan penolakan?');
                                            if (reason) action(order.id, 'reject', 'post', { reason });
                                        }} className="w-full py-2 bg-white text-error border border-error text-sm font-semibold rounded-lg hover:bg-error-light transition-colors">
                                            Tolak Pesanan
                                        </button>
                                    </>
                                )}

                                {order.order_status === 'accepted' && order.payment_status !== 'paid' && (
                                    <div className="text-center p-3 bg-accent-light text-accent-dark border border-accent rounded-lg text-sm font-medium">
                                        Menunggu pelanggan melakukan pembayaran.
                                    </div>
                                )}
                                
                                {order.order_status === 'accepted' && order.payment_status === 'paid' && (
                                    <button onClick={() => action(order.id, 'prepare')} className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                                        Mulai Produksi (Dipersiapkan)
                                    </button>
                                )}

                                {order.order_status === 'preparing' && (
                                    <button onClick={() => action(order.id, 'deliver')} className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                                        Kirim Pesanan (Dikirim)
                                    </button>
                                )}

                                {order.payment_status === 'pending_review' && (
                                    <div className="mt-2 pt-4 border-t border-border">
                                        <p className="text-sm font-semibold text-text-primary mb-2 text-center">Review Pembayaran</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => action(order.id, 'payment/approve')} className="flex-1 py-2 bg-primary-light text-primary text-xs font-semibold rounded hover:bg-primary hover:text-white transition-colors">
                                                Terima Bukti
                                            </button>
                                            <button onClick={() => {
                                                const reason = prompt('Alasan penolakan?');
                                                if (reason) action(order.id, 'payment/reject', 'post', { reason });
                                            }} className="flex-1 py-2 bg-error-light text-error text-xs font-semibold rounded hover:bg-error hover:text-white transition-colors">
                                                Tolak Bukti
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {orders.last_page > 1 && (
                        <div className="flex justify-center gap-1 mt-8">
                            {orders.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3.5 py-2 text-sm rounded-lg font-medium ${
                                        link.active ? 'bg-primary text-white' : link.url ? 'text-text-secondary hover:bg-surface' : 'text-border cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveState
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </MerchantLayout>
    );
}