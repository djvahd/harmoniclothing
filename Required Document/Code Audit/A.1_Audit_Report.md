# A.1 Laporan Audit Kode — Harmoni Clothing

**Tanggal audit:** 2026-07-28
**Commit:** `20a92c6` (branch `master`, working tree bersih)
**Cakupan:** seluruh `backend/` (Laravel 13.x) + `frontend/` (Next.js 14 App Router) dibandingkan dengan `Required Document/` Phase 1–6.
**Metode:** pembacaan statis. Tidak ada kode yang diubah, tidak ada test yang dijalankan.

---

## 1. Ringkasan Eksekutif

| Area                 | Nilai     | Catatan singkat                                                                                                                           |
| -------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Arsitektur backend   | 🟢 Baik   | Controller→Service→Repository konsisten di 28 controller; docblock selalu merujuk FR/BR/dokumen sumber.                                   |
| Cakupan API          | 🟢 Baik   | 62 dari 64 endpoint terdokumentasi sudah ada; 214 test method di 35 file.                                                                 |
| Sinkronisasi dokumen | 🔴 Buruk  | URL seluruh 45 halaman menyimpang dari Sitemap; 8 migration tidak masuk ERD/Table Design. Melanggar *Documentation Sync Policy* (3.5 §7). |
| Kelengkapan seeder   | 🔴 Buruk  | 15 dari 25 tabel tidak pernah di-seed; **akun test tetap tidak punya data sama sekali**.                                                  |
| Gap fitur            | 🟠 Sedang | Bulk Order (Must, FE-052/056) belum ada **dan belum dicatat** sebagai gap; route customer/creator tanpa guard.                            |
| Konsistensi UI/UX    | 🟠 Sedang | Dua paradigma loading, empty state tidak seragam, tidak ada toast, warna mentah menembus design token.                                    |
| Duplikasi kode       | 🔴 Buruk  | ~400 baris kembar antara dua halaman detail; `generateSlug` tiga kali; `applySort` dua kali; 6 pola query-string.                         |
| Modularitas          | 🟠 Sedang | Backend rapi; frontend punya 7 file >370 baris dan folder `hooks/` kosong.                                                                |

**Tiga hal paling mendesak**

1. **Akun test tidak punya data** (§3.2) — semua halaman Customer/Creator/Admin tampil kosong saat demo. Ini penghalang terbesar untuk verifikasi manual.
2. **Bulk Order belum ada dan tidak tercatat** (§4.1) — fitur berprioritas *Must* yang perilakunya sekarang **bertentangan** dengan BR-026.
3. **Route group `(customer)` dan `(creator)` tanpa guard** (§4.2) — guest bisa membuka `/checkout` dan `/akun/*`; customer biasa bisa membuka `/creator/*`.

---

## 2. Dokumen vs Kode

### 2.1 🔴 Seluruh URL menyimpang dari Sitemap 2.1

`2.1_Sitemap.md` §8 menyatakan tegas: *"Bahasa URL: Bahasa Inggris, lowercase, kebab-case (`/become-creator`, bukan `/ajukan-creator`)"*. Implementasi memakai Bahasa Indonesia untuk **semua** halaman.

| Sitemap 2.1 | Implementasi | |
|---|---|---|
| `/marketplace` | `/lapak-desain` | |
| `/marketplace/{creatorSlug}` | `/kreator/[slug]` | |
| `/marketplace/design/{designSlug}` | `/lapak-desain/[slug]` | |
| `/catalog` | `/katalog-produk` | |
| `/catalog/{productSlug}` | `/katalog-produk/[slug]` | |
| `/about` | `/tentang-kami` | |
| `/cart` | `/keranjang` | |
| `/account` | `/akun/profil` | |
| `/account/addresses` | `/akun/alamat` | |
| `/account/become-creator` | `/akun/upgrade-creator` | |
| `/orders`, `/orders/{id}` | `/akun/pesanan`, `/akun/pesanan/[id]` | |
| `/wishlist` | `/akun/wishlist` | |
| `/notifications` | `/notifikasi` | |
| `/editor/custom/{slug}` + `/editor/marketplace/{slug}` | `/customize/[slug]` | 2 route → 1 |
| `/creator/verification` | `/creator/verifikasi` | |
| `/creator/designs` | `/creator/desain` | |
| `/creator/designs/{id}/preview` | `/creator/desain/[id]` | |
| `/creator/earnings` | `/creator/statistik` | |
| `/legal/privacy-policy` | `/kebijakan-privasi` | |
| `/legal/terms` | `/syarat-ketentuan` | |
| `/login`, `/register`, `/forgot-password` | overlay global (tanpa route) | |
| `/admin/users` | `/admin/pengguna` | |
| `/admin/creators/approval` | `/admin/approval-creator` | |
| `/admin/designs/approval` | `/admin/approval-desain` | |
| `/admin/catalog` | `/admin/katalog` | |
| `/admin/production` | `/admin/produksi` | |
| `/admin/orders` | `/admin/pesanan` | |
| `/admin/payments` | `/admin/pembayaran` | |
| `/admin/shipments` | `/admin/pengiriman` | |
| `/admin/notifications/settings` | `/admin/notifikasi-config` | |
| `/admin/reports` | `/admin/laporan` | |

