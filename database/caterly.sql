-- Caterly MySQL 8 schema and deterministic demo data.
-- Generated from the Laravel migrations and DatabaseSeeder.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS app_notifications, order_status_events, payment_proofs, invoices,
capacity_reservations, order_items, orders, cart_items, carts, customer_addresses,
menus, merchant_date_capacities, merchant_operating_days, merchant_service_areas,
customer_profiles, merchant_profiles, categories, regions, failed_jobs, job_batches,
jobs, cache_locks, cache, sessions, password_reset_tokens, users, migrations;

CREATE TABLE migrations (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('customer','merchant') NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
    email VARCHAR(255) NOT NULL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    KEY sessions_user_id_index (user_id),
    KEY sessions_last_activity_index (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cache (
    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
    value MEDIUMTEXT NOT NULL,
    expiration BIGINT NOT NULL,
    KEY cache_expiration_index (expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cache_locks (
    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration BIGINT NOT NULL,
    KEY cache_locks_expiration_index (expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jobs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    attempts SMALLINT UNSIGNED NOT NULL,
    reserved_at INT UNSIGNED NULL,
    available_at INT UNSIGNED NOT NULL,
    created_at INT UNSIGNED NOT NULL,
    KEY jobs_queue_index (queue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE job_batches (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INT NOT NULL,
    pending_jobs INT NOT NULL,
    failed_jobs INT NOT NULL,
    failed_job_ids LONGTEXT NOT NULL,
    options MEDIUMTEXT NULL,
    cancelled_at INT NULL,
    created_at INT NOT NULL,
    finished_at INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection VARCHAR(255) NOT NULL,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY failed_jobs_connection_queue_failed_at_index (connection, queue, failed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE regions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    city_name VARCHAR(255) NOT NULL,
    province_name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE merchant_profiles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    description TEXT NULL,
    publication_status ENUM('draft','published') NOT NULL DEFAULT 'draft',
    minimum_portions INT UNSIGNED NOT NULL DEFAULT 10,
    default_daily_capacity INT UNSIGNED NOT NULL DEFAULT 100,
    bank_name VARCHAR(255) NULL,
    bank_account_name VARCHAR(255) NULL,
    bank_account_number VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT merchant_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE customer_profiles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    pic_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT customer_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE merchant_service_areas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    merchant_id BIGINT UNSIGNED NOT NULL,
    region_id BIGINT UNSIGNED NOT NULL,
    delivery_fee INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY merchant_service_areas_merchant_region_unique (merchant_id, region_id),
    CONSTRAINT merchant_service_areas_merchant_id_foreign FOREIGN KEY (merchant_id) REFERENCES users(id),
    CONSTRAINT merchant_service_areas_region_id_foreign FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE merchant_operating_days (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    merchant_id BIGINT UNSIGNED NOT NULL,
    weekday TINYINT UNSIGNED NOT NULL,
    is_open TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY merchant_operating_days_merchant_weekday_unique (merchant_id, weekday),
    CONSTRAINT merchant_operating_days_merchant_id_foreign FOREIGN KEY (merchant_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE merchant_date_capacities (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    merchant_id BIGINT UNSIGNED NOT NULL,
    delivery_date DATE NOT NULL,
    capacity INT UNSIGNED NOT NULL DEFAULT 100,
    reserved_portions INT UNSIGNED NOT NULL DEFAULT 0,
    is_closed TINYINT(1) NOT NULL DEFAULT 0,
    is_override TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY merchant_date_capacities_merchant_date_unique (merchant_id, delivery_date),
    CONSTRAINT merchant_date_capacities_merchant_id_foreign FOREIGN KEY (merchant_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE menus (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    merchant_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    image_path VARCHAR(255) NULL,
    price_idr INT UNSIGNED NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    KEY menus_merchant_active_category_index (merchant_id, is_active, category_id),
    CONSTRAINT menus_merchant_id_foreign FOREIGN KEY (merchant_id) REFERENCES users(id),
    CONSTRAINT menus_category_id_foreign FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE customer_addresses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    region_id BIGINT UNSIGNED NOT NULL,
    label VARCHAR(255) NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    notes TEXT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT customer_addresses_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT customer_addresses_region_id_foreign FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE carts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL UNIQUE,
    merchant_id BIGINT UNSIGNED NULL,
    delivery_date DATE NULL,
    region_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT carts_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT carts_merchant_id_foreign FOREIGN KEY (merchant_id) REFERENCES users(id),
    CONSTRAINT carts_region_id_foreign FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    menu_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY cart_items_cart_menu_unique (cart_id, menu_id),
    CONSTRAINT cart_items_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT cart_items_menu_id_foreign FOREIGN KEY (menu_id) REFERENCES menus(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    customer_id BIGINT UNSIGNED NOT NULL,
    merchant_id BIGINT UNSIGNED NOT NULL,
    region_id BIGINT UNSIGNED NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_slot VARCHAR(30) NOT NULL DEFAULT '11:00-12:00 WIB',
    order_status ENUM('pending_confirmation','accepted','rejected','cancelled','expired','preparing','delivering','completed') NOT NULL DEFAULT 'pending_confirmation',
    payment_status ENUM('unpaid','pending_review','paid') NOT NULL DEFAULT 'unpaid',
    total_portions INT UNSIGNED NOT NULL,
    subtotal_idr BIGINT UNSIGNED NOT NULL,
    delivery_fee_idr INT UNSIGNED NOT NULL,
    total_idr BIGINT UNSIGNED NOT NULL,
    expires_at TIMESTAMP NULL,
    notes TEXT NULL,
    customer_snapshot JSON NOT NULL,
    merchant_snapshot JSON NOT NULL,
    address_snapshot JSON NOT NULL,
    bank_snapshot JSON NULL,
    idempotency_key VARCHAR(64) NULL,
    request_fingerprint VARCHAR(64) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY orders_customer_idempotency_unique (customer_id, idempotency_key),
    KEY orders_merchant_delivery_status_index (merchant_id, delivery_date, order_status),
    KEY orders_customer_created_index (customer_id, created_at),
    KEY orders_status_expires_index (order_status, expires_at),
    CONSTRAINT orders_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT orders_merchant_id_foreign FOREIGN KEY (merchant_id) REFERENCES users(id),
    CONSTRAINT orders_region_id_foreign FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    menu_id BIGINT UNSIGNED NULL,
    menu_name_snapshot VARCHAR(100) NOT NULL,
    category_snapshot VARCHAR(255) NULL,
    unit_price_idr INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    line_total_idr BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT order_items_menu_id_foreign FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE capacity_reservations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL UNIQUE,
    capacity_date_id BIGINT UNSIGNED NOT NULL,
    portions INT UNSIGNED NOT NULL,
    released_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT capacity_reservations_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT capacity_reservations_capacity_date_id_foreign FOREIGN KEY (capacity_date_id) REFERENCES merchant_date_capacities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invoices (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL UNIQUE,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    issued_at TIMESTAMP NOT NULL,
    status ENUM('issued','void') NOT NULL DEFAULT 'issued',
    voided_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT invoices_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payment_proofs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    storage_path VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NULL,
    mime_type VARCHAR(50) NOT NULL,
    status ENUM('submitted','approved','rejected') NOT NULL DEFAULT 'submitted',
    submitted_by BIGINT UNSIGNED NOT NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT payment_proofs_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT payment_proofs_submitted_by_foreign FOREIGN KEY (submitted_by) REFERENCES users(id),
    CONSTRAINT payment_proofs_reviewed_by_foreign FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_status_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    from_status VARCHAR(255) NULL,
    to_status VARCHAR(255) NOT NULL,
    actor_id BIGINT UNSIGNED NULL,
    reason TEXT NULL,
    event_key VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    CONSTRAINT order_status_events_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT order_status_events_actor_id_foreign FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE app_notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    resource_type VARCHAR(50) NULL,
    resource_id BIGINT UNSIGNED NULL,
    event_key VARCHAR(100) NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY app_notifications_user_event_unique (user_id, event_key),
    KEY app_notifications_user_read_index (user_id, read_at),
    CONSTRAINT app_notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO migrations (migration, batch) VALUES
('0001_01_01_000000_create_users_table', 1),
('0001_01_01_000001_create_cache_table', 1),
('0001_01_01_000002_create_jobs_table', 1),
('2026_09_11_000001_create_caterly_tables', 1);

INSERT INTO regions (id, code, city_name, province_name) VALUES
(1, 'JAMBI', 'Kota Jambi', 'Jambi'),
(2, 'JAKPUS', 'Jakarta Pusat', 'DKI Jakarta'),
(3, 'JAKSEL', 'Jakarta Selatan', 'DKI Jakarta'),
(4, 'BDGKOTA', 'Kota Bandung', 'Jawa Barat'),
(5, 'SBYKT', 'Kota Surabaya', 'Jawa Timur');

INSERT INTO categories (id, name, slug) VALUES
(1, 'Nasi Box', 'nasi-box'),
(2, 'Menu Nusantara', 'menu-nusantara'),
(3, 'Vegetarian', 'vegetarian'),
(4, 'Snack Box', 'snack-box'),
(5, 'Prasmanan', 'prasmanan');

INSERT INTO users (id, name, email, role, company_name, phone, password, created_at, updated_at) VALUES
(1, 'Dapur Selaras', 'dapur@caterly.test', 'merchant', 'Dapur Selaras', '081234567890', '$2y$10$VrQjM.QSnd830rox2DUgae4Ow96WJ9FnHqtOnwOWEGD3LZN7uqRvu', NOW(), NOW()),
(2, 'Sajian Ibu', 'sajian@caterly.test', 'merchant', 'Sajian Ibu', '082345678901', '$2y$10$VrQjM.QSnd830rox2DUgae4Ow96WJ9FnHqtOnwOWEGD3LZN7uqRvu', NOW(), NOW()),
(3, 'Faza', 'faza@caterly.test', 'customer', 'PT Sinar Karya', '081122334455', '$2y$10$VrQjM.QSnd830rox2DUgae4Ow96WJ9FnHqtOnwOWEGD3LZN7uqRvu', NOW(), NOW()),
(4, 'Budi', 'budi@caterly.test', 'customer', 'CV Maju Bersama', '081566778899', '$2y$10$VrQjM.QSnd830rox2DUgae4Ow96WJ9FnHqtOnwOWEGD3LZN7uqRvu', NOW(), NOW());

INSERT INTO merchant_profiles
(id, user_id, company_name, address, phone, description, publication_status, minimum_portions, default_daily_capacity, bank_name, bank_account_name, bank_account_number, created_at, updated_at) VALUES
(1, 1, 'Dapur Selaras', 'Jl. Sultan Thaha No. 42, Kota Jambi', '081234567890', 'Katering makan siang untuk kantor dengan menu masakan Nusantara segar setiap hari.', 'published', 10, 100, 'Bank Demo', 'CV Dapur Selaras', '1234567890 (DEMO)', NOW(), NOW()),
(2, 2, 'Sajian Ibu', 'Jl. Kapten Pattimura No. 15, Kota Jambi', '082345678901', 'Masakan rumahan khas ibu dengan cita rasa otentik dan porsi mengenyangkan.', 'published', 15, 80, 'Bank Demo', 'UD Sajian Ibu', '0987654321 (DEMO)', NOW(), NOW());

INSERT INTO customer_profiles (id, user_id, company_name, pic_name, phone, created_at, updated_at) VALUES
(1, 3, 'PT Sinar Karya', 'Faza', '081122334455', NOW(), NOW()),
(2, 4, 'CV Maju Bersama', 'Budi', '081566778899', NOW(), NOW());

INSERT INTO merchant_service_areas (id, merchant_id, region_id, delivery_fee, created_at, updated_at) VALUES
(1, 1, 1, 25000, NOW(), NOW()),
(2, 2, 1, 20000, NOW(), NOW());

INSERT INTO merchant_operating_days (merchant_id, weekday, is_open, created_at, updated_at) VALUES
(1, 0, 0, NOW(), NOW()), (1, 1, 1, NOW(), NOW()), (1, 2, 1, NOW(), NOW()),
(1, 3, 1, NOW(), NOW()), (1, 4, 1, NOW(), NOW()), (1, 5, 1, NOW(), NOW()),
(1, 6, 0, NOW(), NOW()), (2, 0, 0, NOW(), NOW()), (2, 1, 1, NOW(), NOW()),
(2, 2, 1, NOW(), NOW()), (2, 3, 1, NOW(), NOW()), (2, 4, 1, NOW(), NOW()),
(2, 5, 1, NOW(), NOW()), (2, 6, 0, NOW(), NOW());

INSERT INTO menus
(id, merchant_id, category_id, name, description, image_path, price_idr, is_active, created_at, updated_at) VALUES
(1, 1, 1, 'Nasi Ayam Bakar', 'Nasi putih, ayam bakar kecap, lalapan, sambal terasi, dan kerupuk.', NULL, 28000, 1, NOW(), NOW()),
(2, 1, 2, 'Nasi Ikan Sambal', 'Nasi putih, ikan dori goreng, sambal balado, sayur buncis, dan bakwan jagung.', NULL, 30000, 1, NOW(), NOW()),
(3, 1, 1, 'Nasi Rendang Sapi', 'Nasi putih, rendang sapi, sayur nangka, telur balado, dan kerupuk.', NULL, 35000, 1, NOW(), NOW()),
(4, 1, 2, 'Nasi Uduk Komplit', 'Nasi uduk, empal sapi, telur rawis, perkedel, sambal kacang, dan kerupuk.', NULL, 32000, 1, NOW(), NOW()),
(5, 2, 1, 'Nasi Gudeg Yogya', 'Nasi, gudeg nangka muda, telur pindang, krecek, dan sambal goreng.', NULL, 27000, 1, NOW(), NOW()),
(6, 2, 2, 'Nasi Pecel Lele', 'Lele goreng, nasi hangat, sambal lalapan, dan tempe penyet.', NULL, 25000, 1, NOW(), NOW());

INSERT INTO customer_addresses
(id, customer_id, region_id, label, receiver, phone, address, notes, is_default, created_at, updated_at) VALUES
(1, 3, 1, 'Kantor Pusat', 'Faza', '081122334455', 'Jl. Jenderal Sudirman No. 100, Lantai 3, Kota Jambi', 'Masuk dari lobby utama, lift ke lantai 3', 1, NOW(), NOW()),
(2, 4, 1, 'Kantor Cabang', 'Budi', '081566778899', 'Jl. Hayam Wuruk No. 55, Kota Jambi', NULL, 1, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;
