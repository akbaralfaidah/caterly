import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/login', {
            onError: () => toast.error('Email atau password yang Anda masukkan salah.'),
        });
    };

    return (
        <>
            <Head title="Masuk" />
            <div className="min-h-screen flex bg-surface">
                {/* Left side - form */}
                <div className="w-full lg:w-[45%] flex flex-col justify-center p-6 sm:p-12 relative">
                    <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
                        <img src="/img/logo-caterly.svg" alt="Caterly" className="h-10" />
                    </div>
                    
                    <div className="w-full max-w-[400px] mx-auto mt-16 lg:mt-0">
                        <div className="mb-10 text-center lg:text-left">
                            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-3">Selamat Datang Kembali</h1>
                            <p className="text-text-secondary">Masukkan email dan password Anda untuk melanjutkan.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                                        <Mail size={20} strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                        placeholder="nama@perusahaan.com"
                                    />
                                </div>
                                {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                                        <Lock size={20} strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="text-error text-sm mt-1">{errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all bg-primary hover:bg-primary-dark shadow-[0_4px_14px_0_rgba(1,96,57,0.39)] mt-8"
                            >
                                Masuk ke Dashboard
                                <ArrowRight size={20} />
                            </button>
                        </form>
                        
                        <p className="mt-8 text-center text-text-secondary text-sm">
                            Belum punya akun?{' '}
                            <Link href="/register" className="font-bold text-primary hover:underline">
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right side - Image with Glassmorphism Overlay */}
                <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-gray-900">
                    <img 
                        src="https://images.unsplash.com/photo-1505935428862-770b6f24f629?q=80&w=2067&auto=format&fit=crop" 
                        alt="Catering Service" 
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 to-transparent mix-blend-multiply"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="glass-dark p-10 rounded-3xl max-w-lg">
                            <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">Solusi Katering Terpercaya untuk Karyawan Anda</h2>
                            <p className="text-white/80 leading-relaxed text-base mb-8">
                                "Semenjak menggunakan Caterly, mengatur makan siang tim menjadi sangat efisien, transparan, dan jadwal pengiriman selalu on-time."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">AH</div>
                                <div>
                                    <div className="font-bold text-white">Arif Hidayat</div>
                                    <div className="text-white/60 text-sm">HR Manager, PT Teknologi Maju</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}