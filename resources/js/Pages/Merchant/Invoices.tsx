import { Head, Link } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { OrderData, PageProps, PaginatedData, formatDate, formatRupiah } from '@/types';

interface Props extends PageProps {
    orders: PaginatedData<OrderData>;
}

export default function Invoices({ orders }: Props) {
    return (
        <MerchantLayout title="Invoice">
            <Head title="Invoice Merchant" />
            <div className="mb-6">
                <h2 className="text-xl font-bold">Daftar Invoice</h2>
                <p className="text-sm text-text-secondary">Dokumen tagihan diterbitkan otomatis saat checkout.</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                {orders.data.length === 0 ? (
                    <p className="p-12 text-center text-text-secondary">Belum ada invoice.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-surface">
                                <tr>
                                    <th className="p-4">Invoice</th>
                                    <th className="p-4">Pelanggan</th>
                                    <th className="p-4">Pengiriman</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Total</th>
                                    <th className="p-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.data.map(order => (
                                    <tr key={order.id}>
                                        <td className="p-4 font-bold">{order.invoice?.invoice_number}</td>
                                        <td className="p-4">{order.customer_snapshot?.company_name || order.customer_snapshot?.name}</td>
                                        <td className="p-4">{formatDate(order.delivery_date)}</td>
                                        <td className="p-4">
                                            <span className={order.invoice?.status === 'void' ? 'rounded-full bg-error-light px-2 py-1 font-bold text-error' : 'rounded-full bg-primary-light px-2 py-1 font-bold text-primary'}>
                                                {order.invoice?.status === 'void' ? 'Void' : 'Terbit'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold">{formatRupiah(order.total_idr)}</td>
                                        <td className="p-4 text-right"><Link href={'/merchant/orders/' + order.id + '/invoice'} target="_blank" className="font-bold text-primary">Buka</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {orders.last_page > 1 && (
                <nav className="mt-6 flex justify-center gap-1">
                    {orders.links.map((link, index) => (
                        <Link key={index} href={link.url || '#'} className={'rounded-lg px-3 py-2 text-sm ' + (link.active ? 'bg-primary text-white' : link.url ? 'text-text-secondary' : 'pointer-events-none text-border')} dangerouslySetInnerHTML={{ __html: link.label }} />
                    ))}
                </nav>
            )}
        </MerchantLayout>
    );
}
