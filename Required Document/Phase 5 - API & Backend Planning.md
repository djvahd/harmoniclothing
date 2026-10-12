# Phase 5 — API & Backend Planning: Indeks Dokumen

**Proyek:** Harmoni Clothing Website

Dokumen ini adalah peta navigasi untuk 6 dokumen Phase 5. Gunakan ini untuk menemukan "informasi X ada di dokumen mana" tanpa perlu membuka semua file satu per satu.

---

## Daftar Dokumen

| # | Dokumen | File | Isi Singkat |
|---|---|---|---|
| 5.1 | Business Rules | Bagian 5.1 | 28 BR dari 1.2 dikategorikan & dipetakan ke modul + state, untuk konsumsi Backend. |
| 5.2 | API List | Bagian 5.2 | Seluruh ±62 endpoint, method + path + auth + deskripsi, per kategori. Ini adalah **dokumen akar** untuk API Specification. |
| 5.3 | API Specification | Bagian 5.3 | Konvensi umum + spesifikasi detail 8 endpoint representatif (mewakili semua pola). |
| 5.4 | Authentication Flow | Bagian 5.4 | Laravel Sanctum SPA (cookie-based), login/register/logout/reset/session. |
| 5.5 | Error Handling | Bagian 5.5 | Format error terstandar, status code, logging (Sentry), pesan dwibahasa. |
| 5.6 | Security Planning | Bagian 5.6 | Authn/authz, proteksi data, upload security, rate limiting, checklist. |

---

## Dokumen Terkait