**Rekomendasi:** perbarui Sitemap, bukan kode. URL Bahasa Indonesia justru lebih cocok untuk pasar ID, dan mengganti 45 route sekarang berisiko tinggi tanpa manfaat nyata. Catat sebagai deviasi resmi di Change Log 2.1, mengikuti pola yang sudah dipakai di `3.1_Technology_Stack.md` §9.

### 2.2 🟠 Jumlah halaman: 45 (dokumen) vs 39 file `page.tsx`

Selisihnya bukan sekadar hitungan:

- **Hilang:** `/bulk-order/{slug}`, `/checkout/bulk` (lihat §4.1), `/chat` (diganti `ChatWidget` mengambang).
- **Digabung:** dua mode Product Editor jadi satu route `/customize/[slug]`.
- **Dipindah ke overlay:** Login / Register / Lupa Password (commit `5ffc740`) — hanya `/reset-password` yang masih berupa halaman.
- **Tambahan tak tercatat:** `app/not-found.tsx`.

Sisa artefak: `app/(auth)/login/`, `app/(auth)/register/`, `app/(auth)/lupa-password/` masih ada sebagai **direktori kosong** setelah refactor overlay.

### 2.3 🔴 Skema database tidak disinkronkan ke 4.2 ERD / 4.3 Table Design

`3.5_Coding_Standards.md` §7 mewajibkan: *"Perubahan skema → update ERD (4.2) dan Table Design (4.3)"*. Delapan migration setelah 21 Juli belum masuk dokumen mana pun:

| Migration | Yang tidak terdokumentasi |
|---|---|
| `2026_07_21_181324` | pelebaran kolom PII untuk enkripsi |
| `2026_07_22_163342` | `creator_profiles`: `birth_date`, `is_minor`, `payout_method`, `payout_account_number`, `payout_account_holder`, `guardian_name`, `guardian_id_number`, `guardian_consent_at` |
| `2026_07_22_163423` | `commissions.payout_reference` |
| `2026_07_22_180153` | `products.gender_segment` |
| `2026_07_22_180154` | `product_variants.print_areas` |
| `2026_07_25_140000` | tabel `tags` (baru) |
| `2026_07_25_140001` | tabel pivot `design_tag` (baru) |

Dua tabel baru (`tags`, `design_tag`) **tidak muncul sama sekali** di ERD — padahal keduanya dipakai aktif oleh filter Marketplace.

Catatan minor: `2026_07_24_100000_add_compare_price…` lalu `2026_07_25_090000_drop_compare_price…` — kolom ditambah lalu dibuang dalam 24 jam, menyisakan dua migration yang saling meniadakan.

### 2.4 🟠 API List 5.2 vs `routes/api.php`

**Terdokumentasi tapi belum ada (2):**

| Endpoint                  | Dampak                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `POST /checkout/bulk`     | Bulk Order tidak bisa jalan (§4.1)                                                               |
| `POST /broadcasting/auth` | Sudah dicatat sebagai deviasi di 3.1 §9 (Reverb belum terpasang) — tidak perlu tindakan sekarang |

**Ada tapi tidak terdokumentasi (10):** `GET /catalog/products/filters`, `GET /marketplace/designs/filters`, `GET /marketplace/creators`, `POST /customization/uploads`, `GET /admin/catalog/products`, `POST /admin/catalog/products/{p}/variants`, `PATCH /admin/catalog/variants/{v}`, `GET /admin/orders`, `GET /admin/creators/{id}/kyc-document`, `GET /admin/chat/threads/{id}/messages`.

Semuanya sudah diberi komentar `// gap-filled` di `routes/api.php` — niatnya benar, tapi 5.2 belum menyusul.

### 2.5 🟠 Struktur folder 3.4 vs kenyataan

