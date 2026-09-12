import { Head, Link, router } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { ORDER_STATUS_LABELS, OrderData, PAYMENT_STATUS_LABELS, PageProps, formatDate, formatDateTime, formatRupiah } from '@/types';

interface Props extends PageProps {
    order: OrderData;
}

export default function OrderDetail({ order }: Props) {
    const post = (action: string, data: Record<string, string> = {}) => {
        router.post('/merchant/orders/' + order.id + '/' + action, data, { preserveScroll: true });
    };

    const askReason = (action: string, label: string) => {
        const reason = prompt(label);
        if (reason) post(action, { reason });
    };

    const submittedProof = order.payment_proofs?.find(proof => proof.status === 'submitted');

    return (
        <MerchantLayout title="Detail Pesanan">
            <Head title={'Pesanan ' + order.order_number} />
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link href="/merchant/orders" className="text-sm font-semibold text-primary">&larr; Daftar pesanan</Link>
                    <h2 className="mt-2 text-2xl font-extrabold">{order.order_number}</h2>
                    <p className="text-sm text-text-secondary">{formatDateTime(order.created_at)}</p>
                </div>
                <Link href={'/merchant/orders/' + order.id + '/invoice'} target="_blank" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold">
                    Buka invoice
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <section className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-border bg-white p-5">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div><p className="text-xs text-text-secondary">Status</p><p className="font-bold">{ORDER_STATUS_LABELS[order.order_status]}</p></div>
                            <div><p className="text-xs text-text-secondary">Pembayaran</p><p className="font-bold">{PAYMENT_STATUS_LABELS[order.payment_status]}</p></div>
                            <div><p className="text-xs text-text-secondary">Pengiriman</p><p className="font-bold">{formatDate(order.delivery_date)}</p></div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border bg-white">
                        <h3 className="border-b border-border bg-surface/50 p-5 font-bold">Menu ({order.total_portions} porsi)</h3>
                        <div className="divide-y divide-border">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between gap-4 p-5">
                                    <div><p className="font-semibold">{item.menu_name_snapshot}</p><p className="text-sm text-text-secondary">{item.quantity} × {formatRupiah(item.unit_price_idr)}</p></div>
                                    <p className="font-bold">{formatRupiah(item.line_total_idr)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-border bg-surface/50 p-5 text-right text-lg font-extrabold text-primary">Total {formatRupiah(order.total_idr)}</div>
                    </div>

                    <div className="rounded-xl border border-border bg-white p-5">
                        <h3 className="mb-4 font-bold">Riwayat Status</h3>
                        <div className="space-y-3">
                            {order.status_events.map(event => (
                                <div key={event.id} className="border-l-2 border-primary pl-4">
                                    <p className="font-semibold">{ORDER_STATUS_LABELS[event.to_status]}</p>
                                    <p className="text-xs text-text-secondary">{formatDateTime(event.created_at)}</p>
                                    {event.reason && <p className="mt-1 text-sm text-text-secondary">{event.reason}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="rounded-xl border border-border bg-white p-5">
                        <h3 className="mb-3 font-bold">Pelanggan & Tujuan</h3>
                        <p className="font-semibold">{order.customer_snapshot?.company_name}</p>
                        <p className="text-sm text-text-secondary">{order.customer_snapshot?.name} · {order.customer_snapshot?.phone}</p>
                        <p className="mt-3 text-sm">{order.address_snapshot?.receiver}</p>
                        <p className="text-sm text-text-secondary">{order.address_snapshot?.address}, {order.address_snapshot?.region}</p>
                        {order.notes && <p className="mt-3 rounded-lg bg-surface p-3 text-sm">Catatan: {order.notes}</p>}
                    </div>

                    {submittedProof && (
                        <div className="rounded-xl border border-border bg-white p-5">
                            <h3 className="mb-3 font-bold">Bukti Pembayaran</h3>
                            <a href={'/merchant/payment-proof/' + submittedProof.id} target="_blank" rel="noreferrer" className="block rounded-lg bg-primary-light px-4 py-2 text-center text-sm font-bold text-primary">
                                Lihat {submittedProof.original_name || 'bukti'}
                            </a>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <button onClick={() => post('payment/approve')} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white">Terima</button>
                                <button onClick={() => askReason('payment/reject', 'Alasan penolakan bukti:')} className="rounded-lg bg-error-light px-3 py-2 text-sm font-bold text-error">Tolak</button>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2 rounded-xl border border-border bg-white p-5">
                        {order.order_status === 'pending_confirmation' && <>
                            <button onClick={() => post('accept')} className="rounded-lg bg-primary py-2 font-bold text-white">Terima pesanan</button>
                            <button onClick={() => askReason('reject', 'Alasan penolakan:')} className="rounded-lg border border-error py-2 font-bold text-error">Tolak pesanan</button>
                        </>}
                        {order.order_status === 'accepted' && order.payment_status === 'paid' && <button onClick={() => post('prepare')} className="rounded-lg bg-primary py-2 font-bold text-white">Mulai produksi</button>}
                        {order.order_status === 'preparing' && <button onClick={() => post('deliver')} className="rounded-lg bg-primary py-2 font-bold text-white">Kirim pesanan</button>}
                        {order.order_status === 'accepted' && order.payment_status === 'unpaid' && <button onClick={() => askReason('cancel', 'Alasan pembatalan:')} className="rounded-lg border border-error py-2 font-bold text-error">Batalkan pesanan</button>}
                    </div>
                </aside>
            </div>
        </MerchantLayout>
    );
}
