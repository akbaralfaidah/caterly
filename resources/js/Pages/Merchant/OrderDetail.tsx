import { Head, Link, router } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { useInteractiveDialog } from '@/Components/InteractiveDialog';
import { ORDER_STATUS_LABELS, OrderData, PAYMENT_STATUS_LABELS, PageProps, formatDate, formatDateTime, formatRupiah } from '@/types';

interface Props extends PageProps {
    order: OrderData;
}

export default function OrderDetail({ order }: Props) {
    const { confirm: confirmDialog, prompt: promptDialog } = useInteractiveDialog();

    const post = (action: string, data: Record<string, string> = {}) => {
        router.post('/merchant/orders/' + order.id + '/' + action, data, { preserveScroll: true });
    };

    const confirmPost = async (
        action: string,
        title: string,
        message: string,
        confirmLabel: string,
        tone: 'primary' | 'success' = 'primary',
    ) => {
        const confirmed = await confirmDialog({
            title,
            message,
            confirmLabel,
            tone,
        });

        if (!confirmed) return;

        post(action);
    };

    const askReason = async (action: string, title: string, message: string, confirmLabel: string) => {
        const reason = await promptDialog({
            title,
            message,
            inputLabel: 'Alasan',
            placeholder: 'Tuliskan alasan secara jelas...',
            confirmLabel,
            tone: 'danger',
        });

        if (!reason) return;

        post(action, { reason });
    };

    const submittedProof = order.payment_proofs?.find(proof => proof.status === 'submitted');
    const approvedAmount = order.payment_proofs
        ?.filter(proof => proof.status === 'approved')
        .reduce((total, proof) => total + proof.amount_idr, 0) ?? 0;
    const remainingAmount = Math.max(0, order.total_idr - approvedAmount);
    const hasVerifiedDeposit = approvedAmount >= Math.ceil(order.total_idr / 2);

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

                    <div className="rounded-xl border border-border bg-white p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-bold">Progres Pembayaran</h3>
                            <span className="text-sm font-extrabold text-primary">{Math.round((approvedAmount / order.total_idr) * 100)}%</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (approvedAmount / order.total_idr) * 100)}%` }} />
                        </div>
                        <div className="mt-3 flex justify-between gap-3 text-xs text-text-secondary">
                            <span>Terverifikasi {formatRupiah(approvedAmount)}</span>
                            <span>Sisa {formatRupiah(remainingAmount)}</span>
                        </div>
                    </div>

                    {submittedProof && (
                        <div className="rounded-xl border border-border bg-white p-5">
                            <h3 className="mb-3 font-bold">Bukti Pembayaran</h3>
                            <div className="mb-3 rounded-lg bg-primary-light p-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-primary">Nominal transfer</p>
                                <p className="mt-1 text-xl font-extrabold tabular-nums">{formatRupiah(submittedProof.amount_idr)}</p>
                                <p className="text-xs text-text-secondary">{approvedAmount > 0 ? 'Periksa nominal dan keaslian bukti sebelum menyetujui.' : 'Minimum DP yang diwajibkan adalah 50% dari total pesanan.'}</p>
                            </div>
                            <a href={'/merchant/payment-proof/' + submittedProof.id} target="_blank" rel="noreferrer" className="block rounded-lg bg-primary-light px-4 py-2 text-center text-sm font-bold text-primary">
                                Lihat {submittedProof.original_name || 'bukti'}
                            </a>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <button onClick={() => confirmPost('payment/approve', 'Terima bukti pembayaran?', `${formatRupiah(submittedProof.amount_idr)} akan diverifikasi sebagai DP/pembayaran dan pelanggan akan diberi tahu.`, 'Terima pembayaran', 'success')} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white">Terima</button>
                                <button onClick={() => askReason('payment/reject', 'Tolak bukti pembayaran?', 'Jelaskan bagian bukti pembayaran yang perlu diperbaiki pelanggan.', 'Tolak bukti')} className="rounded-lg bg-error-light px-3 py-2 text-sm font-bold text-error">Tolak</button>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2 rounded-xl border border-border bg-white p-5">
                        {order.order_status === 'pending_confirmation' && <>
                            <button onClick={() => confirmPost('accept', 'Terima pesanan?', 'Pelanggan akan mendapat notifikasi untuk melanjutkan pembayaran.', 'Terima pesanan', 'success')} className="rounded-lg bg-primary py-2 font-bold text-white">Terima pesanan</button>
                            <button onClick={() => askReason('reject', 'Tolak pesanan?', 'Jelaskan alasan penolakan agar pelanggan dapat memahami keputusan Anda.', 'Tolak pesanan')} className="rounded-lg border border-error py-2 font-bold text-error">Tolak pesanan</button>
                        </>}
                        {order.order_status === 'accepted' && hasVerifiedDeposit && <button onClick={() => confirmPost('prepare', 'Mulai produksi?', 'DP minimum 50% sudah terverifikasi. Status pesanan akan berubah menjadi sedang dipersiapkan.', 'Mulai produksi')} className="rounded-lg bg-primary py-2 font-bold text-white">Mulai produksi</button>}
                        {order.order_status === 'preparing' && order.payment_status === 'paid' && <button onClick={() => confirmPost('deliver', 'Kirim pesanan?', 'Pembayaran sudah lunas. Pastikan seluruh pesanan lengkap sebelum memulai pengiriman.', 'Mulai pengiriman')} className="rounded-lg bg-primary py-2 font-bold text-white">Kirim pesanan</button>}
                        {order.order_status === 'preparing' && order.payment_status !== 'paid' && (
                            <div className="rounded-lg border border-accent/40 bg-accent-light p-3 text-center text-sm font-semibold text-accent-dark">
                                Menunggu pelunasan 100% diverifikasi sebelum pesanan dapat dikirim.
                            </div>
                        )}
                        {order.order_status === 'accepted' && order.payment_status === 'unpaid' && <button onClick={() => askReason('cancel', 'Batalkan pesanan?', 'Pembatalan akan melepas kapasitas dan memberi tahu pelanggan.', 'Batalkan pesanan')} className="rounded-lg border border-error py-2 font-bold text-error">Batalkan pesanan</button>}
                    </div>
                </aside>
            </div>
        </MerchantLayout>
    );
}