| Dokumen 3.4 | Kenyataan |
|---|---|
| `frontend/locales/` = *"satu-satunya sumber string UI, tidak ada hardcoded string di komponen"* | **Kosong.** 100% string ditulis langsung di JSX. Tidak ada library i18n di `package.json`. |
| `frontend/hooks/` | Kosong (hanya `.gitkeep`) |
| `frontend/providers/` = AuthProvider, WebSocketProvider, I18nProvider, QueryProvider | Hanya `AppProviders.tsx` |
| `backend/app/Jobs/` = AutoCancelUnpaidOrderJob, AutoCompleteOrderJob, GenerateInvoiceJob, SendNotificationJob | **Kosong** — auto-cancel diimplementasikan sebagai Console Command, bukan Job |
| `backend/app/Policies/` = otorisasi per Permission Matrix | **Kosong** — otorisasi lewat middleware + scoping manual di controller |
| `backend/app/Listeners/` | Kosong |
| `backend/app/DTO/` | Hanya `CheckoutDTO` (dokumen menyebut OrderDTO, PricingResultDTO, BulkOrderDTO) |
| `backend/app/Enums/` | Hanya `UserRole`, `UserStatus` (dokumen menyebut OrderStatus, PaymentStatus, ShipmentStatus, CreatorStatus, DesignStatus) |

Pendekatan middleware+scoping bukan kesalahan — tapi dokumen menjanjikan Policies, jadi salah satunya harus mengalah.

### 2.6 🟢 Deviasi yang sudah dicatat dengan baik

`3.1_Technology_Stack.md` §9 sudah mencatat SWR (bukan TanStack Query), driver database (bukan Redis), Laravel 13.x (bukan 11.x), dan Reverb belum terpasang. `1.2` dan `1.5` sudah menandai FR-010, FR-012, FR-027, FR-029, FR-034, NFR-008, BR-027 sebagai belum selesai. **Praktik ini sudah benar dan sebaiknya diteruskan** — masalahnya hanya beberapa gap lain belum ikut dicatat.

---

## 3. Kelengkapan Seeder

### 3.1 🔴 15 dari 25 tabel tidak pernah di-seed

Hanya ada 4 seeder (`DatabaseSeeder`, `CatalogSeeder`, `BulkPricingTierSeeder`, `NotificationSettingSeeder`) untuk 25 model.

| Tabel tanpa seed | Halaman yang jadi kosong |
|---|---|
| `addresses` | Checkout ("Belum ada alamat tersimpan"), `/akun/alamat` |
| `cart_items` | `/keranjang`, popover keranjang di header |
| `wishlists` | `/akun/wishlist` |
| `payments`, `invoices` | `/admin/pembayaran`, `/akun/pesanan/[id]/invoice` |
| `shipments` | `/admin/pengiriman` |
| `commissions` | `/creator/statistik`, `/creator/dashboard` |
| `chat_threads`, `chat_messages` | `/admin/chat`, ChatWidget |
| `notifications` | `/notifikasi`, popover notifikasi |
| `audit_logs` | endpoint `/admin/audit-logs` (belum ada halaman) |
| `order_status_histories` | timeline di `/akun/pesanan/[id]` |

Selain itu **tidak ada data berstatus `pending`**, sehingga `/admin/approval-creator` dan `/admin/approval-desain` selalu menampilkan "Tidak ada pengajuan" — dua alur approval inti (BR-001, BR-002) tidak bisa didemokan sama sekali.

### 3.2 🔴 Akun test tetap tidak terhubung ke data mana pun

`DatabaseSeeder.php` membuat tiga akun tetap (`admin@harmoni.test`, `creator@harmoni.test`, `test@example.com`), lalu `CatalogSeeder` membuat order, desain, dan creator profile untuk **user acak yang dibuat sendiri oleh factory** — bukan untuk ketiga akun itu.

Akibatnya, setelah `php artisan migrate:fresh --seed`:

- Login sebagai `creator@harmoni.test` → Kelola Desain kosong, Statistik & Komisi kosong, Dashboard semua nol.
- Login sebagai `test@example.com` → Riwayat Pesanan kosong, Wishlist kosong, Keranjang kosong, Notifikasi kosong.
- Login sebagai `admin@harmoni.test` → hanya Katalog yang berisi; Pesanan/Pembayaran/Pengiriman/Chat/Approval kosong.

Ini menjelaskan kenapa hanya halaman publik yang terlihat "hidup". Perbaikan ini memberi hasil paling besar dibanding usaha yang diperlukan.

