import { Head, Link, router, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { PageProps, OrderData, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, formatRupiah, formatDateTime, formatDate } from '@/types';
import { FormEvent, useRef, useState } from 'react';

interface Props extends PageProps {
    order: OrderData;
}

export default function OrderDetail({ order }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        proof: null as File | null,
    });

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

    const cancelOrder = () => {
        if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
            router.post(`/customer/orders/${order.id}/cancel`, {}, { preserveScroll: true });
        }
    };

    const confirmReceived = () => {
        if (confirm('Konfirmasi bahwa pesanan sudah Anda terima dengan baik?')) {
            router.post(`/customer/orders/${order.id}/confirm-received`, {}, { preserveScroll: true });
        }
    };

    const uploadPayment = (e: FormEvent) => {
        e.preventDefault();
        setUploading(true);
        post(`/customer/orders/${order.id}/payment`, {
            preserveScroll: true,
            onFinish: () => setUploading(false),
        });
    };

    return (
        <GuestLayout>
            <Head title={`Detail Pesanan ${order.order_number}`} />
            
            <div className="bg-surface border-b border-border py-8">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                            <Link href="/customer/orders" className="text-text-secondary hover:text-text-primary mr-2">
                                &larr; Kembali
                            </Link>
                            <h1 className="text-2xl font-bold text-text-primary">Detail Pesanan</h1>
                        </div>
                        <div className="flex gap-3 items-center">
                            {order.order_status === 'pending_confirmation' && (
                                <button onClick={cancelOrder} className="px-4 py-2 text-sm font-semibold text-error border border-error rounded-lg hover:bg-error-light transition-colors">
                                    Batalkan Pesanan
                                </button>
                            )}
                            {order.order_status === 'delivering' && (
                                <button onClick={confirmReceived} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
                                    Pesanan Diterima
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary mt-4">
                        <p>No. Pesanan: <span className="font-semibold text-text-primary">{order.order_number}</span></p>
                        <p>Dipesan: <span className="font-semibold text-text-primary">{formatDateTime(order.created_at)}</span></p>
                        <div className="flex items-center gap-2">
                            <span>Status:</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getStatusColor(order.order_status)}`}>
                                {ORDER_STATUS_LABELS[order.order_status]}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Timeline */}
                        <div className="bg-white border border-border rounded-xl shadow-sm p-5 sm:p-6">
                            <h3 className="font-bold text-text-primary mb-5">Riwayat Status</h3>
                            <div className="space-y-4">
                                {order.status_events?.map((evt, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-primary rounded-full mt-1.5" />
                                            {idx < order.status_events.length - 1 && <div className="w-0.5 h-full bg-border mt-1" />}
                                        </div>
                                        <div className="pb-4">
                                            <p className="font-semibold text-text-primary text-sm">{ORDER_STATUS_LABELS[evt.to_status]}</p>
                                            <p className="text-xs text-text-secondary mb-1">{formatDateTime(evt.created_at)}</p>
                                            {evt.reason && <p className="text-sm text-text-secondary">{evt.reason}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-border bg-surface/30">
                                <h3 className="font-bold text-text-primary">Daftar Menu</h3>
                            </div>
                            <div className="divide-y divide-border p-5">
                                {order.items?.map(item => (
                                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-text-primary">{item.menu_name_snapshot}</p>
                                            <p className="text-sm text-text-secondary">{item.quantity} porsi &times; {formatRupiah(item.unit_price_idr)}</p>
                                        </div>
                                        <p className="font-bold tabular-nums text-text-primary">{formatRupiah(item.line_total_idr)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-5 bg-surface/30 space-y-2 border-t border-border">
                                <div className="flex justify-between text-sm text-text-secondary">
                                    <span>Subtotal menu</span>
                                    <span className="tabular-nums">{formatRupiah(order.subtotal_idr)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-text-secondary">
                                    <span>Ongkos kirim</span>
                                    <span className="tabular-nums">{formatRupiah(order.delivery_fee_idr)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-border mt-3">
                                    <span className="font-bold text-text-primary">Total Pembayaran</span>
                                    <span className="font-bold text-lg text-primary tabular-nums">{formatRupiah(order.total_idr)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Payment Section */}
                        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-border bg-surface/30 flex justify-between items-center">
                                <h3 className="font-bold text-text-primary">Pembayaran</h3>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${order.payment_status === 'paid' ? 'bg-primary-light text-primary' : 'bg-accent-light text-accent-dark'}`}>
                                    {PAYMENT_STATUS_LABELS[order.payment_status]}
                                </span>
                            </div>
                            <div className="p-5">
                                {order.payment_status === 'unpaid' && (order.order_status === 'pending_confirmation' || order.order_status === 'accepted') ? (
                                    <form onSubmit={uploadPayment} className="space-y-4">
                                        <p className="text-sm text-text-secondary">Silakan upload bukti transfer pembayaran pesanan ini.</p>
                                        
                                        <div>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                onChange={e => setData('proof', e.target.files?.[0] || null)}
                                                className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary/20"
                                                accept="image/*"
                                                required
                                            />
                                            {errors.proof && <p className="text-error text-xs mt-1">{errors.proof}</p>}
                                        </div>
                                        
                                        <button 
                                            type="submit"
                                            disabled={processing || !data.proof}
                                            className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                                        >
                                            {processing ? 'Mengupload...' : 'Upload Bukti'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-3">
                                        {order.payment_proofs?.map(proof => (
                                            <div key={proof.id} className="text-sm p-3 border border-border rounded-lg bg-surface">
                                                <p className="font-semibold mb-1">Upload: {formatDateTime(proof.created_at)}</p>
                                                <p className="text-text-secondary flex justify-between">
                                                    Status: <span className="font-medium text-text-primary">{proof.status === 'submitted' ? 'Menunggu Review' : proof.status === 'approved' ? 'Diterima' : 'Ditolak'}</span>
                                                </p>
                                                {proof.rejection_reason && (
                                                    <p className="text-error mt-1 text-xs">Alasan: {proof.rejection_reason}</p>
                                                )}
                                            </div>
                                        ))}
                                        {(!order.payment_proofs || order.payment_proofs.length === 0) && (
                                            <p className="text-sm text-text-secondary text-center">Belum ada bukti yang diunggah.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-border bg-surface/30">
                                <h3 className="font-bold text-text-primary">Informasi Pengiriman</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-text-secondary mb-0.5">Katering</p>
                                    <p className="text-sm font-semibold text-text-primary">{order.merchant_snapshot?.name}</p>
                                    <p className="text-sm text-text-secondary">{order.merchant_snapshot?.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-text-secondary mb-0.5">Tanggal</p>
                                    <p className="text-sm font-semibold text-text-primary">{formatDate(order.delivery_date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-text-secondary mb-0.5">Tujuan Pengiriman</p>
                                    <p className="text-sm font-semibold text-text-primary">{order.address_snapshot?.receiver} ({order.address_snapshot?.phone})</p>
                                    <p className="text-sm text-text-secondary">{order.address_snapshot?.address}</p>
                                    <p className="text-sm text-text-secondary">{order.address_snapshot?.region}</p>
                                    {order.address_snapshot?.notes && (
                                        <p className="text-sm text-text-secondary mt-1 italic">Catatan: {order.address_snapshot.notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}