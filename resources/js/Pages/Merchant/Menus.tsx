import { Head, useForm, router } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { useInteractiveDialog } from '@/Components/InteractiveDialog';
import { PageProps, MenuItem, Category, formatRupiah, menuImageUrl } from '@/types';
import { useState, useRef, FormEvent } from 'react';

interface Props extends PageProps {
    menus: MenuItem[];
    categories: Category[];
}

export default function Menus({ menus, categories }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { alert: alertDialog, confirm: confirmDialog } = useInteractiveDialog();

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        price_idr: '',
        category_id: '',
        image: null as File | null,
        _method: 'post',
    });

    const openModal = (menu: MenuItem | null = null) => {
        setEditingMenu(menu);
        if (menu) {
            setData({
                name: menu.name,
                description: menu.description,
                price_idr: menu.price_idr.toString(),
                category_id: menu.category_id.toString(),
                image: null,
                _method: 'patch',
            });
        } else {
            setData({
                name: '',
                description: '',
                price_idr: '',
                category_id: '',
                image: null,
                _method: 'post',
            });
        }
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingMenu(null);
    };

    const selectImage = (file: File | null) => {
        const hasAllowedMimeType = file === null || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        const hasAllowedExtension = file === null || /\.(jpe?g|png|webp)$/i.test(file.name);

        if (!hasAllowedMimeType || !hasAllowedExtension) {
            setData('image', null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            void alertDialog({
                title: 'Format foto tidak didukung',
                message: 'Foto menu hanya boleh berformat JPG, JPEG, PNG, atau WebP.',
                confirmLabel: 'Mengerti',
                tone: 'warning',
            });

            return;
        }

        clearErrors('image');
        setData('image', file);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (editingMenu) {
            post(`/merchant/menus/${editingMenu.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/merchant/menus', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleStatus = (menuId: number) => {
        router.patch(`/merchant/menus/${menuId}/toggle`, {}, { preserveScroll: true });
    };

    const deleteMenu = async (menuId: number) => {
        const confirmed = await confirmDialog({
            title: 'Hapus menu?',
            message: 'Menu akan dihapus dari katalog dan tidak lagi dapat dipesan pelanggan.',
            confirmLabel: 'Hapus menu',
            tone: 'danger',
        });

        if (!confirmed) return;

        router.delete(`/merchant/menus/${menuId}`, { preserveScroll: true });
    };

    return (
        <MerchantLayout title="Katalog Menu">
            <Head title="Katalog Menu" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">Katalog Menu</h2>
                    <p className="text-sm text-text-secondary">Kelola daftar menu yang ditawarkan ke pelanggan</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors shrink-0"
                >
                    + Tambah Menu Baru
                </button>
            </div>

            {menus.length === 0 ? (
                <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden p-12 text-center">
                    <div className="text-5xl mb-4">🍱</div>
                    <p className="text-lg font-bold text-text-primary mb-2">Belum ada menu</p>
                    <p className="text-text-secondary mb-6">Silakan tambah menu pertama Anda agar pelanggan bisa mulai memesan.</p>
                    <button 
                        onClick={() => openModal()}
                        className="text-primary font-semibold hover:underline"
                    >
                        Tambah Menu Sekarang
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {menus.map((menu) => (
                        <div key={menu.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                            <div className="aspect-video bg-surface relative">
                                <img
                                    src={menuImageUrl(menu.image_path)}
                                    alt={menu.name}
                                    className={`h-full w-full object-cover ${!menu.is_active ? 'grayscale opacity-60' : ''}`}
                                    onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src = menuImageUrl(null);
                                    }}
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-md text-text-primary shadow-sm">
                                        {menu.category}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md shadow-sm text-white ${menu.is_active ? 'bg-primary' : 'bg-text-secondary'}`}>
                                        {menu.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>
                            <div className={`p-4 flex-1 flex flex-col ${!menu.is_active && 'opacity-60'}`}>
                                <h3 className="text-lg font-bold text-text-primary mb-1 line-clamp-1">{menu.name}</h3>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-3 flex-1">{menu.description}</p>
                                <p className="text-lg font-bold text-text-primary mb-4 tabular-nums">{formatRupiah(menu.price_idr)}</p>
                                
                                <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
                                    <button 
                                        onClick={() => openModal(menu)}
                                        className="flex-1 py-1.5 text-sm font-semibold text-primary bg-primary-light rounded-md hover:bg-primary/20 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => toggleStatus(menu.id)}
                                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${menu.is_active ? 'text-text-secondary bg-surface hover:bg-border' : 'text-primary bg-primary-light hover:bg-primary/20'}`}
                                    >
                                        {menu.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    </button>
                                    <button 
                                        onClick={() => deleteMenu(menu.id)}
                                        className="p-1.5 text-text-secondary hover:text-error hover:bg-error-light rounded-md transition-colors"
                                        title="Hapus"
                                    >
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
                            <h3 className="text-lg font-bold text-text-primary">
                                {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
                            </h3>
                            <button onClick={closeModal} className="text-text-secondary hover:text-text-primary">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-5 overflow-y-auto">
                            <form id="menu-form" onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Nama Menu</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full h-11 px-3 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                                        placeholder="Contoh: Nasi Goreng Spesial"
                                    />
                                    {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Kategori</label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            className="w-full h-11 px-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                                        >
                                            <option value="">Pilih kategori...</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-error text-sm mt-1">{errors.category_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-1.5">Harga (Rp)</label>
                                        <input
                                            type="number"
                                            value={data.price_idr}
                                            onChange={(e) => setData('price_idr', e.target.value)}
                                            className="w-full h-11 px-3 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                                            placeholder="Contoh: 25000"
                                            min="0"
                                        />
                                        {errors.price_idr && <p className="text-error text-sm mt-1">{errors.price_idr}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Deskripsi Lengkap</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full p-3 border border-border rounded-lg text-sm focus:outline-none focus:border-primary min-h-[100px] resize-y"
                                        placeholder="Jelaskan isi dari menu ini (lauk, sayur, dll)..."
                                    />
                                    {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Foto Menu (Opsional)</label>
                                    <div className="flex items-center gap-3">
                                        {data.image ? (
                                            <div className="text-sm text-primary font-medium flex items-center gap-2">
                                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                                                Foto dipilih
                                            </div>
                                        ) : editingMenu?.image_path ? (
                                            <img src={menuImageUrl(editingMenu.image_path)} alt="Preview" className="h-12 w-16 object-cover rounded border border-border" />
                                        ) : null}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={(e) => selectImage(e.target.files?.[0] || null)}
                                            className="text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary/20"
                                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                        />
                                    </div>
                                    {errors.image && <p className="text-error text-sm mt-1">{errors.image}</p>}
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-5 border-t border-border flex justify-end gap-3 shrink-0 bg-surface rounded-b-xl">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="menu-form"
                                disabled={processing}
                                className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Menu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