### 3.3 🟠 Efek samping: user sampah

`CatalogSeeder` memanggil `Order::factory()` ±75 kali tanpa `recycle()`, dan setiap order membuat user + address baru. `/admin/pengguna` jadi penuh nama acak yang tidak merepresentasikan apa pun.

### 3.4 🟡 `OrderStatusHistoryFactory` tidak ada

Satu-satunya model non-pivot tanpa factory (22 factory untuk 25 model; `DesignProduct` dan `DesignTag` adalah pivot).

---

## 4. Gap Fitur

### 4.1 🔴 Bulk Order — belum ada, dan **bertentangan** dengan BR-026

Fitur berprioritas **Must** (FE-052, FE-056 / FR-040, FR-044 / BR-012, BR-026) yang **tidak ditandai** sebagai gap di `1.2` maupun `1.5`.

Yang sudah ada: `BulkPricingTier` (model, migration, seeder, endpoint publik, form admin) dan `PricingService::bulkUnitPriceFor()`.

Yang belum ada:

| Item | Status |
|---|---|
| `POST /checkout/bulk` (5.2 §4) | ❌ tidak ada route |
| Halaman `/bulk-order/{productSlug}` | ❌ tidak ada |
| Halaman `/checkout/bulk` | ❌ tidak ada |
| FE-056 — input kuantitas per ukuran (S/M/L/XL) | ❌ tidak ada UI |
| Lead time produksi terpisah (BR-012) | ❌ tidak ada |
| `orders.type = 'bulk'` | ❌ `CheckoutService` selalu menulis `'reguler'` → kolom mati |

**Pertentangan langsung:** `CheckoutService.php:29–33` menulis di docblock-nya sendiri *"there's no separate 'bulk checkout' flow, the discount just applies automatically"*. BR-026 menyatakan sebaliknya: *"Bulk Order dan item reguler tidak dapat digabung dalam satu transaksi checkout — harus checkout terpisah, karena lead time produksi keduanya dihitung berbeda"*.

Kondisi sekarang: keranjang campuran dengan total kuantitas ≥ tier minimum akan **mendapat harga bulk untuk semua item**, termasuk item reguler. Itu bukan sekadar fitur yang belum jadi — itu perilaku harga yang salah menurut aturan bisnis yang berlaku.

### 4.2 🔴 Route group `(customer)` dan `(creator)` tanpa guard

`app/(customer)/layout.tsx` dan `app/(creator)/layout.tsx` **identik byte-per-byte** dengan `app/(public)/layout.tsx` — tidak ada pemeriksaan sesi. Hanya `(admin)` yang memakai `AdminGuard`.

Akibat:

- Guest membuka `/checkout`, `/keranjang`, `/akun/profil`, `/akun/pesanan` → halaman ter-render, request API balas 401, layar menampilkan state kosong/rusak alih-alih memunculkan overlay login.
- Customer biasa membuka `/creator/dashboard` → backend balas 403, UI menampilkan halaman rusak, bukan pesan yang jelas.

Data tidak bocor (backend tetap menolak), tapi ini bertentangan dengan `2.5_Permission_Matrix.md` §7 dan pengalaman yang dijanjikan FR-005.

### 4.3 🟠 Link rusak di header admin

`components/layout/AdminHeader.tsx:20` menautkan ikon lonceng ke `/admin/notifikasi` — route ini **tidak ada** (yang ada `/admin/notifikasi-config`, halaman konfigurasi, bukan inbox). Klik = 404.

### 4.4 ✅ Klaim ditarik (koreksi 2026-07-29) — Admin memang sengaja hanya bisa memajukan status ke "Diproses"

