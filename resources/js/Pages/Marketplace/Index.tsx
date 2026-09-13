import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    Calendar,
    Check,
    ChefHat,
    ChevronRight,
    Clock3,
    CreditCard,
    MapPin,
    PackageCheck,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    Store,
    Truck,
    Users,
    Utensils,
} from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { Category, MerchantCard, PageProps, PaginatedData, Region, deliveryDateInputValue, formatRupiah, menuImageUrl } from '@/types';

interface Props extends PageProps {
    merchants: PaginatedData<MerchantCard>;
    regions: Region[];
    categories: Category[];
    requires_address: boolean;
    filters: {
        region_id: number | null;
        delivery_date: string | null;
        portions: number | null;
        category_id: number | null;
        search: string | null;
        max_budget: number | null;
        sort: string;
    };
}

const discoveryBenefits = [
    { icon: MapPin, title: 'Sesuai area', description: 'Hanya lihat katering yang melayani lokasi kantor.' },
    { icon: CreditCard, title: 'Harga transparan', description: 'Bandingkan menu dan biaya tanpa tebak-tebakan.' },
    { icon: Clock3, title: 'Jadwal fleksibel', description: 'Pesan untuk hari ini atau jadwalkan lebih awal.' },
];

const orderingSteps = [
    { icon: Search, number: '01', title: 'Temukan yang cocok', description: 'Atur area, jumlah porsi, tanggal, dan anggaran kantor.' },
    { icon: Utensils, number: '02', title: 'Pilih menu favorit', description: 'Bandingkan pilihan menu dan pesan dalam satu keranjang.' },
    { icon: Truck, number: '03', title: 'Terima di kantor', description: 'Pantau pembayaran dan status pesanan sampai tiba.' },
];

