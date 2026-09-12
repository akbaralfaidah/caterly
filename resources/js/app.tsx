import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

router.on('success', (event) => {
    const flash = (event.detail.page.props as any).flash;
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
});

createInertiaApp({
    title: (title) => title ? `${title} — Caterly` : 'Caterly',
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx')
        ),
    setup({ el, App, props }) {
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