import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Building2, ChefHat, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
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
        post('/register', {
            onError: () => toast.error('Gagal mendaftar. Periksa kembali form Anda.'),
        });
    };

    return (
        <>
            <Head title="Daftar" />
            <div className="min-h-screen flex bg-surface">
                {/* Left side - form */}
                <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative">
                    <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
                        <img src="/img/logo-caterly.svg" alt="Caterly" className="h-10" />
                    </div>
                    
                    <div className="w-full max-w-[480px] mt-16 lg:mt-0">
                        <div className="mb-10">
                            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-3">Mulai bersama Caterly</h1>
                            <p className="text-text-secondary">Pesan katering untuk kantor Anda atau bergabung sebagai mitra penyedia katering.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setData('role', 'customer')}
                                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ` + 
                                        (data.role === 'customer' 
                                            ? 'border-primary bg-primary-light/30 shadow-sm' 
                                            : 'border-border bg-white hover:border-gray-300 hover:bg-gray-50')}
                                >
                                    <div className={`p-2.5 rounded-lg w-fit mb-3 ` + (data.role === 'customer' ? 'bg-primary text-white' : 'bg-surface text-text-secondary')}>
                                        <Building2 size={24} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-text-primary">Perusahaan</h3>
                                    <p className="text-xs text-text-secondary mt-1">Pesan katering</p>
                                    {data.role === 'customer' && (
                                        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setData('role', 'merchant')}
                                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ` + 
                                        (data.role === 'merchant' 
                                            ? 'border-accent bg-accent-light/30 shadow-sm' 
                                            : 'border-border bg-white hover:border-gray-300 hover:bg-gray-50')}
                                >
                                    <div className={`p-2.5 rounded-lg w-fit mb-3 ` + (data.role === 'merchant' ? 'bg-accent text-white' : 'bg-surface text-text-secondary')}>
                                        <ChefHat size={24} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-text-primary">Katering</h3>
                                    <p className="text-xs text-text-secondary mt-1">Jual katering</p>
                                    {data.role === 'merchant' && (
                                        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-accent ring-4 ring-accent/20"></div>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1">Nama Lengkap PIC</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                        placeholder="Contoh: Budi Santoso"
                                    />
                                    {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                        placeholder="nama@perusahaan.com"
                                    />
                                    {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1">
                                            {data.role === 'customer' ? 'Nama Perusahaan' : 'Nama Usaha Katering'}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.company_name}
                                            onChange={e => setData('company_name', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                        />
                                        {errors.company_name && <p className="text-error text-sm mt-1">{errors.company_name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1">Nomor Telepon/WA</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                        />
                                        {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={e => setData('password', e.target.value)}
                                                className="w-full rounded-xl border border-border bg-white py-3 pl-4 pr-12 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                            <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={showPassword}>
                                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-error text-sm mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1">Konfirmasi</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmation ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={e => setData('password_confirmation', e.target.value)}
                                                className="w-full rounded-xl border border-border bg-white py-3 pl-4 pr-12 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                            <button type="button" onClick={() => setShowConfirmation(value => !value)} className="absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" aria-label={showConfirmation ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'} aria-pressed={showConfirmation}>
                                                {showConfirmation ? <EyeOff size={19} /> : <Eye size={19} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all ` + 
                                    (data.role === 'customer' 
                                        ? 'bg-primary hover:bg-primary-dark shadow-[0_4px_14px_0_rgba(1,96,57,0.39)]' 
                                        : 'bg-accent hover:bg-accent-dark shadow-[0_4px_14px_0_rgba(244,131,23,0.39)]')}
                            >
                                Daftar Sekarang
                                <ArrowRight size={20} />
                            </button>
                        </form>
                        
                        <p className="mt-8 text-center text-text-secondary text-sm">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="font-bold text-primary hover:underline">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right side - Image with Glassmorphism Overlay */}
                <div className="hidden lg:block lg:w-[45%] relative overflow-hidden bg-gray-900">
                    <img 
                        src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" 
                        alt="Catering" 
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                    
                    <div className="absolute bottom-16 left-16 right-16">
                        <div className="glass p-8 rounded-2xl border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-3">Makan Siang Tanpa Repot</h2>
                            <p className="text-white/80 leading-relaxed text-sm">
                                Temukan penyedia katering terbaik untuk karyawan Anda. Atur jadwal, porsi, dan menu dengan mudah dalam satu platform transparan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
