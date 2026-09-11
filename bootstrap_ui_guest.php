<?php
$files = [];

// ===== Guest Layout =====
$files['resources/js/Layouts/GuestLayout.tsx'] = <<<'TSX'
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ReactNode } from 'react';

export default function GuestLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-border sticky top-0 bg-white z-50">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/marketplace" className="flex items-center gap-2">
                        <img src="/img/logo-caterly.webp" alt="Caterly" className="h-8" />
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
                                        {auth.user.company_name}
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="text-sm text-text-secondary hover:text-error font-medium"
                                    >
                                        Keluar
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-text-primary font-semibold hover:text-primary transition-colors text-[15px]">
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors text-[15px]"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}
TSX;

// ===== Merchant Layout =====
$files['resources/js/Layouts/MerchantLayout.tsx'] = <<<'TSX'
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ReactNode, useState } from 'react';

const navItems = [
    { label: 'Ringkasan', href: '/merchant/dashboard', icon: '📋' },
    { label: 'Menu', href: '/merchant/menus', icon: '🍱' },
    { label: 'Pesanan', href: '/merchant/orders', icon: '📦' },
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
                        <img src="/img/logo-caterly.webp" alt="Caterly" className="h-7" />
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
                            <img src="/img/logo-caterly.webp" alt="Caterly" className="h-8" />
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
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="mt-3 text-sm text-error hover:text-error/80 font-medium"
                        >
                            Keluar
                        </Link>
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
TSX;

// ===== Login Page =====
$files['resources/js/Pages/Auth/Login.tsx'] = <<<'TSX'
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Masuk" />
            <div className="min-h-screen flex">
                {/* Left side - branding */}
                <div className="hidden lg:flex w-1/2 bg-primary items-center justify-center p-12">
                    <div className="max-w-md text-center">
                        <img src="/img/logo-caterly.webp" alt="Caterly" className="h-12 mx-auto mb-8 brightness-0 invert" />
                        <h2 className="text-3xl font-bold text-white mb-4">Makan siang untuk tim Anda</h2>
                        <p className="text-white/80 text-lg leading-relaxed">
                            Temukan katering terpercaya sesuai lokasi, jadwal, dan kebutuhan porsi kantor Anda.
                        </p>
                    </div>
                </div>

                {/* Right side - form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                    <div className="w-full max-w-md">
                        <div className="lg:hidden mb-8">
                            <img src="/img/logo-caterly.webp" alt="Caterly" className="h-10 mx-auto" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Masuk ke Caterly</h1>
                        <p className="text-text-secondary mb-8 text-[15px]">
                            Masukkan email dan password Anda untuk melanjutkan.
                        </p>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full h-11 px-4 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="nama@perusahaan.com"
                                    autoFocus
                                />
                                {errors.email && <p className="text-error text-sm mt-1.5">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full h-11 px-4 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="Masukkan password"
                                />
                                {errors.password && <p className="text-error text-sm mt-1.5">{errors.password}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 text-[15px]"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>

                        <p className="text-center mt-6 text-[15px] text-text-secondary">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-primary font-semibold hover:underline">
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
TSX;

foreach ($files as $path => $content) {
    file_put_contents($path, $content);
}
echo "Guest UI OK";