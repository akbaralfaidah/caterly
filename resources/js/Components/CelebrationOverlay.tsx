import { CelebrationData } from '@/types';
import { CSSProperties, useCallback, useEffect, useState } from 'react';

const CELEBRATION_EVENT = 'caterly:celebration';

export function showCelebration(celebration: CelebrationData): void {
    window.dispatchEvent(new CustomEvent<CelebrationData>(CELEBRATION_EVENT, { detail: celebration }));
}

export default function CelebrationOverlay({ initialCelebration }: { initialCelebration?: CelebrationData | null }) {
    const [celebration, setCelebration] = useState<CelebrationData | null>(null);

    const openCelebration = useCallback((nextCelebration: CelebrationData | null | undefined) => {
        if (!nextCelebration) return;

        const storageKey = `caterly-celebration:${nextCelebration.id}`;
        if (window.localStorage.getItem(storageKey)) return;

        window.localStorage.setItem(storageKey, new Date().toISOString());
        setCelebration(nextCelebration);
    }, []);

    useEffect(() => {
        openCelebration(initialCelebration);

        const handleCelebration = (event: Event) => {
            openCelebration((event as CustomEvent<CelebrationData>).detail);
        };

        window.addEventListener(CELEBRATION_EVENT, handleCelebration);

        return () => window.removeEventListener(CELEBRATION_EVENT, handleCelebration);
    }, [initialCelebration, openCelebration]);

    useEffect(() => {
        if (!celebration) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const timeout = window.setTimeout(() => setCelebration(null), 7000);
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setCelebration(null);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.clearTimeout(timeout);
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [celebration]);

    if (!celebration) return null;

    return (
        <div className="caterly-celebration fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#059669_0%,#016039_45%,#003820_100%)] px-5 py-8 text-white" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
            <div className="absolute inset-0 opacity-30" aria-hidden="true">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200 blur-3xl" />
                <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-orange-300 blur-3xl" />
            </div>

            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                {Array.from({ length: 32 }, (_, index) => (
                    <span
                        key={index}
                        className="caterly-confetti absolute block h-3 w-2 rounded-sm"
                        style={{
                            '--confetti-color': ['#FBBF24', '#FB7185', '#6EE7B7', '#93C5FD', '#FFFFFF'][index % 5],
                            '--confetti-delay': `${(index % 8) * 0.12}s`,
                            '--confetti-left': `${3 + ((index * 29) % 94)}%`,
                            '--confetti-drift': `${-90 + ((index * 47) % 180)}px`,
                            '--confetti-duration': `${2.6 + (index % 5) * 0.35}s`,
                        } as CSSProperties}
                    />
                ))}
            </div>

            <button type="button" onClick={() => setCelebration(null)} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-2xl font-light text-white backdrop-blur transition hover:scale-105 hover:bg-white/20 sm:right-7 sm:top-7" aria-label="Tutup animasi">
                ×
            </button>

            <div className="caterly-celebration-card relative z-10 w-full max-w-2xl text-center">
                <div className="caterly-celebration-icon mx-auto mb-7 grid h-28 w-28 place-items-center rounded-full border-[6px] border-white/30 bg-white text-6xl text-primary shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:h-36 sm:w-36 sm:text-7xl">
                    ✓
                </div>
                <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.28em] text-emerald-100 sm:text-base">Pesanan berhasil</p>
                <h2 id="celebration-title" className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{celebration.title}</h2>
                <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-emerald-50 sm:text-2xl">{celebration.message}</p>
                {celebration.order_number && (
                    <p className="mt-6 inline-flex rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-bold tracking-wide backdrop-blur sm:text-base">
                        {celebration.order_number}
                    </p>
                )}
                <button type="button" onClick={() => setCelebration(null)} className="mx-auto mt-8 block rounded-2xl bg-white px-8 py-3.5 text-base font-extrabold text-primary shadow-xl transition hover:-translate-y-1 hover:shadow-2xl sm:px-10">
                    Lanjutkan
                </button>
            </div>
        </div>
    );
}
