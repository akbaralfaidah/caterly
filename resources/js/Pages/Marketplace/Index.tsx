import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Calendar, ChevronRight, MapPin, Search, SlidersHorizontal, Users, Utensils } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { Category, MerchantCard, PageProps, PaginatedData, Region, formatRupiah } from '@/types';

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

    return (
        <Layout>
            <Head title="Cari Katering" />

            <section className="bg-primary px-4 py-16 text-white">
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-3xl font-extrabold sm:text-5xl">Temukan katering kantor yang tepat</h1>
                    <p className="mt-3 max-w-2xl text-white/80">Bandingkan area, tanggal, kapasitas, kategori, dan anggaran sebelum memesan.</p>

                    <form onSubmit={submit} className="mt-8 grid gap-3 rounded-2xl bg-white p-4 text-text-primary shadow-xl md:grid-cols-4">
                        <label className="relative md:col-span-2">
                            <Search className="absolute left-3 top-3.5 text-text-secondary" size={18} />
                            <input
                                value={data.search}
                                onChange={event => setData('search', event.target.value)}
                                placeholder="Cari nama katering"
                                className="h-11 w-full rounded-lg border border-border pl-10 pr-3 outline-none focus:border-primary"
                            />
                        </label>
                        <label className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-text-secondary" size={18} />
                            <select
                                value={data.region_id}
                                onChange={event => setData('region_id', event.target.value)}
                                className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-3 outline-none focus:border-primary"
                            >
                                <option value="">{auth.user?.role === 'customer' ? 'Pilih alamat perusahaan' : 'Semua area'}</option>
                                {regions.map(region => <option key={region.id} value={region.id}>{region.city_name}</option>)}
                            </select>
                        </label>
                        <label className="relative">
                            <Calendar className="absolute left-3 top-3.5 text-text-secondary" size={18} />
                            <input
                                type="date"
                                value={data.delivery_date}
                                onChange={event => setData('delivery_date', event.target.value)}
                                min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                                max={new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)}
                                className="h-11 w-full rounded-lg border border-border pl-10 pr-3 outline-none focus:border-primary"
                            />
                        </label>
                        <label className="relative">
                            <Users className="absolute left-3 top-3.5 text-text-secondary" size={18} />
                            <input
                                type="number"
                                min="1"
                                max="100000"
                                value={data.portions}
                                onChange={event => setData('portions', event.target.value)}
                                placeholder="Jumlah porsi"
                                className="h-11 w-full rounded-lg border border-border pl-10 pr-3 outline-none focus:border-primary"
                            />
                        </label>
                        <select
                            value={data.category_id}
                            onChange={event => setData('category_id', event.target.value)}
                            className="h-11 rounded-lg border border-border bg-white px-3 outline-none focus:border-primary"
                        >
                            <option value="">Semua kategori</option>
                            {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={data.max_budget}
                            onChange={event => setData('max_budget', event.target.value)}
                            placeholder="Harga maksimum / porsi"
                            className="h-11 rounded-lg border border-border px-3 outline-none focus:border-primary"
                        />
                        <div className="flex gap-2">
                            <select
                                value={data.sort}
                                onChange={event => setData('sort', event.target.value)}
                                className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 outline-none focus:border-primary"
                            >
                                <option value="default">Terbaru</option>
                                <option value="name_asc">Nama A–Z</option>
                                <option value="price_asc">Harga terendah</option>
                                <option value="price_desc">Harga tertinggi</option>
                            </select>
                            <button disabled={processing} className="flex h-11 items-center gap-2 rounded-lg bg-accent px-5 font-bold text-white disabled:opacity-50">
                                <SlidersHorizontal size={17} /> Terapkan
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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

                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-text-primary">Katering Tersedia</h2>
                        <p className="mt-1 text-text-secondary">{merchants.total} katering sesuai kriteria.</p>
                    </div>
                </div>

                {merchants.data.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-surface p-16 text-center">
                        <Utensils className="mx-auto text-text-secondary" size={36} />
                        <h3 className="mt-4 text-lg font-bold">Tidak ada katering ditemukan</h3>
                        <p className="mt-1 text-text-secondary">{requiresAddress ? 'Lengkapi alamat perusahaan untuk melihat katering di area Anda.' : 'Ubah atau kosongkan beberapa filter.'}</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {merchants.data.map(merchant => (
                            <Link key={merchant.id} href={`/marketplace/${merchant.id}${filters.region_id ? `?region_id=${filters.region_id}` : ''}`} className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                <div className="bg-primary-light p-5">
                                    <h3 className="text-xl font-extrabold group-hover:text-primary">{merchant.company_name}</h3>
                                    <p className="mt-1 text-sm text-text-secondary">Minimal {merchant.minimum_portions} porsi</p>
                                </div>
                                <div className="p-5">
                                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
                                        {merchant.service_area && <span className="rounded-full bg-surface px-3 py-1">{merchant.service_area}</span>}
                                        <span className="rounded-full bg-surface px-3 py-1">{merchant.menu_count} menu</span>
                                        {merchant.availability && (
                                            <span className={merchant.availability.available ? 'rounded-full bg-primary-light px-3 py-1 text-primary' : 'rounded-full bg-error-light px-3 py-1 text-error'}>
                                                {merchant.availability.available ? 'Tersedia' : merchant.availability.reason}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-4 line-clamp-2 min-h-10 text-sm text-text-secondary">{merchant.description || 'Katering korporat profesional.'}</p>
                                    <div className="mt-5 space-y-2">
                                        {merchant.menus_preview.map(menu => (
                                            <div key={menu.id} className="flex justify-between gap-3 rounded-lg bg-surface p-3 text-sm">
                                                <span className="truncate font-semibold">{menu.name}</span>
                                                <span className="shrink-0 font-bold text-primary">{formatRupiah(menu.price_idr)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                                        <div>
                                            <p className="text-xs text-text-secondary">Mulai dari</p>
                                            <p className="font-extrabold">{merchant.starting_price ? formatRupiah(merchant.starting_price) : '-'}</p>
                                        </div>
                                        <ChevronRight className="text-primary" />
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
        </Layout>
    );
}
