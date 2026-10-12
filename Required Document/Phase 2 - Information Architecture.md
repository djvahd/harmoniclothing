# Phase 2 — Information Architecture: Indeks Dokumen

**Proyek:** Harmoni Clothing Website

Dokumen ini adalah peta navigasi untuk 5 dokumen Phase 2. Gunakan ini untuk menemukan "informasi X ada di dokumen mana" tanpa perlu membuka semua file satu per satu.

---

## Daftar Dokumen

| # | Dokumen | File | Isi Singkat |
|---|---|---|---|
| 2.1 | Sitemap | Bagian 2.1 | Seluruh 45 halaman website (Public, Customer, Creator, Admin), URL, hierarki, dan struktur URL. Ini adalah **dokumen akar Phase 2**, seluruh dokumen lain merujuk ke sini. |
| 2.2 | User Roles | Bagian 2.2 | Definisi 4 role (Guest, Customer, Creator, Admin) tingkat sistem: tanggung jawab, kemampuan, modul yang dapat diakses, hierarki, lifecycle, dan batasan role. |
| 2.3 | User Flow | Bagian 2.3 | Alur sistem detail untuk 20 flow utama (registrasi, checkout, Bulk Order, KYC Creator, approval, tracking, dst.), termasuk decision point, validasi, exception flow, dan state transition (Order/Payment/Shipment Status). |
| 2.4 | Navigation Structure | Bagian 2.4 | Struktur menu & navigasi per role, navigation tree, breadcrumb, deep link rules, dan navigasi responsive (desktop/tablet/mobile). |
| 2.5 | Permission Matrix | Bagian 2.5 | Hak akses granular per role terhadap modul, fitur, halaman, dan API — dasar implementasi Policy/Middleware di Phase 5 & 7. |

---

## Dokumen Terkait