~~`services/admin.ts:196–201` — `updateOrderStatus(id)` mengunci body ke `{ status: "diproses_produksi" }`. Backend `PATCH /admin/orders/{id}/status` menerima transisi lain, tapi UI tidak menyediakannya. Status `dikirim` dan `selesai` tidak bisa di-set dari UI → FR-021 baru separuh jalan.`~~

**Koreksi:** klaim "backend menerima transisi lain" di atas keliru. `OrderStatusRequest::rules()` membatasi `status` hanya ke `Rule::in(['diproses_produksi'])`, dan `OrderService::updateStatus()` bahkan tidak membaca `$request->status` — transisi di-hardcode server-side. Ini **sesuai desain**, bukan gap: diagram State Transition di `2.3_User_Flow.md` §9 dan **BR-014** (`5.1_Business_Rules.md`) secara eksplisit mendefinisikan `dikirim` sebagai webhook-driven (Biteship, FR-022) dan `selesai` sebagai customer-confirmation/auto-complete 3-hari-driven — tidak ada jalur Admin untuk keduanya di dokumen manapun. Kode dan dokumen sudah sinkron; laporan audit sebelumnya salah baca kode. Checklist item 2.4 di `A.2_Fix_Checklist.md` ditandai tidak berlaku.

### 4.5 🟠 `GET /admin/orders` sudah ada tapi tidak dipakai — dan pesannya salah

`/admin/pesanan` mengambil dari `/admin/production-queue`, lalu menampilkan **ke pengguna**:

> "Menampilkan pesanan aktif (menunggu approval/diproses) - tidak ada endpoint admin untuk daftar semua pesanan termasuk yang selesai/dibatalkan."

Endpoint itu ada, di `routes/api.php:150`. Keterangan ini sudah basi dan tidak seharusnya tampil di UI produksi.

### 4.6 🟠 Halaman `/chat` tidak ada

Sitemap §4 mencantumkan "Chat dengan Admin" sebagai halaman tersendiri; implementasinya hanya `ChatWidget` mengambang. Keputusan desain yang wajar, tapi belum tercatat di mana pun.

### 4.7 🟠 Daftar ulasan tidak ada endpoint-nya

Kedua halaman detail menampilkan kalimat *"Daftar ulasan lengkap akan tampil di sini setelah fitur listing ulasan tersedia"* kepada pengguna akhir. Tidak ada `GET /catalog/products/{slug}/reviews` di API List maupun di kode — jadi gap ini belum terdaftar di mana pun.

### 4.8 🟠 Tidak ada `metadata` per halaman

Hanya `app/layout.tsx` yang mengekspor `metadata`. Ke-39 halaman memakai judul dan deskripsi yang sama. Sitemap §8 menyebut slug deskriptif dipilih untuk "SEO dasar" — manfaat itu hilang tanpa title/description per halaman.

### 4.9 🟢 Gap yang sudah tercatat benar (tidak perlu tindakan sekarang)

FR-010/FE-016 (atur posisi desain), FR-012 (editor 3D Three.js — `three` memang tidak ada di dependencies), FR-027/FE-039 (form review), FR-029/BR-027 (realtime Reverb), FR-034/NFR-008/FE-051 (i18n). Semua sudah bertanda ⚠ di `1.2`/`1.5` dengan tanggal — audit ini mengonfirmasi statusnya masih sama.

---

## 5. Konsistensi UI/UX

### 5.1 🟠 Dua paradigma loading yang berbeda

| Kelompok | Perlakuan |
|---|---|
| Halaman publik | Skeleton `animate-pulse` (ProductCard, DesignCard, CreatorCard, FilterSidebar, halaman detail) |
| Customer / Creator / Admin | Teks polos `<p>Memuat...</p>` |

Teksnya pun berbeda-beda di 21 tempat: `Memuat...`, `Memuat pesanan...`, `Memuat laporan...`, `Memuat pengguna...`, `Memuat alamat...`, `Memuat wishlist...`, `Memuat desain...`, `Memuat invoice...`, `Memuat keranjang...`, `Memuat notifikasi...`, `Memuat produk...`.

Tidak ada `loading.tsx` di segmen route mana pun — konvensi App Router untuk streaming tidak dipakai.

### 5.2 🟠 Empty state tidak seragam

- Dengan ikon + CTA: `app/not-found.tsx`, kedua halaman detail (`PackageSearch` + link kembali).
- Teks polos tanpa ikon/CTA: 15 lokasi lain.
- **Tanpa empty state sama sekali:** `/admin/pengguna`, `/admin/pembayaran` — tabel kosong tanpa penjelasan.
- Kalimat berselang-seling antara "Belum ada …" dan "Tidak ada …" untuk situasi yang sama.

### 5.3 🟠 Tidak ada sistem notifikasi/toast

Semua umpan balik berupa `<p className="font-body text-xs text-red-500">` inline. Tidak ada toast sukses (mis. setelah "Tambah ke Keranjang" halaman langsung pindah tanpa konfirmasi), tidak ada `error.tsx` di segmen mana pun, tidak ada error boundary global.

### 5.4 🟠 Warna mentah menembus design token

`tailwind.config.ts` mendefinisikan `background`, `primary`, `accent`, `surface`, `border`, `text.primary/secondary/on-accent` — tapi **tidak ada token `danger` / `success` / `warning` / `info`**. Akibatnya warna Tailwind mentah dipakai langsung di ±20 tempat:

| File | Warna |
|---|---|
| `components/ui/Badge.tsx:13–14` | `bg-amber-500 text-white`, `bg-red-600 text-white` |
| `components/ui/Button.tsx:29` | `bg-red-600`, `bg-red-700` |
| `components/ui/Input.tsx:26,40` | `border-red-500`, `text-red-500` |
| `components/ui/PasswordInput.tsx:24,47` | idem |
| `components/layout/SiteHeader.tsx:109,124` | `bg-red-500` (badge counter) |
| `components/ui/{ProductCard,DesignCard,CreatorCard}.tsx` | `text-yellow-400` (bintang rating) |
| 8 halaman | `text-red-500` untuk pesan error |

Aksesibilitas: `text-white` di atas `bg-amber-500` menghasilkan kontras ±2.1:1, di bawah ambang WCAG AA (4.5:1) untuk teks kecil. Badge "warning" dipakai untuk status `belum_dibayar` — status yang justru harus mudah dibaca.

### 5.5 🟠 Tabel admin tanpa komponen bersama

Enam halaman admin (`pesanan`, `pembayaran`, `pengguna`, `pengiriman`, `produksi`, `katalog`) menyalin shell yang sama: `<div className="overflow-x-auto rounded-md border border-border bg-surface"><table className="w-full text-left font-body text-sm">…`, lengkap dengan `<thead>`, baris loading ber-`colSpan` manual, dan class baris `border-b border-border last:border-0`.

### 5.6 🟠 Paginasi tidak ada di daftar admin

API mengembalikan `meta.current_page / per_page / total`, dan tipe `Paginated<T>` sudah dideklarasikan di frontend — tapi tidak ada satu pun kontrol paginasi di halaman admin. Daftar user/pembayaran berhenti di halaman pertama.

### 5.7 🟡 Size chart statis dan generik

Tabel ukuran di kedua halaman detail berisi angka hardcode yang sama (S 46/66 … XXL 58/78) untuk **semua** produk, dengan catatan "Ukuran umum, dapat berbeda tipis tergantung jenis produk." Tidak terhubung ke data produk.

---

## 6. Duplikasi Kode

### 6.1 🔴 Frontend — dua halaman detail nyaris kembar (~400 baris)

`app/(public)/katalog-produk/[slug]/page.tsx` (523 baris) vs `app/(public)/lapak-desain/[slug]/page.tsx` (696 baris).

| Blok yang sama | Katalog | Lapak Desain |
|---|---|---|
| `PRINT_AREA_LABELS` | :32–36 | :39–43 |
| `TABS` + `TabKey` | :38–46 | :45–53 |
| Skeleton loading | :141–158 | :147–164 |
| Empty "tidak ditemukan" | :160–173 | :166–179 |
| `hasRating` / `hasSold` / `isLaris` | :175–177 | :181–183 |
| Breadcrumb | :181–198 | :187–204 |
| Galeri + thumbnail | :200–245 | :206–248 |
| Pemilih warna | :266–291 | :313–338 |
| Pemilih ukuran + size chart | :293–347 | :340–394 |
| Jumlah + total harga | :372–377 | :396–403 |
| Textarea catatan | :379–388 | :415–424 |
| Tombol Keranjang / Beli | :392–410 | :428–446 |
| Trust badge (3 ikon) | :412–425 | :448–461 |
| Tab bar | :430–447 | :468–485 |
| Teks tab "perawatan" + "pengiriman" | :465–477 | :521–533 |
| `YouMightLike` | :495–523 | :559–587 |

Perbedaan nyatanya hanya empat: sumber data (product vs design), pemilih produk (khusus desain), upload desain sendiri (khusus produk), dan baris royalti kreator (khusus desain).

### 6.2 🔴 Backend — `generateSlug` ditulis tiga kali

Identik kecuali model yang di-query:

- `app/Services/CatalogService.php:128–139` → `Product`
- `app/Services/CreatorDesignService.php:185–196` → `Design`
- `app/Services/CreatorService.php:194–205` → `CreatorProfile`

### 6.3 🟠 Backend — `applySort` ditulis dua kali

`app/Repositories/ProductRepository.php:106–114` dan `app/Repositories/DesignRepository.php:115–123` — `match()` yang sama, hanya kolom harga berbeda (`base_price` vs `starting_price`).

### 6.4 🟠 Frontend — `appendArrayParam` disalin persis

`services/catalog.ts:25–27` dan `services/marketplace.ts:23–25`, kata per kata.

### 6.5 🟠 Frontend — pola query-string diulang 6 kali

`catalog.ts:30–42`, `marketplace.ts:28–40` & `:85–95`, `admin.ts:80–86` & `:218–223` & `:253–258` — semuanya `new URLSearchParams()` → set kondisional → `query ? '?'+query : ''`.

### 6.6 🟠 `interface Paginated<T>` dideklarasikan 3 kali

`services/catalog.ts:4`, `services/marketplace.ts:4`, `services/admin.ts:74`. Tempatnya di `types/`.

### 6.7 🟠 `API_URL` diturunkan 3 kali

`lib/api.ts:1`, `lib/storage.ts:1`, dan lagi **di dalam fungsi** `services/admin.ts:96`.

### 6.8 🟠 `err instanceof ApiError ? err.message : "…"` di 13 file

Dengan teks fallback yang berbeda-beda ("Terjadi kesalahan, coba lagi.", "Gagal mengunggah file.", dst.).

### 6.9 🟠 Format tanggal inline di 6 file

`new Date(x).toLocaleDateString("id-ID")` tersebar di `approval-creator:67`, `statistik:51`, `invoice:61`, `notifikasi:46`, `kreator/[slug]:70`, `SiteHeader:396` — sementara `formatCurrency` sudah punya rumah di `lib/format.ts`.

### 6.10 🟠 Tiga layout identik

`app/(public)/layout.tsx`, `app/(customer)/layout.tsx`, `app/(creator)/layout.tsx` sama persis. Menyelesaikan §4.2 (guard) sekaligus menyelesaikan duplikasi ini.

### 6.11 🟠 Fungsi chat admin menduplikasi service chat customer

`services/admin.ts:230–247` (`getAdminChatThreads`, `getAdminChatMessages`, `sendAdminChatMessage`) menduplikasi bentuk `services/chat.ts` dengan prefix berbeda.

---

## 7. Modularitas & Keterbacaan

### 7.1 🟢 Yang sudah baik dan layak dipertahankan

- **Backend berlapis rapi.** Controller→Service→Repository dipatuhi konsisten di 28 controller / 27 service / 8 repository. Controller tetap tipis (rata-rata < 60 baris).
- **Traceability docblock luar biasa.** Hampir setiap method backend merujuk sumbernya: `// 5.2_API_List.md §4 — /orders (FE-028/029/031), scope own`, `/** BR-012: … */`. Ini praktik yang jarang dan sangat berharga — pertahankan, dan tiru di frontend.
- **`SidebarNav` + objek konfigurasi per role** (`AccountSidebar`, `CreatorSidebar`, `AdminSidebar`) adalah pola yang tepat: satu komponen, tiga konfigurasi.
- **Satu FormRequest per endpoint** (26 file) dan **satu Resource per model** (25 file), konsisten.
- **214 test method di 35 file**, mencakup semua modul.
- `lib/format.ts` punya docblock yang menjelaskan *kenapa* koersi `Number()` wajib (cast `decimal:2` Laravel mengirim string) — persis jenis komentar yang berguna.

