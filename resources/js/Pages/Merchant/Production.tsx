import { Head, Link, router } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { OrderData, PageProps, formatRupiah } from '@/types';

interface Props extends PageProps {
    date: string;
    orders: OrderData[];
    menu_totals: { menu_name_snapshot: string; category_snapshot: string | null; total_quantity: number }[];
    total_portions: number;
}

export default function Production({ date, orders, menu_totals, total_portions }: Props) {
    return (
        <MerchantLayout title="Produksi">
            <Head title="Rekap Produksi" />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Rekap Produksi Harian</h2>
                    <p className="text-sm text-text-secondary">Hanya pesanan lunas dan aktif yang dihitung.</p>
                </div>
                <label className="text-sm font-semibold">
                    Tanggal
                    <input type="date" value={date} onChange={event => router.get('/merchant/production', { date: event.target.value }, { preserveState: true, replace: true })} className="ml-3 h-10 rounded-lg border border-border px-3" />
                </label>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-primary p-5 text-white">
                    <p className="text-sm text-white/75">Total Produksi</p>
                    <p className="mt-1 text-3xl font-extrabold">{total_portions} porsi</p>
                </div>
                <div className="rounded-xl border border-border bg-white p-5">
                    <p className="text-sm text-text-secondary">Pesanan Aktif</p>
                    <p className="mt-1 text-3xl font-extrabold">{orders.length}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="overflow-hidden rounded-xl border border-border bg-white">
                    <h3 className="border-b border-border bg-surface p-4 font-bold">Kebutuhan per Menu</h3>
                    {menu_totals.length === 0 ? <p className="p-8 text-center text-text-secondary">Tidak ada produksi.</p> : (
                        <div className="divide-y divide-border">
                            {menu_totals.map((menu, index) => (
                                <div key={index} className="flex justify-between gap-4 p-4">
                                    <div><p className="font-semibold">{menu.menu_name_snapshot}</p><p className="text-xs text-text-secondary">{menu.category_snapshot}</p></div>
                                    <p className="text-lg font-extrabold text-primary">{menu.total_quantity} porsi</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <section className="overflow-hidden rounded-xl border border-border bg-white">
                    <h3 className="border-b border-border bg-surface p-4 font-bold">Pesanan</h3>
                    {orders.length === 0 ? <p className="p-8 text-center text-text-secondary">Tidak ada pesanan.</p> : (
                        <div className="divide-y divide-border">
                            {orders.map(order => (
                                <Link key={order.id} href={'/merchant/orders/' + order.id} className="flex justify-between gap-4 p-4 hover:bg-surface">
                                    <div><p className="font-semibold">{order.order_number}</p><p className="text-xs text-text-secondary">{order.customer_snapshot?.company_name} · {order.total_portions} porsi</p></div>
                                    <p className="font-bold">{formatRupiah(order.total_idr)}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </MerchantLayout>
    );
}
