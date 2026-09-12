import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { PageProps, PaginatedData, formatDateTime } from '@/types';

interface AppNotification {
    id: number;
    type: string;
    title: string;
    message: string;
    resource_type: string | null;
    resource_id: number | null;
    read_at: string | null;
    created_at: string;
}

interface Props extends PageProps {
    notifications: PaginatedData<AppNotification>;
}

export default function Notifications({ auth, notifications }: Props) {
    const Layout = auth.user?.role === 'merchant' ? MerchantLayout : GuestLayout;
    const orderBase = auth.user?.role === 'merchant' ? '/merchant/orders/' : '/customer/orders/';

    return (
        <Layout>
            <Head title="Notifikasi" />
            <main className="mx-auto max-w-3xl px-4 py-10">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold">Notifikasi</h1>
                        <p className="text-sm text-text-secondary">Pembaruan pesanan dan pembayaran Anda.</p>
                    </div>
                    <button onClick={() => router.post('/notifications/read-all')} className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-bold text-primary">
                        Tandai semua dibaca
                    </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                    {notifications.data.length === 0 ? (
                        <p className="p-12 text-center text-text-secondary">Belum ada notifikasi.</p>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.data.map(notification => (
                                <article key={notification.id} className={'p-5 ' + (notification.read_at ? 'bg-white' : 'bg-primary-light/40')}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="font-bold">{notification.title}</h2>
                                            <p className="mt-1 text-sm text-text-secondary">{notification.message}</p>
                                            <p className="mt-2 text-xs text-text-secondary">{formatDateTime(notification.created_at)}</p>
                                        </div>
                                        {!notification.read_at && (
                                            <button onClick={() => router.post('/notifications/' + notification.id + '/read', {}, { preserveScroll: true })} className="shrink-0 text-xs font-bold text-primary">
                                                Tandai dibaca
                                            </button>
                                        )}
                                    </div>
                                    {notification.resource_type === 'order' && notification.resource_id && (
                                        <Link href={orderBase + notification.resource_id} className="mt-3 inline-block text-sm font-bold text-primary">
                                            Buka pesanan →
                                        </Link>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.last_page > 1 && (
                    <nav className="mt-6 flex justify-center gap-1">
                        {notifications.links.map((link, index) => (
                            <Link key={index} href={link.url || '#'} className={'rounded-lg px-3 py-2 text-sm ' + (link.active ? 'bg-primary text-white' : link.url ? 'text-text-secondary' : 'pointer-events-none text-border')} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </nav>
                )}
            </main>
        </Layout>
    );
}
