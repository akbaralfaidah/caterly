import { AlertTriangle, CheckCircle2, CircleHelp, Info, X } from 'lucide-react';
import {
    createContext,
    FormEvent,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';

type DialogMode = 'alert' | 'confirm' | 'prompt';
type DialogTone = 'primary' | 'danger' | 'warning' | 'success';
type DialogResult = boolean | string | null;

export interface DialogOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: DialogTone;
}

export interface PromptDialogOptions extends DialogOptions {
    defaultValue?: string;
    inputLabel?: string;
    inputType?: 'text' | 'date';
    max?: string;
    min?: string;
    placeholder?: string;
    required?: boolean;
}

interface DialogRequest {
    id: number;
    mode: DialogMode;
    options: DialogOptions | PromptDialogOptions;
    resolve: (value: DialogResult) => void;
}

interface InteractiveDialogContextValue {
    alert: (options: DialogOptions) => Promise<void>;
    confirm: (options: DialogOptions) => Promise<boolean>;
    prompt: (options: PromptDialogOptions) => Promise<string | null>;
}

const InteractiveDialogContext = createContext<InteractiveDialogContextValue | null>(null);

const toneStyles = {
    primary: {
        button: 'bg-primary text-white shadow-primary/25 hover:bg-primary-dark focus-visible:ring-primary/30',
        icon: CircleHelp,
        iconContainer: 'bg-primary-light text-primary',
    },
    danger: {
        button: 'bg-error text-white shadow-error/25 hover:bg-red-700 focus-visible:ring-error/30',
        icon: AlertTriangle,
        iconContainer: 'bg-error-light text-error',
    },
    warning: {
        button: 'bg-accent text-white shadow-accent/25 hover:bg-accent-dark focus-visible:ring-accent/30',
        icon: AlertTriangle,
        iconContainer: 'bg-accent-light text-accent-dark',
    },
    success: {
        button: 'bg-primary text-white shadow-primary/25 hover:bg-primary-dark focus-visible:ring-primary/30',
        icon: CheckCircle2,
        iconContainer: 'bg-primary-light text-primary',
    },
} satisfies Record<DialogTone, {
    button: string;
    icon: typeof Info;
    iconContainer: string;
}>;

let dialogSequence = 0;

