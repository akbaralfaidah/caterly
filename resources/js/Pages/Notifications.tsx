import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { PageProps, PaginatedData, formatDateTime } from '@/types';
import { useState } from 'react';

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
    const unreadCount = notifications.data.filter(notification => !notification.read_at).length;
    const [markingAll, setMarkingAll] = useState(false);
    const [markingId, setMarkingId] = useState<number | null>(null);

    const markAllAsRead = () => {
        setMarkingAll(true);
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            onFinish: () => setMarkingAll(false),
        });
    };

    const markAsRead = (notificationId: number) => {
        setMarkingId(notificationId);
        router.post('/notifications/' + notificationId + '/read', {}, {
            preserveScroll: true,
            onFinish: () => setMarkingId(null),
        });
    };

    return (
        <Layout>
            <Head title="Notifikasi" />
            <main className="mx-auto max-w-3xl px-4 py-10">
                <div className="mb-6 flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-extrabold">Notifikasi</h1>
                        <p className="text-sm text-text-secondary">Pembaruan pesanan dan pembayaran Anda.</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={markingAll}
                            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/20 bg-primary-light px-3 py-2 text-xs font-extrabold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-emerald-100 disabled:pointer-events-none disabled:opacity-60 sm:px-4 sm:text-sm"
                            aria-label={`Tandai ${unreadCount} notifikasi sebagai sudah dibaca`}
                        >
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] text-white" aria-hidden="true">✓</span>
                            <span className="sm:hidden">Baca semua</span>
                            <span className="hidden sm:inline">{markingAll ? 'Menandai...' : 'Tandai semua dibaca'}</span>
                        </button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                    {notifications.data.length === 0 ? (
                        <p className="p-12 text-center text-text-secondary">Belum ada notifikasi.</p>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.data.map(notification => (
                                <article key={notification.id} className={'p-5 ' + (notification.read_at ? 'bg-white' : 'bg-primary-light/40')}>
                                    <div className="flex items-start gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-bold">{notification.title}</h2>
                                            <p className="mt-1 break-words text-sm text-text-secondary">{notification.message}</p>
                                            <p className="mt-2 text-xs text-text-secondary">{formatDateTime(notification.created_at)}</p>
                                        </div>
                                        {!notification.read_at && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_4px_rgba(1,96,57,0.12)]" aria-label="Belum dibaca" />}
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        {notification.resource_type === 'order' && notification.resource_id && (
                                            <Link href={orderBase + notification.resource_id} className="inline-flex min-h-9 items-center rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white transition hover:bg-primary-dark sm:text-sm">
                                                Buka pesanan →
                                            </Link>
                                        )}
                                        {!notification.read_at && (
                                            <button
                                                type="button"
                                                onClick={() => markAsRead(notification.id)}
                                                disabled={markingId === notification.id}
                                                className="inline-flex min-h-9 items-center rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-primary transition hover:border-primary/30 hover:bg-primary-light disabled:pointer-events-none disabled:opacity-60 sm:text-sm"
                                            >
                                                {markingId === notification.id ? 'Menandai...' : 'Tandai dibaca'}
                                            </button>
                                        )}
                                    </div>
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
