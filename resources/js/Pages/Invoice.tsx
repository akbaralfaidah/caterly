import { Head } from '@inertiajs/react';
import { PageProps, OrderData, formatRupiah, formatDateTime, PAYMENT_STATUS_LABELS } from '@/types';
import { useEffect } from 'react';

interface Props extends PageProps {
    order: OrderData;
    is_merchant: boolean;
}

export default function Invoice({ order, is_merchant }: Props) {
    useEffect(() => {
        // Optional: auto-print when opened
        // window.print();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white font-sans text-gray-900">
            <Head title={`Invoice - ${order.order_number}`} />
            
            <div className="max-w-3xl mx-auto bg-white p-10 shadow-lg rounded-xl print:shadow-none print:p-0 print:rounded-none">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">INVOICE</h1>
                        <p className="text-gray-500 font-medium">#{order.invoice?.invoice_number || order.order_number}</p>
                        {order.invoice?.status === 'void' && <p className="mt-2 inline-block rounded bg-red-100 px-2 py-1 text-xs font-black uppercase text-red-600">Void</p>}
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-gray-800 mb-1 tracking-tight">Caterly</div>
                        <p className="text-sm text-gray-500">Corporate Catering Service</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Ditagihkan Kepada</p>
                        <h3 className="font-bold text-lg mb-1">{order.customer_snapshot?.company_name || 'Pelanggan'}</h3>
                        <p className="text-gray-600 mb-1">PIC: {order.customer_snapshot?.name}</p>
                        <p className="text-gray-600 mb-1">{order.customer_snapshot?.phone}</p>
                        <p className="text-gray-600">{order.customer_snapshot?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Katering Penyelenggara</p>
                        <h3 className="font-bold text-lg mb-1">{order.merchant_snapshot?.name || 'Katering'}</h3>
                        <p className="text-gray-600 mb-1">{order.merchant_snapshot?.phone}</p>
                        <p className="text-gray-600 whitespace-pre-wrap">{order.merchant_snapshot?.address}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8 bg-gray-50 p-6 rounded-lg">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Terbit</p>
                        <p className="font-semibold">{formatDateTime(order.created_at)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Tgl Pengiriman</p>
                        <p className="font-semibold">{new Date(order.delivery_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Status Pembayaran</p>
                        <p className={`font-bold uppercase tracking-wider ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                            {PAYMENT_STATUS_LABELS[order.payment_status]}
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-3 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Deskripsi Item</th>
                                <th className="py-3 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right w-24">Qty</th>
                                <th className="py-3 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right w-40">Harga Satuan</th>
                                <th className="py-3 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right w-40">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.items?.map(item => (
                                <tr key={item.id}>
                                    <td className="py-4 px-4">
                                        <p className="font-semibold text-gray-800">{item.menu_name_snapshot}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.category_snapshot}</p>
                                    </td>
                                    <td className="py-4 px-4 text-right text-gray-700">{item.quantity}</td>
                                    <td className="py-4 px-4 text-right tabular-nums text-gray-700">{formatRupiah(item.unit_price_idr)}</td>
                                    <td className="py-4 px-4 text-right tabular-nums font-semibold text-gray-800">{formatRupiah(item.line_total_idr)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="flex flex-col items-end mb-12">
                    <div className="w-full sm:w-1/2 space-y-3">
                        <div className="flex justify-between text-gray-600 px-4">
                            <span>Subtotal Menu</span>
                            <span className="tabular-nums">{formatRupiah(order.subtotal_idr)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 px-4 pb-4 border-b border-gray-200">
                            <span>Ongkos Kirim</span>
                            <span className="tabular-nums">{formatRupiah(order.delivery_fee_idr)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 pt-2">
                            <span className="text-lg font-bold text-gray-800">Total Tagihan</span>
                            <span className="text-2xl font-black text-primary tabular-nums">{formatRupiah(order.total_idr)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="border-t-2 border-gray-200 pt-8 mt-8">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Informasi Pengiriman</p>
                    <div className="text-sm text-gray-600">
                        <p className="font-semibold text-gray-800 mb-1">{order.address_snapshot?.receiver} ({order.address_snapshot?.phone})</p>
                        <p>{order.address_snapshot?.address}, {order.address_snapshot?.region}</p>
                        {order.address_snapshot?.notes && <p className="italic mt-1">Catatan: {order.address_snapshot?.notes}</p>}
                    </div>
                </div>
                
                <div className="mt-12 text-center text-sm text-gray-400 print:hidden">
                    <button 
                        onClick={() => window.print()}
                        className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Cetak Invoice / Simpan PDF
                    </button>
                    <p className="mt-4">
                        <a href={is_merchant ? '/merchant/orders' : '/customer/orders'} className="hover:text-primary transition-colors">
                            &larr; Kembali ke daftar pesanan
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
