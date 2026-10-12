# Phase 4 — Database Design: Indeks Dokumen

**Proyek:** Harmoni Clothing Website

Dokumen ini adalah peta navigasi untuk 5 dokumen Phase 4. Gunakan ini untuk menemukan "informasi X ada di dokumen mana" tanpa perlu membuka semua file satu per satu.

---

## Daftar Dokumen

| # | Dokumen | File | Isi Singkat |
|---|---|---|---|
| 4.1 | Entity Identification | Bagian 4.1 | 24 entitas, dikelompokkan 5 cluster (Identity, Catalog, Commerce, Feedback & Earnings, Support), kepemilikan data. Ini adalah **dokumen akar Phase 4**, seluruh dokumen lain merujuk ke sini. |
| 4.2 | ERD | Bagian 4.2 | Diagram relasi per cluster, tabel cardinality, aturan relasi. |
| 4.3 | Table Design | Bagian 4.3 | Kolom lengkap 24 tabel, PK/FK, index strategy, constraint, soft delete strategy. |
| 4.4 | Validation Rules | Bagian 4.4 | Validasi entitas & bisnis, seluruhnya ditautkan balik ke FR/BR/NFR Phase 1. |
| 4.5 | Migration Plan | Bagian 4.5 | Urutan migration, seeder, factory, rollback strategy — file migration nyata dibuat di Phase 7. |

---

## Dokumen Terkait