[[Phase 5 - API & Backend Planning#5.1 Business Rules — Harmoni Clothing|5.1 Business Rules]], [[Phase 5 - API & Backend Planning#5.2 API List — Harmoni Clothing|5.2 API List]], [[Phase 5 - API & Backend Planning#5.3 API Specification — Harmoni Clothing|5.3 API Specification]], [[Phase 5 - API & Backend Planning#5.4 Authentication Flow — Harmoni Clothing|5.4 Authentication Flow]], [[Phase 5 - API & Backend Planning#5.5 Error Handling — Harmoni Clothing|5.5 Error Handling]], [[Phase 5 - API & Backend Planning#5.6 Security Planning — Harmoni Clothing|5.6 Security Planning]]

---

*Dokumen ini mengikuti template Phase 5 yang telah ditetapkan (`Phase 5.md`), diturunkan dari Phase 1–4. Catatan cakupan: API Specification (5.3) merinci penuh 8 endpoint representatif (bukan seluruh ±62 endpoint) yang mewakili setiap pola berbeda — endpoint lain mengikuti pola yang sama saat implementasi Phase 7.*

---

# 5.1 Business Rules — Harmoni Clothing

**Output:** Bagian 5.1
**Tujuan:** Mendokumentasikan seluruh aturan bisnis sistem.
**Referensi:** [[Phase 1 - Product Discovery#1.5 Feature List — Harmoni Clothing|1.5 Feature List]], [[Phase 2 - Information Architecture#2.3 User Flow — Harmoni Clothing|2.3 User Flow]], [[Phase 3 - System Architecture#3.3 Module Breakdown — Harmoni Clothing|3.3 Module Breakdown]]
**Digunakan Oleh:** [[Phase 4 - Database Design#4.4 Validation Rules — Harmoni Clothing|4.4 Validation Rules]], [[Phase 5 - API & Backend Planning#5.2 API List — Harmoni Clothing|5.2 API List]], [[Phase 5 - API & Backend Planning#5.5 Error Handling — Harmoni Clothing|5.5 Error Handling]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

28 Business Rules (BR-001–028) sudah didefinisikan penuh di Requirement Gathering (1.2 Bagian 6) — dokumen ini **tidak menduplikasi** isinya, melainkan mengategorikan & memetakannya ke modul (3.3) dan state (2.3 Bagian 9) supaya siap dikonsumsi Backend saat implementasi Service layer.

---

### 2. Rule Categories

| Kategori | BR-ID |
|---|---|
| Approval & Verification | BR-001, BR-002, BR-008, BR-028 |
| Payment & Pricing | BR-003, BR-006, BR-009, BR-012, BR-017, BR-018, BR-025, BR-026 |
| Order Lifecycle | BR-004, BR-010, BR-011, BR-014, BR-015, BR-016, BR-022 |
| Creator & Commission | BR-005, BR-007, BR-013, BR-019, BR-020, BR-021, BR-023 |
| Data & Notification | BR-024, BR-027 |

---

### 3. Module Rules

| Modul (3.3) | BR Terkait |
|---|---|
| Order Management | BR-003, BR-004, BR-009, BR-010, BR-012, BR-014, BR-016–018, BR-022, BR-024–026 |
| Creator Management | BR-001, BR-005, BR-007, BR-008, BR-013, BR-019–021, BR-023, BR-028 |
| Payment | BR-003, BR-006, BR-017, BR-025 |
| Notification | BR-027 |

---

### 4. State Rules

Rule yang memicu transisi status (rujuk State Transition, 2.3 Bagian 9): **BR-003** (Belum Dibayar → Menunggu Approval), **BR-017** (auto-cancel 24 jam), **BR-001/002/008** (status Creator/Design → Menunggu Approval → Aktif/Ditolak), **BR-028** (Ditolak → Menunggu Approval saat revisi), **BR-014** (Menunggu Konfirmasi → Selesai).

---

### 5. Exception Rules

Rule penanganan kasus tidak normal: **BR-006** (refund manual), **BR-011** (produksi ulang gratis jika kesalahan produksi), **BR-015** (produksi gagal total → tawarkan alternatif → refund), **BR-016** (komplain 7 hari), **BR-019–021** (dampak ban Creator & dispute plagiarisme).

---

### 6. Notes

Sumber kebenaran tetap Bagian 1.2 Bagian 6 — dokumen ini adalah lapisan navigasi/kategorisasi untuk kebutuhan implementasi Backend, bukan pengganti.

---

### Dependencies

**Depends On**

- User Flow

**Used By**

- Backend
- API

---

# 5.2 API List — Harmoni Clothing

**Output:** Bagian 5.2
**Tujuan:** Mendata seluruh endpoint.
**Referensi:** [[Phase 3 - System Architecture#3.3 Module Breakdown — Harmoni Clothing|3.3 Module Breakdown]], [[Phase 5 - API & Backend Planning#5.1 Business Rules — Harmoni Clothing|5.1 Business Rules]]
**Digunakan Oleh:** [[Phase 5 - API & Backend Planning#5.3 API Specification — Harmoni Clothing|5.3 API Specification]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Base path `/api`. Kolom Auth: `public` tanpa login, `auth` Customer/Creator (scope `own`), `creator` role Creator aktif, `admin` role Admin (scope `all`) — sesuai Permission Matrix 2.5 Bagian 7.

---

### 2. Authentication APIs

*Termasuk User Management (profil & address book) — satu bucket identitas akun.*

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/register` | public | FR-001 |
| POST | `/auth/login` | public | FR-002 |
| POST | `/auth/logout` | auth | FR-002 |
| POST | `/auth/forgot-password` | public | FR-003 |
| POST | `/auth/reset-password` | public | FR-003 |
| GET | `/auth/verify-email/{id}/{hash}` | public | Verifikasi email |
| POST | `/auth/verify-email/resend` | public | Kirim ulang email verifikasi — ditambahkan 2026-10 |
| GET | `/me` | auth | Profil sesi aktif |
| PATCH | `/account/profile` | auth | FR-004 |
| GET | `/account/addresses` | auth | FR-048 |
| POST | `/account/addresses` | auth | FR-048 |
| PATCH | `/account/addresses/{id}` | auth | FR-048 |
| DELETE | `/account/addresses/{id}` | auth | FR-048 |
| POST | `/account/photo` | auth | Upload foto profil (semua role) — ditambahkan 2026-08 |
| DELETE | `/account/photo` | auth | Hapus foto profil — ditambahkan 2026-08 |

---

### 3. Product APIs

*Termasuk Marketplace, Product Catalog, Cart, Wishlist, Product Editor.*

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/marketplace/designs` | public | FE-008/009/010 |
| GET | `/marketplace/designs/filters` | public | Opsi filter (kategori, tag, dll) — ditambahkan, belum tercatat (lihat Bagian 8) |
| GET | `/marketplace/designs/{slug}` | public | Detail Desain |
| GET | `/marketplace/designs/{slug}/reviews` | public | Ulasan desain — ditambahkan, belum tercatat |
| GET | `/marketplace/creators` | public | Daftar Creator (list) — ditambahkan, belum tercatat |
| GET | `/marketplace/creators/{slug}` | public | FE-011 |
| GET | `/catalog/products` | public | FE-012 |
| GET | `/catalog/products/filters` | public | Opsi filter (kategori, gender_segment, dll) — ditambahkan, belum tercatat |
| GET | `/catalog/products/{slug}` | public | FE-013, termasuk variants |
| GET | `/catalog/products/{slug}/reviews` | public | Ulasan produk — ditambahkan, belum tercatat |
| POST | `/customization/uploads` | auth | FR-010/FE-015 — upload file desain custom di Product Editor, ditambahkan, belum tercatat |
| GET | `/cart` | auth | FE-025 |
| POST | `/cart` | auth | Tambah item — BR-025 snapshot harga |
| PATCH | `/cart/{id}` | auth | Ubah qty/catatan |
| DELETE | `/cart/{id}` | auth | |
| GET | `/wishlist` | auth | FE-030, badge tidak tersedia — BR-024 |
| POST | `/wishlist` | auth | |
| DELETE | `/wishlist/{id}` | auth | |

---

### 4. Order APIs

*Termasuk Checkout, Bulk Order, Payment, Shipping (sisi Customer), Invoice, Review, Chat & Notifikasi (sisi Customer).*

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/bulk-pricing-tiers` | public | BR-012 |
| POST | `/checkout` | auth | FR-017, Flow 6 |
| POST | `/checkout/shipping-rates` | auth | Pratinjau opsi kurir & ongkir dari Biteship sebelum checkout — ditambahkan 2026-09 |
| POST | `/checkout/bulk` | auth | FR-040/044, Flow 7 — BR-026 |
| GET | `/orders` | auth | FR-019 |
| GET | `/orders/{id}` | auth | FR-023, scope own |
| POST | `/orders/{id}/cancel` | auth | FR-036, BR-010 |
| POST | `/orders/{id}/confirm-received` | auth | FR-042, BR-014 |
| POST | `/orders/{id}/reorder` | auth | FR-019 |
| GET | `/orders/{id}/invoice` | auth | FR-018 |
| POST | `/orders/{id}/reviews` | auth | FR-027, BR-004 — body wajib sertakan `order_item_id` (review per item, bukan per order — 4.3) |
| GET | `/chat/threads` | auth | FR-028 |
| GET | `/chat/threads/{id}/messages` | auth | |
| POST | `/chat/threads/{id}/messages` | auth | |
| GET | `/notifications` | auth | FR-029 |
| PATCH | `/notifications/{id}/read` | auth | |

---

### 5. Creator APIs

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/account/become-creator` | auth | FR-041 |
| POST | `/creator/verification` | auth | FR-035, BR-008 |
| GET | `/creator/dashboard` | creator | FE-020 |
| GET | `/creator/designs` | creator | FR-024 |
| POST | `/creator/designs` | creator | Upload desain + pilih apparel — FR-022 |
| PATCH | `/creator/designs/{id}` | creator | Revisi desain "Ditolak" — BR-028 |
| POST | `/creator/designs/{id}/apparel/{productId}/confirm` | creator | FR-037 |
| POST | `/creator/designs/{id}/submit` | creator | Wajib semua apparel confirmed — Flow 16 |
| GET | `/creator/earnings` | creator | FR-026 |

---

### 6. Admin APIs

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/admin/dashboard` | admin | FE-042 |
| GET | `/admin/users` | admin | FR-030 |
| GET | `/admin/creators?status=aktif\|banned` | admin | Daftar creator yang sudah diputuskan (default `aktif`), dipakai untuk aksi Ban — ditambahkan 2026-10 |
| GET | `/admin/creators/pending` | admin | Approval queue |
| POST | `/admin/creators/{id}/approve` | admin | BR-001/008 |
| POST | `/admin/creators/{id}/reject` | admin | reason wajib |
| POST | `/admin/creators/{id}/ban` | admin | BR-019/020/023 |
| GET | `/admin/creators/{id}/kyc-document` | admin | Lihat dokumen KYC terenkripsi — ditambahkan, belum tercatat |
| GET | `/admin/designs/pending` | admin | FR-025 |
| POST | `/admin/designs/{id}/approve` | admin | BR-002 |
| POST | `/admin/designs/{id}/reject` | admin | reason wajib — BR-028 |
| GET | `/admin/catalog/products` | admin | List manajemen (beda dari `GET /catalog/products` publik) — ditambahkan, belum tercatat |
| POST | `/admin/catalog/products` | admin | FR-031 |
| PATCH | `/admin/catalog/products/{id}` | admin | |
| POST | `/admin/catalog/mockup-upload` | admin | Upload gambar mockup varian (PNG/SVG, maks 20MB) — ditambahkan 2026-08 |
| POST | `/admin/catalog/products/{id}/variants` | admin | FE-046 — ditambahkan, belum tercatat |
| PATCH | `/admin/catalog/variants/{id}` | admin | FE-046 — ditambahkan, belum tercatat |
| POST | `/admin/catalog/bulk-pricing-tiers` | admin | BR-012 |
| GET | `/admin/production-queue` | admin | FR-021 |
| PATCH | `/admin/orders/{id}/status` | admin | Update produksi — FR-021 |
| POST | `/admin/orders/{id}/reject` | admin | reason wajib — FR-043 |
| GET | `/admin/orders` | admin | List manajemen pesanan (beda dari `GET /orders` scope customer) — ditambahkan, belum tercatat |
| GET | `/admin/payments` | admin | FR-032 |
| POST | `/admin/orders/{id}/shipment` | admin | Booking Biteship — FR-022 |
| GET | `/admin/chat/threads` | admin | FE-041 |
| GET | `/admin/chat/threads/{id}/messages` | admin | Ditambahkan, belum tercatat |
| POST | `/admin/chat/threads/{id}/messages` | admin | |
| GET | `/admin/notification-settings` | admin | FE-038 |
| PATCH | `/admin/notification-settings/{type}` | admin | |
| GET | `/admin/reports/sales` | admin | FR-033 |
| GET | `/admin/audit-logs` | admin | Permission Matrix 2.5 Bagian 10 |

---

### 7. Integration APIs

*Endpoint publik yang dipanggil pihak ketiga (webhook), diverifikasi via signature — bukan endpoint yang dipanggil Frontend.*

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/webhooks/midtrans` | signature | Update status pembayaran |
| POST | `/webhooks/biteship` | signature | Update status pengiriman — trigger BR-014 |
| POST | `/broadcasting/auth` | auth | Otorisasi channel privat Laravel Reverb — **belum ada di `routes/api.php`** (Reverb belum terpasang, deviasi sudah dicatat di Bagian 3.1 §9), tidak perlu tindakan sekarang. |

---

### 8. Notes

Total ±72 endpoint (direvisi dari perkiraan awal ±62, Code Audit Batch 7, 2026-07-30) — 10 endpoint yang sudah ada di kode tapi belum tercatat ditambahkan ke atas (ditandai "ditambahkan, belum tercatat"), semua sudah diberi komentar `// gap-filled` di `routes/api.php`. Method & path final dapat sedikit berubah saat implementasi Phase 7 tanpa mengubah struktur dokumen ini, mengikuti Documentation Sync Policy (3.5 Bagian 7).

---

### Dependencies

**Depends On**

- Module Breakdown

**Used By**

- API Specification

---

# 5.3 API Specification — Harmoni Clothing

**Output:** Bagian 5.3
**Tujuan:** Mendefinisikan spesifikasi setiap endpoint.
**Referensi:** [[Phase 5 - API & Backend Planning#5.2 API List — Harmoni Clothing|5.2 API List]]
**Digunakan Oleh:** [[Phase 5 - API & Backend Planning#5.5 Error Handling — Harmoni Clothing|5.5 Error Handling]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

> **Keputusan cakupan**: Menulis spesifikasi detail (request/response/validasi/error/contoh) untuk seluruh ±62 endpoint akan sangat panjang & sebagian besar polanya berulang. Dokumen ini mendefinisikan **konvensi umum** (Bagian 2–7) yang berlaku untuk SEMUA endpoint, lalu memberi **spesifikasi penuh untuk 8 endpoint representatif** yang mewakili setiap pola berbeda (Bagian 8). Endpoint lain mengikuti pola yang sama saat diimplementasikan di Phase 7.

---

### 1. Overview

Base URL: `https://api.harmoniclothing.com/api` (produksi) — konvensi berlaku seragam di seluruh endpoint kecuali disebutkan lain per-endpoint.

---

### 2. Endpoint Convention

- Resource plural, kebab-case: `/bulk-pricing-tiers`, bukan `/bulkPricingTier`.
- Nested resource maksimal 2 level: `/orders/{id}/reviews`, tidak lebih dalam.

---

### 3. Request

```
Headers:
  Accept: application/json
  Content-Type: application/json
  X-XSRF-TOKEN: {csrf_token}   // Sanctum SPA — 5.4 Authentication Flow
Cookie: harmoni_session={session}  // otomatis oleh browser
```

---

### 4. Response

```json
// Sukses — single resource
{ "data": { ... } }

// Sukses — list (paginated)
{
  "data": [ ... ],
  "meta": { "current_page": 1, "per_page": 20, "total": 143 }
}
```

---

### 5. Validation

Diproses di Form Request (NFR-009) — format error lihat Error Handling (5.5 Bagian 3).

---

### 6. Error Response

```json
{
  "message": "Data yang dikirim tidak valid.",
  "errors": { "email": ["Email sudah terdaftar."] }
}
```

Format lengkap & seluruh kode error: lihat 5.5 Error Handling.

---

### 7. Status Codes

| Code | Arti |
|---|---|
| 200 | Sukses (GET/PATCH) |
| 201 | Resource dibuat (POST) |
| 204 | Sukses tanpa body (DELETE) |
| 401 | Belum login |
| 403 | Login tapi tidak berhak (Policy) — Permission Matrix 2.5 |
| 404 | Resource tidak ditemukan / bukan milik user (disamarkan sebagai 404, bukan 403, untuk data milik user lain) |
| 422 | Validasi gagal |
| 429 | Rate limit — 5.6 Bagian 7 |
| 500 | System error, dilog ke Sentry — 5.5 Bagian 5 |

---

### 8. Endpoint Detail (representatif)

**POST /auth/register** — *pola: public create + validasi kompleks*

Request:
```json
{
  "name": "Rangga Pratama",
  "email": "rangga@example.com",
  "password": "********",
  "password_confirmation": "********",
  "privacy_accepted": true,
  "terms_accepted": true
}
```
Validation: email unik & format valid, password min. 8 karakter, `privacy_accepted`/`terms_accepted` wajib `true` (NFR-012).
Response 201:
```json
{ "data": { "id": 42, "name": "Rangga Pratama", "email": "rangga@example.com" } }
```

**POST /auth/login** — *pola: autentikasi, set session cookie*

Request: `{ "email": "...", "password": "..." }`
Response 200: set-cookie sesi (Sanctum), body `{ "data": { "user": {...} } }`.
Error: 422 kredensial salah (pesan generik, tidak membedakan "email tidak ada" vs "password salah" — mencegah user enumeration); 429 setelah 5x gagal (5.6 Bagian 7).

**GET /catalog/products** — *pola: list publik + pagination + filter*

Query: `?category=kaos&page=1&per_page=20`
Response 200: envelope list standar (Bagian 4), field dwibahasa `name_id`/`name_en` sesuai `Accept-Language` header atau param `?lang=`.

**POST /checkout** — *pola: business logic kompleks (DTO, Pricing Engine)*

Request:
```json
{ "address_id": 7, "cart_item_ids": [12, 13] }
```
Alur backend: Controller → `CheckoutDTO` → `CheckoutService` (validasi stok/varian, hitung ulang via `PricingService` untuk verifikasi harga snapshot — BR-025) → `OrderRepository` create → panggil Midtrans Snap API.
Response 201:
```json
{ "data": { "order_id": 501, "order_number": "HC-20260712-0501", "midtrans_redirect_url": "..." } }
```
Error khusus: 422 jika item keranjang sudah tidak tersedia/varian nonaktif sejak ditambahkan.

**POST /admin/orders/{id}/reject** — *pola: aksi admin dengan reason wajib*

Request: `{ "reason": "Bahan yang diminta sedang habis." }`
Validation: `reason` wajib, min. 10 karakter (FR-043). Hanya berlaku jika `orders.status = "menunggu_approval"`.
Response 200: order berubah status "ditolak", event `OrderRejected` di-broadcast ke Customer (Flow 20).
Error: 409 Conflict jika status order sudah berubah (mis. sudah masuk produksi) sebelum request diproses.

**POST /webhooks/midtrans** — *pola: webhook, verifikasi signature bukan sesi user*

Request: payload standar Midtrans notification (order_id, transaction_status, signature_key, dst.).
Validation: signature diverifikasi ulang server-side (SHA512 dari order_id+status_code+gross_amount+ServerKey) sebelum diproses — *tidak* memakai middleware `auth`.
Response 200 body kosong (Midtrans hanya cek status code, bukan body).

**GET /orders/{id}** — *pola: scope kepemilikan (own)*

Policy: `OrderPolicy::view` — 403 (disamarkan 404) jika `order.user_id !== auth()->id()`, kecuali requester adalah Admin (scope `all`).
Response 200: detail order + relasi (items, payment, shipment, status_history) untuk timeline tracking (FR-023).

**POST /creator/designs/{id}/submit** — *pola: transisi state bersyarat*

Precondition: seluruh baris `design_product` milik desain ini wajib `preview_confirmed_at` terisi (FR-037, Flow 16).
Response 200 jika lolos: status desain → "menunggu_approval".
Error 422 jika ada apparel belum dikonfirmasi:
```json
{ "message": "Masih ada jenis apparel yang belum dikonfirmasi.", "unconfirmed_product_ids": [3, 7] }
```

---

### 9. Notes

Kedelapan pola di atas (public create, autentikasi, list publik, business-logic kompleks, aksi admin dengan reason, webhook, scope kepemilikan, transisi state bersyarat) mencakup seluruh karakter endpoint di API List (5.2) — endpoint lain adalah variasi/kombinasi pola yang sama.

---

### Dependencies

**Depends On**

- API List

**Used By**

- Frontend
- Backend
- QA

---

# 5.4 Authentication Flow — Harmoni Clothing

**Output:** Bagian 5.4
**Tujuan:** Mendokumentasikan alur autentikasi.
**Referensi:** [[Phase 2 - Information Architecture#2.2 User Roles — Harmoni Clothing|2.2 User Roles]], [[Phase 2 - Information Architecture#2.5 Permission Matrix — Harmoni Clothing|2.5 Permission Matrix]]
**Digunakan Oleh:** [[Phase 5 - API & Backend Planning#5.6 Security Planning — Harmoni Clothing|5.6 Security Planning]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Menggunakan **Laravel Sanctum — mode SPA (cookie-based)**, bukan token Bearer. Dipilih karena Frontend (Next.js) & Backend (Laravel) berada di bawah domain yang sama secara efektif (subdomain, mis. `app.harmoniclothing.com` & `api.harmoniclothing.com`), lebih sederhana dari OAuth/JWT untuk kebutuhan MVP, dan tidak diperlukan — tidak ada mobile app (Project Brief 1.1 Out of Scope).

---

### 2. Login Flow

```
1. Frontend GET /sanctum/csrf-cookie  → set cookie XSRF-TOKEN
2. Frontend POST /auth/login (+ header X-XSRF-TOKEN dari cookie)
3. Backend verifikasi kredensial → set cookie sesi httpOnly
4. Frontend simpan user di AuthProvider/Zustand (bukan token — sesi via cookie)
```

---

### 3. Register Flow

Sama seperti Login Flow langkah 1–2 tapi ke `/auth/register` (Flow 1, User Flow 2.3) — auto-login setelah sukses, konsisten dengan Flow 1 di User Flow.

---

### 4. Logout Flow

`POST /auth/logout` → invalidasi sesi server-side, Frontend hapus state auth lokal & redirect ke `/`.

---

### 5. Password Reset

```
1. POST /auth/forgot-password { email } → kirim email berisi link reset (SMTP — 3.1)
2. User klik link → halaman /reset-password?token=...
3. POST /auth/reset-password { token, email, password, password_confirmation }
```

---

### 6. Session Management

Sesi disimpan di Redis (3.1 Bagian 3), lifetime default Laravel (120 menit idle) diperpanjang tiap request aktif. Tidak ada "remember me" tambahan di MVP — cukup untuk kebutuhan Requirement Gathering.

---

### 7. Token Strategy

Tidak ada personal access token untuk user biasa (murni cookie session). Sanctum tetap dipakai (bukan session Laravel native) karena API terpisah dari Frontend secara arsitektur (System Architecture 3.2), meski satu ekosistem domain.

---

### 8. Notes

Rate limiting endpoint auth & kebijakan lockout: lihat Security Planning (5.6 Bagian 7).

---

### Dependencies

**Depends On**

- User Roles

**Used By**

- Backend
- Frontend

---

# 5.5 Error Handling — Harmoni Clothing

**Output:** Bagian 5.5
**Tujuan:** Menentukan standar penanganan error.
**Referensi:** [[Phase 5 - API & Backend Planning#5.3 API Specification — Harmoni Clothing|5.3 API Specification]], [[Phase 5 - API & Backend Planning#5.1 Business Rules — Harmoni Clothing|5.1 Business Rules]]
**Digunakan Oleh:** — (dipakai saat Error Handling UI — Phase 8, belum dibuat)
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Standar respons error API — dasar bagi Frontend Error UI (FE-008.8, Feature List 1.5) dan Backend Exception Handler Laravel.

---

### 2. HTTP Status Codes

Rujuk tabel lengkap di API Specification (5.3 Bagian 7).

---

### 3. Validation Errors (422)

```json
{
  "message": "Data yang dikirim tidak valid.",
  "errors": { "field_name": ["pesan error 1", "pesan error 2"] }
}
```

---

### 4. Business Errors (409/422)

Pelanggaran Business Rule (mis. batalkan order yang sudah masuk produksi — BR-010) dikembalikan sebagai 409 Conflict dengan `error_code` tersendiri:

```json
{ "message": "Pesanan sudah masuk produksi, tidak dapat dibatalkan.", "error_code": "ORDER_NOT_CANCELLABLE" }
```

---

### 5. System Errors (500)

Tidak pernah menampilkan stack trace/detail teknis ke Frontend. Dilog penuh ke Sentry (3.1) dengan request ID; Frontend menerima pesan generik + `request_id` untuk keperluan dukungan.

---

### 6. Logging Strategy

4xx (validation/business) → log level `info`, tidak mengirim ke Sentry (volume tinggi, bukan bug). 5xx → log level `error`, otomatis terkirim ke Sentry (3.1 Bagian 2).

---

### 7. User Messages

Pesan di `message` selalu dalam bahasa sesuai locale aktif user (ID/EN — NFR-008), diambil dari file lang Laravel per key error, bukan hardcoded string di Controller.

---

### 8. Notes

`error_code` (bukan `message`) yang dipakai Frontend untuk logic (mis. tampilkan tombol retry) — `message` murni untuk ditampilkan ke user, dapat berubah tanpa merusak Frontend.

---

### Dependencies

**Depends On**

- API Specification

**Used By**

- Backend
- Frontend

---

# 5.6 Security Planning — Harmoni Clothing

**Output:** Bagian 5.6
**Tujuan:** Merancang standar keamanan aplikasi.
**Referensi:** [[Phase 2 - Information Architecture#2.5 Permission Matrix — Harmoni Clothing|2.5 Permission Matrix]], [[Phase 5 - API & Backend Planning#5.4 Authentication Flow — Harmoni Clothing|5.4 Authentication Flow]], [[Phase 3 - System Architecture#3.2 System Architecture — Harmoni Clothing|3.2 System Architecture]]
**Digunakan Oleh:** — (dipakai saat Security Testing — Phase 9, belum dibuat)
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

### 1. Overview

Merangkum & menegaskan keputusan keamanan yang sudah tersirat di Phase 1–4 menjadi satu checklist actionable untuk Phase 7.

---

### 2. Authentication

Sanctum SPA (5.4), password di-hash bcrypt (NFR-003), lockout setelah 5x percobaan gagal (Acceptance Criteria 1.2 Bagian 8).

---

### 3. Authorization

Laravel Policy per entitas, mengikuti Permission Matrix (2.5) — ditegakkan di backend, bukan hanya UI (2.5 Bagian 9).

---

### 4. Data Protection

Enkripsi at-rest untuk `creator_profiles.kyc_*` & `addresses.address_line` (NFR-011, 4.3 Bagian 3). HTTPS/TLS wajib di seluruh traffic (termasuk webhook masuk).

---

### 5. File Upload Security

- Whitelist MIME type ketat: PNG/SVG untuk desain (bukan cek ekstensi saja), maksimal 20MB (1.5 Bagian 9).
- File disimpan di Cloudflare R2 dengan nama acak (bukan nama asli upload) — mencegah path traversal & overwrite.
- Tidak ada eksekusi file yang diupload user (murni storage objek, disajikan via CDN).

---

### 6. API Security

- CORS whitelist ketat: hanya origin Frontend resmi.
- Webhook (Midtrans/Biteship) diverifikasi signature, bukan whitelist IP saja (5.3 Bagian 8).
- Endpoint admin (`/admin/*`) di-middleware ganda: `auth` + `role:admin` (2.5 Bagian 7).

---

### 7. Rate Limiting

| Endpoint | Limit |
|---|---|
| `/auth/login` | 5 percobaan / menit / IP+email, lalu cooldown (Acceptance Criteria 1.2 Bagian 8) |
| `/auth/*` | 20 request / menit / IP |
| API umum (auth) | 60 request / menit / user |
| Webhook | Tidak dibatasi rate (dikontrol via signature verification) |

---

### 8. Audit Logging

Seluruh aksi Admin sensitif (approve/reject, ban, ubah harga) tercatat di `audit_logs` (4.3) — cakupan lengkap: Permission Matrix 2.5 Bagian 10.

---

### 9. Backup Strategy

Cron `mysqldump` harian ke Cloudflare R2 (bucket terpisah dari aset publik), sesuai NFR-004 & System Architecture 3.2 Bagian 7.

---

### 10. Security Checklist

- [ ] Password hashing bcrypt/Argon2 aktif
- [ ] Rate limiting login & endpoint auth aktif
- [ ] Seluruh Policy diuji (403 untuk akses lintas-user)
- [ ] Enkripsi kolom sensitif (KYC, alamat) aktif
- [ ] Signature verification webhook Midtrans & Biteship aktif
- [ ] CORS whitelist hanya domain Frontend resmi
- [ ] Backup harian terjadwal & teruji restore-nya
- [ ] Sentry menangkap 5xx tanpa membocorkan data sensitif di payload

---

### 11. Notes

Checklist ini akan diverifikasi ulang saat Security Testing (Phase 9 Bagian 9.6, sesuai roadmap).

---

### Dependencies

**Depends On**

- Authentication Flow
- Permission Matrix

**Used By**

- Backend Development
- DevOps
- QA
