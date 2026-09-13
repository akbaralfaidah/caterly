import { Link, usePage } from '@inertiajs/react';
import LogoutButton from '@/Components/LogoutButton';
import { PageProps } from '@/types';
import { ReactNode, useState } from 'react';

const navItems = [
    { label: 'Ringkasan', href: '/merchant/dashboard', icon: '📋' },
    { label: 'Menu', href: '/merchant/menus', icon: '🍱' },
    { label: 'Pesanan', href: '/merchant/orders', icon: '📦' },
    { label: 'Produksi', href: '/merchant/production', icon: '👩‍🍳' },
    { label: 'Jadwal & Kapasitas', href: '/merchant/capacity', icon: '📅' },
    { label: 'Invoice', href: '/merchant/invoices', icon: '🧾' },
    { label: 'Profil Usaha', href: '/merchant/profile', icon: '🏪' },
];

export default function MerchantLayout({ children, title }: { children: ReactNode; title?: string }) {
    const { auth } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-surface">
            {/* Mobile header */}
            <header className="lg:hidden border-b border-border bg-white sticky top-0 z-50">
                <div className="px-4 h-14 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 text-text-primary">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>
                    <Link href="/merchant/dashboard">
                        <img src="/img/logo-caterly.svg" alt="Caterly" className="h-7" />
                    </Link>
                    <Link href="/notifications" className="p-2 -mr-2 text-text-secondary hover:text-text-primary">
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                        </svg>
                    </Link>
                </div>
            </header>

            {/* Mobile drawer overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex">
                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-0 h-screen w-[232px] bg-white border-r border-border flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-5 border-b border-border hidden lg:block">
                        <Link href="/merchant/dashboard">
                            <img src="/img/logo-caterly.svg" alt="Caterly" className="h-8" />
                        </Link>
                    </div>
                    <nav className="flex-1 py-3 px-3 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-[15px] font-medium transition-colors ${
                                    currentPath.startsWith(item.href)
                                        ? 'bg-primary-light text-primary'
                                        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                                }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-border">
                        <div className="text-sm font-semibold text-text-primary truncate">{auth.user?.company_name}</div>
                        <div className="text-xs text-text-secondary truncate mt-0.5">{auth.user?.email}</div>
                        <LogoutButton className="mt-3 w-full rounded-xl border border-error/20 bg-error-light px-3 py-2.5 text-sm text-error hover:-translate-y-0.5 hover:border-error/30 hover:bg-red-100" />
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 min-w-0">
                    <div className="hidden lg:flex border-b border-border bg-white px-8 h-14 items-center justify-between">
                        <h1 className="text-lg font-bold text-text-primary">{title}</h1>
                        <div className="flex items-center gap-4">
                            <Link href="/notifications" className="p-2 text-text-secondary hover:text-text-primary">
                                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                                </svg>
                            </Link>
                            <span className="text-sm font-medium text-text-secondary">{auth.user?.name}</span>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
