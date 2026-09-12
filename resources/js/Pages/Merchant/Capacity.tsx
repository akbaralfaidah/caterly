import { Head, router } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { PageProps } from '@/types';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface CapacityRecord {
    id: number;
    delivery_date: string;
    capacity: number;
    reserved_portions: number;
    is_closed: boolean;
    is_override: boolean;
}

interface Props extends PageProps {
    default_capacity: number;
    capacities: CapacityRecord[];
    operating_days: { weekday: number; is_open: boolean }[];
}

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function Capacity({ default_capacity, capacities, operating_days }: Props) {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isClosed, setIsClosed] = useState(false);
    const [overrideVal, setOverrideVal] = useState<string>('');
    const [modalOpen, setModalOpen] = useState(false);
    const [operatingDays, setOperatingDays] = useState(operating_days);

    const openModal = (dateStr: string) => {
        const record = capacities.find(c => c.delivery_date === dateStr);
        setSelectedDate(dateStr);
        if (record) {
            setIsClosed(record.is_closed);
            setOverrideVal(record.is_override ? record.capacity.toString() : '');
        } else {
            setIsClosed(false);
            setOverrideVal('');
        }
        setModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/merchant/capacity/override', {
            date: selectedDate,
            is_closed: isClosed,
            capacity: overrideVal ? parseInt(overrideVal) : null
        }, {
            preserveScroll: true,
            onSuccess: () => setModalOpen(false),
            onError: errors => toast.error(String(Object.values(errors)[0] || 'Kapasitas gagal disimpan.')),
        });
    };

    const saveOperatingDays = () => {
        router.patch('/merchant/operating-days', { days: operatingDays }, {
            preserveScroll: true,
            onError: errors => toast.error(String(Object.values(errors)[0] || 'Jadwal gagal disimpan.')),
        });
    };

    // Calendar generation for next 30 days
    const today = new Date();
    const days = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        
        const record = capacities.find(c => c.delivery_date === dateStr);
        const maxCap = record?.capacity ?? default_capacity;
        const reserved = record?.reserved_portions ?? 0;
        const closed = record?.is_closed ?? false;

        days.push({
            date: d,
            dateStr,
            maxCap,
            reserved,
            closed,
            available: maxCap - reserved
        });
    }

    return (
        <MerchantLayout title="Jadwal & Kapasitas">
            <Head title="Jadwal & Kapasitas" />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text-primary">Jadwal & Kapasitas Harian</h2>
                    <p className="text-sm text-text-secondary">Pantau sisa kapasitas harian dan atur libur</p>
                </div>
            </div>

            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden p-6 mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                    <p className="text-sm text-text-secondary">Kapasitas Default Harian: <span className="font-bold text-text-primary">{default_capacity} porsi</span></p>
                    <div className="flex gap-4 text-xs font-semibold text-text-secondary">
                        <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-border rounded-sm"></div> Tersedia</span>
                        <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-error-light border border-error rounded-sm"></div> Penuh/Tutup</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {days.map((day, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => openModal(day.dateStr)}
                            className={`p-4 rounded-xl border cursor-pointer hover:border-primary transition-colors ${
                                day.closed || day.available <= 0 ? 'bg-error-light border-error/50' : 'bg-surface border-border'
                            }`}
                        >
                            <p className="text-xs font-bold text-text-secondary mb-1">
                                {day.date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </p>
                            {day.closed ? (
                                <p className="text-error font-bold text-sm">TUTUP</p>
                            ) : (
                                <>
                                    <p className="text-lg font-bold text-text-primary mb-1">
                                        {day.reserved} <span className="text-xs text-text-secondary">/ {day.maxCap}</span>
                                    </p>
                                    <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full ${day.available <= 0 ? 'bg-error' : day.available < (day.maxCap * 0.2) ? 'bg-accent' : 'bg-primary'}`} 
                                            style={{ width: `${day.maxCap > 0 ? Math.min(100, (day.reserved / day.maxCap) * 100) : 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-text-secondary mt-2 text-right">{day.available} sisa</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-border rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                    <div>
                        <h3 className="font-bold text-text-primary">Hari Operasional Mingguan</h3>
                        <p className="text-sm text-text-secondary">Perubahan tidak dapat menutup hari yang sudah memiliki pesanan aktif.</p>
                    </div>
                    <button onClick={saveOperatingDays} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark">
                        Simpan Jadwal
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {operatingDays.map((day, index) => (
                        <label key={day.weekday} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-semibold">
                            <input
                                type="checkbox"
                                checked={day.is_open}
                                onChange={event => setOperatingDays(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, is_open: event.target.checked } : item))}
                                className="rounded text-primary focus:ring-primary"
                            />
                            {dayNames[day.weekday]}
                        </label>
                    ))}
                </div>
            </div>

            {/* Modal Override */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative flex flex-col">
                        <div className="p-5 border-b border-border">
                            <h3 className="text-lg font-bold text-text-primary">Atur Kapasitas</h3>
                            <p className="text-sm text-text-secondary">
                                Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                                <input 
                                    type="checkbox" 
                                    id="is_closed"
                                    checked={isClosed}
                                    onChange={e => setIsClosed(e.target.checked)}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor="is_closed" className="text-sm font-semibold text-text-primary">Tutup pada tanggal ini</label>
                            </div>

                            {!isClosed && (
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Override Kapasitas (Opsional)</label>
                                    <input 
                                        type="number" 
                                        value={overrideVal}
                                        onChange={e => setOverrideVal(e.target.value)}
                                        min="0"
                                        placeholder={`Default: ${default_capacity}`}
                                        className="w-full h-11 px-3 border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
                                    />
                                    <p className="text-xs text-text-secondary mt-1">Kosongkan untuk menggunakan kapasitas default.</p>
                                </div>
                            )}

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 text-sm font-semibold text-text-secondary bg-surface rounded-lg">
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 py-2 text-sm font-semibold text-white bg-primary rounded-lg">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
