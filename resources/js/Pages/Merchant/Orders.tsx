import { Head, Link, router } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { useInteractiveDialog } from '@/Components/InteractiveDialog';
import { PageProps, PaginatedData, OrderData, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatRupiah, formatDateTime, formatDate } from '@/types';

interface Props extends PageProps {
    orders: PaginatedData<OrderData>;
}

export default function Orders({ orders }: Props) {
    const { confirm: confirmDialog, prompt: promptDialog } = useInteractiveDialog();
    const hasVerifiedDeposit = (order: OrderData) => (order.payment_proofs ?? [])
        .filter(proof => proof.status === 'approved')
        .reduce((total, proof) => total + proof.amount_idr, 0) >= Math.ceil(order.total_idr / 2);
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

    const actionMessages: Record<string, { title: string; message: string; confirmLabel: string; tone?: 'primary' | 'success' }> = {
        accept: {
            title: 'Terima pesanan?',
            message: 'Pelanggan akan mendapat notifikasi untuk melanjutkan pembayaran.',
            confirmLabel: 'Terima pesanan',
            tone: 'success',
        },
        prepare: {
            title: 'Mulai produksi?',
            message: 'Status pesanan akan berubah menjadi sedang dipersiapkan.',
            confirmLabel: 'Mulai produksi',
        },
        deliver: {
            title: 'Kirim pesanan?',
            message: 'Pastikan pesanan sudah lengkap sebelum mengubah status menjadi dikirim.',
            confirmLabel: 'Mulai pengiriman',
        },
        'payment/approve': {
            title: 'Terima bukti pembayaran?',
            message: 'Nominal transfer akan diverifikasi sebagai DP/pembayaran dan pelanggan akan menerima notifikasi.',
            confirmLabel: 'Terima pembayaran',
            tone: 'success',
        },
    };

    const action = async (orderId: number, path: string, data: Record<string, string> = {}) => {
        const copy = actionMessages[path] ?? {
            title: 'Lanjutkan tindakan?',
            message: 'Pastikan data sudah benar sebelum melanjutkan.',
            confirmLabel: 'Lanjutkan',
        };
        const confirmed = await confirmDialog(copy);

        if (!confirmed) return;

        router.post(`/merchant/orders/${orderId}/${path}`, data, { preserveScroll: true });
    };

    const reasonAction = async (
        orderId: number,
        path: string,
        title: string,
        message: string,
        confirmLabel: string,
    ) => {
        const reason = await promptDialog({
            title,
            message,
            inputLabel: 'Alasan',
            placeholder: 'Tuliskan alasan secara jelas...',
            confirmLabel,
            tone: 'danger',
        });

        if (!reason) return;

        router.post(`/merchant/orders/${orderId}/${path}`, { reason }, { preserveScroll: true });
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
                        <div key={order.id} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-3 border-b border-border bg-surface/50 px-4 py-3 sm:px-5">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Status Pesanan</p>
                                <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${getStatusColor(order.order_status)}`}>
                                    {order.order_status === 'pending_confirmation' && (
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />
                                    )}
                                    {ORDER_STATUS_LABELS[order.order_status]}
                                </span>
                            </div>

                            <div className="flex flex-col lg:flex-row">
                                <div className="flex-1 border-b border-border p-5 lg:border-r lg:border-b-0">
                                    <div className="mb-4 grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                                        <div className="min-w-0">
                                            <p className="mb-1 break-words font-bold text-text-primary">{order.customer_snapshot?.company_name || 'Pelanggan'}</p>
                                            <p className="text-sm text-text-secondary">PIC: {order.customer_snapshot?.name} ({order.customer_snapshot?.phone})</p>
                                        </div>
                                        <div className="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
                                            <a
                                                href={`/merchant/orders/${order.id}/invoice`}
                                                target="_blank"
                                                className="text-xs font-semibold text-primary hover:underline"
                                            >
                                                Cetak Invoice
                                            </a>
                                            <p className="text-sm font-bold text-text-primary">{order.order_number}</p>
                                            <p className="text-xs text-text-secondary">{formatDateTime(order.created_at)}</p>
                                            <Link href={`/merchant/orders/${order.id}`} className="text-xs font-semibold text-primary hover:underline">
                                                Lihat detail
                                            </Link>
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
                                        <button
                                            onClick={() => reasonAction(
                                                order.id,
                                                'reject',
                                                'Tolak pesanan?',
                                                'Jelaskan alasan penolakan agar pelanggan dapat memahami keputusan Anda.',
                                                'Tolak pesanan',
                                            )}
                                            className="w-full py-2 bg-white text-error border border-error text-sm font-semibold rounded-lg hover:bg-error-light transition-colors"
                                        >
                                            Tolak Pesanan
                                        </button>
                                    </>
                                )}

                                {order.order_status === 'accepted' && !hasVerifiedDeposit(order) && (
                                    <div className="text-center p-3 bg-accent-light text-accent-dark border border-accent rounded-lg text-sm font-medium">
                                        Menunggu DP minimum 50% dari pelanggan diverifikasi.
                                    </div>
                                )}

                                {order.order_status === 'accepted' && order.payment_status === 'unpaid' && (
                                    <button
                                        onClick={() => reasonAction(
                                            order.id,
                                            'cancel',
                                            'Batalkan pesanan?',
                                            'Pembatalan akan melepas kapasitas dan memberi tahu pelanggan.',
                                            'Batalkan pesanan',
                                        )}
                                        className="w-full py-2 bg-white text-error border border-error text-sm font-semibold rounded-lg hover:bg-error-light transition-colors"
                                    >
                                        Batalkan Pesanan
                                    </button>
                                )}
                                
                                {order.order_status === 'accepted' && hasVerifiedDeposit(order) && (
                                    <button onClick={() => action(order.id, 'prepare')} className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                                        Mulai Produksi (Dipersiapkan)
                                    </button>
                                )}

                                {order.order_status === 'preparing' && order.payment_status === 'paid' && (
                                    <button onClick={() => action(order.id, 'deliver')} className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                                        Kirim Pesanan (Dikirim)
                                    </button>
                                )}

                                {order.order_status === 'preparing' && order.payment_status !== 'paid' && (
                                    <div className="rounded-lg border border-accent/40 bg-accent-light p-3 text-center text-sm font-medium text-accent-dark">
                                        Menunggu pelunasan 100% sebelum pengiriman.
                                    </div>
                                )}

                                {order.payment_status === 'pending_review' && (
                                    <div className="mt-2 pt-4 border-t border-border">
                                        <p className="text-sm font-semibold text-text-primary mb-2 text-center">Review Pembayaran</p>
                                        {order.payment_proofs?.filter(proof => proof.status === 'submitted').slice(-1).map(proof => (
                                            <div key={proof.id} className="mb-2 rounded-lg bg-white p-2 text-center">
                                                <p className="text-sm font-extrabold text-primary tabular-nums">{formatRupiah(proof.amount_idr)}</p>
                                                <a
                                                    href={`/merchant/payment-proof/${proof.id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-1 block text-xs font-bold text-primary underline"
                                                >
                                                    Lihat {proof.original_name || 'bukti pembayaran'}
                                                </a>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <button onClick={() => action(order.id, 'payment/approve')} className="flex-1 py-2 bg-primary-light text-primary text-xs font-semibold rounded hover:bg-primary hover:text-white transition-colors">
                                                Terima Bukti
                                            </button>
                                            <button
                                                onClick={() => reasonAction(
                                                    order.id,
                                                    'payment/reject',
                                                    'Tolak bukti pembayaran?',
                                                    'Jelaskan bagian bukti pembayaran yang perlu diperbaiki pelanggan.',
                                                    'Tolak bukti',
                                                )}
                                                className="flex-1 py-2 bg-error-light text-error text-xs font-semibold rounded hover:bg-error hover:text-white transition-colors"
                                            >
                                                Tolak Bukti
                                            </button>
                                        </div>
                                    </div>
                                )}
                                </div>
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
