# Phase 3 — System Architecture: Indeks Dokumen

**Proyek:** Harmoni Clothing Website

Dokumen ini adalah peta navigasi untuk 5 dokumen Phase 3. Gunakan ini untuk menemukan "informasi X ada di dokumen mana" tanpa perlu membuka semua file satu per satu.

---

## Daftar Dokumen

| # | Dokumen | File | Isi Singkat |
|---|---|---|---|
| 3.1 | Technology Stack | Bagian 3.1 | Formalisasi stack per layer (sudah dipatok di Project Brief Constraints), version matrix, state management frontend, external services, dev tools. Ini adalah **dokumen akar Phase 3**, seluruh dokumen lain merujuk ke sini. |
| 3.2 | System Architecture | Bagian 3.2 | Modular monolith + REST API + WebSocket, diagram layer Laravel (Controller → Service → Repository → Database), data flow, integrasi pihak ketiga, NFR. |
| 3.3 | Module Breakdown | Bagian 3.3 | 15 modul dipetakan langsung ke 57 fitur di Master Feature List (1.5), tanggung jawab, dependency, interface, shared component. |
| 3.4 | Folder Structure | Bagian 3.4 | Struktur repo monorepo (`/backend`, `/frontend`), termasuk DTO/Enums/Jobs (backend) dan types/services/providers (frontend). |
| 3.5 | Coding Standards | Bagian 3.5 | Naming convention, PSR-12, ESLint/Prettier/TS rules, Git convention, migration policy, documentation sync policy. |

---

## Dokumen Terkait

