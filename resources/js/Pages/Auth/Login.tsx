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