### 7.2 🟠 File frontend terlalu besar

| File | Baris | Isinya |
|---|---|---|
| `app/(public)/lapak-desain/[slug]/page.tsx` | 696 | halaman + `YouMightLike` + `CreatorSummaryCard` |
| `app/(public)/lapak-desain/page.tsx` | 542 | hero + `DesainTab` (192 baris) + `CreatorTab` |
| `app/(public)/page.tsx` | 535 | seluruh landing page dalam satu komponen |
| `app/(public)/katalog-produk/[slug]/page.tsx` | 523 | halaman + `YouMightLike` |
| `components/ui/FilterSidebar.tsx` | 490 | |
| `components/layout/SiteHeader.tsx` | 418 | nav + mega-dropdown + popover keranjang + popover notifikasi + search + trigger mobile |
| `app/(admin)/admin/katalog/page.tsx` | 377 | daftar + form produk + form varian |

### 7.3 🟠 `frontend/hooks/` kosong

Pola `useSWR(key, () => service())` lalu `data?.data ?? []` diulang di ±30 halaman. Hook domain (`useProducts`, `useCart`, `useOrders`, `useNotifications`) akan menghapus pengulangan itu sekaligus memusatkan key SWR — yang sekarang ditulis manual sebagai string dan rawan salah ketik saat `mutate()`.

