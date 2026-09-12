import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ReactNode } from 'react';

export default function GuestLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-white">
            <header className="glass sticky top-0 z-50 border-b border-white/20 shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/marketplace" className="flex items-center gap-2">
                        <img src="/img/logo-caterly.svg" alt="Caterly" className="h-8" />
                    </Link>
                    <nav className="flex items-center gap-3 sm:gap-6 text-[15px]">
                        <Link href="/marketplace" className="hidden sm:block text-text-secondary hover:text-text-primary font-medium">
                            Cari Katering
                        </Link>
                        {auth.user ? (
                            <>
                                {auth.user.role === 'customer' && (
                                    <>
                                        <Link href="/customer/orders" className="hidden sm:block text-text-secondary hover:text-text-primary font-medium">Pesanan</Link>
                                        <Link href="/customer/invoices" className="hidden sm:block text-text-secondary hover:text-text-primary font-medium">Invoice</Link>
                                    </>
                                )}
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={auth.user.role === 'merchant' ? '/merchant/dashboard' : '/customer/profile'}
                                        className="text-sm font-semibold text-primary px-3 py-1.5 rounded-md hover:bg-primary-light"
                                    >
                                        Dashboard
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-text-secondary hover:text-text-primary font-semibold transition-colors">
                                    Masuk
                                </Link>
                                <Link href="/register" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(1,96,57,0.39)]">
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}