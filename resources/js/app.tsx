import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';
import { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { InteractiveDialogProvider } from '@/Components/InteractiveDialog';
import CelebrationOverlay, { showCelebration } from '@/Components/CelebrationOverlay';
import { PageProps } from '@/types';

router.on('success', (event) => {
    const flash = event.detail.page.props.flash as PageProps['flash'] | undefined;
    const celebration = flash?.celebration ?? event.detail.page.props.celebration as PageProps['celebration'];
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (celebration) showCelebration(celebration);
});

const pages = import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx');

createInertiaApp<PageProps>({
    title: (title) => title ? `${title} - Caterly` : 'Caterly',
    resolve: (name) => {
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) throw new Error(`Halaman Inertia tidak ditemukan: ${name}`);

        return page().then(module => module.default);
    },
    setup({ el, App, props }) {
        if (!el) return;

        createRoot(el).render(
            <InteractiveDialogProvider>
                <CelebrationOverlay initialCelebration={(props.initialPage.props.flash as PageProps['flash'] | undefined)?.celebration ?? props.initialPage.props.celebration as PageProps['celebration']} />
                <Toaster
                    containerStyle={{
                        bottom: 'auto',
                        left: '1rem',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                    gutter={12}
                    position="top-center"
                    toastOptions={{
                        duration: 4000,
                        error: {
                            iconTheme: {
                                primary: '#BA1A1A',
                                secondary: '#FFDAD6',
                            },
                        },
                        style: {
                            background: '#11171E',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '16px',
                            boxShadow: '0 24px 70px rgba(0, 0, 0, 0.28)',
                            color: '#fff',
                            fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            lineHeight: 1.5,
                            maxWidth: 'min(420px, calc(100vw - 2rem))',
                            padding: '14px 16px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#34D399',
                                secondary: '#064E3B',
                            },
                        },
                    }}
                />
                <App {...props} />
            </InteractiveDialogProvider>
        );
    },
    progress: {
        color: '#016039',
        showSpinner: true,
    },
});