### 7.4 🟠 Komentar di frontend jauh lebih miskin daripada backend

Backend menjelaskan *kenapa*; frontend hampir tanpa komentar sama sekali. Pengecualian yang baik justru menunjukkan bedanya: `lib/format.ts`, `CREATOR_ROYALTY_RATE` di `lapak-desain/[slug]:33–37`, dan komentar `recycle`/`sequence` di `CatalogSeeder`. Komponen UI dan service sama sekali tidak punya docblock.

### 7.5 🟠 Komentar basi tampil ke pengguna

`app/(admin)/admin/pesanan/page.tsx:38–41` — keterangan "tidak ada endpoint admin untuk daftar semua pesanan" bukan komentar kode, melainkan `<p>` yang dirender ke layar admin. Isinya juga sudah tidak benar (§4.5).

### 7.6 🟡 Sisa scaffold

- `backend/tests/Feature/ExampleTest.php` dan `backend/tests/Unit/ExampleTest.php` — bawaan Laravel, tidak menguji apa pun.
- `User::factory()->create(['email' => 'test@example.com'])` di `DatabaseSeeder.php:22–25` masih bernama "Test User", tercampur dengan tiga akun test yang sengaja dibuat.
- Direktori kosong `app/(auth)/login/`, `app/(auth)/register/`, `app/(auth)/lupa-password/`.

