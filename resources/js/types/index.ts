export interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'merchant';
    company_name: string;
}

export interface PageProps {
    [key: string]: unknown;
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
        celebration: CelebrationData | null;
    };
    celebration?: CelebrationData | null;
}

export interface CelebrationData {
    id: string;
    audience: 'customer' | 'merchant';
    title: string;
    message: string;
    order_number?: string | null;
}

export interface Region {
    id: number;
    code: string;
    city_name: string;
    province_name: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    image_path: string | null;
    price_idr: number;
    category: string;
    category_id: number;
    is_active: boolean;
}

export interface MerchantCard {
    id: number;
    company_name: string;
    description: string;
    minimum_portions: number;
    starting_price: number | null;
    delivery_fee: number | null;
    service_area: string | null;
    menu_count: number;
    categories: string[];
    availability: { available: boolean; reason?: string; remaining?: number } | null;
    menus_preview: { id: number; name: string; price_idr: number; image_path: string | null; category: string }[];
}

export interface CartData {
    id: number;
    merchant_id: number;
    merchant_name: string;
    delivery_date: string | null;
    region_id: number | null;
    region_name: string | null;
    delivery_fee: number;
    minimum_portions: number;
    items: CartItemData[];
    total_portions: number;
    subtotal: number;
    checkout_token?: string;
    is_serviceable?: boolean;
}

export interface CartItemData {
    id: number;
    menu_id: number;
    name: string;
    price_idr: number;
    quantity: number;
    is_active: boolean;
    category: string | null;
}

export interface Address {
    id: number;
    label: string;
    receiver: string;
    phone: string;
    address: string;
    notes: string | null;
    is_default: boolean;
    region?: Region;
    region_id: number;
}

export interface CustomerSnapshot {
    name: string;
    email: string;
    phone: string | null;
    company_name: string;
}

export interface MerchantSnapshot {
    name: string;
    company_name: string;
    phone: string | null;
    address: string | null;
}

export interface AddressSnapshot {
    label: string;
    receiver: string;
    phone: string;
    address: string;
    region: string | null;
    notes: string | null;
}

export interface BankSnapshot {
    bank_name: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
}

export interface OrderData {
    id: number;
    order_number: string;
    delivery_date: string;
    delivery_slot: string;
    order_status: string;
    payment_status: string;
    total_portions: number;
    subtotal_idr: number;
    delivery_fee_idr: number;
    total_idr: number;
    expires_at: string | null;
    notes: string | null;
    created_at: string;
    customer_snapshot: CustomerSnapshot;
    merchant_snapshot: MerchantSnapshot;
    address_snapshot: AddressSnapshot;
    bank_snapshot: BankSnapshot | null;
    items: OrderItemData[];
    invoice: InvoiceData | null;
    status_events: StatusEvent[];
    payment_proofs: PaymentProofData[];
}

export interface OrderItemData {
    id: number;
    menu_name_snapshot: string;
    category_snapshot: string;
    unit_price_idr: number;
    quantity: number;
    line_total_idr: number;
}

export interface InvoiceData {
    id: number;
    invoice_number: string;
    issued_at: string;
    status: 'issued' | 'void';
    voided_at: string | null;
}

export interface StatusEvent {
    id: number;
    from_status: string | null;
    to_status: string;
    reason: string | null;
    created_at: string;
}

export interface PaymentProofData {
    id: number;
    amount_idr: number;
    status: 'submitted' | 'approved' | 'rejected';
    original_name: string | null;
    created_at: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export function formatRupiah(amount: number): string {
    return 'Rp' + amount.toLocaleString('id-ID');
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }) + ' WIB';
}

export function deliveryDateInputValue(daysFromToday = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
}

const DEFAULT_MENU_IMAGE_URL = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=85&auto=format&fit=crop';

export function menuImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return DEFAULT_MENU_IMAGE_URL;
    if (/^https?:\/\//i.test(imagePath)) return imagePath;

    return `/storage/${imagePath.replace(/^\/+/, '')}`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
    pending_confirmation: 'Menunggu Konfirmasi',
    accepted: 'Diterima',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
    expired: 'Kedaluwarsa',
    preparing: 'Dipersiapkan',
    delivering: 'Dikirim',
    completed: 'Selesai',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
    unpaid: 'Belum Dibayar',
    pending_review: 'Menunggu Verifikasi',
    partially_paid: 'DP Terverifikasi',
    paid: 'Pembayaran Terverifikasi',
};
