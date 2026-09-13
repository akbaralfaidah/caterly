import { useInteractiveDialog } from '@/Components/InteractiveDialog';
import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

interface LogoutButtonProps {
    className?: string;
}

export default function LogoutButton({ className = '' }: LogoutButtonProps) {
    const { confirm: confirmDialog } = useInteractiveDialog();
    const [processing, setProcessing] = useState(false);

    const logout = async () => {
        if (processing) {
            return;
        }

        const confirmed = await confirmDialog({
            title: 'Keluar dari akun?',
            message: 'Sesi Anda akan diakhiri. Pastikan semua perubahan sudah tersimpan sebelum keluar.',
            confirmLabel: 'Ya, keluar',
            cancelLabel: 'Tetap masuk',
            tone: 'danger',
        });

        if (!confirmed) {
            return;
        }

        router.post('/logout', {}, {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <button
            type="button"
            onClick={logout}
            disabled={processing}
            className={`inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-error/20 disabled:cursor-wait disabled:opacity-60 ${className}`}
            aria-label={processing ? 'Sedang keluar dari akun' : 'Keluar dari akun'}
        >
            <LogOut aria-hidden="true" className={`h-4 w-4 ${processing ? 'animate-pulse' : ''}`} />
            <span>{processing ? 'Keluar...' : 'Keluar'}</span>
        </button>
    );
}
