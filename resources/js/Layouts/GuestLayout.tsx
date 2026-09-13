import { Link, usePage } from '@inertiajs/react';
import LogoutButton from '@/Components/LogoutButton';
import { PageProps } from '@/types';
import { ReactNode } from 'react';

export default function GuestLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen overflow-x-clip bg-white">
            <header className="glass sticky top-0 z-50 border-b border-white/40 shadow-[0_8px_30px_rgba(17,23,30,0.05)]">
                <div className="mx-auto flex h-16 min-w-0 max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
                    <Link href="/marketplace" className="flex shrink-0 items-center gap-2 transition hover:scale-[1.03]">
                        <img src="/img/logo-caterly.svg" alt="Caterly" className="h-8 sm:h-9" />
                    </Link>
                    <nav className="flex min-w-0 items-center gap-3 text-[15px] sm:gap-6">
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
                                    <LogoutButton className="rounded-xl border border-error/20 bg-error-light px-3 py-2 text-sm text-error hover:-translate-y-0.5 hover:border-error/30 hover:bg-red-100" />
                                </div>
                            </>
                        ) : (
                            <div className="flex min-w-0 items-center gap-2 sm:gap-5">
                                <a href="/marketplace#cara-kerja" className="hidden font-semibold text-text-secondary transition hover:text-primary lg:block">Cara kerja</a>
                                <a href="/marketplace#untuk-katering" className="hidden font-semibold text-text-secondary transition hover:text-primary lg:block">Untuk katering</a>
                                <Link href="/login" className="font-semibold text-text-secondary transition-colors hover:text-text-primary">
                                    Masuk
                                </Link>
                                <Link href="/register" className="rounded-xl bg-primary px-4 py-2 font-bold text-white shadow-[0_7px_20px_rgba(1,96,57,0.28)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark sm:px-5 sm:py-2.5">
                                    <span className="sm:hidden">Daftar</span><span className="hidden sm:inline">Daftar gratis</span>
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