export function InteractiveDialogProvider({ children }: { children: ReactNode }) {
    const [activeDialog, setActiveDialog] = useState<DialogRequest | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const activeDialogRef = useRef<DialogRequest | null>(null);
    const isClosingRef = useRef(false);
    const queueRef = useRef<DialogRequest[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    const presentNextDialog = useCallback(() => {
        if (activeDialogRef.current) {
            return;
        }

        const nextDialog = queueRef.current.shift();
        if (!nextDialog) {
            return;
        }

        activeDialogRef.current = nextDialog;
        const promptOptions = nextDialog.mode === 'prompt'
            ? nextDialog.options as PromptDialogOptions
            : null;

        setInputValue(promptOptions?.defaultValue ?? '');
        setActiveDialog(nextDialog);
    }, []);

    const enqueueDialog = useCallback((
        mode: DialogMode,
        options: DialogOptions | PromptDialogOptions,
        resolve: (value: DialogResult) => void,
    ) => {
        queueRef.current.push({
            id: ++dialogSequence,
            mode,
            options,
            resolve,
        });
        presentNextDialog();
    }, [presentNextDialog]);

    const alert = useCallback((options: DialogOptions): Promise<void> => (
        new Promise((resolve) => {
            enqueueDialog('alert', options, () => resolve());
        })
    ), [enqueueDialog]);

    const confirm = useCallback((options: DialogOptions): Promise<boolean> => (
        new Promise((resolve) => {
            enqueueDialog('confirm', options, (value) => resolve(value === true));
        })
    ), [enqueueDialog]);

    const prompt = useCallback((options: PromptDialogOptions): Promise<string | null> => (
        new Promise((resolve) => {
            enqueueDialog('prompt', options, (value) => resolve(typeof value === 'string' ? value : null));
        })
    ), [enqueueDialog]);

    const settleDialog = useCallback((result: DialogResult) => {
        const dialog = activeDialogRef.current;
        if (!dialog || isClosingRef.current) {
            return;
        }

        isClosingRef.current = true;
        setIsClosing(true);
        window.setTimeout(() => {
            dialog.resolve(result);
            activeDialogRef.current = null;
            isClosingRef.current = false;
            setActiveDialog(null);
            setIsClosing(false);
            window.setTimeout(presentNextDialog, 0);
        }, 160);
    }, [presentNextDialog]);

    useEffect(() => {
        if (!activeDialog) {
            return;
        }

        const previouslyFocused = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const focusTimer = window.setTimeout(() => {
            if (activeDialog.mode === 'prompt') {
                inputRef.current?.focus();
                inputRef.current?.select();
                return;
            }

            if (activeDialog.options.tone === 'danger' && activeDialog.mode === 'confirm') {
                cancelButtonRef.current?.focus();
                return;
            }

            confirmButtonRef.current?.focus();
        }, 40);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                settleDialog(activeDialog.mode === 'prompt' ? null : false);
                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const focusableElements = Array.from(
                panelRef.current?.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
                ) ?? [],
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements.at(-1);

            if (!firstElement || !lastElement) {
                return;
            }

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [activeDialog, settleDialog]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!activeDialog) {
            return;
        }

        if (activeDialog.mode === 'prompt') {
            const options = activeDialog.options as PromptDialogOptions;
            const value = inputValue.trim();

            if (options.required !== false && value === '') {
                inputRef.current?.focus();
                return;
            }

            settleDialog(value);
            return;
        }

        settleDialog(true);
    };

    const handleCancel = () => {
        settleDialog(activeDialog?.mode === 'prompt' ? null : false);
    };

    const contextValue = {
        alert,
        confirm,
        prompt,
    };

    const modal = activeDialog ? (() => {
        const tone = activeDialog.options.tone ?? 'primary';
        const styles = toneStyles[tone];
        const Icon = styles.icon;
        const promptOptions = activeDialog.mode === 'prompt'
            ? activeDialog.options as PromptDialogOptions
            : null;
        const isInputInvalid = activeDialog.mode === 'prompt'
            && promptOptions?.required !== false
            && inputValue.trim() === '';

        return createPortal(
            <div
                className="caterly-dialog-backdrop fixed inset-0 z-[10000] flex max-w-[100vw] touch-pan-y items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain bg-[#07130e]/60 p-4 backdrop-blur-sm sm:p-6"
                data-closing={isClosing}
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget && activeDialog.mode !== 'alert') {
                        handleCancel();
                    }
                }}
            >
                <section
                    aria-describedby={descriptionId}
                    aria-labelledby={titleId}
                    aria-modal="true"
                    className="caterly-dialog-panel relative max-h-[calc(100dvh-2rem)] min-w-0 w-full max-w-[min(28rem,calc(100vw-2rem))] touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain rounded-3xl border border-white/70 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
                    data-closing={isClosing}
                    key={activeDialog.id}
                    ref={panelRef}
                    role={activeDialog.mode === 'alert' ? 'alertdialog' : 'dialog'}
                >
                    <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 blur-3xl" />
                    <form className="relative min-w-0 p-5 sm:p-7" onSubmit={handleSubmit}>
                        <div className="flex items-start justify-between gap-4">
                            <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconContainer}`}>
                                <Icon aria-hidden="true" className="size-6" strokeWidth={2.25} />
                            </div>
                            {activeDialog.mode !== 'alert' && (
                                <button
                                    aria-label="Tutup dialog"
                                    className="flex size-10 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface hover:text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                                    onClick={handleCancel}
                                    type="button"
                                >
                                    <X aria-hidden="true" className="size-5" />
                                </button>
                            )}
                        </div>

                        <div className="mt-5">
                            <h2 className="break-words text-xl font-extrabold tracking-tight text-text-primary [overflow-wrap:anywhere] sm:text-2xl" id={titleId}>
                                {activeDialog.options.title}
                            </h2>
                            <p className="mt-2 break-words text-sm leading-6 text-text-secondary [overflow-wrap:anywhere] sm:text-[15px]" id={descriptionId}>
                                {activeDialog.options.message}
                            </p>
                        </div>

                        {promptOptions && (
                            <label className="mt-5 block">
                                <span className="mb-2 block text-sm font-bold text-text-primary">
                                    {promptOptions.inputLabel ?? 'Jawaban'}
                                </span>
                                <input
                                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-base text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    max={promptOptions.max}
                                    min={promptOptions.min}
                                    onChange={(event) => setInputValue(event.target.value)}
                                    placeholder={promptOptions.placeholder}
                                    ref={inputRef}
                                    required={promptOptions.required !== false}
                                    type={promptOptions.inputType ?? 'text'}
                                    value={inputValue}
                                />
                            </label>
                        )}

                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            {activeDialog.mode !== 'alert' && (
                                <button
                                    className="min-h-12 rounded-xl border border-border bg-white px-5 py-3 text-sm font-bold text-text-primary transition hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 sm:min-w-28"
                                    onClick={handleCancel}
                                    ref={cancelButtonRef}
                                    type="button"
                                >
                                    {activeDialog.options.cancelLabel ?? 'Batal'}
                                </button>
                            )}
                            <button
                                className={`min-h-12 rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:min-w-28 ${styles.button}`}
                                disabled={isInputInvalid || isClosing}
                                ref={confirmButtonRef}
                                type="submit"
                            >
                                {activeDialog.options.confirmLabel ?? (activeDialog.mode === 'alert' ? 'Mengerti' : 'Lanjutkan')}
                            </button>
                        </div>
                    </form>
                </section>
            </div>,
            document.body,
        );
    })() : null;

    return (
        <InteractiveDialogContext.Provider value={contextValue}>
            {children}
            {modal}
        </InteractiveDialogContext.Provider>
    );
}

export function useInteractiveDialog(): InteractiveDialogContextValue {
    const context = useContext(InteractiveDialogContext);

    if (!context) {
        throw new Error('useInteractiveDialog harus digunakan di dalam InteractiveDialogProvider.');
    }

    return context;
}