[[Phase 2 - Information Architecture#2.1 Sitemap — Harmoni Clothing|2.1 Sitemap]], [[Phase 2 - Information Architecture#2.2 User Roles — Harmoni Clothing|2.2 User Roles]], [[Phase 2 - Information Architecture#2.3 User Flow — Harmoni Clothing|2.3 User Flow]], [[Phase 2 - Information Architecture#2.4 Navigation Structure — Harmoni Clothing|2.4 Navigation Structure]], [[Phase 2 - Information Architecture#2.5 Permission Matrix — Harmoni Clothing|2.5 Permission Matrix]]

---

*Dokumen ini mengikuti template Phase 2 yang telah ditetapkan (`Phase 2.md`) dan tidak menyimpang dari struktur maupun ruang lingkup yang sudah didefinisikan di Phase 1 (Project Brief, Requirement Gathering, User Persona, Feature List, MVP Definition, Product Roadmap).*

---

# 2.1 Sitemap — Harmoni Clothing

**Output:** Bagian 2.1
**Tujuan:** Menentukan seluruh struktur halaman website beserta hubungan antarhalaman.
**Referensi:** [[Phase 1 - Product Discovery#1.5 Feature List — Harmoni Clothing|1.5 Feature List]]
**Digunakan Oleh:** [[Phase 2 - Information Architecture#2.2 User Roles — Harmoni Clothing|2.2 User Roles]], [[Phase 2 - Information Architecture#2.3 User Flow — Harmoni Clothing|2.3 User Flow]], [[Phase 2 - Information Architecture#2.4 Navigation Structure — Harmoni Clothing|2.4 Navigation Structure]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

- **Tujuan Sitemap**: Memetakan seluruh halaman website Harmoni Clothing sebagai dasar navigasi, wireframe (Phase 6), dan routing frontend (Phase 8), agar tidak ada modul dari Requirement Gathering (1.2) yang tidak memiliki representasi halaman.
- **Ruang Lingkup**: Website (bukan mobile app, sesuai Project Brief Bagian 9 — Out of Scope), mencakup seluruh halaman untuk 4 role.
- **Jumlah Role**: 4 (Guest, Customer, Creator, Admin) — konsisten dengan Project Brief Bagian 13.
- **Jumlah Halaman**: 42 halaman (10 Public, 13 Customer, 6 Creator, 13 Admin) — direvisi dari rencana awal 45, lihat Change Log Bagian 11.

---

### 2. Website Structure

```
Harmoni Clothing Website
│
├── Public (Guest + semua role, tanpa login)
│   ├── Beranda
│   ├── Marketplace
│   │   ├── Profil Publik Creator
│   │   └── Detail Desain
│   ├── Produk
│   │   └── Detail Produk & Desain
|   ├── Tentang Kami
│   ├── Login / Register / Lupa Password (overlay global, bukan halaman) → Reset Password (halaman, link email)
│   └── Kebijakan Privasi / Syarat & Ketentuan
│
├── Customer (login, akun dasar)
│   ├── Akun Saya (Profil, Address Book, Ajukan Upgrade jadi Creator)
│   ├── Kustomisasi Produk (satu editor, gabungan bekas Mode Custom + Mode Marketplace)
│   ├── Keranjang → Checkout → Invoice
│   ├── Bulk Order → Checkout Bulk Order
│   ├── Riwayat Pesanan → Detail Pesanan & Tracking
│   ├── Wishlist
│   └── Notifikasi
│   (Chat dengan Admin tersedia lewat ChatWidget mengambang di semua halaman, bukan route terpisah)
│
├── Creator (upgrade dari Customer, setelah approval)
│   ├── Dashboard Creator
│   ├── Verifikasi Data Diri
│   ├── Kelola Desain → Upload Desain → Konfirmasi Multi-Apparel
│   └── Statistik & Komisi
│
└── Admin
    ├── Dashboard Admin
    ├── Kelola User & Creator → Approval Creator
    ├── Approval Desain
    ├── Kelola Product Catalog
    ├── Kelola Antrian Produksi
    ├── Kelola Pesanan (+ Penolakan Order)
    ├── Kelola Pembayaran & Invoice
    ├── Kelola Pengiriman
    ├── Chat Management
    ├── Konfigurasi Notifikasi
    ├── Audit Log
    └── Sales Report
```

*Catatan: Creator bukan cabang akses terpisah dari Customer — seluruh halaman Customer tetap dapat diakses oleh akun yang sudah menjadi Creator, sesuai BR-013 (Requirement Gathering 1.2), satu akun berperan ganda.*

---

### 3. Public Pages

*Dapat diakses tanpa login, sesuai FR-005 (Requirement Gathering 1.2). Aksi yang memerlukan login (tambah ke keranjang, checkout, wishlist) tetap tersedia sebagai tombol di halaman ini, tetapi memicu redirect ke Login/Register.*

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Beranda | `/` | Landing page, entry point utama, highlight Marketplace & Katalog. |
| Marketplace Desain | `/marketplace` | Browsing & search/filter desain dari Creator (FE-008/009/010). |
| Profil Publik Creator | `/marketplace/{creatorSlug}` | Profil & portofolio Creator (FE-011). |
| Detail Desain | `/marketplace/design/{designSlug}` | Ringkasan desain, entry point ke Product Editor Mode Marketplace. |
| Katalog Produk | `/catalog` | Browsing blank product (FE-012). |
| Detail Produk & Desain | `/catalog/{productSlug}` | Ringkasan produk, entry point ke Product Editor Mode Custom (FR-014). |
| Tentang Kami | `/about` | Informasi perusahaan, misi, dan cerita Harmoni Clothing. |
| Reset Password | `/reset-password` | Halaman tujuan link reset password dari email (FR-003) — satu-satunya sisa alur auth yang tetap berupa route; Login/Register/Lupa Password kini overlay global tanpa route sendiri (lihat Bagian 11). |
| Kebijakan Privasi | `/legal/privacy-policy` | Consent wajib saat registrasi (NFR-012). |
| Syarat & Ketentuan | `/legal/terms` | Consent wajib saat registrasi (NFR-012). |
| Kebijakan Pengembalian | `/legal/returns` | Aturan komplain 7 hari & produksi ulang (BR-011/016). Ditambahkan 2026-10. |
| Kebijakan Pengiriman | `/legal/shipping` | Kurir, estimasi, dan ongkir via Biteship. Ditambahkan 2026-10. |
| FAQ | `/faq` | Pertanyaan umum. Ditambahkan 2026-10. |
| Kontak | `/kontak` | Kontak WhatsApp & email. Ditambahkan 2026-10. |
| Pusat Bantuan | `/pusat-bantuan` | Panduan penggunaan & jalur bantuan. Ditambahkan 2026-10. |
| Verifikasi Email | `/verify-email` | Tujuan link verifikasi email (halaman, bukan overlay). Ditambahkan 2026-08. |

---

### 4. Customer Pages

*Memerlukan login. Berlaku untuk seluruh user dengan akun dasar, termasuk yang sudah menjadi Creator (BR-013).*

| Halaman | URL | Fungsi |
|---------|-----|--------|
| Kelola Profil | `/account/profile` | Edit data diri & foto (FR-004). |
| Address Book | `/account/addresses` | Simpan & kelola alamat pengiriman (FR-048). |
| Ajukan Upgrade jadi Creator | `/account/become-creator` | Entry point upgrade akun jadi Creator (FR-041). |
| Kustomisasi Produk | `/customize/{slug}` | Kustomisasi bahan/ukuran/warna/potongan, dari produk blank maupun desain Creator — satu editor untuk kedua mode, gabungan bekas Mode Custom + Mode Marketplace (lihat Bagian 11) (FR-009/010/011/012/013). |
| Keranjang | `/cart` | Kelola item sebelum checkout (FE-025). |
| Checkout | `/checkout` | Proses pemesanan reguler & pembayaran Midtrans (FR-017). |
| Bulk Order | `/bulk-order/{productSlug}` | Konfigurasi pemesanan grup/massal, kombinasi ukuran (FR-040/044). |
| Checkout Bulk Order | `/checkout/bulk` | Checkout khusus Bulk Order, terpisah dari reguler (BR-026). |
| Riwayat Pesanan | `/account/orders` | Histori transaksi & reorder (FR-019). |
| Detail Pesanan & Tracking | `/account/orders/{orderId}` | Status produksi & pengiriman real-time, konfirmasi diterima (FR-023/042), pembatalan (FR-036). |
| Invoice | `/account/orders/{orderId}/invoice` | Invoice otomatis pasca-pembayaran (FR-018). |
| Wishlist | `/account/wishlist` | Simpan produk favorit (FR-020). |
| Notifikasi | `/notifications` | Pusat notifikasi real-time (FR-029). |

*Chat dengan Admin (FR-028) bukan lagi halaman tersendiri — `ChatWidget` mengambang tersedia di semua halaman Customer (lihat Bagian 11).*

---

### 5. Creator Pages

*Memerlukan login dan status Creator "Aktif" (lolos approval, BR-001). Selain halaman berikut, Creator tetap memiliki akses penuh ke seluruh Customer Pages (Bagian 4).*

| Halaman | URL | Fungsi |
|---------|-----|--------|
| Dashboard Creator | `/creator/dashboard` | Ringkasan aktivitas Creator (FE-020). |
| Verifikasi Data Diri | `/creator/verification` | KYC sederhana, syarat approval (FR-035). |
| Kelola Desain | `/creator/designs` | CRUD desain milik Creator (FR-024). |
| Upload Desain | `/creator/designs/upload` | Upload desain baru + pilih apparel kompatibel (FR-024/022). |
| Konfirmasi Multi-Apparel | `/creator/designs/{designId}` | Preview & konfirmasi desain di banyak jenis apparel sebelum submit, di halaman detail desain yang sama — tidak ada sub-route `/preview` terpisah (lihat Bagian 11) (FR-037). |
| Statistik & Komisi | `/creator/earnings` | Dashboard penjualan & komisi (FR-026). |

---

### 6. Admin Pages

*Memerlukan login dengan role Admin (akun diprovisikan manual, bukan self-register — lihat 2.2 User Roles Bagian 8).*

| Halaman | URL | Fungsi |
|---------|-----|--------|
| Dashboard Admin | `/admin/dashboard` | Ringkasan operasional (FE-042). |
| Kelola User & Creator | `/admin/users` | Kelola akun pengguna (FR-030). |
| Approval Creator | `/admin/creators/approval` | Approve/reject Creator + tinjau KYC (FR-030, BR-008). |
| Approval Desain | `/admin/designs/approval` | Approve/reject desain sebelum tayang (FR-025). |
| Kelola Product Catalog | `/admin/catalog` | Kelola blank product + aset mockup 3D (FR-031). |
| Kelola Antrian Produksi | `/admin/production` | Kelola antrian & update status produksi (FR-021). |
| Kelola Pesanan | `/admin/orders` | Kelola pesanan, termasuk Penolakan Order (FR-043). |
| Kelola Pembayaran & Invoice | `/admin/payments` | Kelola pembayaran & invoice (FR-032). |
| Kelola Pengiriman | `/admin/shipments` | Kelola pengiriman terintegrasi Biteship (FR-022). |
| Chat Management | `/admin/chat` | Kelola seluruh chat customer terpusat (FR-038). |
| Konfigurasi Notifikasi | `/admin/notifications/settings` | Atur jenis notifikasi terkirim (FR-039). |
| Audit Log | `/admin/audit-log` | Jejak aktivitas admin sensitif (approval, ban, dll) — ditambahkan Code Audit Batch 5.3, tidak ada di rencana awal (lihat Bagian 11). |
| Sales Report | `/admin/reports` | Laporan omzet, produk terlaris, statistik operasional (FR-033). |

---

### 7. Page Hierarchy

```
/ (root)
├── /about
├── /marketplace
│   ├── /marketplace/{creatorSlug}
│   └── /marketplace/design/{designSlug}
├── /catalog
│   └── /catalog/{productSlug}
├── /customize/{slug}
├── /reset-password
├── /cart → /checkout → /account/orders/{orderId}/invoice
├── /bulk-order/{productSlug} → /checkout/bulk
├── /account/orders → /account/orders/{orderId}
├── /account
│   ├── /account/profile
│   ├── /account/addresses
│   ├── /account/become-creator
│   └── /account/wishlist
├── /creator
│   ├── /creator/dashboard
│   ├── /creator/verification
│   └── /creator/designs
│       ├── /creator/designs/upload
│       └── /creator/designs/{designId}
└── /admin
    ├── /admin/dashboard
    ├── /admin/users → /admin/creators/approval
    ├── /admin/designs/approval
    ├── /admin/catalog
    ├── /admin/production
    ├── /admin/orders
    ├── /admin/payments
    ├── /admin/shipments
    ├── /admin/chat
    ├── /admin/notifications/settings
    ├── /admin/audit-log
    └── /admin/reports
```

---

### 8. URL Structure

- **Bahasa URL**: Bahasa Inggris, lowercase, kebab-case (`/become-creator`, bukan `/ajukan-creator`) — URL adalah struktur teknis untuk developer/routing, terpisah dari bahasa UI yang ditampilkan ke user (ID/EN sesuai FR-034/NFR-008).
- **Slug**: Halaman detail publik (produk, desain, profil Creator) menggunakan slug deskriptif (`/catalog/kaos-oversize-polos`), bukan ID numerik, untuk keterbacaan & SEO dasar.
- **ID dinamis**: Halaman transaksional milik user (`/account/orders/{orderId}`, `/creator/designs/{designId}`) menggunakan ID unik, tidak perlu SEO-friendly karena tidak publik.
- **Prefix role**: Halaman Creator diprefix `/creator/*`, halaman Admin diprefix `/admin/*` — memudahkan penerapan route middleware per role (lihat 2.5 Permission Matrix Bagian 7).
- **Konsistensi modul**: URL mengikuti nama modul di Requirement Gathering (1.2) sebisa mungkin (`/catalog` = Product Catalog, `/marketplace` = Marketplace).

---

### 9. Future Pages

*Konsisten dengan Project Brief Bagian 9 (Out of Scope) & Feature List Bagian 11 (Future Features) — bukan bagian dari 45 halaman MVP di atas.*

- `/promo` — Halaman Voucher/Promo Engine (Marketing, Fase 2+).
- `/contest` — Design Contest/Voting Komunitas (ide brainstorming, belum dijadwalkan).
- `/creator/payouts` — Riwayat pencairan komisi otomatis (Fase 2, saat ini pencairan manual oleh Admin).
- `/admin/roles` — Multi Admin & Role Permission (Enterprise Features, Fase 2+).
- Halaman aplikasi mobile (Android/iOS) — di luar scope website sepenuhnya.

---

### 10. Notes

- Halaman Detail Produk & Desain (`/catalog/{productSlug}`) dan Detail Desain (`/marketplace/design/{designSlug}`) tetap dapat dibuka Guest untuk dilihat; hanya aksi "Kustomisasi"/"Tambah ke Keranjang" yang memicu redirect ke `/login` (FR-005).
- Tidak ada halaman keranjang untuk Guest — status keranjang tidak tersimpan lintas sesi sebelum login, konsisten dengan catatan Guest Journey di User Persona (1.3 Bagian 3).
- Bulk Order (`/bulk-order/*`) sengaja dipisah dari alur `/cart` reguler karena tidak dapat digabung dalam satu checkout (BR-026).
- Jumlah halaman (kini 42, lihat Bagian 11) dapat bertambah saat Wireframe (Phase 6) jika ditemukan kebutuhan halaman pendukung (misal halaman error 404/403, halaman kosong/empty state) — itu adalah detail UI, bukan struktur informasi baru, sehingga tidak dicatat terpisah di sitemap ini.

---

### 11. Change Log

*Ditambahkan 2026-07-30 (Code Audit Batch 7), mengikuti pola pencatatan deviasi di Bagian 3.1 §9.*

| Tanggal | Perubahan | Alasan |
|---|---|---|
| 2026-07-29 | 39 route yang sempat memakai path Bahasa Indonesia (mis. `/lapak-desain`, `/katalog-produk`, `/kreator/{slug}`) di-rename ke path Bahasa Inggris sesuai dokumen ini (Code Audit K-1, Batch 2b). Deviasi bahasa yang sempat ditemukan Code Audit (2026-07-28) diperbaiki di sisi **kode**, bukan dokumen — Bagian 8 di atas tidak berubah. |
| 2026-07-29 | Login, Register, dan Lupa Password dipindah dari halaman routed menjadi **overlay/modal global** (`AuthModal`), dipicu dari halaman mana saja tanpa navigasi penuh — hanya `/reset-password` (tujuan link email) yang tetap route, karena butuh URL yang bisa diklik dari luar aplikasi. |
| 2026-07-29 | Product Editor Mode Custom (`/editor/custom/{productSlug}`) dan Mode Marketplace (`/editor/marketplace/{designSlug}`) digabung jadi satu route `/customize/{slug}` — kedua mode berbagi UI editor, dibedakan lewat data produk/desain yang di-fetch, bukan route terpisah. |
| 2026-07-29 | `/wishlist` dipindah ke bawah `/account` (jadi `/account/wishlist`), konsisten dengan halaman Customer lain yang butuh akun. `Kelola Profil` juga eksplisit jadi `/account/profile` (bukan `/account` langsung). |
| 2026-07-29 | `/chat` (halaman Customer) dihapus, digantikan `ChatWidget` — komponen chat mengambang tersedia di semua halaman Customer, bukan route terpisah. `/admin/chat` (Chat Management, Admin) tidak terpengaruh. |
| 2026-07-29 | `/creator/designs/{designId}/preview` disederhanakan jadi `/creator/designs/{designId}` — konfirmasi apparel multi-produk terjadi di halaman detail desain yang sama, tanpa sub-route `/preview` terpisah. |
| 2026-07-29 | `/admin/audit-log` ditambahkan (Code Audit Batch 5.3) — halaman baru, tidak ada di rencana Sitemap awal. |
| 2026-07-30 | Jumlah halaman diperbarui dari rencana 45 ke realisasi **42**: 10 Public (termasuk `/reset-password`, minus 3 halaman auth jadi overlay), 13 Customer (2 editor→1, minus `/chat`), 6 Creator (tidak berubah), 13 Admin (+`/admin/audit-log`). |
| 2026-10-13 | Sinkronisasi dengan kode: rute Customer `/orders*` ditulis `/account/orders*` (sesuai implementasi); 6 halaman publik yang dibuat setelah 2026-07-30 ditambahkan (`/legal/returns`, `/legal/shipping`, `/faq`, `/kontak`, `/pusat-bantuan`, `/verify-email`). Jumlah halaman realisasi: **48**. Catatan: `/kontak` dan `/pusat-bantuan` masih berbahasa Indonesia, berbeda dari konvensi §8. |

---

### Dependencies

**Depends On**

- Project Scope
- Functional Requirements

**Used By**

- User Roles
- User Flow
- Navigation Structure
- UI/UX Design

---

# 2.2 User Roles — Harmoni Clothing

**Output:** Bagian 2.2
**Tujuan:** Mendefinisikan seluruh role pengguna beserta tanggung jawab, kemampuan, dan batasannya.
**Referensi:** [[Phase 2 - Information Architecture#2.1 Sitemap — Harmoni Clothing|2.1 Sitemap]], [[Phase 1 - Product Discovery#1.3 User Persona — Harmoni Clothing|1.3 User Persona]]
**Digunakan Oleh:** [[Phase 2 - Information Architecture#2.3 User Flow — Harmoni Clothing|2.3 User Flow]], [[Phase 2 - Information Architecture#2.5 Permission Matrix — Harmoni Clothing|2.5 Permission Matrix]], [[Phase 5 - API & Backend Planning#5.4 Authentication Flow — Harmoni Clothing|5.4 Authentication Flow]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

- **Tujuan**: Menurunkan definisi role di Project Brief (1.1 Bagian 13) dan hak akses tingkat tinggi di Requirement Gathering (1.2 Bagian 3) menjadi spesifikasi role yang siap dipakai untuk desain Permission Matrix (2.5) dan implementasi Policy (Phase 5 & 7).
- **Jumlah Role**: 4 — Guest, Customer, Creator, Admin.
- **RBAC Overview**: Sistem menggunakan Role-Based Access Control sederhana dengan 4 role, di mana Creator bersifat **aditif** (tambahan kapabilitas di atas Customer, bukan role eksklusif terpisah), sesuai BR-013 (Requirement Gathering 1.2). Tidak ada role kustom atau permission per-user individual di MVP (Multi Admin & Role Permission granular adalah Enterprise Feature, Out of Scope — Project Brief 1.1 Bagian 9).

---

### 2. Role List

| Role | Tipe Akun | Wajib Login |
|---|---|---|
| Guest | Tidak ada akun | Tidak |
| Customer | Akun dasar | Ya |
| Creator | Upgrade dari akun dasar | Ya |
| Admin | Akun operasional, diprovisikan manual | Ya |

*Representasi data: Customer/Admin dibedakan lewat kolom `users.role`; status Creator ditentukan lewat keberadaan baris `creator_profiles` (bukan kolom `role`) — lihat Entity Identification 4.1.*

---

### 3. Role Description

*Deskripsi lengkap masing-masing role: lihat Project Brief (1.1) Bagian 13. Ringkasan untuk kebutuhan Information Architecture:*

- **Guest**: Pengunjung yang belum login. Dapat menjelajah Marketplace Desain dan Katalog Produk secara read-only, tetapi wajib login/register sebelum menambahkan item ke keranjang atau checkout (FR-005).
- **Customer**: Akun dasar hasil registrasi (FR-001). Role default seluruh user terdaftar — termasuk yang kemudian menjadi Creator.
- **Creator**: Customer yang telah mengajukan dan lolos proses Verifikasi Data Diri + approval Admin (FR-035, FR-041, BR-001, BR-008). Mendapat kapabilitas tambahan untuk mengunggah & menjual desain.
- **Admin**: Mencakup baik pengelola operasional platform maupun tim produksi, menggunakan akses yang sama tanpa role terpisah (Project Brief 1.1 Bagian 13). Tidak ada pendaftaran mandiri untuk Admin.

---

### 4. Responsibilities

| Role | Tanggung Jawab Utama |
|---|---|
| Guest | Menjelajahi katalog/marketplace sebagai calon Customer. |
| Customer | Memesan produk secara akurat (memilih varian, mengisi catatan pemesanan dengan jelas), menyelesaikan pembayaran tepat waktu, mengonfirmasi penerimaan pesanan. |
| Creator | Mengunggah desain yang tidak melanggar hak cipta (asumsi Project Brief 1.1 Bagian 14), melengkapi KYC secara jujur, menjaga kualitas desain yang diunggah. |
| Admin | Menjaga kelancaran operasional end-to-end: approval Creator/desain, pengelolaan antrian produksi, pembayaran, pengiriman, dan komunikasi dengan Customer. |

---

### 5. Capabilities

| Role | Kemampuan Utama |
|---|---|
| Guest | Browsing & search Marketplace/Katalog, lihat profil publik Creator, lihat Detail Produk & Desain. |
| Customer | Seluruh kapabilitas Guest + kustomisasi produk (3D Editor), kelola keranjang, checkout (reguler & Bulk Order), kelola profil & address book, tracking pesanan, wishlist, rating & review, chat dengan Admin. |
| Creator | Seluruh kapabilitas Customer + upload & kelola desain, preview multi-apparel, lihat statistik & komisi. |
| Admin | Kelola user/Creator, approval Creator & desain, kelola Product Catalog, kelola antrian produksi, kelola pembayaran/invoice, kelola pengiriman, kelola chat terpusat, konfigurasi notifikasi, lihat sales report. Admin **tidak** melakukan aksi sebagai Customer/Creator (tidak checkout, tidak upload desain untuk dijual) — akses Admin murni operasional. |

---

### 6. Accessible Modules

*Modul mengacu pada kategori Feature List (1.5 Bagian 2). Detail hak akses granular (Create/Read/Update/Delete/Approve) ada di Permission Matrix (2.5).*

| Modul | Guest | Customer | Creator | Admin |
|---|---|---|---|---|
| Authentication | Register/Login saja | ✔ | ✔ | ✔ |
| User Management | ✖ | Profil sendiri | Profil sendiri + KYC | Seluruh user |
| Marketplace | Read-only | ✔ | ✔ (+ sebagai penjual) | Read-only (moderasi) |
| Product Catalog | Read-only | ✔ | ✔ | Kelola penuh |
| Product Customization | ✖ (redirect login) | ✔ | ✔ | ✖ |
| Creator Management | ✖ | Ajukan upgrade | ✔ | Approval |
| Order Management | ✖ | ✔ | ✔ (sebagai Customer) | Kelola penuh |
| Payment | ✖ | ✔ (checkout) | ✔ (checkout) | Kelola penuh |
| Shipping | ✖ | Lihat tracking | Lihat tracking | Kelola penuh |
| Notification | ✖ | Terima | Terima | Kelola konfigurasi |
| Review & Rating | Read-only | ✔ | ✔ (sebagai Customer) | Read-only |
| Communication | ✖ | Chat dengan Admin | Chat dengan Admin | Chat Management terpusat |
| Admin Dashboard | ✖ | ✖ | ✖ | ✔ |
| Analytics | ✖ | ✖ | Statistik pribadi saja | Sales Report penuh |
| Settings/Localization | Language switcher | Language switcher | Language switcher | Language switcher + Konfigurasi Notifikasi |

---

### 7. Role Hierarchy

```
Guest
  │  (Register — FR-001)
  ▼
Customer ────────────────────────────┐
  │  (Ajukan Upgrade jadi Creator —   │
  │   FR-041, lolos KYC + approval)   │
  ▼                                   │
Creator                               │
  (tetap memiliki seluruh kapabilitas │
   Customer — BR-013) ────────────────┘

Admin (independen, tidak diturunkan dari role manapun,
       diprovisikan manual di luar alur registrasi publik)
```

*Catatan: Ini bukan hierarki permission bertingkat (Admin bukan "superset" dari Creator/Customer dalam artian teknis) — Admin memiliki modul aksesnya sendiri yang berbeda karakter (operasional, bukan transaksional). Lihat Permission Matrix (2.5) untuk detail granular.*

---

### 8. Role Lifecycle

**Customer**
1. Guest melakukan Register (FR-001) → akun Customer aktif langsung (tidak ada approval untuk Customer).
2. Customer dapat dinonaktifkan/di-ban oleh Admin (mengikuti kasus pelanggaran, ditangani manual — konsisten dengan BR-021 untuk dugaan pelanggaran hak cipta & kasus lain di luar sistem).

**Creator**
1. Customer mengajukan upgrade lewat "Ajukan Upgrade jadi Creator" (FR-041).
2. Mengisi Verifikasi Data Diri / KYC sederhana (FR-035, BR-008) → status "Menunggu Approval".
3. Admin approve → status "Aktif" (dapat upload desain) / Admin reject → status "Ditolak" (Creator menerima notifikasi alasan, dapat mengajukan ulang).
4. Admin dapat menonaktifkan/ban Creator sewaktu-waktu → status "Nonaktif"/"Di-ban": desain otomatis ditarik dari marketplace (BR-019), akses Customer pada akun yang sama ikut disuspend jika ban karena pelanggaran hak cipta terbukti (BR-023).

**Admin**
1. Akun Admin dibuat secara manual (oleh Admin lain atau melalui provisioning awal sistem) — tidak ada alur self-register publik untuk role ini, konsisten dengan Project Brief (1.1 Bagian 14, Asumsi Bisnis) yang menyebut tim produksi memakai akses Admin yang sama.
2. Tidak ada proses approval berjenjang untuk Admin di MVP (Multi Admin & Role Permission granular adalah Out of Scope — Fase 2).

```
Guest → Register → Customer (Aktif)
                       │
                       ├── Ajukan Upgrade → Menunggu Approval → Aktif (Creator) / Ditolak
                       │
                       └── (kasus khusus) → Nonaktif / Di-ban (oleh Admin)
```

---

### 9. Role Restrictions

| Role | Batasan |
|---|---|
| Guest | Tidak dapat mengakses keranjang, checkout, wishlist, chat, atau halaman apapun di bawah `/account`, `/creator`, `/admin` (lihat Sitemap 2.1). Aksi transaksional selalu redirect ke `/login`. |
| Customer | Tidak dapat mengakses halaman/modul Creator (`/creator/*`) sebelum diapprove sebagai Creator. Tidak dapat mengakses modul Admin sama sekali. |
| Creator | Tidak dapat mengakses modul Admin. Desain yang diunggah wajib melalui approval sebelum tayang (BR-002) — Creator tidak dapat mem-publish desain sendiri tanpa approval. Creator yang di-ban kehilangan akses upload/kelola desain baru; desain lama otomatis ditarik (BR-019). |
| Admin | Tidak memiliki akses ke fitur transaksional Customer/Creator (tidak checkout produk, tidak upload desain untuk dijual) — akses Admin murni operasional & moderasi, memastikan pemisahan tanggung jawab yang jelas. |

---

### 10. Role Switching

- **Guest → Customer**: Perpindahan permanen lewat Register, bukan "switching" sesi — begitu register, sesi Guest berakhir.
- **Customer ↔ Creator**: Bukan role switching dalam arti teknis (ganti konteks akun), melainkan **penambahan kapabilitas** pada akun yang sama (BR-013). Secara UI, user yang sudah menjadi Creator dapat berpindah konteks tampilan antara area Customer (`/account`, `/account/orders`, dst.) dan area Creator (`/creator/*`) lewat navigasi, tanpa perlu logout/login ulang atau memilih "mode" secara eksplisit — lihat Navigation Structure (2.4 Bagian 4).
- **Tidak ada role switching untuk Admin**: satu akun Admin tidak dapat berperan sebagai Customer/Creator dan sebaliknya user Customer/Creator tidak dapat menjadi Admin tanpa provisioning manual di luar sistem.

---

### 11. Notes

- Definisi role ini adalah acuan tunggal (single source of truth) untuk Permission Matrix (2.5) — setiap penambahan modul/fitur baru pasca-Phase 2 wajib dipetakan ke salah satu dari 4 role di atas, tidak membuat role baru tanpa melalui protokol approval (konsisten dengan pola perubahan di Requirement Gathering 1.2 Change Log).
- Istilah "KYC" dipakai sebagai istilah internal/teknis di dokumen ini; untuk UI/copy yang dilihat Creator tetap gunakan "Verifikasi Data Diri" (catatan penamaan sudah ditetapkan di Feature List 1.5 Bagian 9).

---

### Dependencies

**Depends On**

- Sitemap

**Used By**

- User Flow
- Permission Matrix
- Backend Authentication
- UI Navigation

---

# 2.3 User Flow — Harmoni Clothing

**Output:** Bagian 2.3
**Tujuan:** Mendokumentasikan alur sistem setiap fitur utama secara detail.
**Referensi:** [[Phase 2 - Information Architecture#2.1 Sitemap — Harmoni Clothing|2.1 Sitemap]], [[Phase 2 - Information Architecture#2.2 User Roles — Harmoni Clothing|2.2 User Roles]], [[Phase 1 - Product Discovery#1.2 Requirement Gathering — Harmoni Clothing|1.2 Requirement Gathering]]
**Digunakan Oleh:** [[Phase 2 - Information Architecture#2.4 Navigation Structure — Harmoni Clothing|2.4 Navigation Structure]], [[Phase 2 - Information Architecture#2.5 Permission Matrix — Harmoni Clothing|2.5 Permission Matrix]], [[Phase 5 - API & Backend Planning#5.1 Business Rules — Harmoni Clothing|5.1 Business Rules]], [[Phase 5 - API & Backend Planning#5.2 API List — Harmoni Clothing|5.2 API List]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

- **Tujuan**: Menerjemahkan Functional Requirements, Business Rules, dan Acceptance Criteria (Requirement Gathering 1.2) menjadi alur langkah-demi-langkah yang siap dipakai untuk Database Design (Phase 4), API Design (Phase 5), dan Wireframe (Phase 6).
- **Ruang Lingkup**: 20 flow utama yang mencakup seluruh modul MVP (Bagian 2), dari sisi Guest, Customer, Creator, maupun Admin.
- **Flow Convention**: Setiap flow ditulis sebagai urutan langkah linear dengan tanda `↓`; percabangan ditulis sebagai keputusan (`?`) dengan dua jalur hasil. ID referensi (FR/BR/FE) dicantumkan di setiap flow untuk ketertelusuran ke Requirement Gathering & Feature List.

---

### 2. Flow Inventory

| # | Flow | Role Utama | Referensi |
|---|---|---|---|
| 1 | Registrasi & Login | Guest → Customer | FR-001/002/003 |
| 2 | Guest Browsing → Login Redirect | Guest | FR-005 |
| 3 | Ajukan Upgrade jadi Creator (KYC) | Customer → Creator | FR-035/041, BR-008 |
| 4 | Kustomisasi Produk — Mode Custom | Customer | FR-009/010/012/013 |
| 5 | Kustomisasi Produk — Mode Marketplace | Customer | FR-011/012 |
| 6 | Checkout Reguler & Pembayaran | Customer | FR-015/016/017/018, BR-003/017/025 |
| 7 | Pemesanan Bulk Order | Customer | FR-040/044, BR-012/022/026 |
| 8 | Antrian Produksi & Update Status | Admin | FR-021 |
| 9 | Pengiriman & Auto Tracking Resi | Sistem/Admin | FR-022 |
| 10 | Konfirmasi Penerimaan Pesanan | Customer | FR-042, BR-014 |
| 11 | Pembatalan Pesanan | Customer | FR-036, BR-010 |
| 12 | Penolakan Order oleh Admin | Admin | FR-043 |
| 13 | Reorder & Wishlist | Customer | FR-019/020 |
| 14 | Rating & Review | Customer | FR-027, BR-004 |
| 15 | Chat Customer–Admin | Customer, Admin | FR-028/038 |
| 16 | Upload Desain & Preview Multi-Apparel (Creator) | Creator | FR-024/037 |
| 17 | Approval Desain (Admin) | Admin | FR-025, BR-002/028 |
| 18 | Approval Creator (Admin) | Admin | FR-030, BR-001/008 |
| 19 | Komplain Kualitas Pasca-Selesai | Customer, Admin | BR-016 |
| 20 | Notifikasi Real-time | Sistem | FR-029/039, BR-027 |

---

### 3. Flow Detail

**Flow 1 — Registrasi & Login**
```
Guest buka /register
   ↓
Isi form (nama, email, password) + centang consent Privacy Policy & ToS
   ↓
Submit → validasi data?
   ├─ Tidak valid → tampilkan error, tetap di form
   └─ Valid → akun Customer dibuat, status aktif
       ↓
   Redirect ke /login atau auto-login → Beranda
```

**Flow 2 — Guest Browsing → Login Redirect**
```
Guest buka /marketplace atau /catalog
   ↓
Browsing, search, filter, lihat Detail Produk/Desain (read-only)
   ↓
Klik "Tambah ke Keranjang" / "Checkout" / "Tambah ke Wishlist"
   ↓
Sistem cek sesi login?
   ├─ Belum login → redirect ke /login (return_url disimpan)
   └─ Sudah login → lanjut sebagai Customer dari titik yang sama
```

**Flow 3 — Ajukan Upgrade jadi Creator (KYC)**
```
Customer buka /account/become-creator
   ↓
Isi form Verifikasi Data Diri (nama lengkap, nomor identitas)
   ↓
Submit → validasi kelengkapan data?
   ├─ Tidak lengkap → error, field kurang ditandai
   └─ Lengkap → status "Menunggu Approval"
       ↓
   Admin review (Flow 18)
       ↓
   Approve → status "Aktif" (akses /creator/* terbuka) / Reject → status "Ditolak" + notifikasi alasan
```

**Flow 4 — Kustomisasi Produk (Mode Custom)**
```
Customer buka /catalog/{productSlug} → klik "Kustomisasi"
   ↓
Masuk /editor/custom/{productSlug}
   ↓
Pilih bahan/ukuran/warna/jenis potongan
   ↓
Upload desain sendiri (PNG/SVG) → atur posisi/ukuran/rotasi di preview 3D
   ↓
Isi catatan pemesanan (opsional)
   ↓
Konfirmasi → lanjut ke Detail Produk & Desain (ringkasan) → "Tambah ke Keranjang"
```

**Flow 5 — Kustomisasi Produk (Mode Marketplace)**
```
Customer/Guest buka /marketplace/design/{designSlug} → klik "Kustomisasi"
   ↓
(Guest → Flow 2 login redirect dulu)
   ↓
Masuk /editor/marketplace/{designSlug}
   ↓
Pilih varian produk yang kompatibel (posisi desain terkunci — tidak dapat diubah)
   ↓
Isi catatan pemesanan (opsional)
   ↓
Konfirmasi → "Tambah ke Keranjang"
```

**Flow 6 — Checkout Reguler & Pembayaran**
```
Customer buka /cart → review item (harga terkunci sejak ditambahkan — BR-025)
   ↓
Klik "Checkout" → /checkout
   ↓
Pilih/isi alamat pengiriman (Address Book) → sistem hitung ongkir (Biteship)
   ↓
Review total (Perhitungan Harga Otomatis) → bayar via Midtrans
   ↓
Pembayaran berhasil?
   ├─ Gagal/timeout → status order "Belum Dibayar", item tetap di keranjang
   │      ↓
   │   Tidak diselesaikan dalam 24 jam → order otomatis "Dibatalkan" (BR-017)
   └─ Berhasil → status order "Menunggu Approval", invoice ter-generate otomatis (FR-018)
       ↓
   Lanjut ke Flow 8 (Antrian Produksi) setelah Admin approve
```

**Flow 7 — Pemesanan Bulk Order**
```
Customer buka /bulk-order/{productSlug}
   ↓
Pilih desain (upload sendiri / marketplace) + input kombinasi ukuran & kuantitas per ukuran
   ↓
Sistem hitung harga per-unit bertingkat dari TOTAL kuantitas keseluruhan (BR-012, FR-044)
   ↓
Konfirmasi → /checkout/bulk (terpisah dari checkout reguler — BR-026, tidak dapat digabung)
   ↓
Bayar via Midtrans → sama seperti Flow 6 dari titik pembayaran
   ↓
Lead time produksi dihitung terpisah (lebih panjang dari reguler — BR-012)
```

**Flow 8 — Antrian Produksi & Update Status**
```
Admin buka /admin/production
   ↓
Lihat order berstatus "Menunggu Approval"
   ↓
Approve → order masuk antrian, status "Diproses/Produksi"
   ↓
Admin update progres produksi manual seiring berjalan
   ↓
Produksi selesai → Admin serahkan ke proses pengiriman (Flow 9)
```
*Jalur reject: lihat Flow 12.*

**Flow 9 — Pengiriman & Auto Tracking Resi**
```
Order selesai produksi → Admin buat pengiriman lewat /admin/shipments (Biteship)
   ↓
Resi otomatis dibuat & ditautkan ke order → status "Dikirim"
   ↓
Biteship update status berkala (webhook) → Customer lihat real-time di /account/orders/{orderId}
   ↓
Biteship melaporkan "Delivered" → status order otomatis "Menunggu Konfirmasi" (lanjut Flow 10)
```

**Flow 10 — Konfirmasi Penerimaan Pesanan**
```
Status order "Menunggu Konfirmasi" (trigger: Biteship "Delivered" — BR-014)
   ↓
Customer klik "Konfirmasi Diterima"?
   ├─ Ya (kapan saja) → status "Selesai" + form Rating & Review muncul otomatis (opsional, dapat di-skip)
   └─ Tidak ada aksi dalam 3 hari kerja → sistem auto-complete → status "Selesai" (tanpa prompt rating,
       Customer tetap bisa beri rating belakangan lewat Riwayat Pesanan)
```

**Flow 11 — Pembatalan Pesanan**
```
Customer buka /account/orders/{orderId}, status masih "Menunggu Approval"?
   ├─ Ya → tombol "Batalkan Pesanan" aktif
   │      ↓
   │   Klik batalkan → status "Dibatalkan", refund diproses manual oleh Admin (BR-006)
   └─ Tidak (sudah "Diproses/Produksi" atau lebih lanjut) → tombol batal disabled/tidak tersedia (BR-010)
```

**Flow 12 — Penolakan Order oleh Admin**
```
Admin buka /admin/orders, pilih order status "Menunggu Approval"
   ↓
Klik "Tolak Order" → wajib isi alasan penolakan (FR-043)
   ↓
Submit → status order "Ditolak", Customer menerima notifikasi + alasan
   ↓
(Kasus produksi gagal total pasca-approve — BR-015: Admin tawarkan alternatif via Chat dulu,
 jika Customer tolak seluruh alternatif → refund penuh manual, BR-006)
```

**Flow 13 — Reorder & Wishlist**
```
Customer buka /account/orders → pilih order lama → klik "Reorder"
   ↓
Sistem salin konfigurasi produk/desain ke keranjang baru (harga dihitung ulang sesuai harga saat ini)
   ↓
Lanjut seperti Flow 6 dari /cart

(Terpisah) Customer buka produk → klik "Tambah ke Wishlist" → tersimpan di /wishlist
   ↓
Jika produk/Creator kemudian tidak tersedia → item tetap muncul dengan badge "Tidak Tersedia" (BR-024),
tidak dapat di-checkout, tidak dihapus otomatis
```

**Flow 14 — Rating & Review**
```
Trigger: konfirmasi manual (Flow 10) → form muncul otomatis dalam alur yang sama (opsional)
   atau
Trigger: dari Riwayat Pesanan pasca auto-complete → Customer buka order "Selesai" → klik "Beri Rating"
   ↓
Isi rating (1-5) + review teks → submit → tersimpan, tampil di halaman produk/Creator
```

**Flow 15 — Chat Customer–Admin**
```
Customer buka /chat → kirim pesan ke Admin
   ↓
Admin terima di /admin/chat (Chat Management terpusat, seluruh chat customer dalam satu dashboard)
   ↓
Admin balas → Customer terima notifikasi real-time (FR-029)
```

**Flow 16 — Upload Desain & Preview Multi-Apparel (Creator)**
```
Creator (status "Aktif") buka /creator/designs/upload
   ↓
Upload file desain + pilih ≥1 jenis apparel yang kompatibel (FR-022) — status desain: Draft
   ↓
Masuk /creator/designs/{designId}/preview (Editor Preview Multi-Apparel)
   ↓
Preview & konfirmasi desain di TIAP jenis apparel yang dipilih
   ↓
Semua jenis apparel sudah dikonfirmasi?
   ├─ Belum → tombol "Submit" tetap nonaktif, indikator jenis apparel yang belum dicek ditampilkan
   └─ Ya → tombol "Submit" aktif → submit ke Admin, status desain "Menunggu Approval"
```

**Flow 17 — Approval Desain (Admin)**
```
Admin buka /admin/designs/approval → pilih desain status "Menunggu Approval"
   ↓
Review desain per jenis apparel yang disubmit
   ↓
Approve → status "Aktif", tayang di marketplace
   ↓
Reject → status "Ditolak" + alasan wajib diisi → Creator menerima notifikasi
   ↓
Creator revisi desain "Ditolak" → submit ulang (entry yang sama, bukan submission baru — BR-028)
   ↓
Status kembali "Menunggu Approval" → ulangi dari awal flow ini
```

**Flow 18 — Approval Creator (Admin)**
```
Admin buka /admin/creators/approval → pilih pengajuan status "Menunggu Approval"
   ↓
Review data Verifikasi Data Diri (kelengkapan, bukan validasi resmi ke pihak ketiga — Feature List 1.5 Bagian 9)
   ↓
Approve → status Creator "Aktif" / Reject → status "Ditolak" + alasan, Customer tetap berstatus Customer biasa
```

**Flow 19 — Komplain Kualitas Pasca-Selesai**
```
Order berstatus "Selesai" (dari konfirmasi manual atau auto-complete)
   ↓
Dalam 7 hari kalender sejak "Selesai"?
   ├─ Ya → Customer ajukan komplain via Chat (Flow 15) → Admin tangani case-by-case manual,
   │        tidak ada refund/reproduksi otomatis (BR-016)
   └─ Tidak → status "Selesai" dianggap final, komplain tidak lagi dapat diajukan lewat flow ini
```

**Flow 20 — Notifikasi Real-time**
```
Event sistem terjadi (order berubah status, chat masuk, approval Creator/desain, dst.)
   ↓
Sistem cek konfigurasi notifikasi (diatur Admin — FE-038, FR-039)?
   ├─ Jenis notifikasi ini aktif → kirim in-app real-time via WebSocket (Laravel Reverb)
   └─ Jenis notifikasi ini nonaktif → tidak dikirim
   ↓
User lihat di /notifications (in-app saja untuk MVP — BR-027, email/SMS di Fase 2)
```

---

### 4. Decision Points

| Decision Point | Flow | Hasil |
|---|---|---|
| Validasi form registrasi | 1 | Lanjut buat akun / tampilkan error |
| Sesi login saat aksi transaksional | 2 | Lanjut aksi / redirect login |
| Kelengkapan data KYC | 3 | Menunggu Approval / error field kurang |
| Semua apparel dikonfirmasi (Editor Preview Multi-Apparel) | 16 | Submit aktif / submit tetap nonaktif |
| Hasil pembayaran Midtrans | 6, 7 | Menunggu Approval / Belum Dibayar → auto-cancel 24 jam |
| Status order saat request batal | 11 | Tombol aktif / disabled |
| Approve/Reject (Creator, Desain, Order) | 12, 17, 18 | Status Aktif / Ditolak, dengan alasan wajib untuk reject |
| Aksi Customer dalam 3 hari kerja sejak "Delivered" | 10 | Selesai manual (+ prompt rating) / auto-complete (tanpa prompt) |
| Window komplain 7 hari sejak "Selesai" | 19 | Komplain diterima / status final |
| Konfigurasi notifikasi aktif/nonaktif | 20 | Kirim / tidak kirim |

---

### 5. Validation Rules

- **Registrasi (FR-001)**: Email format valid & belum terdaftar, password memenuhi minimum kompleksitas, consent Privacy Policy & ToS wajib dicentang (NFR-012).
- **Upload Desain (FE-015, Feature List 1.5 Bagian 9)**: Maksimal 20 MB, format PNG/SVG saja.
- **KYC (FR-035, BR-008)**: Nama lengkap & nomor identitas wajib diisi; validasi hanya cek kelengkapan, bukan validasi resmi pihak ketiga.
- **Checkout (FR-017)**: Seluruh item di keranjang harus valid (bahan/varian masih tersedia) sebelum lanjut ke pembayaran.
- **Bulk Order (FR-044)**: Total kuantitas dari seluruh kombinasi ukuran dipakai untuk menentukan tingkat harga (BR-012), bukan per-ukuran.
- **Penolakan (FR-043, BR-015)**: Alasan penolakan/reject wajib diisi, tidak boleh kosong — berlaku untuk reject Order, Desain, dan Creator.
- **Harga di keranjang (BR-025)**: Harga terkunci saat item ditambahkan; perubahan harga bahan/tingkat oleh Admin setelahnya tidak memengaruhi item yang sudah ada di keranjang.

---

### 6. Exception Flow

| Exception | Penanganan |
|---|---|
| Pembayaran Midtrans gagal/timeout | Status "Belum Dibayar", auto-cancel dalam 24 jam (BR-017), Customer checkout ulang. |
| Produksi gagal total (bahan discontinued) | Admin wajib tawarkan alternatif via Chat; seluruh alternatif ditolak → refund penuh manual (BR-015, BR-006). |
| Creator/desain di-ban karena hak cipta terbukti | Desain ditarik otomatis dari marketplace; order yang sudah checkout sebelum ban tetap diproduksi & dikirim, tidak berdampak ke Customer (BR-019); komisi terkait ditahan seluruhnya (BR-020); akses Customer pada akun yang sama ikut disuspend (BR-023). |
| Dugaan plagiarisme antar-Creator | Tidak ada alur/UI dispute khusus — ditangani manual oleh Admin lewat Chat/email di luar sistem (BR-021). |
| Item Wishlist tidak tersedia lagi | Tetap muncul dengan badge "Tidak Tersedia", tidak dapat di-checkout, tidak dihapus otomatis (BR-024). |
| Chargeback/pembatalan paksa dari bank | Di luar kendali sistem, proses dispute di sisi Midtrans-bank, ditangani manual Admin jika terjadi (Project Brief 1.1 Bagian 16). |

---

### 7. Alternative Flow

- **Reorder (Flow 13)** sebagai jalur pintas menuju Checkout (Flow 6) tanpa mengulang Flow 4/5 dari awal.
- **Bulk Order (Flow 7)** sebagai jalur alternatif penuh dari Checkout Reguler (Flow 6) — keduanya tidak dapat digabung dalam satu transaksi (BR-026).
- **Rating & Review** dapat diisi lewat dua pemicu berbeda: langsung dalam alur konfirmasi manual (Flow 10), atau belakangan lewat Riwayat Pesanan setelah auto-complete (Flow 14).
- **Revisi Desain "Ditolak" (Flow 17)** adalah alternative flow dari submission baru — entry yang sama disubmit ulang, bukan membuat desain baru dari nol (BR-028).

---

### 8. Business Rules

*Rujukan lengkap: Bagian 1.2 Bagian 6. Business Rules yang paling menentukan alur di dokumen ini: BR-003 (pembayaran sebelum masuk produksi), BR-010 (batas waktu pembatalan), BR-012 (skema harga Bulk Order), BR-014 (trigger status Selesai), BR-017 (auto-cancel 24 jam), BR-025 (harga terkunci di keranjang), BR-026 (Bulk Order checkout terpisah).*

---

### 9. State Transition

**Order Status**
```
Belum Dibayar → Menunggu Approval → Diproses/Produksi → Dikirim → Menunggu Konfirmasi → Selesai
      │                  │
      ↓                  ↓
  Dibatalkan          Ditolak
  (auto 24 jam,       (Admin reject,
   BR-017)             FR-043)
                        │
                        ↓
                  (Customer batalkan manual,
                   hanya saat "Menunggu Approval",
                   BR-010) → Dibatalkan
```

**Payment Status**
```
Belum Dibayar → Diproses (Midtrans) → Berhasil
                                    → Gagal/Timeout → (kembali ke Belum Dibayar, retry checkout)
```

**Shipment Status**
```
Menunggu Pickup → Dikirim → Delivered → (trigger Order Status: Menunggu Konfirmasi)
```

**Creator Status**
```
(belum mengajukan) → Menunggu Approval → Aktif → Nonaktif / Di-ban
                                        → Ditolak → (dapat mengajukan ulang)
```

**Design Status**
```
Draft (saat upload & preview, sebelum semua apparel dikonfirmasi & disubmit)
    ↓
Menunggu Approval → Aktif (tayang di marketplace)
                  → Ditolak → (Creator revisi & submit ulang, entry sama — BR-028) → Menunggu Approval
```

---

### 10. System Response

| Aksi User | Respon Sistem |
|---|---|
| Checkout berhasil dibayar | Status order berubah, invoice ter-generate, notifikasi terkirim ke Customer & Admin. |
| Admin approve/reject (Order, Desain, Creator) | Status entitas berubah, notifikasi terkirim ke pihak terkait dengan alasan (jika reject). |
| Biteship update status resi | Status pengiriman & order Customer ter-update otomatis real-time, tanpa aksi manual Admin. |
| Customer konfirmasi diterima / auto-complete 3 hari | Status order "Selesai", form rating muncul (khusus konfirmasi manual). |
| Tidak ada aksi Customer 3 hari sejak "Delivered" | Sistem otomatis set status "Selesai" (job terjadwal). |
| Tidak ada pembayaran 24 jam sejak checkout | Sistem otomatis set status "Dibatalkan" (job terjadwal). |

---

### 11. Related Modules

Authentication, User Management, Marketplace, Product Catalog, Product Customization, Creator Management, Order Management, Payment, Shipping, Notification, Review & Rating, Communication, Admin Dashboard — seluruh 13 modul operasional dari 15 kategori Feature List (1.5 Bagian 2) terhubung ke minimal satu flow di dokumen ini (Analytics & Settings/Localization bersifat lintas-flow, tidak punya flow transaksional sendiri).

---

### 12. Notes

- Flow di dokumen ini adalah alur logis/fungsional, bukan diagram teknis (sequence diagram/ERD) — detail teknis diturunkan di Phase 4 (Database Design) & Phase 5 (API & Backend Planning).
- Job terjadwal (auto-cancel 24 jam, auto-complete 3 hari kerja) perlu dicatat sebagai kebutuhan scheduler/queue saat System Architecture (Phase 3).
- Seluruh flow yang melibatkan notifikasi (checkout, approval, chat, dst.) tunduk pada Flow 20 (Konfigurasi Notifikasi) — tidak diulang detailnya di tiap flow individual.

---

### Dependencies

**Depends On**

- Functional Requirements
- Sitemap
- User Roles

**Used By**

- Navigation Structure
- Database Design
- API Design
- Wireframe
- Backend Development

---

# 2.4 Navigation Structure — Harmoni Clothing

**Output:** Bagian 2.4
**Tujuan:** Menentukan struktur navigasi website untuk setiap role.
**Referensi:** [[Phase 2 - Information Architecture#2.1 Sitemap — Harmoni Clothing|2.1 Sitemap]], [[Phase 2 - Information Architecture#2.3 User Flow — Harmoni Clothing|2.3 User Flow]]
**Digunakan Oleh:** — (dipakai saat Layout & Responsive Design — Phase 6/8, belum dibuat)
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Dokumen ini menerjemahkan 45 halaman di Sitemap (2.1) menjadi struktur menu yang dapat dinavigasi user sesuai role-nya (2.2 User Roles), sebagai acuan Wireframe (Phase 6) dan implementasi layout Frontend (Phase 8).

---

### 2. Navigation Principles

- **Role-aware, bukan role-terpisah**: Navigasi menyesuaikan konten yang tampil berdasar role (Guest/Customer/Creator/Admin), tetapi Customer dan Creator berbagi kerangka navigasi yang sama (Creator hanya mendapat tambahan menu, konsisten dengan BR-013 & User Roles 2.2 Bagian 10).
- **Area Admin terpisah total**: `/admin/*` menggunakan layout & navigasi tersendiri (sidebar), terpisah dari navigasi publik/Customer, karena sifatnya operasional bukan konsumen (User Roles 2.2 Bagian 5).
- **Konsisten dengan Sitemap**: Setiap item navigasi mengarah ke halaman yang sudah terdaftar di Sitemap (2.1) — tidak ada tautan menuju halaman yang belum didefinisikan.
- **Minim friction sebelum login**: Navigasi publik tetap menampilkan aksi transaksional (Cart, Wishlist) agar Guest bisa mencoba, dengan pemahaman bahwa aksi tersebut memicu redirect login (Flow 2, User Flow 2.3).

---

### 3. Navigation Types

- **Global Navigation**: Navbar atas, tampil di seluruh halaman publik & Customer/Creator — Logo, Marketplace, Katalog, Tentang Kami, Search, ikon Cart, ikon Notifikasi, menu Akun/tombol Login.
- **Primary Navigation**: Menu utama per konteks — dropdown Akun (Customer), sidebar Dashboard (Creator), sidebar Admin.
- **Secondary Navigation**: Navigasi dalam halaman — tab & filter (misal filter kategori di Marketplace/Katalog, tab status di Riwayat Pesanan).
- **Footer Navigation**: Tautan statis — Kebijakan Privasi, Syarat & Ketentuan, dan informasi platform dasar (tampil di seluruh halaman publik).

---

### 4. Navigation by Role

**Guest**
- Global Navigation: Logo, Marketplace, Katalog, Tentang Kami, Search, ikon Cart (kosong/redirect login jika diklik saat isi), tombol "Masuk" & "Daftar".
- Tidak ada menu Akun, Notifikasi, atau Chat.

**Customer**
- Global Navigation: sama seperti Guest + ikon Notifikasi aktif + dropdown Akun menggantikan tombol Login.
- Dropdown Akun: Kelola Profil, Address Book, Riwayat Pesanan, Wishlist, Chat dengan Admin, Ajukan Upgrade jadi Creator (hanya tampil jika belum Creator), Logout.

**Creator**
- Seluruh navigasi Customer tetap ada, ditambah:
- Dropdown Akun: entri tambahan "Dashboard Creator" (mengarah ke `/creator/dashboard`, area dengan sidebar sendiri: Dashboard, Verifikasi Data Diri — hanya tampil bila belum "Aktif", Kelola Desain, Statistik & Komisi).

**Admin**
- Tidak menggunakan Global Navigation publik — login Admin langsung masuk ke layout `/admin/*` dengan sidebar tetap:
  Dashboard, Kelola User & Creator (+ Approval Creator), Approval Desain, Kelola Product Catalog, Kelola Antrian Produksi, Kelola Pesanan, Kelola Pembayaran & Invoice, Kelola Pengiriman, Chat Management, Konfigurasi Notifikasi, Sales Report.

---

### 5. Navigation Tree

```
Global Navigation (Guest/Customer/Creator)
├── Logo → /
├── Marketplace → /marketplace
├── Katalog → /catalog
├── Tentang Kami → /about
├── Search (inline, hasil ke /marketplace atau /catalog sesuai konteks)
├── Cart icon → /cart
├── Notification icon → /notifications (Customer/Creator saja)
└── Account
    ├── (Guest) Masuk → /login | Daftar → /register
    └── (Customer/Creator) Dropdown
        ├── Kelola Profil → /account
        ├── Address Book → /account/addresses
        ├── Riwayat Pesanan → /account/orders
        ├── Wishlist → /wishlist
        ├── Chat dengan Admin → /chat
        ├── Ajukan Upgrade jadi Creator → /account/become-creator   (disembunyikan jika sudah Creator)
        ├── Dashboard Creator → /creator/dashboard                  (hanya jika role Creator)
        └── Logout

Admin Sidebar (terpisah, bukan bagian Global Navigation)
├── Dashboard → /admin/dashboard
├── Kelola User & Creator → /admin/users
│   └── Approval Creator → /admin/creators/approval
├── Approval Desain → /admin/designs/approval
├── Kelola Product Catalog → /admin/catalog
├── Kelola Antrian Produksi → /admin/production
├── Kelola Pesanan → /admin/orders
├── Kelola Pembayaran & Invoice → /admin/payments
├── Kelola Pengiriman → /admin/shipments
├── Chat Management → /admin/chat
├── Konfigurasi Notifikasi → /admin/notifications/settings
└── Sales Report → /admin/reports
```

---

### 6. Breadcrumb Structure

- **Format**: `Beranda > [Halaman Induk] > [Halaman Aktif]`.
- **Contoh Katalog**: `Beranda > Katalog Produk > Kaos Oversize Polos`.
- **Contoh Marketplace**: `Beranda > Marketplace Desain > [Nama Creator] > [Nama Desain]`.
- **Contoh Akun**: `Akun Saya > Riwayat Pesanan > Detail Pesanan #ORD-0001`.
- **Contoh Admin**: `Admin > Kelola User & Creator > Approval Creator`.
- Breadcrumb tidak ditampilkan di halaman transaksional linear (Cart → Checkout → Invoice) karena alurnya sudah linear dan disertai step indicator, bukan navigasi bebas.

---

### 7. Deep Link Rules

- Halaman publik (Beranda, Marketplace, Katalog, Detail Produk/Desain, Profil Creator, Tentang Kami) dapat diakses langsung via URL tanpa login (Sitemap 2.1 Bagian 3).
- Halaman Customer/Creator (`/account/*`, `/account/orders/*`, `/cart`, `/checkout`, `/creator/*`) yang diakses tanpa sesi login → redirect ke `/login` dengan `return_url` disimpan, kembali ke URL tujuan setelah berhasil login (Flow 2, User Flow 2.3).
- Halaman `/creator/*` yang diakses oleh Customer yang belum berstatus Creator "Aktif" → redirect ke `/account/become-creator`.
- Halaman `/admin/*` yang diakses oleh non-Admin (termasuk Customer/Creator yang sudah login) → ditolak akses (403), tidak ada redirect ke halaman Admin manapun.
- Halaman detail dengan slug/ID yang tidak ditemukan (produk dihapus, order milik user lain) → halaman 404/403 sesuai konteks.

---

### 8. Responsive Navigation

- **Desktop**: Navbar horizontal penuh (Global Navigation), sidebar tetap terbuka untuk Admin & Dashboard Creator.
- **Tablet**: Navbar tetap horizontal dengan item dipadatkan (search dapat menjadi ikon-expand), sidebar Admin/Creator dapat collapse jadi ikon saja.
- **Mobile**: Navbar menjadi hamburger menu + bottom navigation ringkas (Beranda, Marketplace/Katalog, Cart, Akun) untuk aksi paling sering dipakai. Product Editor tetap fungsional di mobile meski prioritas desktop (NFR-002, Requirement Gathering 1.2), navigasi editor di mobile disederhanakan jadi panel bawah (bottom sheet) alih-alih sidebar.
- Sidebar Admin di mobile berubah menjadi drawer (slide-in), bukan default terbuka, mengingat Admin (Persona Pak Budi) juga sesekali cek dari HP (User Persona 1.3 Bagian 2.3).

---

### 9. Accessibility

*Baseline praktik umum untuk MVP, bukan komitmen kepatuhan standar formal (tidak ada requirement WCAG eksplisit di Phase 1) — dicatat di sini supaya tidak terlewat saat implementasi Frontend (Phase 8).*

- Seluruh item navigasi dapat diakses via keyboard (tab order logis, focus state terlihat jelas).
- Ikon navigasi (Cart, Notification, Search) disertai label teks atau `aria-label` untuk pembaca layar.
- Kontras warna menu mengikuti Design System (Phase 6) agar tetap terbaca di light/dark state tombol aktif-nonaktif.

---

### 10. Notes

- Struktur navigasi ini adalah kerangka logis; tampilan visual detail (ikon, warna, spacing) ditentukan di Design System (6.2) dan Wireframe (6.3).
- Item "Dashboard Creator" di dropdown Akun adalah satu-satunya elemen navigasi yang bersifat kondisional berdasarkan status role tambahan (Creator "Aktif") — seluruh item lain kondisional murni berdasar status login (Guest vs Customer).
- **Update 2026-07-21**: Wireframe Figma (Phase 6) sempat membangun navbar Guest dan navbar Customer/Creator sebagai dua komponen statis terpisah per jenis halaman (Public flow selalu pakai navbar Guest, Customer/Creator flow selalu pakai navbar logged-in) — ini menyimpang dari prinsip "Role-aware, bukan role-terpisah" di Bagian 2 dokumen ini. Saat implementasi Frontend (Phase 8), navbar dibangun ulang agar benar-benar reaktif ke status login sebenarnya (Zustand auth state), bukan statis per jenis halaman — artinya user yang sudah login tetap melihat navbar logged-in (Cart/Notifikasi/Akun) meski membuka halaman Public, sesuai dokumen ini, bukan sesuai perilaku statis di Figma.

---

### Dependencies

**Depends On**

- Sitemap
- User Flow

**Used By**

- Wireframe
- Frontend Development

---

# 2.5 Permission Matrix — Harmoni Clothing

**Output:** Bagian 2.5
**Tujuan:** Mendefinisikan hak akses setiap role terhadap modul, halaman, fitur, dan API.
**Referensi:** [[Phase 2 - Information Architecture#2.2 User Roles — Harmoni Clothing|2.2 User Roles]], [[Phase 2 - Information Architecture#2.3 User Flow — Harmoni Clothing|2.3 User Flow]]
**Digunakan Oleh:** [[Phase 5 - API & Backend Planning#5.4 Authentication Flow — Harmoni Clothing|5.4 Authentication Flow]], [[Phase 5 - API & Backend Planning#5.6 Security Planning — Harmoni Clothing|5.6 Security Planning]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Dokumen ini adalah rincian granular dari hak akses tingkat tinggi yang sudah didefinisikan di User Roles (2.2 Bagian 6 — Accessible Modules). Menjadi acuan langsung untuk implementasi Policy/Middleware di Backend (Phase 7) dan pengujian akses saat QA (Phase 9).

---

### 2. Permission Convention

- **Format penamaan**: `module.action`, huruf kecil, snake_case (contoh: `order.approve`, `design.review`).
- **Action standar**: `create`, `read`, `update`, `delete`, `approve` — mengikuti kolom di Bagian 4.
- **Action khusus non-CRUD**: dicatat sebagai action tersendiri bila tidak masuk 5 action standar (contoh: `order.cancel`, `order.reject`, `creator.ban`).
- **Scope kepemilikan**: Permission Customer/Creator selalu terbatas pada data milik sendiri (`own`), kecuali dinyatakan lain. Admin selalu `all` (seluruh data), tidak ada scope `own` untuk Admin karena Admin tidak memiliki data transaksional pribadi (User Roles 2.2 Bagian 5).

---

### 3. Module List

*Konsisten dengan Feature Categories di Feature List (1.5 Bagian 2), 15 modul:*

Authentication, User Management, Marketplace, Product Catalog, Product Customization, Creator Management, Order Management, Payment, Shipping, Notification, Review & Rating, Communication, Admin Dashboard, Analytics, Settings/Localization.

---

### 4. Module Permission Matrix

*C = Create, R = Read, U = Update, D = Delete, A = Approve. Sel kosong berarti tidak ada akses.*

**Guest**

| Module | Create | Read | Update | Delete | Approve |
|---|---|---|---|---|---|
| Marketplace | | R (publik) | | | |
| Product Catalog | | R (publik) | | | |

**Customer**

| Module | Create | Read | Update | Delete | Approve |
|---|---|---|---|---|---|
| Authentication | C (register) | R (sesi sendiri) | U (password) | | |
| User Management | | R (profil sendiri) | U (profil, address book) | D (address, bukan akun) | |
| Marketplace | | R | | | |
| Product Catalog | | R | | | |
| Product Customization | C (konfigurasi produk) | R | U (sebelum checkout) | D (batal sebelum checkout) | |
| Order Management | C (order, wishlist) | R (order sendiri) | U (catatan, batal — sebelum produksi) | D (wishlist) | |
| Payment | C (checkout) | R (invoice sendiri) | | | |
| Shipping | | R (tracking sendiri) | | | |
| Notification | | R (milik sendiri) | | | |
| Review & Rating | C (setelah "Selesai") | R | | | |
| Communication | C (chat) | R (chat sendiri) | | | |

**Creator** *(seluruh permission Customer tetap berlaku, ditambah:)*

| Module | Create | Read | Update | Delete | Approve |
|---|---|---|---|---|---|
| Creator Management | C (KYC, desain) | R (desain, statistik sendiri) | U (desain sebelum approve, profil Creator) | D (desain sendiri, sebelum tayang) | |
| Marketplace | | R + tampil sebagai penjual | | | |
| Analytics | | R (statistik & komisi sendiri) | | | |

**Admin**

| Module | Create | Read | Update | Delete | Approve |
|---|---|---|---|---|---|
| User Management | | R (semua user) | U (status akun) | D (nonaktifkan) | |
| Creator Management | | R (semua) | U (status Creator) | | A (approval Creator) |
| Product Catalog | C | R | U | D | |
| Order Management | | R (semua order) | U (status produksi) | | A (approval order) — juga action `order.reject` |
| Marketplace/Design | | R (semua desain) | | | A (approval desain) |
| Payment | | R (semua) | U (status manual jika perlu) | | |
| Shipping | C (booking kirim) | R | U (status manual jika perlu) | | |
| Notification | | | U (konfigurasi jenis notifikasi) | | |
| Review & Rating | | R (moderasi tidak tersedia MVP) | | | |
| Communication | | R (semua chat) | | | |
| Admin Dashboard | | R | | | |
| Analytics | | R (sales report) | | | |

---

### 5. Feature Permission Matrix

*Dipetakan ke ID Feature List (1.5). Hanya fitur dengan perbedaan akses signifikan antar role yang dicantumkan; fitur murni CRUD data milik sendiri mengikuti Module Permission Matrix di atas.*

| Fitur | Guest | Customer | Creator | Admin |
|---|---|---|---|---|
| Browsing Marketplace/Katalog (FE-008/012) | ✔ | ✔ | ✔ | ✔ (read) |
| 3D Product Editor (FE-014/017/018) | ✖ (redirect login) | ✔ | ✔ | ✖ |
| Perhitungan Harga Otomatis (FE-026) | ✖ | ✔ | ✔ | ✖ (lihat hasil saja) |
| Checkout & Bulk Order (FE-027, FE-052) | ✖ | ✔ | ✔ | ✖ |
| Ajukan Upgrade jadi Creator (FE-053) | ✖ | ✔ | — (sudah Creator) | ✖ |
| Upload & Kelola Desain (FE-021) | ✖ | ✖ | ✔ | ✖ |
| Editor Preview Multi-Apparel (FE-023) | ✖ | ✖ | ✔ | ✖ |
| Statistik & Komisi (FE-024) | ✖ | ✖ | ✔ (milik sendiri) | ✔ (via Sales Report agregat) |
| Approval Creator (FE-044) | ✖ | ✖ | ✖ | ✔ |
| Approval Desain (FE-045) | ✖ | ✖ | ✖ | ✔ |
| Penolakan Order (FE-055) | ✖ | ✖ | ✖ | ✔ |
| Product Catalog Management (FE-046) | ✖ | ✖ | ✖ | ✔ |
| Order & Production Management (FE-047) | ✖ | ✖ (lihat status sendiri) | ✖ | ✔ |
| Chat Management terpusat (FE-041) | ✖ | ✖ (chat sendiri saja) | ✖ | ✔ |
| Konfigurasi Notifikasi (FE-038) | ✖ | ✖ | ✖ | ✔ |
| Sales Report (FE-050) | ✖ | ✖ | ✖ | ✔ |

---

### 6. Page Permission Matrix

*Merujuk 45 halaman di Sitemap (2.1). Halaman dikelompokkan per bagian Sitemap; aturan akses mengikuti Deep Link Rules (Navigation Structure 2.4 Bagian 7).*

| Kelompok Halaman | Guest | Customer | Creator | Admin |
|---|---|---|---|---|
| Public Pages (2.1 Bagian 3) | Akses penuh | Akses penuh | Akses penuh | Akses penuh (tanpa aksi transaksi) |
| Customer Pages (2.1 Bagian 4) | Redirect `/login` | Akses penuh (data sendiri) | Akses penuh (data sendiri) | Tidak dapat diakses (403) |
| Creator Pages (2.1 Bagian 5) | Redirect `/login` | Redirect `/account/become-creator` | Akses penuh (data sendiri) | Tidak dapat diakses (403) |
| Admin Pages (2.1 Bagian 6) | Tidak dapat diakses (403) | Tidak dapat diakses (403) | Tidak dapat diakses (403) | Akses penuh |

---

### 7. API Authorization

*Detail endpoint lengkap ada di Phase 5 (API List & API Specification). Bagian ini mendefinisikan pola otorisasi tingkat tinggi yang wajib diikuti saat API dirancang.*

| Pola Route | Middleware/Guard | Role Diizinkan |
|---|---|---|
| `GET /api/marketplace/*`, `GET /api/catalog/*` | Publik (tanpa auth) | Guest, Customer, Creator, Admin |
| `POST /api/auth/*` | Publik (tanpa auth) | Guest |
| `*/api/account/*`, `/api/cart`, `/api/checkout`, `/api/orders/*` | `auth` | Customer, Creator (scope: `own`) |
| `/api/creator/*` | `auth` + `role:creator` (status "Aktif") | Creator (scope: `own`) |
| `/api/admin/*` | `auth` + `role:admin` | Admin (scope: `all`) |

*`role:admin` middleware mengecek kolom `users.role` (Database Design 4.3 — enum `customer`/`admin`), bukan tabel terpisah.*

- Seluruh endpoint scope `own` wajib memvalidasi kepemilikan data di level backend (bukan hanya menyembunyikan UI), sesuai NFR-009 (Requirement Gathering 1.2) yang mensyaratkan pola Service + Repository + Form Request + Policy di Laravel.
- Endpoint publik (Marketplace, Katalog) tetap read-only di level HTTP method — tidak ada `POST/PUT/DELETE` yang dibuka tanpa auth.

---

### 8. Business Rules

*Business Rules yang secara langsung membentuk aturan permission di dokumen ini (rujukan lengkap: Bagian 1.2 Bagian 6):*

- **BR-001/BR-002**: Creator & desain wajib approval Admin sebelum kapabilitas/kontennya aktif secara publik — karena itu action `approve` di Module Permission Matrix (Bagian 4) eksklusif milik Admin.
- **BR-013**: Creator adalah upgrade dari akun Customer (bukan role terpisah) — karena itu Feature/Page Permission Matrix Creator selalu superset dari Customer, tidak pernah exclusive-or.
- **BR-019/BR-020/BR-023**: Ban Creator menghapus permission `creator.*` secara otomatis (desain ditarik), dan jika ban karena pelanggaran hak cipta terbukti, permission `customer.*` pada akun yang sama ikut disuspend.
- **FR-043**: Reject order adalah permission eksklusif Admin dengan syarat wajib mengisi alasan (divalidasi di layer Form Request, bukan hanya UI).

---

### 9. Security Notes

- Seluruh permission di dokumen ini **wajib ditegakkan di backend** (Laravel Policy per NFR-009), UI hanya menyembunyikan elemen yang tidak relevan — bukan satu-satunya lapisan proteksi (mencegah privilege escalation lewat manipulasi request langsung).
- Data sensitif (KYC/nomor identitas, alamat pengiriman) yang dapat dibaca Admin tetap tunduk pada enkripsi penyimpanan (NFR-011); permission `read` di sini tidak menggugurkan kewajiban enkripsi at-rest.
- Middleware role (`role:creator`, `role:admin`) harus mengevaluasi status terkini (Aktif/Nonaktif/Di-ban), bukan cache status lama, terutama setelah aksi ban Admin (Exception Flow, User Flow 2.3 Bagian 6).
- Tidak ada permission per-user granular (custom role) di MVP — konsisten dengan Multi Admin & Role Permission yang masuk Out of Scope (Project Brief 1.1 Bagian 9).

---

### 10. Audit Permissions

*Aksi yang wajib dicatat sebagai audit log (detail skema logging ditentukan di Phase 4/Phase 5, bagian ini hanya menetapkan cakupannya):*

- Approve/Reject Creator, Desain, dan Order (siapa, kapan, alasan jika reject).
- Ban/nonaktifkan Creator atau user.
- Perubahan status pembayaran & pengiriman yang dilakukan manual oleh Admin.
- Perubahan harga bahan/tingkat Bulk Order oleh Admin (memengaruhi BR-025 — harga terkunci di keranjang).
- Perubahan Konfigurasi Notifikasi oleh Admin.

---

### 11. Notes

- Matrix di dokumen ini adalah spesifikasi hak akses tingkat produk; implementasi teknis (nama Policy class, middleware alias, struktur Form Request) ditentukan di Phase 5 (Auth Flow, Security Checklist) dan Phase 7 (Backend Development).
- Setiap penambahan modul/fitur baru pasca-Phase 2 wajib memperbarui dokumen ini terlebih dahulu sebelum diimplementasikan, konsisten dengan protokol perubahan di seluruh dokumen Phase 1 & 2.

---

### Dependencies

**Depends On**

- User Roles
- User Flow

**Used By**

- Backend Authorization
- Middleware
- API
- Frontend Access Control
- QA Testing
