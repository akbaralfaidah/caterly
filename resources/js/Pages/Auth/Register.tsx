import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        company_name: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Daftar" />
            <div className="min-h-screen flex">
                {/* Left side - form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                    <div className="w-full max-w-md">
                        <div className="lg:hidden mb-8">
                            <img src="/img/logo-caterly.svg" alt="Caterly" className="h-10 mx-auto" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Daftar Akun Baru</h1>
                        <p className="text-text-secondary mb-8 text-[15px]">
                            Bergabung dengan Caterly untuk mulai memesan atau menjual katering.
                        </p>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <label className={`border rounded-lg p-4 cursor-pointer transition-all ${data.role === 'customer' ? 'border-primary bg-primary-light ring-1 ring-primary' : 'border-border hover:border-text-secondary bg-surface'}`}>
                                    <input type="radio" name="role" value="customer" checked={data.role === 'customer'} onChange={e => setData('role', e.target.value)} className="sr-only" />
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🏢</div>
                                        <div className="font-bold text-sm text-text-primary">Perusahaan</div>
                                        <div className="text-xs text-text-secondary mt-1">Pesan katering</div>
                                    </div>
                                </label>
                                <label className={`border rounded-lg p-4 cursor-pointer transition-all ${data.role === 'merchant' ? 'border-primary bg-primary-light ring-1 ring-primary' : 'border-border hover:border-text-secondary bg-surface'}`}>
                                    <input type="radio" name="role" value="merchant" checked={data.role === 'merchant'} onChange={e => setData('role', e.target.value)} className="sr-only" />
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🧑‍🍳</div>
                                        <div className="font-bold text-sm text-text-primary">Katering</div>
                                        <div className="text-xs text-text-secondary mt-1">Jual katering</div>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Nama Lengkap PIC</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full h-11 px-4 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="Contoh: Budi Santoso"
                                />
                                {errors.name && <p className="text-error text-sm mt-1.5">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full h-11 px-4 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="nama@perusahaan.com"
                                />
                                {errors.email && <p className="text-error text-sm mt-1.5">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Nama {data.role === 'customer' ? 'Perusahaan' : 'Katering'}</label>
                                    <input
                                        type="text"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className="w-full h-11 px-4 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                    {errors.company_name && <p className="text-error text-sm mt-1.5">{errors.company_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Nomor Telepon/WA</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full h-11 px-4 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                    {errors.phone && <p className="text-error text-sm mt-1.5">{errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full h-11 px-4 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                                {errors.password && <p className="text-error text-sm mt-1.5">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full h-11 px-4 border border-border rounded-lg text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 text-[15px] mt-6"
                            >
                                {processing ? 'Memproses...' : 'Daftar Sekarang'}
                            </button>
                        </form>

                        <p className="text-center mt-6 text-[15px] text-text-secondary">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right side - branding */}
                <div className="hidden lg:flex w-1/2 bg-accent items-center justify-center p-12">
                    <div className="max-w-md text-center">
                        <img src="/img/logo-caterly.svg" alt="Caterly" className="h-12 mx-auto mb-8 brightness-0 invert" />
                        <h2 className="text-3xl font-bold text-white mb-4">Solusi Katering Korporat</h2>
                        <p className="text-white/80 text-lg leading-relaxed">
                            Platform yang mempertemukan kebutuhan makan siang perusahaan dengan penyedia katering profesional.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