[[Phase 3 - System Architecture#3.1 Technology Stack — Harmoni Clothing|3.1 Technology Stack]], [[Phase 3 - System Architecture#3.2 System Architecture — Harmoni Clothing|3.2 System Architecture]], [[Phase 3 - System Architecture#3.3 Module Breakdown — Harmoni Clothing|3.3 Module Breakdown]], [[Phase 3 - System Architecture#3.4 Folder Structure — Harmoni Clothing|3.4 Folder Structure]], [[Phase 3 - System Architecture#3.5 Coding Standards — Harmoni Clothing|3.5 Coding Standards]]

---

*Dokumen ini mengikuti template Phase 3 yang telah ditetapkan (`Phase 3.md`), dengan penyesuaian: Module Breakdown (3.3) memakai daftar modul aktual dari Master Feature List (1.5) menggantikan daftar generik di template, dan Folder Structure/Coding Standards mendapat tambahan sesuai arahan approval.*

---

# 3.1 Technology Stack — Harmoni Clothing

**Output:** Bagian 3.1
**Tujuan:** Menentukan teknologi yang digunakan pada setiap layer aplikasi beserta alasan pemilihannya.
**Referensi:** [[Phase 1 - Product Discovery#1.6 MVP Definition — Harmoni Clothing|1.6 MVP Definition]]
**Digunakan Oleh:** [[Phase 3 - System Architecture#3.2 System Architecture — Harmoni Clothing|3.2 System Architecture]], [[Phase 3 - System Architecture#3.4 Folder Structure — Harmoni Clothing|3.4 Folder Structure]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

- **Tujuan**: Memformalkan stack teknologi yang sudah dipatok di Project Brief (1.1 Bagian 15 — Constraints) menjadi spesifikasi versi & rasional yang siap dipakai untuk System Architecture (3.2) dan implementasi Backend/Frontend (Phase 7–8).
- **Prinsip Pemilihan Teknologi**: (1) Konsisten dengan Constraints Project Brief — tidak memilih ulang stack yang sudah ditetapkan; (2) Prioritas layanan free-tier/biaya minim (anggaran seminimal mungkin, Project Brief 1.1 Bagian 15); (3) Stack yang familiar untuk pengembangan berbantuan AI (Claude Code) — ekosistem dengan dokumentasi & konvensi matang (Laravel, Next.js).

---

### 2. Technology Overview

- **Frontend**: Next.js (React, App Router) + TypeScript
- **Backend**: Laravel (PHP)
- **Database**: MySQL
- **Cache/Queue**: Redis
- **Realtime**: Laravel Reverb (WebSocket self-hosted)
- **3D Rendering**: Three.js/WebGL
- **Storage**: Cloudflare R2 (+ Cloudflare CDN)
- **Payment**: Midtrans
- **Shipping**: Biteship
- **Hosting**: VPS Linux, dikemas Docker Compose
- **Monitoring**: Laravel Telescope (dev/staging), Sentry free tier (error tracking), UptimeRobot free tier (uptime — NFR-006)

---

### 3. Stack by Layer

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | Next.js | 14.x (App Router) | UI, SSR/CSR, routing berbasis role (2.1 Sitemap) |
| Frontend | React | 18.x | Library UI dasar Next.js |
| Frontend | TypeScript | 5.x | Type safety |
| 3D Editor | Three.js | Rilis stabil terbaru saat development dimulai | Product Editor (FE-014/017/018) |
| Backend | Laravel | ~~11.x~~ **13.x** *(diubah — lihat Bagian 9)* | REST API, business logic |
| Backend | PHP | 8.2 / 8.3 | Runtime backend |
| Database | MySQL | 8.0 | Data transaksional |
| Cache/Queue | Redis | 7.x | Session cache, queue job (auto-cancel, auto-complete) |
| Realtime | Laravel Reverb | 1.x | Chat & notifikasi in-app (FR-028/029) |
| Storage | Cloudflare R2 | — | File desain, aset mockup 3D |
| CDN | Cloudflare | — | Delivery aset statis |

---

### 4. External Services

| Layanan | Fungsi |
|---|---|
| Midtrans | Payment Gateway |
| Biteship | Pengiriman & auto tracking resi |
| Cloudflare R2 | Penyimpanan file desain & aset mockup 3D |
| SMTP | Email reset password (FR-003) & verifikasi email — **bukan** untuk notifikasi order (notifikasi MVP in-app saja, BR-027) |
| OAuth | Tidak dipakai — Google OAuth Out of Scope (Project Brief 1.1 Bagian 9) |

---

### 5. Development Tools

- VS Code (dengan Claude Code CLI)
- Git
- GitHub
- Postman
- Figma (desain, dikerjakan Product Owner)
- Docker

---

### 6. Environment Requirements

- Node.js 20.x LTS
- PHP ^8.2
- Composer
- MySQL 8
- pnpm

---

### 7. Upgrade Strategy

- **Version Policy**: Pin versi minor selama development aktif (target 1 bulan, Project Brief 1.1 Bagian 15) — tidak berpindah versi major di tengah sprint.
- **Dependency Update Policy**: Tidak ada auto-upgrade dependency selama development aktif; review upgrade (termasuk major version) hanya dilakukan pasca-MVP (v1.1 ke atas, Product Roadmap 1.7).

---

### 8. Notes

- **State Management (Frontend)**:
  - **Server state**: TanStack Query (React Query) — data fetching, caching, invalidasi otomatis. Cocok untuk data yang berubah dari backend: status order & tracking (FR-023), statistik Creator (FR-026), notifikasi (FR-029).
  - **Client/UI state**: Zustand — ringan, dipakai untuk state Keranjang, state Product Editor (kombinasi varian, posisi desain di 3D Editor), toggle UI. Dipilih dibanding Redux karena boilerplate minim, cocok untuk solo developer.
  - **Realtime state**: Event dari Reverb (WebSocket) memicu invalidasi TanStack Query dan/atau update langsung ke store Zustand (misal notifikasi masuk, status order berubah — Flow 20, User Flow 2.3).
- Seluruh pilihan teknologi di dokumen ini bukan keputusan baru — murni formalisasi dari Project Brief (1.1 Bagian 15), kecuali pilihan Monitoring dan State Management yang belum eksplisit di Phase 1 dan ditetapkan di sini sebagai bagian dari System Architecture.

---

### 9. Deviasi dari Rencana Awal *(dicatat 2026-07-21, setelah Phase 7-8 berjalan)*

| Rencana Awal | Realisasi | Alasan |
|---|---|---|
| Laravel 11.x | **Laravel 13.x** | Setiap rilis 11.x yang sudah di-patch keamanan (11.31–11.55) diblokir Composer audit gate saat scaffolding dimulai (17 Jul 2026); user memilih upgrade ke 13.x (rilis stabil terbaru) daripada memaksa 11.x yang rentan. |
| Server state: TanStack Query | **SWR** | Dipilih saat implementasi frontend (Phase 8) — tidak ada alasan teknis kuat yang tercatat, murni preferensi implementasi. Fungsinya setara (fetching + cache + revalidation) untuk kebutuhan MVP ini. |
| Cache/Queue/Session: Redis | **Database driver** (`SESSION_DRIVER=database`, dst.) | Redis tidak terpasang di environment development lokal; fallback ke driver database/file/log agar development bisa berjalan tanpa dependency tambahan. **Perlu dikonfirmasi ulang sebelum deployment produksi** — apakah tetap pakai Redis sesuai rencana atau lanjut dengan driver database. |
| Realtime: Laravel Reverb (WebSocket) | **Belum terpasang** — notifikasi & chat berjalan lewat polling/refresh biasa (lihat status FR-029/BR-027 di Bagian 1.2 Bagian 6) | Reverb tidak dijalankan di environment development; kode sudah siap broadcast ke channel Reverb tapi tidak ada listener/server yang aktif menerimanya. |
| i18n library: belum ditentukan (NFR-008 hanya menyebut "struktur i18n", tanpa nama library) | **next-intl** (tanpa URL locale routing — bahasa disimpan di cookie `NEXT_LOCALE`, bukan prefix `/id`/`/en`) | Dipilih 2026-07-29 (Code Audit Batch 2c) — dukungan Server Component App Router paling matang di antara alternatif (`react-i18next`, `next-i18next`). Mode tanpa routing dipilih supaya URL hasil rename Batch 2b (Bagian 2.1 §8) tidak perlu diprefiks ulang. |

---

### Dependencies

**Depends On**

- Project Scope

**Used By**

- Backend Development
- Frontend Development
- Deployment

---

# 3.2 System Architecture — Harmoni Clothing

**Output:** Bagian 3.2
**Tujuan:** Mendefinisikan arsitektur sistem beserta hubungan antar komponen.
**Referensi:** [[Phase 3 - System Architecture#3.1 Technology Stack — Harmoni Clothing|3.1 Technology Stack]], [[Phase 1 - Product Discovery#1.5 Feature List — Harmoni Clothing|1.5 Feature List]]
**Digunakan Oleh:** [[Phase 3 - System Architecture#3.3 Module Breakdown — Harmoni Clothing|3.3 Module Breakdown]], [[Phase 4 - Database Design#4.1 Entity Identification — Harmoni Clothing|4.1 Entity Identification]], [[Phase 5 - API & Backend Planning#5.2 API List — Harmoni Clothing|5.2 API List]], [[Phase 5 - API & Backend Planning#5.6 Security Planning — Harmoni Clothing|5.6 Security Planning]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Dokumen ini menerjemahkan Technology Stack (3.1) menjadi arsitektur sistem konkret: bagaimana Frontend, Backend, Database, dan layanan pihak ketiga saling terhubung, sebagai dasar Database Design (Phase 4) dan API & Backend Planning (Phase 5).

---

### 2. Architecture Style

- **Modular Monolith** — Backend Laravel dipecah per modul domain (15 modul, lihat Module Breakdown 3.3), bukan microservices. Dipilih karena constraint anggaran & timeline 1 bulan (Project Brief 1.1 Bagian 15) — microservices menambah overhead operasional yang tidak sepadan untuk tim solo.
- **Client-Server** — Next.js Frontend berkomunikasi dengan Laravel Backend murni via API, tidak ada shared runtime.
- **REST API** — Kontrak komunikasi utama Frontend-Backend.
- **WebSocket (tambahan)** — Laravel Reverb untuk chat & notifikasi real-time (FR-028/029), berjalan berdampingan dengan REST API, bukan pengganti.

---

### 3. High-Level Diagram

```
[Next.js Frontend]
        │  HTTP REST (JSON)  /  WebSocket (Reverb)
        ▼
[Laravel Backend]
   Policy       ── otorisasi request (Permission Matrix 2.5), mengapit Controller
        │
   Controller   ── HTTP layer: terima request, validasi via Form Request, panggil Service
        │            (DTO dibentuk di sini sebagai data terstruktur ke Service — detail di 3.4)
        ▼
   Service      ── business logic (mis. PricingService, OrderService, CheckoutService),
        │           orchestrate Repository + panggil External Service (Midtrans/Biteship)
        ▼
   Repository   ── abstraksi akses data (Eloquent/query builder)
        │
        ▼
   Database (MySQL)

   Event/Listener ── dipicu dari Service (mis. OrderStatusChanged), broadcast via Reverb ke Frontend,
                      terpisah dari alur linear Controller→Service→Repository di atas

[Laravel Backend] ──> Midtrans (payment webhook)
                  ──> Biteship (shipping webhook)
                  ──> Cloudflare R2 (S3-compatible SDK, upload/ambil file)
```

---

### 4. Components

- **Frontend**: Next.js (App Router), route group per role (`(public)`, `(customer)`, `(creator)`, `(admin)` — selaras Sitemap 2.1).
- **Backend**: Laravel, arsitektur layer Controller → Service → Repository (Bagian 3), 15 modul domain (Module Breakdown 3.3).
- **Database**: MySQL — data transaksional (Phase 4).
- **Cache/Queue**: Redis — session cache, job terjadwal (auto-cancel 24 jam BR-017, auto-complete 3 hari kerja BR-014).
- **Storage**: Cloudflare R2 — file desain & aset mockup 3D, di-serve lewat Cloudflare CDN.
- **Realtime**: Laravel Reverb — broadcast event ke Frontend (chat, notifikasi, update status order).
- **External Services**: Midtrans (payment), Biteship (shipping).

---

### 5. Data Flow

**Contoh: Checkout Reguler (Flow 6, User Flow 2.3)**
```
Customer (Next.js) → POST /api/checkout → Controller (validasi Form Request)
   → CheckoutService (hitung harga via PricingService, validasi stok/varian)
   → OrderRepository (create Order, status "Belum Dibayar")
   → panggil Midtrans Snap API → redirect Customer ke halaman pembayaran
   → Midtrans webhook (POST /api/webhooks/midtrans) → Controller → PaymentService
   → update status Order jadi "Menunggu Approval" → InvoiceService generate invoice
   → Event OrderStatusChanged → Listener → broadcast Reverb
   → Frontend Customer & Admin terima notifikasi real-time (Flow 20)
```

**Contoh: Approval Desain (Flow 17, User Flow 2.3)**
```
Admin (Next.js /admin/designs/approval) → PATCH /api/admin/designs/{id}/approve
   → Controller (Policy cek role Admin) → DesignApprovalService
   → DesignRepository (update status "Aktif") → Event DesignApproved
   → broadcast Reverb → notifikasi ke Creator terkait
```

---

### 6. Integration Architecture

- **Midtrans**: Webhook masuk ke endpoint terverifikasi signature (`POST /api/webhooks/midtrans`), diproses `PaymentService`.
- **Biteship**: Webhook status pengiriman masuk ke `POST /api/webhooks/biteship`, memicu update `ShipmentService` → trigger status "Menunggu Konfirmasi" saat "Delivered" (BR-014).
- **Cloudflare R2**: Diakses lewat S3-compatible SDK dari `FileUploadService` (upload desain, aset mockup).
- **Laravel Reverb**: Event Laravel (`Event::dispatch`) di-broadcast lewat channel per user/role, di-subscribe Frontend lewat `WebSocketProvider` (lihat Folder Structure 3.4).

---

### 7. Non Functional Requirements

| NFR | Penerapan Arsitektur |
|---|---|
| Performance (NFR-001, <3 detik termasuk render 3D) | Lazy load model 3D, Draco/KTX2 compression (sudah ditetapkan Feature List 1.5 Bagian 9), cache query di Redis untuk data yang sering diakses (Katalog, Marketplace). |
| Scalability (NFR-005, ±100 concurrent) | Modular monolith cukup untuk skala ini; Redis menangani session & queue agar tidak membebani MySQL langsung. |
| Availability (NFR-006, 99% uptime) | Monitoring UptimeRobot (3.1), VPS dengan Docker Compose restart policy `always`. |
| Reliability (NFR-004, backup harian otomatis) | Cron job `mysqldump` terjadwal, disimpan ke Cloudflare R2 terpisah dari bucket aset publik. |

---

### 8. Risks & Constraints

- Solo developer, timeline 1 bulan, anggaran minim (Project Brief 1.1 Bagian 15) → arsitektur sengaja sederhana (modular monolith, bukan microservices) untuk meminimalkan overhead operasional & deployment.
- Ketergantungan pada layanan pihak ketiga (Midtrans, Biteship, Cloudflare) — downtime pihak ketiga berdampak langsung ke checkout/shipping (sudah dicatat sebagai risiko di Project Brief 1.1 Bagian 16).

---

### 9. Notes

Modular monolith dipilih supaya modul dapat dipecah menjadi service terpisah di masa depan (Fase 2+, Product Roadmap 1.7) tanpa rewrite total, tanpa menanggung kompleksitas operasional microservices sekarang.

---

### Dependencies

**Depends On**

- Technology Stack

**Used By**

- Database Design
- API Design
- Infrastructure

---

# 3.3 Module Breakdown — Harmoni Clothing

**Output:** Bagian 3.3
**Tujuan:** Membagi sistem menjadi modul-modul yang independen.
**Referensi:** [[Phase 3 - System Architecture#3.2 System Architecture — Harmoni Clothing|3.2 System Architecture]], [[Phase 1 - Product Discovery#1.5 Feature List — Harmoni Clothing|1.5 Feature List]]
**Digunakan Oleh:** [[Phase 3 - System Architecture#3.4 Folder Structure — Harmoni Clothing|3.4 Folder Structure]], [[Phase 4 - Database Design#4.1 Entity Identification — Harmoni Clothing|4.1 Entity Identification]], [[Phase 5 - API & Backend Planning#5.1 Business Rules — Harmoni Clothing|5.1 Business Rules]], [[Phase 5 - API & Backend Planning#5.2 API List — Harmoni Clothing|5.2 API List]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Dokumen ini memetakan seluruh 57 fitur di Master Feature List (1.5) ke dalam 15 modul domain yang menjadi unit pengembangan di Backend (arsitektur Modular Monolith, 3.2 Bagian 2). **Catatan penyesuaian dari template**: Module List di template Phase 3.md bersifat contoh generik (`Product`, `Cart`, `Checkout`, dst.). Modul di dokumen ini memakai daftar aktual dari Master Feature List (1.5 Bagian 2 — Feature Categories) yang sudah dipakai konsisten sejak Requirement Gathering (1.2) dan Permission Matrix (2.5), bukan daftar generik template.

---

### 2. Module List & Pemetaan FE-ID

*Diturunkan langsung dari Feature Inventory (1.5 Bagian 3), bukan daftar generik.*

| Modul | Jumlah Fitur | FE-ID |
|---|---|---|
| Authentication | 5 | FE-001–005 |
| User Management | 4 | FE-006, FE-007, FE-053, FE-060 |
| Marketplace | 4 | FE-008–011 |
| Product Catalog | 2 | FE-012, FE-013 |
| Product Customization | 6 | FE-014–019 |
| Creator Management | 5 | FE-020–024 |
| Order Management | 9 | FE-025–031, FE-052, FE-056 |
| Payment | 2 | FE-032, FE-033 |
| Shipping | 4 | FE-034–036, FE-054 |
| Notification | 2 | FE-037, FE-038 |
| Review & Rating | 1 | FE-039 |
| Communication | 2 | FE-040, FE-041 |
| Admin Dashboard | 9 | FE-042–049, FE-055 |
| Analytics | 1 | FE-050 |
| Settings/Localization | 1 | FE-051 |
| **Total** | **57** | Konsisten dengan Feature List 1.5 Bagian 3 (Total: 57 fitur inti) |

---

### 3. Module Responsibilities

*Tanggung jawab tiap modul 1:1 dengan definisi modul di Requirement Gathering (1.2 Bagian 4 — Functional Requirements per Modul) — tidak diulang di sini untuk menghindari duplikasi. Rujuk Bagian 1.2 Bagian 4 untuk detail per modul.*

---

### 4. Module Dependencies

```
Order Management → Payment, Shipping, Notification
Creator Management → User Management, Marketplace
Product Customization → Product Catalog, Marketplace
Admin Dashboard → seluruh modul lain (moderasi & kelola lintas modul)
Communication → Notification (chat memicu notifikasi real-time)
Analytics → Order Management, Payment (sumber data Sales Report)
```

---

### 5. Module Interfaces

- Setiap modul mengekspos satu **Service class** (business logic) dan satu grup **REST endpoint** (`/api/{module}/*`), sesuai layer Controller → Service → Repository (System Architecture 3.2 Bagian 3).
- Pola otorisasi per modul mengikuti Permission Matrix (2.5 Bagian 7 — API Authorization): endpoint publik (`/api/marketplace/*`, `/api/catalog/*`), endpoint `auth` (Customer/Creator scope `own`), endpoint `auth + role:admin` (scope `all`).

---

### 6. Shared Components

| Shared Component | Dipakai Oleh | Fungsi |
|---|---|---|
| Pricing Engine (`PricingService`) | Order Management, Product Customization | Hitung harga bahan/ukuran/kuantitas (FE-026), termasuk skema bertingkat Bulk Order (BR-012) |
| Notification Dispatcher | Seluruh modul | Kirim event ke Reverb, tunduk pada Konfigurasi Notifikasi Admin (FE-038) |
| File Upload Service | Product Customization, Creator Management | Upload ke Cloudflare R2 (desain, mockup) |

---

### 7. Module Lifecycle

Urutan pembangunan modul mengikuti Module Roadmap di Product Roadmap (1.7 Bagian 5):

```
Localization/i18n Foundation
        ↓
Authentication & User Management (termasuk Address Book)
        ↓
Product Catalog & Marketplace
        ↓
Product Customization
        ↓
Order Management
        ↓
Payment
        ↓
Shipping
        ↓
Creator Management
        ↓
Notification (bersamaan dengan modul-modul di atas, karena bersifat lintas modul)
        ↓
Review & Rating
        ↓
Communication
        ↓
Admin Dashboard & Analytics
```

---

### 8. Notes

Modul ini adalah unit pengembangan logis (Service + Repository per modul), bukan unit deployment terpisah — seluruh modul tetap berjalan dalam satu aplikasi Laravel (Modular Monolith, 3.2 Bagian 2).

---

### Dependencies

**Depends On**

- System Architecture

**Used By**

- Database
- API
- Backend Development

---

# 3.4 Folder Structure — Harmoni Clothing

**Output:** Bagian 3.4
**Tujuan:** Menentukan struktur folder project agar konsisten.
**Referensi:** [[Phase 3 - System Architecture#3.3 Module Breakdown — Harmoni Clothing|3.3 Module Breakdown]]
**Digunakan Oleh:** [[Phase 3 - System Architecture#3.5 Coding Standards — Harmoni Clothing|3.5 Coding Standards]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Dokumen ini menentukan struktur folder repository sebagai acuan implementasi Backend & Frontend (Phase 7–8). Struktur nyata folder ini juga discaffold langsung ke root project (`D:\Harmoni Clothing`, di luar `Required Document`), karena tugas ini berjenis **Code** (bukan Planning) di Roadmap.

---

### 2. Repository Structure

**Monorepo** — satu Git repository di root project berisi `backend/` (Laravel) dan `frontend/` (Next.js), dengan `docker-compose.yml` di root. Dipilih untuk meminimalkan overhead koordinasi versi pada tim satu orang, konsisten dengan Constraint anggaran & waktu (Project Brief 1.1 Bagian 15).

---

### 3. Directory Structure

```
D:\4_Project\Harmoni-Clothing/
├── Required Document/       (dokumentasi Phase 1-11, sudah ada)
├── backend/                 (Laravel — lihat Bagian 4)
├── frontend/                (Next.js — lihat Bagian 5)
├── docker-compose.yml
└── README.md
```

---

### 4. Backend Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/   (per modul: AuthController, OrderController, dst. — 3.3 Bagian 2)
│   │   ├── Requests/          (Form Request validation — NFR-009)
│   │   └── Middleware/         (otorisasi — realisasi Permission Matrix 2.5, lihat Bagian 9)
│   ├── Services/               (business logic per modul, mis. PricingService, OrderService)
│   ├── Repositories/           (data access layer per modul)
│   ├── Models/
│   ├── DTO/                    (realisasi: `CheckoutDTO`, `BulkCheckoutDTO` — bukan
│   │                             OrderDTO/PricingResultDTO/BulkOrderDTO seperti rencana awal,
│   │                             lihat Bagian 9)
│   ├── Enums/                  (realisasi: `UserRole`, `UserStatus` saja — status
│   │                             Order/Payment/Shipment/Creator/Design TIDAK berupa enum,
│   │                             lihat Bagian 9)
│   └── Jobs/                   (kosong — realisasi berbeda dari rencana, lihat Bagian 9)
├── database/migrations/
├── routes/api.php
└── .env.example
```

---

### 5. Frontend Structure

```
frontend/
├── app/
│   ├── (public)/                (Beranda, Marketplace, Katalog, Login/Register — 2.1 Bagian 3)
│   ├── (customer)/               (Account, Orders, Cart, Checkout, Editor — 2.1 Bagian 4)
│   ├── (creator)/                (Dashboard, Designs — 2.1 Bagian 5)
│   └── (admin)/                  (2.1 Bagian 6)
├── components/
├── lib/                          (util generik: formatter, konstanta)
├── hooks/                        (domain hooks per modul: useCart, useOrders, useProducts,
│                                   useDesigns, useWishlist, useNotifications, useBulkPricing —
│                                   wrapper SWR + swrKeys, bukan TanStack Query, lihat Bagian 9)
├── store/                        (Zustand stores — 3.1 Bagian 8)
├── types/                        (TypeScript interface/type per modul: Order, Product, Design,
│                                   User, dst. — dipakai lintas app/components/services)
├── services/                     (API service layer per modul: orderService.ts, authService.ts,
│                                   dst. — wrapper fetch, terpisah dari /lib yang isinya util
│                                   generik)
├── providers/                    (realisasi: `AppProviders.tsx` + `I18nProvider.tsx` —
│                                   bukan AuthProvider/WebSocketProvider/QueryProvider terpisah
│                                   seperti rencana awal, lihat Bagian 9)
├── locales/                      (i18n ID/EN — `id.json`/`en.json` via next-intl, NFR-008)
└── public/
```

---

### 6. Shared Resources

- `types/` di frontend dan `DTO/` di backend menyimpan bentuk data yang sama secara konseptual (mis. struktur Order) — tidak ada code-sharing otomatis antar bahasa (PHP vs TypeScript), sinkronisasi manual mengikuti API Documentation (Phase 5).
- `locales/` (frontend) menjadi satu-satunya sumber string UI (NFR-008) — tidak ada hardcoded string di komponen.

---

### 7. Environment Files

- `backend/.env.example` — kredensial Midtrans, Biteship, Cloudflare R2, SMTP, koneksi MySQL/Redis (nilai asli tidak pernah di-commit).
- `frontend/.env.example` — base URL API, key publik (jika ada) untuk layanan pihak ketiga sisi client.
- `docker-compose.yml` di root mengorkestrasi service: `backend`, `frontend`, `mysql`, `redis`, `reverb`.

---

### 8. Documentation Structure

Dokumentasi produk & arsitektur tetap terpusat di `Required Document/` (Phase 1–11), terpisah dari kode — folder `backend/` dan `frontend/` hanya berisi dokumentasi teknis lokal (README per folder) bila diperlukan saat development, bukan pengganti `Required Document/`.

---

### 9. Notes

Struktur ini adalah kerangka awal; folder tambahan (mis. `app/Traits`, `app/Http/Middleware` custom di backend, atau `frontend/config`) dapat ditambahkan saat Backend/Frontend Development (Phase 7–8) sesuai kebutuhan nyata, selama tidak menyimpang dari pola Controller→Service→Repository (3.2) dan modul di 3.3.

**Realisasi vs rencana (dicatat 2026-07-30, Code Audit Batch 7):**

| Folder | Rencana Awal | Realisasi | Alasan |
|---|---|---|---|
| `backend/app/Policies/` | Otorisasi via Laravel Policy per Permission Matrix (2.5) | **Tidak dipakai** — otorisasi lewat middleware (`admin`, `creator.active`) + scoping manual di controller/repository | Keputusan Code Audit K-3 (2026-07-29): pendekatan middleware+scoping sudah berjalan dan teruji (214+ test) sebelum Policy resmi dipertimbangkan; mengganti sekarang murni cleanup arsitektur tanpa manfaat fungsional baru. Permission Matrix (2.5) tetap jadi acuan aturan, hanya mekanisme penegakannya yang beda. |
| `backend/app/Jobs/` | 4 Job async lewat Queue (auto-cancel, auto-complete, invoice, notifikasi) | **Kosong** — auto-cancel/auto-complete order diimplementasikan sebagai Laravel **Console Command** terjadwal, bukan queued Job | Queue driver production (Redis) belum dikonfirmasi (lihat Bagian 3.1 §9) — Console Command + scheduler cukup untuk kebutuhan MVP tanpa dependency Queue worker terpisah. |
| `backend/app/DTO/` | `OrderDTO`, `CheckoutDTO`, `PricingResultDTO`, `BulkOrderDTO` | Hanya `CheckoutDTO`, `BulkCheckoutDTO` | Kebutuhan struktur data transit ternyata cukup ditangani 2 DTO untuk alur checkout reguler & bulk; Order/Pricing tidak butuh DTO terpisah karena sudah tercakup langsung oleh Model/Resource. |
| `backend/app/Enums/` | `OrderStatus`, `PaymentStatus`, `ShipmentStatus`, `CreatorStatus`, `DesignStatus` (native PHP enum) | Hanya `UserRole`, `UserStatus` | Status Order/Payment/Shipment/Design ditangani lewat kolom string + validasi transisi di Service layer (lihat State Transition, Bagian 2.3 §9), bukan native enum — keputusan implementasi, bukan gap fungsional (transisi status tetap ditegakkan). |
| `frontend/providers/` | `AuthProvider`, `WebSocketProvider`, `I18nProvider`, `QueryProvider` (4 provider terpisah) | `AppProviders.tsx` (gabungan Auth+Query concerns) + `I18nProvider.tsx` | Reverb (WebSocket) belum terpasang (Bagian 3.1 §9), jadi tidak ada `WebSocketProvider`. SWR dipakai alih-alih TanStack Query (deviasi sama), sehingga tidak ada `QueryProvider` bernama demikian — logic setara ada di `AppProviders.tsx`. |
| `frontend/hooks/` dan `frontend/locales/` | Kosong di rencana awal (baru diisi saat development) | **Terisi penuh** — 7 domain hook (Code Audit Batch 6) dan `id.json`/`en.json` lengkap (Code Audit Batch 6b) | Bukan gap — dua folder ini sekarang justru sesuai rencana dokumen setelah batch perbaikan i18n & modularitas selesai. |

---

### Dependencies

**Depends On**

- Module Breakdown

**Used By**

- Backend Development
- Frontend Development

---

# 3.5 Coding Standards — Harmoni Clothing

**Output:** Bagian 3.5
**Tujuan:** Menentukan standar penulisan kode agar konsisten.
**Referensi:** [[Phase 3 - System Architecture#3.4 Folder Structure — Harmoni Clothing|3.4 Folder Structure]]
**Digunakan Oleh:** — (dipakai saat Backend/Frontend Development & Code Review — Phase 7/8, belum dibuat)
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Standar ini berlaku untuk seluruh kode yang ditulis di `backend/` dan `frontend/` (Folder Structure 3.4), sebagai acuan implementasi Phase 7–8 dan tolok ukur self-review (tim solo + Claude sebagai Developer).

---

### 2. General Rules

- Tidak ada kode yang menyimpang dari arsitektur layer Controller → Service → Repository (System Architecture 3.2) tanpa alasan yang didokumentasikan.
- Tidak ada hardcoded string UI (i18n, NFR-008) atau hardcoded harga/formula (Pricing Engine, harus lewat `PricingService`).
- Tidak menambah dependency baru di luar Technology Stack (3.1) tanpa melalui protokol perubahan.

---

### 3. Naming Convention

| Item | Konvensi | Contoh |
|---|---|---|
| File & folder (frontend) | kebab-case | `order-detail.tsx` |
| Komponen React | PascalCase | `OrderDetailCard.tsx` |
| Class PHP | PascalCase | `OrderService`, `OrderRepository` |
| Fungsi & variabel | camelCase | `calculateBulkPrice()` |
| Kolom database | snake_case | `order_status`, `created_at` |
| Endpoint API | kebab-case, plural resource | `/api/orders`, `/api/bulk-orders` |

---

### 4. Backend Standards

- **PSR-12** untuk seluruh kode PHP.
- **Laravel Best Practice**: pola Service + Repository + Form Request + Policy (NFR-009, Requirement Gathering 1.2), DTO untuk transfer data antar layer, Enum untuk representasi status (Folder Structure 3.4 Bagian 4).
- **Migration Policy**: Migration yang **sudah di-commit/dijalankan tidak boleh diedit langsung**. Perubahan skema wajib lewat migration baru (`Schema::table` untuk alter kolom/tabel existing) — tidak pernah mengubah isi file migration lama. Ini mencegah drift antar environment (lokal, staging, produksi) dan menjaga riwayat migrasi tetap dapat direplay dari awal.

---

### 5. Frontend Standards

- **ESLint** + **Prettier** — enforced sebelum commit.
- **TypeScript Rules** — `strict: true`, tidak ada `any` implisit; tipe data mengikuti struktur di `types/` (Folder Structure 3.4 Bagian 5).

#### 5.1 Responsive Design Convention

Disepakati 2026-07-20, menggantikan pendekatan desain terpisah di Figma (Phase 6.6) — responsive dikerjakan langsung di kode saat membangun tiap halaman (Tailwind classes, diverifikasi lewat resize browser), bukan dari mockup breakpoint terpisah.

**Breakpoint** — pakai default Tailwind, tanpa kustomisasi:
- Mobile: `<768px` (base, tanpa prefix)
- Tablet: `md:` (768–1023px)
- Desktop: `lg:` (1024px+)

**Prioritas desain per area** (mengikuti arahan persona di 6.0 Design Reference Brief):

| Area | Prioritas | Alasan |
|---|---|---|
| Public + Customer flow | Mobile-first | Persona Rangga — kebiasaan Shopee/Tokopedia |
| Creator + Admin flow | Desktop-first, wajib tetap fungsional di mobile | Persona Nadia/Pak Budi — kerja utama di desktop |
| Product Customization (3D Editor) | Desktop-priority, wajib ada layout mobile eksplisit | NFR-002 — bukan sekadar disusutkan dari desktop |

**Pola collapse terstandar** (dibangun sekali di shared component, dipakai ulang di semua halaman — tidak boleh diimprovisasi ulang per halaman):
- Navbar (guest/logged-in/admin): jadi hamburger + drawer slide-out di bawah `md`.
- AccountSidebar / CreatorSidebar / AdminSidebar: jadi off-canvas drawer/bottom-sheet di bawah `lg`, bukan dikecilkan jadi kolom sempit.
- Grid produk/desain (Katalog, Marketplace, Wishlist, dll): 5-kolom desktop → 3-kolom tablet → 2-kolom mobile.
- Layout 2-kolom (Cart, Checkout, Detail Pesanan, Invoice): summary column stack di bawah main column saat mobile; CTA utama jadi sticky bottom bar.
- Tabel Admin (Kelola Pesanan, Pembayaran, dll): scroll horizontal di mobile, bukan reflow kolom.
- Card/Stat row (Dashboard): 4-kolom desktop → 2-kolom mobile.

---

### 6. Git Standards

- **Branch Naming**: `feature/{modul}-{deskripsi-singkat}` (mis. `feature/order-bulk-pricing`), `fix/{deskripsi}` untuk bug fix.
- **Commit Convention**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- **Pull Request**: Tidak ada reviewer eksternal (tim solo) — tiap PR tetap melalui self-review checklist (Bagian 8) sebelum merge ke branch utama, Claude membantu proses review sebagai bagian dari peran Developer.

---

### 7. Documentation Standards

**Documentation Sync Policy**: Setiap perubahan skema database (migration baru) atau kontrak API **wajib** diikuti update dokumentasi terkait sebelum pekerjaan dianggap selesai:
- Perubahan skema → update ERD (Database Design 4.2) dan Database Schema/Table Design (4.3).
- Perubahan endpoint/kontrak → update API List (5.2) dan API Documentation (5.3).

Mengikuti protokol Change Log yang sudah dipakai di Requirement Gathering (1.2) — setiap perubahan dicatat dengan tanggal dan alasan, bukan diam-diam diubah tanpa jejak.

---

### 8. Code Review Checklist

- [ ] Mengikuti layer Controller → Service → Repository, tidak ada business logic di Controller.
- [ ] Validasi input lewat Form Request, bukan validasi manual di Controller.
- [ ] Otorisasi resource milik-sendiri (`own`-scope) dicek lewat scoped query yang masking sebagai 404 (`$user->relation()->findOrFail($id)`), bukan Policy class + 403 — konvensi ini dipakai konsisten sejak Phase 7 (Address Book, Cart, Wishlist, Orders, dll), sesuai Permission Matrix (2.5).
- [ ] Tidak ada migration lama yang diedit (Bagian 4 — Migration Policy).
- [ ] Dokumentasi terkait (ERD/API) sudah diperbarui jika ada perubahan skema/endpoint (Bagian 7).
- [ ] Tidak ada hardcoded string UI atau harga.
- [ ] Lulus ESLint/Prettier (frontend) atau PSR-12 (backend) tanpa error.

---

### 9. Notes

Standar ini adalah baseline untuk MVP — detail tambahan (mis. testing convention) akan dilengkapi saat QA (Phase 9) bila diperlukan.

---

### Dependencies

**Depends On**

- Folder Structure

**Used By**

- Entire Development Team
