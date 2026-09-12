import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { PageProps } from '@/types';

router.on('success', (event) => {
    const flash = event.detail.page.props.flash as PageProps['flash'] | undefined;
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
});

const pages = import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx');

createInertiaApp<PageProps>({
    title: (title) => title ? `${title} — Caterly` : 'Caterly',
    resolve: (name) => {
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) throw new Error(`Halaman Inertia tidak ditemukan: ${name}`);

        return page().then(module => module.default);
    },
    setup({ el, App, props }) {
        if (!el) return;

        createRoot(el).render(
            <>
                <Toaster position="top-right" toastOptions={{
                    duration: 4000,
                    style: {
                        borderRadius: '10px',
                        background: '#11171E',
                        color: '#fff',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    },
                }} />
                <App {...props} />
            </>
        );
    },
    progress: {
        color: '#016039',
        showSpinner: true,
    },
});