---

## 8. Rangkuman Temuan

| # | Temuan | Tingkat | Bagian |
|---|---|---|---|
| 1 | Akun test tidak terhubung ke data apa pun | 🔴 | §3.2 |
| 2 | Bulk Order belum ada + bertentangan dengan BR-026 | 🔴 | §4.1 |
| 3 | `(customer)` & `(creator)` tanpa auth guard | 🔴 | §4.2 |
| 4 | 15 tabel tidak pernah di-seed | 🔴 | §3.1 |
| 5 | ~400 baris kembar di dua halaman detail | 🔴 | §6.1 |
| 6 | Skema DB tidak sinkron ke ERD/Table Design | 🔴 | §2.3 |
| 7 | Seluruh URL menyimpang dari Sitemap | 🔴 | §2.1 |
| 8 | `generateSlug` triplikat | 🔴 | §6.2 |
| 9 | Link `/admin/notifikasi` 404 | 🟠 | §4.3 |
| 10 | Admin tidak bisa set status dikirim/selesai | 🟠 | §4.4 |
| 11 | `GET /admin/orders` tidak dipakai + pesan salah di UI | 🟠 | §4.5 |
| 12 | Dua paradigma loading, 11 varian teks | 🟠 | §5.1 |
| 13 | Empty state tidak seragam; 2 tabel tanpa empty state | 🟠 | §5.2 |
| 14 | Tidak ada toast / error boundary | 🟠 | §5.3 |
| 15 | Warna mentah menembus token; kontras Badge gagal AA | 🟠 | §5.4 |
| 16 | Tabel admin tanpa komponen bersama | 🟠 | §5.5 |
| 17 | Paginasi admin tidak ada | 🟠 | §5.6 |
| 18 | 10 endpoint tidak terdokumentasi di 5.2 | 🟠 | §2.4 |
| 19 | Struktur folder 3.4 menyimpang (locales, hooks, Jobs, Policies) | 🟠 | §2.5 |
| 20 | `applySort`, `appendArrayParam`, `Paginated`, `API_URL`, error-handling, format tanggal — semua duplikat | 🟠 | §6.3–6.9 |
| 21 | Tiga layout identik | 🟠 | §6.10 |
| 22 | 7 file frontend > 370 baris | 🟠 | §7.2 |
| 23 | `hooks/` kosong, key SWR ditulis manual | 🟠 | §7.3 |
| 24 | Tidak ada metadata per halaman (SEO) | 🟠 | §4.8 |
| 25 | Halaman `/chat` & listing ulasan tidak ada | 🟠 | §4.6, §4.7 |
| 26 | Komentar basi tampil ke pengguna | 🟠 | §7.5 |
| 27 | `OrderStatusHistoryFactory` tidak ada | 🟡 | §3.4 |
| 28 | Sisa scaffold (ExampleTest, direktori kosong) | 🟡 | §7.6 |
| 29 | Size chart statis, sama untuk semua produk | 🟡 | §5.7 |
| 30 | Migration `compare_price` tambah-lalu-hapus | 🟡 | §2.3 |

Rencana perbaikan berurutan ada di **[A.2_Fix_Checklist.md](A.2_Fix_Checklist.md)**.