[[Phase 4 - Database Design#4.1 Entity Identification — Harmoni Clothing|4.1 Entity Identification]], [[Phase 4 - Database Design#4.2 ERD — Harmoni Clothing|4.2 ERD]], [[Phase 4 - Database Design#4.3 Table Design — Harmoni Clothing|4.3 Table Design]], [[Phase 4 - Database Design#4.4 Validation Rules — Harmoni Clothing|4.4 Validation Rules]], [[Phase 4 - Database Design#4.5 Migration Plan — Harmoni Clothing|4.5 Migration Plan]]

---

*Dokumen ini mengikuti template Phase 4 yang telah ditetapkan (`Phase 4.md`), diturunkan dari Phase 1 (Requirement Gathering, Feature List), Phase 2 (User Roles, User Flow, Permission Matrix), dan Phase 3 (System Architecture, Module Breakdown, Folder Structure).*

---

# 4.1 Entity Identification — Harmoni Clothing

**Output:** Bagian 4.1
**Tujuan:** Mengidentifikasi seluruh entitas dalam sistem.
**Referensi:** [[Phase 3 - System Architecture#3.3 Module Breakdown — Harmoni Clothing|3.3 Module Breakdown]]
**Digunakan Oleh:** [[Phase 4 - Database Design#4.2 ERD — Harmoni Clothing|4.2 ERD]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

25 entitas diidentifikasi dari 57 fitur Master Feature List (1.5), 20 flow di User Flow (2.3), dan Module Breakdown (3.3). Setiap entitas dipetakan ke tepat satu modul pemilik.

---

### 2–3. Entity List & Description

| Entitas | Modul Pemilik | Deskripsi |
|---|---|---|
| `users` | Authentication | Akun dasar — basis semua role kecuali Guest (BR-013). Kolom `role` (customer/admin) menandai akun operasional Admin; status Creator tetap ditentukan lewat keberadaan baris `creator_profiles` (existence-based), bukan kolom ini. |
| `creator_profiles` | Creator Management | Data KYC & status Creator, 1:1 opsional dari `users`. |
| `addresses` | User Management | Address Book (FR-048). |
| `password_reset_tokens` | Authentication | Token reset password sementara (FR-003), key by email — standar Laravel, bukan FK ke `users.id`. |
| `categories` | Product Catalog | Kategori produk/desain, dwibahasa (NFR-008). |
| `products` | Product Catalog | Blank product / Katalog Produk. |
| `product_variants` | Product Catalog | Kombinasi warna/ukuran/potongan + aset mockup 3D per varian. |
| `designs` | Marketplace / Creator Management | Desain yang diunggah Creator. |
| `design_product` | Creator Management | Pivot: apparel kompatibel per desain (FR-022/037). |
| `bulk_pricing_tiers` | Order Management | Tingkat harga per-kuantitas Bulk Order (BR-012) — satu skema **global** untuk seluruh produk (bukan per-produk/kategori), demi kesederhanaan MVP sesuai Constraints (Project Brief 1.1 Bagian 15). |
| `cart_items` | Order Management | Isi keranjang, harga terkunci (BR-025). |
| `wishlists` | Order Management | Produk/desain favorit (FE-030, badge tidak tersedia — BR-024). |
| `orders` | Order Management | Entitas transaksi utama, reguler & bulk (BR-026). |
| `order_items` | Order Management | Baris item per order (varian + desain). |
| `payments` | Payment | Transaksi Midtrans per order. |
| `invoices` | Payment | Invoice otomatis pasca-bayar (FR-018). |
| `shipments` | Shipping | Data pengiriman & resi Biteship. |
| `order_status_histories` | Order Management | Riwayat perubahan status — audit & timeline tracking. |
| `reviews` | Review & Rating | Rating & ulasan pasca "Selesai", per item bukan per order (BR-004). |
| `commissions` | Creator Management | Komisi per order item (BR-007/020). |
| `chat_threads` | Communication | Sesi chat Customer↔Admin. |
| `chat_messages` | Communication | Pesan dalam thread. |
| `notifications` | Notification | Notifikasi in-app per user (BR-027). |
| `notification_settings` | Notification | Konfigurasi jenis notifikasi aktif (FE-038), global — bukan per-user. |
| `audit_logs` | Admin Dashboard | Log aksi Admin (Permission Matrix 2.5 Bagian 10). |

---

### 4. Relationships Overview

Lima cluster: **Identity** (users, creator_profiles, addresses, password_reset_tokens) → **Catalog** (categories, products, product_variants, designs, design_product) → **Commerce** (bulk_pricing_tiers, cart_items, wishlists, orders, order_items, payments, invoices, shipments, order_status_histories) → **Feedback & Earnings** (reviews, commissions) → **Support** (chat_threads, chat_messages, notifications, notification_settings, audit_logs). Detail relasi & cardinality: lihat ERD (4.2).

---

### 5. Entity Ownership

Data milik Customer/Creator (addresses, cart_items, wishlists, orders miliknya, designs miliknya) tunduk pada scope `own` di Permission Matrix (2.5 Bagian 2) — divalidasi di layer Policy, bukan hanya query filter. Admin memiliki scope `all` untuk seluruh entitas operasional.

---

### 6. Notes

Konten dwibahasa (NFR-008) ditangani dengan kolom ganda (`name_id`/`name_en`) pada `categories` dan `products` — bukan tabel translasi polymorphic terpisah, supaya tidak over-engineer untuk timeline 1 bulan. Data sensitif (`creator_profiles.kyc_*`, `addresses.address_line`) dienkripsi at-rest sesuai NFR-011.

---

### Dependencies

**Depends On**

- Module Breakdown

**Used By**

- ERD
- Table Design

---

# 4.2 ERD — Harmoni Clothing

**Output:** Bagian 4.2
**Tujuan:** Membuat hubungan antar entitas.
**Referensi:** [[Phase 4 - Database Design#4.1 Entity Identification — Harmoni Clothing|4.1 Entity Identification]]
**Digunakan Oleh:** [[Phase 4 - Database Design#4.3 Table Design — Harmoni Clothing|4.3 Table Design]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1–2. Overview & Conceptual ERD

```
CLUSTER: IDENTITY
  users ──1:1(opsional)── creator_profiles
  users ──1:N── addresses
  password_reset_tokens (standalone, key by email — bukan FK ke users.id, mengikuti default Laravel)

CLUSTER: CATALOG
  categories ──1:N── products ──1:N── product_variants
  users(creator) ──1:N── designs ──N:M(design_product)── products
  designs ──N:M(design_tag)── tags   (ditambahkan 2026-07-25, lihat Bagian 6)

CLUSTER: COMMERCE
  users ──1:N── cart_items ──N:1── product_variants
                cart_items ──N:1(opsional)── designs
  users ──1:N── wishlists ──N:1(opsional)── products / designs
  users(customer) ──1:N── orders ──N:1── addresses
  orders ──1:N── order_items ──N:1── product_variants
              order_items ──N:1(opsional)── designs
  orders ──1:N── payments
  orders ──1:1── invoices
  orders ──1:1── shipments
  orders ──1:N── order_status_histories

CLUSTER: FEEDBACK & EARNINGS
  order_items ──1:0..1── reviews ──N:1── users
  users(creator) ──1:N── commissions ──N:1── order_items

CLUSTER: SUPPORT
  users(customer) ──1:N── chat_threads ──1:N── chat_messages ──N:1── users(sender)
  users ──1:N── notifications
  notification_settings (standalone, dikelola Admin)
  users(admin) ──1:N── audit_logs
```

---

### 3–4. Logical ERD & Cardinality

| Relasi | Cardinality | Catatan |
|---|---|---|
| `users` → `creator_profiles` | 1 : 0..1 | Terbentuk saat upgrade disetujui (BR-013, Flow 3). |
| `users` → `addresses` | 1 : N | FR-048. |
| `designs` ↔ `products` | N : M | Via `design_product`, FR-022/037. |
| `designs` ↔ `tags` | N : M | Via `design_tag` (ditambahkan 2026-07-25) — kata kunci bebas untuk filter/search Marketplace Desain. |
| `products` → `product_variants` | 1 : N | Unique(product_id, color, size, cut_type). |
| `orders` → `order_items` | 1 : N | Item Bulk Order = banyak baris (kombinasi ukuran, FR-044). |
| `orders` → `payments` | 1 : N | Retry pembayaran menghasilkan baris baru; status terkini = baris terakhir. |
| `orders` → `invoices` / `shipments` | 1 : 1 | Invoice dibuat setelah bayar; shipment dibuat setelah produksi selesai. |
| `order_items` → `commissions` | 1 : 0..1 | Hanya item dengan `design_id` terisi (desain Creator) yang punya komisi. |
| `order_items` → `reviews` | 1 : 0..1 | Review per item, bukan per order — memungkinkan rating berbeda untuk tiap produk/desain dalam satu order (BR-004). |

---

### 5. Relationship Rules

- Desain di-*soft delete* tidak menghapus `order_items` historis yang mereferensikannya (integritas riwayat transaksi).
- `design_product.preview_confirmed_at` wajib terisi untuk semua baris terkait sebelum `designs.status` dapat diubah dari draft ke "menunggu_approval" (Flow 16, User Flow 2.3).
- Creator yang di-ban: `designs.status` tidak diubah otomatis, tapi query publik memfilter berdasarkan `creator_profiles.status` (BR-019) — desain tidak dihapus, hanya disembunyikan.

---

### 6. Notes

ERD ini konseptual/logis untuk keperluan Table Design (4.3); diagram visual (mis. dbdiagram.io/draw.io) dapat dibuat terpisah saat implementasi bila diperlukan, bukan bagian wajib dokumen ini.

**Change Log (ditambahkan 2026-07-30, Code Audit Batch 7):** relasi `designs` ↔ `tags` (via `design_tag`) ditambahkan — kedua tabel dibuat 2026-07-25, setelah dokumen ERD ini pertama ditulis, untuk mendukung filter Marketplace Desain. Kolom baru lain yang ditambahkan pasca dokumen awal (widening PII, field KYC/payout `creator_profiles`, `commissions.payout_reference`, `products.gender_segment`, `product_variants.print_areas`) tidak mengubah struktur relasi/cardinality di atas — detail kolomnya ada di Bagian 4.3 §9.

---

### Dependencies

**Depends On**

- Entity Identification

**Used By**

- Table Design

---

# 4.3 Table Design — Harmoni Clothing

**Output:** Bagian 4.3
**Tujuan:** Merancang struktur tabel database.
**Referensi:** [[Phase 4 - Database Design#4.2 ERD — Harmoni Clothing|4.2 ERD]]
**Digunakan Oleh:** [[Phase 4 - Database Design#4.4 Validation Rules — Harmoni Clothing|4.4 Validation Rules]], [[Phase 4 - Database Design#4.5 Migration Plan — Harmoni Clothing|4.5 Migration Plan]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

27 tabel (direvisi dari 25 — `tags` dan `design_tag` ditambahkan setelah dokumen awal, lihat Bagian 9). **PK** = primary key, **FK** = foreign key, **ENUM** = nilai tetap. Semua tabel memakai `bigint unsigned` auto-increment untuk `id`, timestamp `created_at`/`updated_at` standar Laravel kecuali disebutkan lain (kecuali `password_reset_tokens`, yang mengikuti struktur default Laravel tanpa `id` auto-increment).

---

### 2. Table List

Identity: `users`, `creator_profiles`, `addresses`, `password_reset_tokens`
Catalog: `categories`, `products`, `product_variants`, `designs`, `design_product`, `tags`, `design_tag`
Commerce: `bulk_pricing_tiers`, `cart_items`, `wishlists`, `orders`, `order_items`, `payments`, `invoices`, `shipments`, `order_status_histories`
Feedback & Earnings: `reviews`, `commissions`
Support: `chat_threads`, `chat_messages`, `notifications`, `notification_settings`, `audit_logs`

---

### 3. Column Definition

#### Cluster: Identity

**users** — akun dasar semua role

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| name | varchar(150) | not null | |
| email | varchar(255) | unique, not null | FR-001 |
| email_verified_at | timestamp | nullable | |
| password | varchar(255) | not null | bcrypt/Argon2 — NFR-003 |
| phone | text encrypted | nullable | dilebarkan dari varchar(20) 2026-07-21 — NFR-011, nilai terenkripsi lebih panjang dari plaintext |
| status | enum | ENUM | aktif, nonaktif, banned |
| role | enum | ENUM, default 'customer' | customer, admin — Creator BUKAN nilai di kolom ini (Creator = existence-based via `creator_profiles.status`, BR-013); `admin` hanya diset lewat provisioning manual, tidak lewat `/auth/register` (2.2 Bagian 8) |
| privacy_accepted_at | timestamp | not null | NFR-012 |
| terms_accepted_at | timestamp | not null | NFR-012 |

**creator_profiles** — KYC & status Creator, 1:1 opsional

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| user_id | bigint unsigned | FK unique | → users.id |
| kyc_full_name | varchar(150) encrypted | not null | NFR-011 |
| kyc_id_number | varchar(100) encrypted | not null | NFR-011 |
| status | enum | ENUM | menunggu_approval, aktif, ditolak, nonaktif, banned |
| rejection_reason | text | nullable | FR-043 pola serupa |
| approved_by | bigint unsigned | FK nullable | → users.id (Admin) |
| approved_at | timestamp | nullable | |
| brand_name | varchar(150) | nullable | ditambahkan 2026-07-22 — nama brand/toko publik Creator |
| bio | text | nullable | ditambahkan 2026-07-22 — bio singkat, ditampilkan di profil publik |
| portfolio_url | varchar(255) | nullable | ditambahkan 2026-07-22 |
| terms_accepted_at | timestamp | nullable | ditambahkan 2026-07-22 — consent Syarat & Ketentuan Creator |
| birth_date | date | nullable | ditambahkan 2026-07-22 — dasar penentuan `is_minor` (guardian consent) |
| address | text encrypted | nullable | ditambahkan 2026-07-22 — NFR-011 |
| ktp_photo_path | varchar(255) | nullable | ditambahkan 2026-07-22 — R2 |
| payout_method | enum | ENUM, nullable | ditambahkan 2026-07-22 — bank_transfer, gopay, ovo, dana, shopeepay |
| payout_account_number | varchar | nullable | ditambahkan 2026-07-22 |
| payout_account_holder | varchar | nullable | ditambahkan 2026-07-22 |
| guardian_name | varchar | nullable | ditambahkan 2026-07-22 — wajib bila Creator di bawah 18 |
| guardian_id_number | varchar | nullable | ditambahkan 2026-07-22 |
| guardian_consent_at | timestamp | nullable | ditambahkan 2026-07-22 — BR-007 payout otomatis mensyaratkan consent wali |

**addresses** — Address Book (FR-048)

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| user_id | bigint unsigned | FK | → users.id |
| label | varchar(50) | not null | "Rumah", "Kampus" |
| recipient_name | text encrypted | not null | dilebarkan dari varchar(150) 2026-07-21 — NFR-011 |
| phone | text encrypted | not null | dilebarkan dari varchar(20) 2026-07-21 — NFR-011 |
| province / city / district | varchar(100) | not null | |
| postal_code | varchar(10) | not null | |
| address_line | text encrypted | not null | NFR-011 |
| is_default | boolean | default false | |

**password_reset_tokens** — token reset password sementara (FR-003)

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| email | varchar(255) | PK | bukan FK — standar migration default Laravel |
| token | varchar(255) | not null | di-hash |
| created_at | timestamp | nullable | dipakai cek kedaluwarsa token (60 menit default Laravel) |

#### Cluster: Catalog

**categories** — kategori produk/desain, dwibahasa

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| name_id / name_en | varchar(100) | not null | NFR-008 |
| slug | varchar(120) | unique | |
| type | enum | ENUM | product, design |

**products** — blank product / Katalog Produk

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| category_id | bigint unsigned | FK nullable | → categories.id |
| name_id / name_en | varchar(150) | not null | NFR-008 |
| description_id / description_en | text | nullable | |
| slug | varchar(180) | unique | 2.1 URL Structure |
| base_price | decimal(12,2) | not null | |
| gender_segment | enum | ENUM, nullable | ditambahkan 2026-07-22 — pria, wanita, unisex, anak; dipakai filter Katalog |
| is_active | boolean | default true | |

**product_variants** — kombinasi warna/ukuran/potongan + mockup 3D

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| product_id | bigint unsigned | FK | → products.id |
| color / size / cut_type / material | varchar | not null | |
| price_modifier | decimal(12,2) | default 0 | |
| mockup_asset_path | varchar(255) | not null | R2, .glb/.gltf — 1.5 Bagian 9 |
| print_areas | json | nullable | ditambahkan 2026-07-22 — area cetak valid per varian, dipakai Product Editor |

*Unique constraint: `(product_id, color, size, cut_type)`.*

**designs** — desain yang diunggah Creator

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| creator_id | bigint unsigned | FK | → users.id |
| category_id | bigint unsigned | FK nullable | → categories.id |
| title | varchar(150) | not null | |
| description | text | nullable | |
| file_path / thumbnail_path | varchar(255) | not null | R2, max 20MB PNG/SVG — 1.5 Bagian 9 |
| status | enum | ENUM | draft, menunggu_approval, aktif, ditolak — BR-002/028 |
| rejection_reason | text | nullable | |
| approved_by / approved_at | FK / timestamp | nullable | → users.id (Admin) |

**design_product** — pivot: apparel kompatibel per desain

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| design_id | bigint unsigned | FK | → designs.id |
| product_id | bigint unsigned | FK | → products.id |
| preview_confirmed_at | timestamp | nullable | FR-037, wajib terisi sebelum submit |

*Unique: `(design_id, product_id)`.*

**tags** — kata kunci bebas untuk pencarian/filter Marketplace Desain (ditambahkan 2026-07-25, tidak ada di rencana 4.2 ERD awal)

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| name | varchar(50) | not null | ditulis Creator saat upload desain |
| slug | varchar(60) | unique | |

**design_tag** — pivot: tag per desain (ditambahkan 2026-07-25)

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| design_id | bigint unsigned | FK, cascade | → designs.id |
| tag_id | bigint unsigned | FK, cascade | → tags.id |

*Unique: `(design_id, tag_id)`.*

#### Cluster: Commerce

**bulk_pricing_tiers** — tingkat harga Bulk Order (BR-012)

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| min_qty | int | not null | |
| max_qty | int | nullable | null = tanpa batas atas |
| price_per_unit | decimal(12,2) | not null | dikelola Admin — FR-031 |

*Catatan: sengaja tidak ada `product_id`/`category_id` — skema tingkat harga ini **global**, berlaku sama untuk seluruh produk di Bulk Order. Keputusan disengaja untuk menyederhanakan admin & UX di MVP (Constraints, Project Brief 1.1 Bagian 15); jika ke depan dibutuhkan tingkat harga berbeda per kategori produk, perlu penambahan kolom scope di Fase 2+.*

**cart_items** — isi keranjang, harga terkunci (BR-025)

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| user_id | bigint unsigned | FK | → users.id |
| product_variant_id | bigint unsigned | FK | → product_variants.id |
| design_id | bigint unsigned | FK nullable | null = mode custom upload sendiri |
| custom_design_file_path | varchar(255) | nullable | mode custom — FR-010 |
| design_position | json | nullable | posisi/rotasi/ukuran di editor |
| quantity | int | not null | |
| notes | text | nullable | catatan pemesanan — FR-013/019 |
| unit_price_snapshot | decimal(12,2) | not null | BR-025 |

**wishlists** — produk/desain favorit

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| user_id | bigint unsigned | FK | → users.id |
| product_id | bigint unsigned | FK nullable | → products.id |
| design_id | bigint unsigned | FK nullable | → designs.id |

*Tidak dihapus otomatis saat item tidak tersedia — badge "Tidak Tersedia" dihitung dari status `products.is_active`/`designs.status` saat query (BR-024), bukan kolom tersendiri.*

**orders** — entitas transaksi utama

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| order_number | varchar(30) | unique | |
| user_id | bigint unsigned | FK | → users.id |
| address_id | bigint unsigned | FK | → addresses.id |
| type | enum | ENUM | reguler, bulk — BR-026 |
| status | enum | ENUM | belum_dibayar, menunggu_approval, diproses_produksi, dikirim, menunggu_konfirmasi, selesai, dibatalkan, ditolak |
| rejection_reason | text | nullable | FR-043 |
| notes | text | nullable | |
| subtotal / shipping_cost / total | decimal(12,2) | not null | |
| courier_company / courier_type | varchar | nullable | Kurir pilihan customer saat checkout (mis. `jnt` / `ez`); dipakai admin sebagai default saat booking — ditambahkan 2026-09 |
| paid_at, production_started_at, shipped_at, delivered_at, confirmed_at, completed_at, cancelled_at | timestamp | nullable | timeline lengkap — 2.3 Bagian 9 |
| cancelled_by | enum | nullable | customer, system |

**order_items** — baris item per order

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| order_id | bigint unsigned | FK | → orders.id |
| product_variant_id | bigint unsigned | FK | → product_variants.id |
| design_id | bigint unsigned | FK nullable | → designs.id |
| custom_design_file_path / design_position | varchar / json | nullable | disalin dari cart_items saat checkout |
| quantity | int | not null | kombinasi ukuran Bulk Order — FR-044 |
| unit_price / subtotal | decimal(12,2) | not null | |

**payments** — transaksi Midtrans per order

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| order_id | bigint unsigned | FK | → orders.id |
| midtrans_transaction_id | varchar(100) | nullable | |
| method | varchar(50) | nullable | |
| amount | decimal(12,2) | not null | |
| status | enum | ENUM | belum_dibayar, berhasil, gagal |
| paid_at | timestamp | nullable | |
| raw_response | json | nullable | payload webhook Midtrans |

**invoices** — invoice otomatis pasca-bayar

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| order_id | bigint unsigned | FK unique | → orders.id — FR-018 |
| invoice_number | varchar(30) | unique | |
| issued_at | timestamp | not null | |

**shipments** — data pengiriman & resi Biteship

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| order_id | bigint unsigned | FK unique | → orders.id |
| biteship_order_id / courier / tracking_number | varchar | nullable | |
| courier_type | varchar | nullable | Layanan kurir (mis. `ez`, `reg`) — ditambahkan 2026-09. `status` kini juga bernilai `bermasalah` (Biteship: onHold/rejected/returned/dst.) |
| status | enum | ENUM | menunggu_pickup, dikirim, delivered, bermasalah |
| shipped_at / delivered_at | timestamp | nullable | trigger BR-014 |

**order_status_histories** — riwayat perubahan status

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| order_id | bigint unsigned | FK | → orders.id |
| from_status | varchar(30) | nullable | |
| to_status | varchar(30) | not null | |
| changed_by | enum | ENUM | customer, admin, system |
| actor_id | bigint unsigned | FK nullable | → users.id |
| reason | text | nullable | wajib diisi untuk reject — FR-043 |

#### Cluster: Feedback & Earnings

**reviews** — rating & ulasan pasca "Selesai", per item (bukan per order)

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| order_item_id | bigint unsigned | FK unique | → order_items.id — 1 review per item; status order induk wajib "selesai" (BR-004) |
| user_id | bigint unsigned | FK | → users.id |
| rating | tinyint | not null | 1–5 |
| comment | text | nullable | |

*Produk/desain yang direview didapat lewat join `order_item.product_variant_id`/`order_item.design_id` — tidak disimpan ulang di sini (menghindari FK ganda yang bisa berbeda dari item aslinya).*

**commissions** — komisi Creator per order item

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| creator_id | bigint unsigned | FK | → users.id |
| order_item_id | bigint unsigned | FK | → order_items.id |
| amount | decimal(12,2) | not null | |
| status | enum | ENUM | terhutang, dibayar, ditahan — BR-007/020 |
| paid_at | timestamp | nullable | pencairan manual Admin |
| payout_reference | varchar(100) | nullable | ditambahkan 2026-07-22 — id transaksi dari provider disbursement, BR-007 payout otomatis |

#### Cluster: Support

**chat_threads** — sesi chat Customer↔Admin

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| customer_id | bigint unsigned | FK | → users.id |
| assigned_admin_id | bigint unsigned | FK nullable | → users.id |
| last_message_at | timestamp | nullable | untuk sorting Chat Management — FE-041 |

**chat_messages** — pesan dalam thread

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| thread_id | bigint unsigned | FK | → chat_threads.id |
| sender_id | bigint unsigned | FK | → users.id |
| sender_role | enum | ENUM | customer, admin |
| message | text | not null | |
| is_read | boolean | default false | |

**notifications** — notifikasi in-app per user

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| user_id | bigint unsigned | FK | → users.id |
| type | varchar(50) | not null | mengacu notification_settings.notification_type |
| title / body | varchar / text | not null | |
| related_type / related_id | varchar / bigint | nullable | polymorphic ringan ke entitas terkait (mis. orders) |
| is_read | boolean | default false | |

**notification_settings** — konfigurasi jenis notifikasi, global bukan per-user

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| notification_type | varchar(50) | unique | FE-038 |
| is_enabled | boolean | default true | diatur Admin |

**audit_logs** — log aksi Admin

| Column | Type | Key/Null | Notes |
|---|---|---|---|
| id | bigint unsigned | PK | |
| actor_id | bigint unsigned | FK | → users.id (Admin) |
| action | varchar(100) | not null | mis. "order.reject", "creator.approve" |
| entity_type / entity_id | varchar / bigint | not null | |
| description | text | nullable | Permission Matrix 2.5 Bagian 10 |

---

### 4. Primary Keys

Seluruh tabel memakai `id` (bigint unsigned, auto-increment) sebagai primary key, kecuali disebutkan lain.

---

### 5. Foreign Keys

Terdaftar per tabel di Bagian 3 (kolom "Key/Null" bertanda FK). Aturan `ON DELETE`: lihat Bagian 7 — Constraints.

---

### 6. Index Strategy

- Index pada seluruh kolom FK (default Laravel saat `foreignId()`).
- Index tambahan: `orders.status`, `orders.order_number`, `designs.status`, `products.slug`, `chat_messages.thread_id + created_at` (untuk pagination chat).

---

### 7. Constraints

- Foreign key `ON DELETE RESTRICT` untuk entitas transaksi (orders, order_items, payments) — mencegah penghapusan data yang masih direferensikan riwayat.
- Foreign key `ON DELETE CASCADE` hanya untuk relasi anak murni tanpa nilai historis sendiri (mis. `chat_messages` saat `chat_threads` dihapus — kasus langka, admin-only).

---

### 8. Soft Delete Strategy

**Soft delete** (kolom `deleted_at`) diterapkan pada: `users`, `products`, `product_variants`, `designs` — entitas yang dapat "dinonaktifkan" tapi wajib tetap dirujuk oleh riwayat transaksi (order_items, wishlists) tanpa error FK. Tabel transaksi (`orders`, `payments`, `order_status_histories`, dst.) tidak memakai soft delete — riwayat transaksi tidak pernah dihapus, hanya berubah status.

---

### 9. Notes

Tipe kolom di dokumen ini adalah tipe logis (MySQL) — mapping ke Eloquent migration (`$table->foreignId()`, `$table->enum()`, dst.) dilakukan saat implementasi nyata di Phase 7, mengikuti Migration Plan (4.5).

**Change Log (ditambahkan 2026-07-30, Code Audit Batch 7):** 8 migration setelah dokumen awal ini belum tercatat sampai sekarang — semua sudah dimasukkan di atas: pelebaran kolom PII (`users.phone`, `addresses.recipient_name`/`phone`) untuk enkripsi (2026-07-21); 13 kolom baru `creator_profiles` untuk KYC lengkap, payout, dan wali/guardian (2026-07-22); `commissions.payout_reference` (2026-07-22); `products.gender_segment` dan `product_variants.print_areas` (2026-07-22); tabel baru `tags` dan `design_tag` (2026-07-25). Satu migration tambahan (`compare_price` di `products`) ditambah lalu dibuang lagi 24 jam kemudian (2026-07-24 → 2026-07-25) — kolom itu **tidak ada** di skema final, sengaja tidak dicantumkan di atas.

---

### Dependencies

**Depends On**

- ERD

**Used By**

- Migration

---

# 4.4 Validation Rules — Harmoni Clothing

**Output:** Bagian 4.4
**Tujuan:** Menentukan validasi data.
**Referensi:** [[Phase 4 - Database Design#4.3 Table Design — Harmoni Clothing|4.3 Table Design]], [[Phase 5 - API & Backend Planning#5.1 Business Rules — Harmoni Clothing|5.1 Business Rules]]
**Digunakan Oleh:** — (dipakai saat CRUD Modules & Form Validation — Phase 7/8, belum dibuat)
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Validasi di dokumen ini adalah turunan langsung dari Acceptance Criteria (1.2 Bagian 8) dan Business Rules (1.2 Bagian 6) — bukan aturan baru. Ditegakkan di layer Form Request (Controller) dan Database Constraint, sesuai NFR-009.

---

### 2. Entity Validation

| Entitas | Rule | Ref |
|---|---|---|
| `users` | Email unik & format valid, password minimum kompleksitas, `privacy_accepted_at`/`terms_accepted_at` wajib terisi sebelum insert. | FR-001, NFR-012 |
| `creator_profiles` | `kyc_full_name` & `kyc_id_number` wajib diisi sebelum status berubah dari null ke "menunggu_approval". | FR-035, BR-008 |
| `designs` | File maksimal 20MB, format PNG/SVG saja. | 1.5 Bagian 9 |
| `design_product` | Seluruh baris terkait satu `design_id` wajib `preview_confirmed_at` terisi sebelum `designs.status` dapat diubah ke "menunggu_approval". | FR-037, Flow 16 |
| `cart_items` / `order_items` | `quantity` ≥ 1. | BR-009 (tidak ada MOQ, tapi tetap ≥1) |
| `orders` | `rejection_reason` wajib not-null saat `status` = "ditolak". | FR-043 |
| `reviews` | Hanya dapat dibuat jika `orders.status` = "selesai" (dicek via `order_item.order_id`); `rating` antara 1–5; satu `order_item_id` maksimal 1 review. | BR-004 |
| `password_reset_tokens` | Token valid maksimal 60 menit sejak `created_at` (default Laravel); dihapus/invalid setelah dipakai sekali (single-use). | FR-003 |

---

### 3. Business Validation

- **Harga terkunci** — `cart_items.unit_price_snapshot` tidak berubah walau `product_variants.price_modifier`/`bulk_pricing_tiers` berubah setelah item ditambahkan. *(BR-025)*
- **Bulk vs reguler** — satu `orders.type` tidak boleh mencampur item bulk & reguler dalam satu order. *(BR-026)*
- **Auto-cancel** — `orders.status` "belum_dibayar" → "dibatalkan" otomatis via Job jika >24 jam sejak `created_at` tanpa `paid_at`. *(BR-017)*
- **Auto-complete** — `orders.status` "menunggu_konfirmasi" → "selesai" otomatis via Job jika >3 hari kerja sejak `shipments.delivered_at` tanpa `confirmed_at`. *(BR-014)*
- **Ban Creator** — Query publik desain memfilter `creator_profiles.status != 'banned'`; commission terkait diberi status "ditahan" jika ban karena hak cipta. *(BR-019, BR-020)*
- **Provisioning Admin** — `users.role = 'admin'` hanya dapat diset lewat proses provisioning manual (seed/database langsung oleh Admin lain), tidak pernah lewat endpoint publik `/auth/register` — `role` default selalu `'customer'` saat registrasi mandiri. *(2.2 Bagian 8)*

---

### 4. Database Constraints

- Foreign key `ON DELETE RESTRICT` untuk entitas transaksi (orders, order_items, payments) — mencegah penghapusan data yang masih direferensikan riwayat.
- Foreign key `ON DELETE CASCADE` hanya untuk relasi anak murni tanpa nilai historis sendiri (mis. `chat_messages` saat `chat_threads` dihapus — kasus langka, admin-only).

---

### 5. Error Messages

Format & standar pesan error API ditentukan di Phase 5 (5.5 Error Standard) — dokumen ini hanya menetapkan *kondisi* validasi, bukan format respons.

---

### 6. Notes

Validasi ini ditegakkan di Form Request (bukan hanya di frontend), sesuai NFR-009 dan Security Notes Permission Matrix (2.5 Bagian 9).

---

### Dependencies

**Depends On**

- Table Design

**Used By**

- Backend Validation
- API Validation

---

# 4.5 Migration Plan — Harmoni Clothing

**Output:** Bagian 4.5
**Tujuan:** Merencanakan urutan migration database.
**Referensi:** [[Phase 4 - Database Design#4.3 Table Design — Harmoni Clothing|4.3 Table Design]]
**Digunakan Oleh:** — (dipakai saat Database Connection — Phase 7, belum dibuat)
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

> **Catatan Tipe**: 4.5 berjenis **Code** di Roadmap (bukan Planning) — file migration Laravel yang riil (`*_create_xxx_table.php`) baru dapat dibuat & dijalankan setelah proyek Laravel benar-benar diinisialisasi (`composer create-project`) di Phase 7, karena `backend/` saat ini masih folder kosong (scaffold Phase 3). Dokumen ini hanya merencanakan urutan & strategi migration terlebih dahulu.

---

### 1. Overview

Urutan migration mengikuti dependency FK di Table Design (4.3) — tabel tanpa FK dulu, baru tabel yang mereferensikannya.

---

### 2. Migration Order

1. `users`, `password_reset_tokens`
2. `categories`
3. `creator_profiles`, `addresses`
4. `products`
5. `product_variants`, `designs`
6. `design_product`, `bulk_pricing_tiers`
7. `cart_items`, `wishlists`
8. `orders`
9. `order_items`
10. `payments`, `invoices`, `shipments`, `order_status_histories`
11. `reviews`, `commissions`
12. `chat_threads`
13. `chat_messages`
14. `notifications`, `notification_settings`
15. `audit_logs`

---

### 3. Seeder Plan

- **AdminUserSeeder** — akun Admin awal (provisioning manual, bukan self-register — 2.2 Bagian 8).
- **CategorySeeder** — kategori dasar produk & desain (dwibahasa).
- **BulkPricingTierSeeder** — tingkat harga default Bulk Order.
- **NotificationSettingSeeder** — daftar jenis notifikasi default (semua `is_enabled = true`).

---

### 4. Factory Plan

Factory disiapkan untuk: `User`, `Product`, `ProductVariant`, `Design`, `Order`, `OrderItem` — dipakai untuk data uji saat QA (Phase 9), bukan data produksi.

---

### 5. Rollback Strategy

Setiap migration wajib memiliki method `down()` yang benar-benar membalik `up()`. Rollback hanya dilakukan pada migration yang **belum** di-merge ke branch utama — migration yang sudah merged mengikuti Migration Policy (3.5 Bagian 4): tidak diedit/rollback langsung, perubahan lewat migration baru.

---

### 6. Versioning

Mengikuti konvensi default Laravel — nama file diprefix timestamp (`2026_MM_DD_HHMMSS_create_xxx_table.php`), urutan eksekusi otomatis mengikuti timestamp, tidak ada penomoran manual.

---

### 7. Notes

Rencana ini akan dieksekusi ulang sebagai file migration nyata di awal Phase 7 (Backend Development) begitu proyek Laravel diinisialisasi di folder `backend/` yang sudah discaffold (3.4 Folder Structure).

---

### Dependencies

**Depends On**

- Table Design

**Used By**

- Backend Development