export default function MarketplaceIndex({ auth, merchants, regions, categories, requires_address: requiresAddress, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        region_id: filters.region_id?.toString() || '',
        delivery_date: filters.delivery_date || '',
        portions: filters.portions?.toString() || '',
        category_id: filters.category_id?.toString() || '',
        search: filters.search || '',
        max_budget: filters.max_budget?.toString() || '',
        sort: filters.sort || 'default',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        get('/marketplace', { preserveState: true, replace: true });
    };

    const Layout = auth.user?.role === 'merchant' ? MerchantLayout : GuestLayout;
    const isGuest = auth.user === null;
    const hasFilters = Boolean(data.search || data.region_id || data.delivery_date || data.portions || data.category_id || data.max_budget);

    return (
        <Layout>
            <Head title="Cari Katering" />

            <section className="relative isolate overflow-hidden bg-[#063d2b] text-white">
                <div className="marketplace-glow marketplace-glow-one" aria-hidden="true" />
                <div className="marketplace-glow marketplace-glow-two" aria-hidden="true" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />

                <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-16 lg:pt-20">
                    <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                        <div className="marketplace-hero-copy min-w-0">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-emerald-50 backdrop-blur sm:text-sm">
                                <Sparkles className="h-4 w-4 text-amber-300" />
                                Marketplace katering kantor yang lebih praktis
                            </div>
                            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                                Makan enak di kantor, tanpa drama.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/75 sm:text-lg">
                                Temukan katering sesuai area, kapasitas, dan anggaran. Dari rapat kecil sampai acara besar, semuanya bisa diatur dalam satu tempat.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a href="#katering" className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 font-extrabold text-white shadow-[0_16px_40px_rgba(244,131,23,0.3)] transition hover:-translate-y-1 hover:bg-[#ff9228] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                                    Cari katering sekarang
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </a>
                                {isGuest && (
                                    <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                                        <Building2 className="h-5 w-5" /> Daftar gratis
                                    </Link>
                                )}
                            </div>
                            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-white/75">
                                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> Pilihan terverifikasi</span>
                                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> Pembayaran tercatat</span>
                                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> Cocok untuk perusahaan</span>
                            </div>
                        </div>

                        <div className="marketplace-visual relative mx-auto min-w-0 w-full max-w-xl lg:mx-0">
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-2 shadow-[0_36px_100px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                                <img src="https://images.unsplash.com/photo-1555244162-803834f70033?q=85&w=1400&auto=format&fit=crop" alt="Beragam hidangan katering untuk acara kantor" className="h-[330px] w-full rounded-[1.6rem] object-cover sm:h-[430px]" />
                                <div className="absolute inset-2 rounded-[1.6rem] bg-gradient-to-t from-[#052c21]/90 via-transparent to-transparent" aria-hidden="true" />
                                <div className="absolute bottom-7 left-7 right-7">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Menu pilihan</p>
                                    <p className="mt-1 text-xl font-extrabold sm:text-2xl">Siap bikin tim lebih semangat</p>
                                </div>
                            </div>
                            <div className="marketplace-float-card absolute -left-2 top-6 flex items-center gap-3 rounded-2xl bg-white p-3 text-text-primary shadow-2xl sm:-left-8 sm:p-4">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary"><BadgeCheck className="h-6 w-6" /></span>
                                <div><p className="text-xs text-text-secondary">Partner pilihan</p><p className="text-sm font-extrabold">Profil terverifikasi</p></div>
                            </div>
                            <div className="marketplace-float-card marketplace-float-card-delayed absolute -bottom-5 right-2 min-w-48 rounded-2xl bg-white p-4 text-text-primary shadow-2xl sm:-right-7 sm:bottom-8">
                                <div className="flex items-center justify-between gap-5"><span className="text-xs font-bold text-text-secondary">Status pesanan</span><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 ring-4 ring-emerald-100" /></div>
                                <div className="mt-3 flex items-center gap-3"><PackageCheck className="h-8 w-8 text-primary" /><div><p className="font-extrabold">Siap diantar</p><p className="text-xs text-text-secondary">Tepat waktu ke kantor</p></div></div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="relative z-10 mt-16 grid min-w-0 gap-3 rounded-[1.5rem] border border-white/70 bg-white p-4 text-text-primary shadow-[0_24px_70px_rgba(8,39,29,0.22)] sm:p-5 md:grid-cols-2 lg:grid-cols-12">
                        <label className="relative lg:col-span-4">
                            <span className="sr-only">Nama katering</span>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={19} />
                            <input value={data.search} onChange={event => setData('search', event.target.value)} placeholder="Cari nama katering" className="h-12 w-full rounded-xl border border-border bg-surface/60 pl-11 pr-4 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10" />
                        </label>
                        <label className="relative lg:col-span-3">
                            <span className="sr-only">Area pengiriman</span>
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={19} />
                            <select value={data.region_id} onChange={event => setData('region_id', event.target.value)} className="h-12 w-full rounded-xl border border-border bg-surface/60 pl-11 pr-4 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10">
                                <option value="">{auth.user?.role === 'customer' ? 'Pilih alamat perusahaan' : 'Semua area'}</option>
                                {regions.map(region => <option key={region.id} value={region.id}>{region.city_name}</option>)}
                            </select>
                        </label>
                        <label className="relative lg:col-span-3">
                            <span className="sr-only">Tanggal pengiriman</span>
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={19} />
                            <input type="date" value={data.delivery_date} onChange={event => setData('delivery_date', event.target.value)} min={deliveryDateInputValue()} max={deliveryDateInputValue(30)} className="h-12 w-full rounded-xl border border-border bg-surface/60 pl-11 pr-4 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10" />
                        </label>
                        <button disabled={processing} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 font-extrabold text-white shadow-lg shadow-orange-200/60 transition hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-wait disabled:opacity-60 lg:col-span-2">
                            <SlidersHorizontal size={18} className={processing ? 'animate-spin' : ''} /> {processing ? 'Mencari...' : 'Cari sekarang'}
                        </button>
                        <div className="grid gap-3 border-t border-border pt-4 md:col-span-2 md:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
                            <label className="relative"><span className="sr-only">Jumlah porsi</span><Users className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} /><input type="number" min="1" max="100000" value={data.portions} onChange={event => setData('portions', event.target.value)} placeholder="Jumlah porsi" className="h-11 w-full rounded-xl border border-border pl-11 pr-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label>
                            <select aria-label="Kategori menu" value={data.category_id} onChange={event => setData('category_id', event.target.value)} className="h-11 rounded-xl border border-border bg-white px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"><option value="">Semua kategori</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
                            <input aria-label="Harga maksimum per porsi" type="number" min="1" value={data.max_budget} onChange={event => setData('max_budget', event.target.value)} placeholder="Harga maksimum / porsi" className="h-11 rounded-xl border border-border px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
                            <select aria-label="Urutkan katering" value={data.sort} onChange={event => setData('sort', event.target.value)} className="h-11 rounded-xl border border-border bg-white px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"><option value="default">Terbaru</option><option value="name_asc">Nama A–Z</option><option value="price_asc">Harga terendah</option><option value="price_desc">Harga tertinggi</option></select>
                        </div>
                    </form>
                </div>
            </section>

            <section className="bg-surface px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
                    {discoveryBenefits.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary transition group-hover:rotate-3 group-hover:scale-105"><Icon className="h-6 w-6" /></span>
                            <div><h2 className="font-extrabold">{title}</h2><p className="mt-0.5 text-sm leading-5 text-text-secondary">{description}</p></div>
                        </div>
                    ))}
                </div>
            </section>

            <main id="katering" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                {requiresAddress && (
                    <div className="mb-8 rounded-2xl border border-accent/40 bg-accent-light p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                        <div>
                            <h2 className="font-extrabold text-accent-dark">Alamat perusahaan wajib dilengkapi</h2>
                            <p className="mt-1 text-sm text-text-secondary">Tambahkan alamat agar kami hanya menampilkan katering yang melayani area perusahaan Anda.</p>
                        </div>
                        <Link href="/customer/profile" className="mt-4 inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-accent-dark sm:mt-0">
                            Tambah alamat
                        </Link>
                    </div>
                )}

                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                            <Store className="h-4 w-4" /> Pilihan katering
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">Temukan rasa yang pas untuk tim</h2>
                        <p className="mt-2 text-text-secondary">{merchants.total > 0 ? `${merchants.total} katering sesuai kriteria Anda.` : 'Pilihan katering akan tampil di sini sesuai pencarian Anda.'}</p>
                    </div>
                    {hasFilters && (
                        <Link href="/marketplace" className="inline-flex w-fit items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold text-text-secondary transition hover:border-primary hover:text-primary">Kosongkan filter</Link>
                    )}
                </div>

                {merchants.data.length === 0 ? (
                    <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-primary/20 bg-[linear-gradient(135deg,#f4faf7_0%,#fffaf3_100%)] px-6 py-14 text-center sm:px-12 sm:py-20">
                        <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-2xl" aria-hidden="true" />
                        <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white text-primary shadow-xl shadow-primary/10">
                            <ChefHat className="h-10 w-10" />
                            <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white"><Sparkles className="h-4 w-4" /></span>
                        </div>
                        <h3 className="relative mt-6 text-2xl font-extrabold">{requiresAddress ? 'Tambahkan alamat untuk mulai mencari' : 'Belum ada katering yang cocok'}</h3>
                        <p className="relative mx-auto mt-2 max-w-lg leading-7 text-text-secondary">
                            {requiresAddress ? 'Kami akan mencocokkan alamat kantor Anda dengan area layanan katering secara otomatis.' : 'Coba longgarkan filter pencarian, atau jadilah partner katering pertama yang tampil di area ini.'}
                        </p>
                        <div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            {requiresAddress ? (
                                <Link href="/customer/profile" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-dark">Tambahkan alamat <ArrowRight className="h-4 w-4" /></Link>
                            ) : (
                                <>
                                    {hasFilters && <Link href="/marketplace" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary-dark">Tampilkan semua</Link>}
                                    {isGuest && <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/15 bg-white px-5 py-3 font-bold text-primary transition hover:-translate-y-0.5 hover:border-primary/30"><ChefHat className="h-4 w-4" /> Gabung sebagai katering</Link>}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {merchants.data.map((merchant, index) => (
                            <Link
                                key={merchant.id}
                                href={`/marketplace/${merchant.id}${filters.region_id ? `?region_id=${filters.region_id}` : ''}`}
                                className="marketplace-merchant-card group overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-primary/20 hover:shadow-[0_24px_60px_rgba(6,61,43,0.14)]"
                                style={{ animationDelay: `${Math.min(index, 5) * 80}ms` }}
                            >
                                <div className="relative h-52 overflow-hidden bg-primary-light">
                                    <img src={menuImageUrl(merchant.menus_preview[0]?.image_path)} alt={`Menu dari ${merchant.company_name}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                        {merchant.service_area && <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-primary shadow-sm">{merchant.service_area}</span>}
                                        {merchant.availability && <span className={merchant.availability.available ? 'rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm' : 'rounded-full bg-error px-3 py-1.5 text-xs font-extrabold text-white shadow-sm'}>{merchant.availability.available ? 'Tersedia' : merchant.availability.reason}</span>}
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <p className="text-xs font-semibold text-white/75">Minimal {merchant.minimum_portions} porsi</p>
                                        <h3 className="mt-1 text-2xl font-extrabold">{merchant.company_name}</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
                                        {merchant.categories.slice(0, 2).map(category => <span key={category} className="rounded-full bg-surface px-3 py-1.5">{category}</span>)}
                                        <span className="rounded-full bg-surface px-3 py-1.5">{merchant.menu_count} menu</span>
                                    </div>
                                    <p className="mt-4 line-clamp-2 min-h-11 text-sm leading-6 text-text-secondary">{merchant.description || 'Katering korporat profesional untuk berbagai kebutuhan kantor.'}</p>
                                    <div className="mt-5 space-y-2">
                                        {merchant.menus_preview.slice(0, 2).map(menu => (
                                            <div key={menu.id} className="flex justify-between gap-3 rounded-xl bg-surface p-3 text-sm">
                                                <span className="truncate font-semibold">{menu.name}</span>
                                                <span className="shrink-0 font-bold text-primary">{formatRupiah(menu.price_idr)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                                        <div><p className="text-xs text-text-secondary">Mulai dari</p><p className="text-lg font-extrabold text-primary">{merchant.starting_price ? formatRupiah(merchant.starting_price) : '-'}</p></div>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary transition group-hover:bg-primary group-hover:text-white"><ChevronRight className="h-5 w-5" /></span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {merchants.last_page > 1 && (
                    <nav className="mt-10 flex flex-wrap justify-center gap-1">
                        {merchants.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                preserveState
                                className={'rounded-lg px-3 py-2 text-sm ' + (link.active ? 'bg-primary text-white' : link.url ? 'text-text-secondary hover:bg-surface' : 'pointer-events-none text-border')}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                )}
            </main>

            {isGuest && (
                <>
                    <section id="cara-kerja" className="scroll-mt-20 bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                        <div className="mx-auto max-w-7xl">
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-accent">Mudah dari awal</p>
                                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Tiga langkah, makan siang beres</h2>
                                <p className="mt-3 leading-7 text-text-secondary">Tidak perlu lagi menghubungi banyak katering satu per satu.</p>
                            </div>
                            <div className="relative mt-12 grid gap-5 md:grid-cols-3">
                                <div className="absolute left-[16%] right-[16%] top-10 hidden border-t-2 border-dashed border-primary/15 md:block" aria-hidden="true" />
                                {orderingSteps.map(({ icon: Icon, number, title, description }) => (
                                    <div key={number} className="group relative rounded-[1.5rem] border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                                        <div className="relative flex items-center justify-between">
                                            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition group-hover:rotate-3 group-hover:scale-105"><Icon className="h-7 w-7" /></span>
                                            <span className="text-4xl font-extrabold text-primary/10">{number}</span>
                                        </div>
                                        <h3 className="mt-6 text-xl font-extrabold">{title}</h3>
                                        <p className="mt-2 leading-6 text-text-secondary">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="untuk-katering" className="scroll-mt-20 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#10291f] px-6 py-10 text-white shadow-[0_30px_90px_rgba(6,61,43,0.2)] sm:px-10 sm:py-14 lg:px-16">
                            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
                            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
                            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                                <div className="max-w-3xl">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-emerald-100"><ChefHat className="h-4 w-4" /> Punya usaha katering?</div>
                                    <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-5xl">Dapur Anda layak ditemukan lebih banyak perusahaan.</h2>
                                    <p className="mt-4 max-w-2xl leading-7 text-white/70">Tampilkan menu, kelola kapasitas, terima pembayaran, dan pantau pesanan dari satu dashboard.</p>
                                </div>
                                <Link href="/register" className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 font-extrabold text-white shadow-xl shadow-orange-950/20 transition hover:-translate-y-1 hover:bg-[#ff9228]">
                                    Jadi partner Caterly <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                            <div className="relative mt-9 flex flex-wrap gap-3 border-t border-white/10 pt-7 text-sm font-semibold text-white/70">
                                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Profil usaha profesional</span>
                                <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-300" /> Kontrol jadwal & kapasitas</span>
                                <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-300" /> Pembayaran lebih tertata</span>
                            </div>
                        </div>
                    </section>

                    <footer className="border-t border-border bg-white px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                            <img src="/img/logo-caterly.svg" alt="Caterly" className="h-8" />
                            <p className="text-sm text-text-secondary">Katering kantor lebih mudah, transparan, dan menyenangkan.</p>
                            <div className="flex gap-5 text-sm font-bold text-text-secondary"><a href="#cara-kerja" className="transition hover:text-primary">Cara kerja</a><Link href="/login" className="transition hover:text-primary">Masuk</Link></div>
                        </div>
                    </footer>
                </>
            )}
        </Layout>
    );
}
