import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import GuestLayout from '@/Layouts/GuestLayout';
import { FileText, Calendar, Package, ArrowRight } from 'lucide-react';

interface InvoiceOrder {
    id: number;
    order_number: string;
    invoice_number: string | null;
    issued_at: string | null;
    status: string | null;
    merchant_name: string;
    delivery_date: string;
    total_idr: number;
    order_status: string;
    items_count: number;
}

export default function Invoice({ orders }: { orders: InvoiceOrder[] }) {
    const { auth } = usePage<PageProps>().props;

    const statusLabel = (status: string | null) => {
        switch (status) {
            case 'issued': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Terbit</span>;
            case 'voided': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Dibatalkan</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">-</span>;
        }
    };

    return (
        <GuestLayout>
            <div className="max-w-5xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-extrabold text-text-primary mb-2">Invoice Saya</h1>
                <p className="text-text-secondary mb-8">Daftar invoice dari pesanan yang telah dikonfirmasi.</p>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-2xl border border-border">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-text-secondary font-medium">Belum ada invoice.</p>
                        <p className="text-sm text-text-secondary mt-1">Invoice akan muncul setelah pesanan Anda dikonfirmasi oleh katering.</p>
                        <Link href="/marketplace" className="inline-block mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors">
                            Cari Katering
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-text-primary">{order.invoice_number || order.order_number}</span>
                                            {statusLabel(order.status)}
                                        </div>
                                        <p className="text-sm text-text-secondary font-medium">{order.merchant_name}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {order.delivery_date}</span>
                                            <span className="flex items-center gap-1"><Package size={12} /> {order.items_count} item</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-extrabold text-primary">Rp {order.total_idr.toLocaleString('id-ID')}</div>
                                        <Link
                                            href={"/customer/orders/" + order.id + "/invoice"}
                                            className="inline-flex items-center gap-1 mt-2 text-sm font-bold text-primary hover:underline"
                                        >
                                            Lihat Detail <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}