# Code Audit 2026-07 — Harmoni Clothing

> Gabungan tiga dokumen audit (A.1 laporan, A.2 checklist, A.3 keputusan). Audit ditutup 2026-07-30. Referensi seperti "A.1 §2.1" merujuk ke Bagian A.1 di bawah.

---

# BAGIAN A.1 — Laporan Audit


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

Rencana perbaikan berurutan ada di **[A.2_Fix_Checklist.md](#BAGIAN-A)**.

---

# BAGIAN A.2 — Checklist Perbaikan


**Sumber:** [A.1_Audit_Report.md](#BAGIAN-A) · **Dibuat:** 2026-07-28 · **Baseline commit:** `20a92c6`

Checklist ini diurutkan berdasarkan **hasil dibagi usaha**, bukan tingkat keparahan saja. Setiap batch berakhir di **checkpoint (CP)**: titik di mana pekerjaan sudah stabil, bisa di-commit, dan sesi bisa dihentikan tanpa meninggalkan kerja setengah jadi.

**Cara pakai saat token menipis:** selesaikan batch yang sedang berjalan sampai CP-nya, commit dengan pesan yang tertulis di CP, lalu buka sesi baru dan mulai dari batch berikutnya. Bagian "Konteks untuk sesi baru" di setiap CP berisi yang perlu dibaca ulang.

**Legenda:** 🔴 kritis · 🟠 penting · 🟡 rapi-rapi | ⏱ perkiraan usaha (XS/S/M/L/XL)

---

## Batch 1 — Data bisa dilihat (🔴 hasil terbesar, risiko terkecil)

> Tanpa ini, tidak ada satu pun halaman Customer/Creator/Admin yang bisa diverifikasi secara manual. Kerjakan pertama.

- [x] **1.1** 🔴 ⏱M — Ubah `CatalogSeeder` agar `Order::factory()` dan `Design::factory()` memakai `recycle()` pada akun test tetap, bukan membuat user acak baru. (Laporan §3.2, §3.3) — *selesai 2026-07-29; sekalian perbaiki `Review::factory()` yang juga membuat user acak sendiri (tidak disebut di checklist, ditemukan saat verifikasi).*
- [x] **1.2** 🔴 ⏱S — Buat `DemoDataSeeder` baru: alamat, item keranjang, wishlist, notifikasi, dan thread chat untuk `test@example.com`. (§3.1) — *selesai 2026-07-29.*
- [x] **1.3** 🔴 ⏱S — Seed `payments` + `invoices` + `shipments` + `order_status_histories` untuk order berstatus `selesai`/`dikirim`, supaya `/admin/pembayaran`, `/admin/pengiriman`, dan timeline pesanan terisi. (§3.1) — *selesai 2026-07-29.*
- [x] **1.4** 🔴 ⏱S — Seed `commissions` untuk `creator@harmoni.test` agar `/creator/statistik` dan Dashboard Creator punya angka. (§3.1) — *selesai 2026-07-29; dibuat lewat `CommissionService::generateForOrderItem()` yang sudah ada, bukan ditulis manual.*
- [x] **1.5** 🔴 ⏱S — Seed minimal 3 `CreatorProfile` berstatus `pending` dan 5 `Design` berstatus `pending`, supaya alur approval (BR-001/BR-002) bisa didemokan. (§3.1) — *selesai 2026-07-29.*
- [x] **1.6** 🟠 ⏱XS — Seed beberapa `audit_logs` (endpoint sudah ada, halaman menyusul di Batch 5). (§3.1) — *selesai 2026-07-29.*
- [x] **1.7** 🟡 ⏱XS — Tambah `OrderStatusHistoryFactory`. (§3.4) — *selesai 2026-07-29; model `OrderStatusHistory` juga baru dapat trait `HasFactory` (belum pernah dipasang sebelumnya).*
- [x] **1.8** 🟡 ⏱XS — Hapus user "Test User" duplikat di `DatabaseSeeder.php:22–25`, atau jadikan ia akun customer utama yang dipakai butir 1.1–1.2. (§7.6) — *selesai 2026-07-29; dipilih opsi kedua, direname jadi "Customer Harmoni" dan disatukan ke blok akun tetap.*

> **✅ CP-1 — "Seed lengkap"** — **selesai & terverifikasi 2026-07-29**
> **Verifikasi:** `php artisan migrate:fresh --seed` (37 migration + 4 seeder, tanpa error) — hasil: `test@example.com` 6 order/3 alamat/3 cart item/4 wishlist/5 notifikasi/1 chat thread; `creator@harmoni.test` 3 desain/7 komisi/status aktif; 3 CreatorProfile + 5 Design pending; 62 payment/invoice, 5 shipment `dikirim` + 57 `delivered`, 243 order_status_histories, 10 audit_logs; total user turun ke 19 (dari ~85+ user sampah sebelumnya). `php artisan test` — **214/214 lulus**, tidak ada regresi.
> **Commit:** `feat(seeder): attach demo data to fixed test accounts and cover all tables`
> **Konteks untuk sesi baru:** `backend/database/seeders/*`, `backend/database/factories/*`, laporan §3.

---

## Batch 2 — Perbaikan cepat yang berdampak (🔴/🟠, semuanya kecil)

- [x] **2.1** 🔴 ⏱S — Buat `AuthGuard` (mengikuti pola `components/auth/AdminGuard.tsx`) dan pasang di `app/(customer)/layout.tsx`; buat `CreatorGuard` yang memeriksa role creator untuk `app/(creator)/layout.tsx`. Sekalian ini menghapus duplikasi tiga layout identik. (§4.2, §6.10) — *selesai 2026-07-29; dibuat `components/layout/AppShell.tsx` bersama untuk hapus duplikasi. `CreatorGuard` memakai probe SWR ke `/creator/dashboard` (creator.active bersifat existence-based via `creator_profiles.status`, bukan nilai `role`), dengan `/creator/verifikasi` dikecualikan karena itu justru halaman untuk *menjadi* creator.*
- [x] **2.2** 🟠 ⏱XS — Perbaiki link rusak `AdminHeader.tsx:20`: arahkan ke `/admin/notifikasi-config`, atau hapus ikon lonceng sampai halaman inbox admin ada. (§4.3) — *selesai 2026-07-29.*
- [x] **2.3** 🟠 ⏱S — Ganti `/admin/pesanan` agar memakai `GET /admin/orders` (sudah ada di `routes/api.php:150`) dan **hapus paragraf keterangan yang sudah tidak benar** di `page.tsx:38–41`. Tambahkan `getOrders()` di `services/admin.ts`. (§4.5, §7.5) — *selesai 2026-07-29.*
- [x] **2.4** ⚪ ~~Ubah `updateOrderStatus(id)`... sediakan pilihan `dikirim`/`selesai` di UI~~ — **tidak berlaku, koreksi 2026-07-29.** Klaim di laporan §4.4 keliru; lihat koreksi di `A.1_Audit_Report.md` §4.4. Backend sengaja membatasi transisi ini ke `diproses_produksi` saja — `dikirim` webhook-driven (Biteship), `selesai` customer-confirmation/auto-complete (BR-014). Tidak ada kode yang diubah; keputusan user.
- [x] **2.5** 🟡 ⏱XS — Hapus direktori kosong `app/(auth)/login/`, `app/(auth)/register/`, `app/(auth)/lupa-password/`. (§7.6) — *selesai 2026-07-29.*
- [x] **2.6** 🟡 ⏱XS — Hapus `backend/tests/Feature/ExampleTest.php` dan `backend/tests/Unit/ExampleTest.php`. (§7.6) — *selesai 2026-07-29.*

> **✅ CP-2 — "Perbaikan cepat"** — **selesai & terverifikasi 2026-07-29**
> **Verifikasi (browser, live):** guest buka `/checkout` → redirect ke `/` + overlay login muncul ✅. Login `test@example.com` → `/checkout` menampilkan alamat & keranjang miliknya sendiri ✅. Klik "Jadi Kreator" (`/creator/dashboard`) sebagai customer biasa → redirect bersih ke `/akun/upgrade-creator`, bukan halaman rusak ✅. `/creator/verifikasi` tetap bisa diakses meski belum jadi creator aktif ✅. Login admin → klik lonceng notifikasi → mendarat di "Konfigurasi Notifikasi", bukan 404 ✅. `/admin/pesanan` menampilkan data order asli dari `GET /admin/orders`, paragraf basi hilang ✅. Tidak ada console/server error. `php artisan test` — **212/212 lulus** (214 dikurangi 2 ExampleTest yang dihapus).
> **Commit:** `fix(frontend): guard customer/creator routes, repair admin links and order status control`
> **Konteks untuk sesi baru:** `frontend/app/*/layout.tsx`, `frontend/components/auth/AdminGuard.tsx`, `frontend/services/admin.ts`, laporan §4.

---

## Batch 3 — Hapus duplikasi (🔴/🟠, murni refactor)

> Kerjakan setelah Batch 2, karena Batch 2 sudah menghapus tiga layout kembar.

### 3a. Backend

- [x] **3.1** 🔴 ⏱S — Buat `app/Support/SlugGenerator.php` (atau trait `GeneratesUniqueSlug`) dan pakai di `CatalogService`, `CreatorDesignService`, `CreatorService` — hapus tiga salinan `generateSlug`. Beri docblock: *"Menghasilkan slug unik dari teks; menambah sufiks -1, -2, … bila slug sudah dipakai model terkait."* (§6.2) — *selesai 2026-07-29; dibuat sebagai class statis `SlugGenerator::unique(text, modelClass, column)`, bukan trait, karena ketiga caller sudah punya model Eloquent berbeda-beda dan tidak ada state instance yang perlu dibagi.*
- [x] **3.2** 🟠 ⏱S — Angkat `applySort` ke trait bersama (mis. `app/Repositories/Concerns/SortsListings.php`) dengan kolom harga sebagai parameter; pakai di `ProductRepository` dan `DesignRepository`. (§6.3) — *selesai 2026-07-29; `CreatorRepository::applySort` sengaja tidak disentuh karena tidak punya sort harga dan default kolomnya beda (bukan duplikasi sejati).*

### 3b. Frontend — lapisan bersama

- [x] **3.3** 🟠 ⏱S — Buat `lib/query.ts` berisi satu `buildQuery(params)` yang menangani nilai skalar dan array (`key[]`). Pakai di `catalog.ts`, `marketplace.ts` (2 tempat), `admin.ts` (3 tempat); hapus dua salinan `appendArrayParam`. (§6.4, §6.5) — *selesai 2026-07-29; parameter diketik sebagai `object` (bukan `Record<string, QueryValue>`) karena TypeScript menolak assign interface tanpa index signature eksplisit ke tipe Record di titik pemanggilan.*
- [x] **3.4** 🟠 ⏱XS — Pindahkan `interface Paginated<T>` ke `types/api.ts`, impor dari 3 service. (§6.6) — *selesai 2026-07-29.*
- [x] **3.5** 🟠 ⏱XS — Ekspor `API_URL` dari `lib/api.ts`; pakai di `lib/storage.ts` dan `services/admin.ts:96`. (§6.7) — *selesai 2026-07-29.*
- [x] **3.6** 🟠 ⏱S — Tambah `getErrorMessage(err, fallback)` di `lib/api.ts`; ganti 13 kemunculan `err instanceof ApiError ? … : …`. (§6.8) — *selesai 2026-07-29; ternyata 16 kemunculan (bukan 13). `RegisterForm.tsx` sengaja tidak diubah karena memakai `err.errors` (validasi per-field), bukan `err.message`.*
- [x] **3.7** 🟠 ⏱XS — Tambah `formatDate()` dan `formatDateTime()` di `lib/format.ts`; ganti 6 pemanggilan `toLocaleDateString("id-ID")` inline. (§6.9) — *selesai 2026-07-29; ternyata cuma 4 kemunculan inline (bukan 6).*

### 3c. Frontend — dua halaman detail

- [x] **3.8** 🔴 ⏱L — Ekstrak blok bersama dari `catalog/[slug]` dan `marketplace/design/[slug]` (path Bahasa Inggris pasca-K1/Batch 2b, bukan `katalog-produk`/`lapak-desain` seperti tertulis semula) ke `components/product/`:
  - `ProductGallery` — gambar utama + thumbnail + badge Terlaris + tombol wishlist
  - `VariantPicker` — swatch warna + pemilih ukuran
  - `SizeChartTable` — satu sumber data ukuran
  - `TrustBadges` — 3 ikon jaminan
  - `ProductTabs` — tab bar + isi "perawatan"/"pengiriman" yang selama ini disalin
  - `DetailPageSkeleton` dan `DetailNotFound` — terparameter judul + link kembali
  - `RelatedGrid` — menggantikan dua `YouMightLike`, menerima daftar item + judul + href "Lihat Semua"

  *selesai 2026-07-29; kedua halaman turun signifikan (catalog: 493→352 baris, marketplace design: 696→526 baris) tapi **tidak sampai di bawah 250 baris** — sisa baris adalah logic spesifik halaman (state variant/gallery, handler submit cart/checkout, tab content spesifik "produk"/"spesifikasi") yang di luar cakupan 8 komponen yang diminta checklist ini; ekstraksi lebih jauh akan jadi scope creep di luar §6.1/§7.2.* (§6.1, §7.2)

> **✅ CP-3 — "Duplikasi dihapus"** — **selesai & terverifikasi 2026-07-29**
> **Verifikasi:** `php artisan test` — **212/212 lulus**; `pnpm build` hijau (semua 36 route ter-generate, ukuran halaman turun: `catalog/[slug]` 9.56kB→6.93kB, `marketplace/design/[slug]` 7.18kB→4.61kB); dibandingkan langsung di browser (dev server) — gallery, pemilih warna/ukuran, size chart toggle, tab switching, upload desain, related grid, dan (khusus marketplace) creator summary card semua berfungsi identik dengan sebelum refactor, tanpa error console.
> **Commit:** `refactor: extract shared slug/sort/query helpers and product detail components`
> **Konteks untuk sesi baru:** laporan §6 (tabel nomor baris ada di sana), `frontend/components/ui/`, `backend/app/Services/`, `backend/app/Repositories/`.

---

## Batch 4 — Konsistensi UI/UX (🟠)

- [x] **4.1** 🟠 ⏱S — Tambah token semantik ke `tailwind.config.ts`: `danger`, `success`, `warning`, `info` (+ varian `-fg` untuk teks di atasnya). Pilih nada `warning` yang lolos WCAG AA dengan teks gelap, bukan `text-white` di atas `amber-500`. (§5.4) — *selesai 2026-07-29; `warning` dipertahankan sebagai amber-500 tapi `warning-fg` jadi near-black (kontras ~7.85:1, lolos AAA), bukan putih.*
- [x] **4.2** 🟠 ⏱M — Ganti semua warna Tailwind mentah dengan token baru di `Badge.tsx`, `Button.tsx`, `Input.tsx`, `PasswordInput.tsx`, `SiteHeader.tsx`, `CartItemRow.tsx`, kartu rating, dan 8 halaman yang memakai `text-red-500`. (§5.4) — *selesai 2026-07-29; ternyata 27 file terpengaruh (bukan ~13), termasuk ikon bintang rating (`fill-yellow-400`→`fill-warning`), heart wishlist, badge notifikasi SiteHeader, dan banner "Pesanan Ditolak" (`border-red-200 bg-red-50`→`border-danger/20 bg-danger/5`).*
- [x] **4.3** 🟠 ⏱M — Buat `components/ui/EmptyState.tsx` (ikon + judul + deskripsi + CTA opsional). Pakai di 17 lokasi; tambahkan ke `/admin/pengguna` dan `/admin/pembayaran` yang selama ini tidak punya empty state. Seragamkan kalimat: "Belum ada …" untuk kondisi normal, "Tidak ada … yang cocok" untuk hasil filter kosong. (§5.2) — *selesai 2026-07-29; catalog/marketplace listing pages (public) sudah punya pola icon+text+CTA yang sama sebelum batch ini — sengaja tidak dipaksa migrasi ke komponen baru karena sudah benar, bukan duplikasi bermasalah.*
- [x] **4.4** 🟠 ⏱M — Buat `components/ui/LoadingState.tsx` + `Skeleton.tsx`. Ganti 21 `<p>Memuat…</p>` dengan skeleton yang menyerupai bentuk kontennya, sehingga halaman internal setara dengan halaman publik. (§5.1) — *selesai 2026-07-29; semua 21 lokasi diganti (6 di antaranya diserap otomatis oleh `DataTable`'s built-in `TableRowsSkeleton`).*
- [x] **4.5** 🟠 ⏱M — Buat `components/ui/DataTable.tsx` yang menerima definisi kolom + `isLoading` + `emptyState`. Pakai di 6 halaman tabel admin. (§5.5) — *selesai 2026-07-29; `admin/catalog` (tabel produk dengan expand/collapse varian + form inline) sengaja tidak dipaksa ke API kolom rigid `DataTable` — hanya loading skeleton + empty state-nya yang diseragamkan, struktur baris kompleksnya dipertahankan untuk menghindari regresi.*
- [x] **4.6** 🟠 ⏱M — Tambah `components/ui/Pagination.tsx` dan hubungkan ke `meta` yang sudah dikembalikan API pada daftar admin. (§5.6) — *selesai 2026-07-29; dihubungkan ke `admin/users`, `admin/orders`, `admin/payments` (tiga endpoint yang benar-benar `Paginated<T>`); `getUsers`/`getOrders`/`getPayments` ditambah parameter `page`. Backend tidak perlu diubah — Laravel `paginate()` sudah otomatis membaca `?page=`.*
- [x] **4.7** 🟠 ⏱M — Tambah sistem toast (store Zustand + `<Toaster />` di `AppProviders`). Ganti pesan error inline, dan tambahkan konfirmasi sukses untuk aksi yang selama ini senyap (tambah ke keranjang, simpan alamat, approve/reject). (§5.3) — *selesai 2026-07-29; error inline pada form (validasi per-field) **sengaja dipertahankan**, bukan diganti toast — lebih baik untuk aksesibilitas/UX karena error tetap dekat dengan field-nya. Toast difokuskan pada konfirmasi sukses untuk aksi yang sebelumnya senyap: tambah ke keranjang, simpan/hapus alamat, approve/reject creator & desain — diverifikasi langsung di browser (toast "Creator berhasil disetujui." muncul & auto-dismiss).*
- [x] **4.8** 🟠 ⏱S — Tambah `app/error.tsx` global dan `error.tsx` per route group. (§5.3) — *selesai 2026-07-29; 6 file (root + 5 grup) berbagi satu `components/ui/ErrorState.tsx` untuk hindari duplikasi JSX 6x.*

> **✅ CP-4 — "UI konsisten"** — **selesai & terverifikasi 2026-07-29**
> **Verifikasi:** `pnpm build` hijau (36 route, sempat OOM sekali karena tekanan memori sesi panjang — retry dengan `NODE_OPTIONS=--max-old-space-size=4096` sukses, bukan bug kode); `php artisan test` 212/212 (batch ini frontend-only, tidak menyentuh backend selain util); ditelusuri langsung di browser sebagai admin — `DataTable`+`Pagination` di `/admin/payments` (62 data, 4 halaman, navigasi halaman berfungsi), `EmptyState` di `/account/wishlist` (kosong dengan CTA "Jelajahi Katalog"), toast sukses saat approve creator di `/admin/creators/approval`; kontras `warning-fg` atas `warning` dihitung manual ~7.85:1 (lolos WCAG AAA teks normal). Tidak ada console error di semua halaman yang dicek.
> **Commit:** `feat(ui): semantic color tokens, shared empty/loading/table/pagination/toast components`
> **Konteks untuk sesi baru:** laporan §5, `frontend/tailwind.config.ts`, `frontend/components/ui/`.

---

## Batch 5 — Menutup gap fitur (🔴/🟠)

- [x] **5.1** 🔴 ⏱XL — **Bulk Order** (FE-052/FE-056, FR-040/FR-044, BR-012/BR-026): *selesai 2026-07-29 (K-2). Backend (`8bf9dd4`, sesi sebelumnya): `POST /checkout/bulk`, `BulkCheckoutRequest`, `CheckoutService::checkoutBulk()` menulis `orders.type='bulk'`; checkout reguler tidak lagi panggil `bulkUnitPriceFor()` sama sekali. Frontend (`0dc545a`): halaman `/bulk-order/{slug}` — pilih desain (upload sendiri/marketplace) + kuantitas per kombinasi warna/ukuran lintas seluruh varian produk (bukan cuma satu warna), pratinjau tabel tingkat harga live dari `GET /bulk-pricing-tiers`; halaman `/checkout/bulk` terpisah — pilih alamat + ringkasan, submit ke endpoint yang sudah ada. Draft dibawa antar dua halaman lewat store Zustand in-memory (`useBulkOrderStore`), bukan lewat keranjang server (`checkoutBulk()` memang bypass keranjang per BR-026). CTA "Pesan Bulk Order" ditambah di halaman detail produk. Ditelusuri end-to-end di browser sungguhan (login → isi kuantitas → lanjut checkout → alamat → submit → order `HC-...` dengan status "Belum Dibayar" tercipta), tanpa console error.*
- [x] **5.2** 🟠 ⏱M — Halaman notifikasi admin, atau putuskan resmi bahwa admin tidak punya inbox. *Diputuskan 2026-07-29 — tidak dibangun; admin hanya punya `/admin/notification-settings` (konfigurasi), tidak ada inbox. Dicatat sebagai K-5 di `A.3_Decisions_And_Revised_Plan.md` §1 — eksekusi (edit Sitemap) menyusul di Batch 7.*
- [x] **5.3** 🟠 ⏱M — Halaman `/admin/audit-log` yang memakai `GET /admin/audit-logs`. *selesai 2026-07-29. Endpoint dan `services/admin.ts::getAuditLogs()` memang sudah ada (tinggal ditambah param `page`/`action`); yang baru murni halamannya + link sidebar `LAPORAN`. Sekalian dikoreksi: tipe frontend `AuditLog` sudah drift dari resource asli (field lama `subject_type`/`subject_id`/`metadata` tidak pernah ada di model — yang benar `entity_type`/`entity_id`/`description`), dan kolom Entitas ditampilkan basename class saja (bukan `App\Models\CreatorProfile` penuh).*
- [x] **5.4** 🟠 ⏱M — Endpoint `GET /catalog/products/{slug}/reviews` + `GET /marketplace/designs/{slug}/reviews` dan render daftarnya. *selesai 2026-07-29 (`f868fa7` backend, `fb81ff3` frontend). `ReviewResource` ditambah field `user` (`whenLoaded`) untuk nama reviewer. Kalimat placeholder "akan tampil di sini setelah fitur listing ulasan tersedia" sudah dihapus dari `ReviewsTabContent`, diganti render asli (nama, bintang, komentar, tanggal, paginasi). Diverifikasi live di kedua halaman detail (produk & desain).*
- [x] **5.5** 🟠 ⏱S — Tambah `export const metadata` (atau `generateMetadata` untuk route dinamis) di setiap halaman publik demi SEO dasar. *selesai 2026-07-29 (`bfd43e3`). Halaman statis (`about`, `legal/*`) dapat metadata langsung; 4 halaman `"use client"` (katalog/marketplace list+detail, desain detail) dipecah jadi `*Client.tsx` + `page.tsx` wrapper server yang ekspor metadata (dinamis pakai `generateMetadata` + fetch server-side baru `lib/server-fetch.ts`, karena `apiFetch()` biasa baca `document.cookie` yang tak ada di server). Beranda sengaja tidak disentuh — metadata default root layout sudah cukup. Root layout dapat `title.template` ("%s | Harmoni Clothing"). `pnpm build` hijau (38 route) + diverifikasi title tab di 6 halaman termasuk fallback 404 generateMetadata.*
- [x] **5.6** 🟠 ⏱S — Putuskan nasib halaman `/chat`. *Sudah diputuskan sebelumnya (bagian dari K-1, lihat `A.3_Decisions_And_Revised_Plan.md` §2) — dihapus, `ChatWidget` menggantikannya. Eksekusi (edit Sitemap) menyusul di Batch 7 bersama rename lain.*

> **✅ CP-5 — "Gap fitur tertutup"** — **selesai & terverifikasi 2026-07-29**
> **Verifikasi:** `php artisan test` 219/219 hijau (termasuk 2 test baru untuk review listing); `pnpm build` hijau (38 route); alur Bulk Order ditelusuri end-to-end di browser sungguhan dari halaman produk sampai order tercipta dengan `type='bulk'`.
> **Commit:** `0dc545a` (Bulk Order frontend), `935c9ee` (Audit Log), `f868fa7`+`fb81ff3` (review listing), `bfd43e3` (SEO metadata).
> **Konteks untuk sesi baru:** laporan §4.1, `backend/app/Services/CheckoutService.php`, `backend/app/Services/PricingService.php`, `1.2_Requirement_Gathering.md` (BR-012, BR-026).

---

## Batch 6 — Modularitas & keterbacaan (🟠)

- [x] **6.1** 🟠 ⏱M — Isi `frontend/hooks/`: `useProducts`, `useDesigns`, `useCart`, `useOrders`, `useNotifications`, `useWishlist`. Pusatkan key SWR di `lib/swr-keys.ts` supaya `mutate()` tidak lagi bergantung pada string yang diketik manual. (§7.3) — *selesai 2026-07-29; `swrKeys` mencakup keenam domain + `creators` (dipakai bareng `useDesigns` di halaman marketplace); ~17 file konsumen dimigrasi dari `useSWR`+string literal ke hook/`swrKeys`.*
- [x] **6.2** 🟠 ⏱M — Pecah `components/layout/SiteHeader.tsx` (418 baris) menjadi `HeaderNav`, `CartPopover`, `NotificationPopover`, `HeaderSearch`. (§7.2) — *selesai 2026-07-29; tidak ada fitur search di header (diverifikasi, bukan diasumsikan), jadi `HeaderSearch` tidak dibuat — sebagai gantinya `AccountMenu` diekstrak (bagian nyata dari file yang justru butuh dipecah).*
- [x] **6.3** 🟠 ⏱M — Pecah `app/(public)/page.tsx` (535 baris) menjadi komponen per section di `components/home/`. (§7.2) — *selesai 2026-07-29; 6 komponen: `HeroSection`, `HowItWorksSection`, `PopularProductsSection`, `PopularDesignsSection`, `TestimonialsSection`, `CtaSection`.*
- [x] **6.4** 🟠 ⏱M — Pecah `app/(public)/lapak-desain/page.tsx`: pindahkan `DesainTab` dan `CreatorTab` ke file masing-masing. (§7.2) — *selesai 2026-07-29; path sudah `marketplace/page.tsx` pasca-Batch 2b, komponen dipindah ke `components/marketplace/`.*
- [x] **6.5** 🟠 ⏱M — Pecah `app/(admin)/admin/katalog/page.tsx`: pisahkan `ProductForm` dan `VariantForm` dari daftar. (§7.2) — *selesai 2026-07-29; path sudah `admin/catalog/page.tsx` pasca-Batch 2b. Sekalian diekstrak `VariantRow` (baris edit-inline) dan `PrintAreaCheckboxes` (dipakai bareng keduanya) ke `components/admin/catalog/`.*
- [x] **6.6** 🟠 ⏱M — Tambah docblock satu-dua kalimat di setiap komponen `components/ui/` dan setiap fungsi `services/`, meniru gaya backend: jelaskan *tujuan* dan *aturan yang berlaku*, bukan mengulang isi kode. Contoh yang sudah bagus: `lib/format.ts`. (§7.4) — *selesai 2026-07-29; ke-30 komponen `components/ui/` dapat docblock per-komponen. `services/` (13 file, ~72 fungsi CRUD) sengaja didekati beda: satu docblock per file menjelaskan domain resource, bukan 72 komentar per-fungsi yang cuma akan mengulang nama fungsi — CLAUDE.md proyek ini eksplisit melarang komentar yang tidak menjelaskan sesuatu yang non-obvious.*
- [x] **6.7** 🟡 ⏱S — Hubungkan size chart ke data produk, atau beri label eksplisit sebagai panduan umum agar tidak menyesatkan. (§5.7) — *tidak berlaku, diverifikasi 2026-07-29 — `SizeChartTable.tsx` sudah punya disclaimer eksplisit ("Ukuran umum, dapat berbeda tipis tergantung jenis produk") sejak sebelum batch ini. Tidak ada kolom ukuran/measurement apa pun di skema backend untuk dihubungkan — menyambungkannya ke data nyata butuh migration baru, di luar cakupan batch modularitas frontend-only ini.*

> **✅ CP-6 — "Kode modular"** — **selesai & terverifikasi 2026-07-29**
> **Verifikasi:** `pnpm build` hijau (36 route); `php artisan test` 212/212 (batch frontend-only, tidak menyentuh backend); ditelusuri langsung di browser sebagai admin — beranda (hero+parallax+kedua carousel data-driven), marketplace (tab Desain & Kreator), `/admin/catalog` (expand baris → `VariantRow`+`VariantForm` render & simpan), alur tambah-ke-keranjang penuh (`POST /cart` 201 → `invalidateCart()` refetch `GET /cart` 200 → halaman `/cart` menampilkan item) — semua tanpa console/server error.
> **Commit:** `e16c097` `refactor(frontend): domain hooks, component decomposition, and component docblocks`
> **Konteks untuk sesi baru:** laporan §7, `frontend/hooks/`, `frontend/lib/swr-keys.ts`, `frontend/components/{home,marketplace,admin/catalog}/`.

---

## Batch 7 — Sinkronisasi dokumen (🔴/🟠, tanpa sentuh kode)

> Bisa dikerjakan kapan saja secara paralel — tidak ada kode yang berubah. Kalau token sangat terbatas, batch ini yang paling aman dikerjakan sendirian.

- [ ] **7.1** 🔴 ⏱M — Perbarui `2.1_Sitemap.md` ke URL Bahasa Indonesia yang sebenarnya (tabel lengkap ada di laporan §2.1), revisi §8 yang menyatakan "Bahasa URL: Bahasa Inggris", dan tambahkan entri Change Log berisi alasannya. (§2.1)
- [ ] **7.2** 🔴 ⏱M — Perbarui `4.2_ERD.md` dan `4.3_Table_Design.md` dengan 8 migration yang belum tercatat, termasuk dua tabel baru `tags` dan `design_tag`. (§2.3)
- [ ] **7.3** 🟠 ⏱S — Tambahkan 10 endpoint yang sudah ada tapi belum tercatat ke `5.2_API_List.md`; tandai `POST /checkout/bulk` sebagai belum dibuat sampai Batch 5 selesai. (§2.4)
- [ ] **7.4** 🔴 ⏱S — Tandai FE-052 dan FE-056 di `1.5_Master_Feature_List.md`, serta FR-040/FR-044/BR-026 di `1.2_Requirement_Gathering.md`, dengan **⚠ Belum dibuat** beserta tanggal — mengikuti format yang sudah dipakai untuk FR-010/FR-012/FR-027. (§4.1)
- [ ] **7.5** 🟠 ⏱S — Perbarui `3.4_Folder_Structure.md`: `locales/` masih kosong, `hooks/` masih kosong, `Jobs/` diganti Console Command, `Policies/` diganti middleware + scoping. Tulis apa adanya, bukan yang direncanakan. (§2.5)
- [ ] **7.6** 🟠 ⏱XS — Perbarui jumlah halaman di `2.1_Sitemap.md` dari 45 menjadi angka sebenarnya, dan catat perubahan Login/Register jadi overlay. (§2.2)

> **✅ CP-7 — "Dokumen sinkron"**
> **Verifikasi:** baca ulang `3.5_Coding_Standards.md` §7 dan pastikan tiap perubahan skema/API pada commit belakangan sudah punya jejak di dokumen.
> **Commit:** `docs: sync sitemap, ERD, table design, API list, and feature status with implementation`
> **Konteks untuk sesi baru:** laporan §2 dan §4.1, `Required Document/Phase 2`, `Phase 4`, `Phase 5`.

---

## Keputusan yang dibutuhkan dari Anda

Empat hal ini mengubah isi pekerjaan, jadi sebaiknya dijawab sebelum batch terkait dimulai:

| # | Pertanyaan | Rekomendasi |
|---|---|---|
| K-1 | **URL:** ubah kode agar cocok dengan Sitemap (Inggris), atau ubah Sitemap agar cocok dengan kode (Indonesia)? | Ubah dokumen. URL Indonesia lebih pas untuk pasar ID, dan mengganti 45 route berisiko tinggi tanpa manfaat nyata. |
| K-2 | **Bulk Order:** bangun alur terpisah sesuai BR-026, atau ubah BR-026 agar diskon bertingkat otomatis di checkout reguler menjadi perilaku resmi? | Bangun alur terpisah. BR-012 mendasarkan BR-026 pada lead time produksi yang memang berbeda — alasan operasional, bukan preferensi UI. **Apa pun pilihannya, perilaku sekarang harus diperbaiki**: keranjang campuran ikut mendapat harga bulk. |
| K-3 | **Policies:** implementasikan Laravel Policy sesuai 3.4, atau resmikan middleware + scoping yang sudah berjalan? | Resmikan yang sudah ada. Pendekatan sekarang berfungsi dan sudah teruji 214 test; ganti dokumennya saja. |
| K-4 | **i18n (FR-034/NFR-008):** kerjakan sekarang atau tunda ke Fase 2? | Kalau ditunda, turunkan prioritasnya dari *Must* di `1.5` supaya status dokumen jujur. Menambahkannya nanti berarti menyentuh setiap file JSX — persis yang ingin dicegah NFR-008. |

---

## Ringkasan usaha

| Batch | Isi | Perkiraan | Bisa jalan sendiri? |
|---|---|---|---|
| 1 | Seeder | ½ hari | ✅ ya |
| 2 | Perbaikan cepat | ½ hari | ✅ ya |
| 3 | Hapus duplikasi | 1–1½ hari | ✅ ya |
| 4 | Konsistensi UI/UX | 1½–2 hari | ✅ ya |
| 5 | Gap fitur | 2–3 hari | ⚠️ butuh K-2 |
| 6 | Modularitas | 1–1½ hari | sebaiknya setelah Batch 4 |
| 7 | Sinkronisasi dokumen | ½ hari | ⚠️ butuh K-1, K-3, K-4 |

**Total ±7–9 hari kerja.** Batch 1 dan 2 saja (satu hari) sudah menghilangkan tiga temuan kritis dan membuat aplikasi bisa diverifikasi manual untuk pertama kalinya.

---

# BAGIAN A.3 — Keputusan & Urutan Kerja


**Tanggal keputusan:** 2026-07-29
**Sumber:** [A.1_Audit_Report.md](#BAGIAN-A) · [A.2_Fix_Checklist.md](A.2_Fix_Checklist.md)
**Status:** menggantikan bagian "Keputusan yang dibutuhkan dari Anda" dan "Ringkasan usaha" di A.2. Isi batch di A.2 tetap berlaku; yang berubah adalah **urutan** dan **tiga batch baru**.

---

## 1. Keputusan yang sudah diambil

| # | Keputusan | Konsekuensi |
|---|---|---|
| **K-1** | **URL diubah ke Bahasa Inggris**, mengikuti `2.1_Sitemap.md` §8. | 39 route direname. ±22 baris Sitemap otomatis cocok; ±9 baris tetap diperbarui karena bedanya struktural, bukan bahasa (lihat §2). |
| **K-2** | **Bangun alur Bulk Order terpisah** sesuai BR-026. | `POST /checkout/bulk` + halaman `/bulk-order/{slug}` + `/checkout/bulk`. **Dan** hentikan penerapan harga bulk otomatis di checkout reguler — perilaku sekarang membuat item reguler ikut dapat harga bulk pada keranjang campuran. |
| **K-3** | **Resmikan middleware + scoping** sebagai pola otorisasi; Policies tidak dibuat. | Hanya dokumen yang berubah: `3.4_Folder_Structure.md` dan `2.5_Permission_Matrix.md` §7 menyebut middleware `admin` / `creator.active` + scoping di controller, bukan `app/Policies/`. Kode tidak disentuh. |
| **K-4** | **i18n dikerjakan sekarang**, bukan ditunda ke Fase 2. | FR-034 / NFR-008 / FE-051 keluar dari daftar gap. Dipecah jadi dua tahap agar tidak menyentuh file yang sama dua kali (lihat §3). |
| **K-5** | **Admin tidak punya inbox notifikasi** — hanya `/admin/notification-settings` (konfigurasi). Tidak dibangun halaman inbox baru. | Item 5.2 selesai lewat keputusan, bukan kode. Sitemap perlu dicatat di Batch 7 bahwa admin tidak punya entri notifikasi setara Customer/Creator. |

---

## 2. K-1 — baris Sitemap yang tetap harus diperbarui

Rename route menyelesaikan sebagian besar selisih, tapi sembilan baris berikut berbeda **secara struktur**, bukan bahasa. Ini tetap perlu diedit di `2.1_Sitemap.md` setelah rename:

| Sitemap sekarang | Keputusan |
|---|---|
| `/login`, `/register`, `/forgot-password` (3 baris) | Hapus sebagai halaman; catat sebagai overlay global. Sisakan `/reset-password` yang memang masih berupa halaman. |
| `/editor/custom/{slug}` + `/editor/marketplace/{slug}` | Gabung jadi satu baris `/customize/{slug}` (2 halaman → 1). |
| `/account` | Jadi `/account/profile` — profil ada di sub-path, bukan root akun. |
| `/orders`, `/orders/{id}`, `/wishlist` | Jadi `/account/orders`, `/account/orders/{id}`, `/account/wishlist` — di kode bersarang di bawah akun. |
| `/creator/designs/{id}/preview` | Jadi `/creator/designs/{id}` — sufiks `/preview` tidak dipakai. |
| `/chat` | Hapus; catat bahwa `ChatWidget` menggantikannya. |
| — | Tambahkan `app/not-found.tsx` (halaman 404) yang belum tercatat. |

`/bulk-order/{slug}` dan `/checkout/bulk` tidak masuk daftar ini — K-2 akan membuatnya, jadi otomatis sesuai.

**Peta rename lengkap** ada di laporan [A.1 §2.1](#BAGIAN-A). Yang ikut berubah selain nama direktori: seluruh `href` internal, `router.push` (4 tempat), konfigurasi `AccountSidebar` / `CreatorSidebar` / `AdminSidebar`, dan redirect di `AdminGuard`.

---

## 3. K-4 — i18n dipecah dua tahap

Ini penting agar tidak boros. Biaya i18n sebanding dengan jumlah titik string. Batch 3, 4, dan 6 **mengurangi** jumlah titik string (konsolidasi duplikat, komponen bersama); Batch 5 **menambah** (halaman Bulk Order baru).

Kalau i18n dikerjakan sekaligus di awal, string yang baru diekstrak akan dihapus lagi saat konsolidasi. Kalau dikerjakan sekaligus di akhir, semua batch di antaranya menulis string hardcode yang harus diekstrak belakangan. Karena itu dipecah:

**Tahap A — infrastruktur (dikerjakan awal, sebelum Batch 3).** Tidak menyentuh string yang sudah ada; hanya menyiapkan jalurnya, supaya setiap batch berikutnya langsung menulis dengan `t()`.

**Tahap B — ekstraksi massal (dikerjakan akhir, setelah Batch 6).** Menyapu string yang tersisa dari kode yang tidak tersentuh batch lain.

---

## 4. Urutan kerja revisi

Tiga batch baru: **2b**, **2c**, dan **6b**. Isi batch lain tidak berubah dari A.2.

| Urutan | Batch | Isi | Perkiraan |
|---|---|---|---|
| 1 | **1** | Seeder — data bisa dilihat | ½ hari |
| 2 | **2** | Perbaikan cepat — guard, link rusak, status order | ½ hari |
| 3 | **2b** 🆕 | **Rename 39 route ke Bahasa Inggris** (K-1) | ½ hari |
| 4 | **2c** 🆕 | **i18n Tahap A — infrastruktur** (K-4) | ½ hari |
| 5 | **3** | Hapus duplikasi — slug, sort, query, halaman detail | 1–1½ hari |
| 6 | **4** | Konsistensi UI/UX — token, empty/loading, tabel, toast | 1½–2 hari |
| 7 | **6** | Modularitas — hooks, pecah file besar, docblock | 1–1½ hari |
| 8 | **5** | Gap fitur — **Bulk Order terpisah** (K-2), audit log, review | 2–3 hari |
| 9 | **6b** 🆕 | **i18n Tahap B — ekstraksi massal + terjemahan EN** (K-4) | 1–1½ hari |
| 10 | **7** | Sinkronisasi dokumen — Sitemap, ERD, API List, status fitur | ½ hari |

**Total ±9–12 hari kerja** (naik dari 7–9 karena K-1 dan K-4 masuk scope).

**Kenapa urutannya begitu:**

- **2b sebelum 3** — rename menyentuh setiap `href`; kalau dilakukan setelah refactor komponen, `href` yang sama ditulis ulang dua kali.
- **2c sebelum 3** — begitu infrastruktur i18n ada, komponen bersama yang dibuat di Batch 3/4/6 langsung lahir dengan `t()`.
- **7 paling akhir** — dokumen merekam keadaan final, bukan keadaan setengah jalan.

---

## 5. Batch 2b — Rename route ke Bahasa Inggris (baru)

- [x] **2b.1** ⏱M — Rename 39 direktori route sesuai peta di [A.1 §2.1](#BAGIAN-A), dengan penyesuaian struktural §2 di atas (`/account/profile`, `/account/orders`, `/account/wishlist`, `/customize/{slug}`, `/creator/designs/{id}`). — *selesai 2026-07-29 via 27 `git mv` (mempertahankan histori), termasuk restrukturisasi 3 arah `lapak-desain`+`kreator` → `marketplace` root/`design/[slug]`/`[slug]`.*
- [x] **2b.2** ⏱S — Perbarui seluruh `href` internal dan `router.push` — *selesai; 85 penggantian string literal di 30 file (bukan 13 — cakupan lebih luas dari perkiraan awal audit), termasuk `katalog-produk/[slug]`, `lapak-desain/[slug]`, `checkout`.*
- [x] **2b.3** ⏱S — Perbarui konfigurasi `AccountSidebar`, `CreatorSidebar`, `AdminSidebar`, dan menu di `SiteHeader` / `MobileDrawer`. — *selesai; `MobileDrawer` ternyata cuma shell tanpa route sendiri (menu datang dari `AdminSidebar`/`SiteHeader` yang sudah diperbarui).*
- [x] **2b.4** ⏱XS — Perbaiki link rusak `/admin/notifikasi` — *sudah selesai di 2.2 sebelumnya, tidak perlu diulang.*
- [x] **2b.5** ⏱S — Telusuri ulang seluruh `href` setelah rename. — *selesai; grep menyeluruh dua putaran + tes fetch semua route lama (404) dan baru (200) mengonfirmasi cutover bersih.*

> **✅ CP-2b — "URL Inggris"** — **selesai & terverifikasi 2026-07-29**
> **Verifikasi:** `npm run build` hijau (36 route baru terdaftar). Klik langsung setiap item di ketiga sidebar (Admin, Creator, Account) + menu header sebagai ketiga akun test — tidak ada 404, tidak ada console/server error. Fetch semua route lama → 404 (cutover bersih, bukan dual-serving). **Temuan tambahan:** build sempat gagal di `/catalog` dan `/marketplace` karena `useSearchParams()` tanpa `Suspense` boundary (bug pra-eksisting, tidak terkait rename — baru ketahuan karena `next build` kemungkinan belum pernah dijalankan sebelumnya, hanya `next dev`); diperbaiki sekalian dengan pola wrapper `Suspense` standar Next.js.
> **Commit:** `refactor(routes): rename all routes to English per Sitemap 2.1 §8`

---

## 6. Batch 2c — i18n Tahap A: infrastruktur (baru)

- [x] **2c.1** ⏱S — Pasang library i18n untuk App Router (`next-intl` direkomendasikan — dukungan Server Component matang). Catat pilihannya di `3.1_Technology_Stack.md`. — *selesai 2026-07-29; mode tanpa URL locale routing (cookie `NEXT_LOCALE`) supaya rename Batch 2b tidak perlu diprefiks ulang. Sempat gagal `npm install` karena proyek pakai `pnpm` (ketahuan dari `pnpm-lock.yaml`) — diinstal ulang dengan `pnpm add`.*
- [x] **2c.2** ⏱S — Buat `providers/I18nProvider.tsx` dan pasang di `app/layout.tsx`. — *selesai.*
- [x] **2c.3** ⏱S — Buat `locales/id.json` dan `locales/en.json`. Isi awal: namespace `common` saja. — *selesai.*
- [x] **2c.4** ⏱S — Buat komponen `LanguageSwitcher` dan pasang di `SiteHeader` + `Footer`; simpan pilihan bahasa di cookie. — *selesai; pakai Server Action (`lib/locale-actions.ts`) + `window.location.reload()` setelah cookie di-set, karena data yang di-fetch lewat SWR tidak otomatis refresh hanya dari `revalidatePath` di sisi server (ketahuan saat verifikasi browser — deskripsi produk tidak berubah sampai ditambahkan reload paksa).*
- [x] **2c.5** ⏱S — Sambungkan bahasa aktif ke `?lang=`/`Accept-Language` — *selesai via header `Accept-Language` di `lib/api.ts` (bukan `?lang=` per-request, lebih simpel — `ResolvesLocale` backend menerima keduanya).*
- [x] **2c.6** ⏱XS — Perbarui `app/layout.tsx`: atribut `<html lang>` mengikuti bahasa aktif. — *selesai via `getLocale()`.*

> **✅ CP-2c — "i18n siap"** — **selesai & terverifikasi 2026-07-29**
> **Verifikasi:** `pnpm build` hijau (36 route, semua jadi `ƒ Dynamic` karena bergantung pada `cookies()` — trade-off wajar dari mode tanpa URL routing). Di browser: klik switcher → label "Bahasa"/"Language" berubah langsung, `<html lang>` & cookie `NEXT_LOCALE` berubah. Bukti `?lang=`/`Accept-Language` tersambung dibuktikan dua arah: `curl` langsung ke backend dengan header berbeda menghasilkan `description` berbeda (nama produk sengaja sama di data seed — `ProductFactory` pakai teks Faker yang sama untuk `name_id`/`name_en`, tapi `description_id`/`description_en` independen), dan browser menampilkan teks yang sama setelah switch. Cookie bertahan lintas navigasi baru. Tidak ada console/server error di halaman publik, customer, creator, maupun admin.
> **Commit:** `feat(i18n): add next-intl infrastructure, locale files, and language switcher`

---

## 7. Batch 6b — i18n Tahap B: ekstraksi massal (baru)

- [ ] **6b.1** ⏱L — Ekstrak string dari seluruh halaman publik ke `locales/*.json`.
- [ ] **6b.2** ⏱L — Ekstrak string dari halaman Customer, Creator, dan Admin.
- [ ] **6b.3** ⏱M — Ekstrak string dari `components/` yang belum tersentuh Batch 4 dan 6.
- [ ] **6b.4** ⏱M — Terjemahkan `en.json` secara utuh.
- [ ] **6b.5** ⏱S — Terjemahkan pesan error backend (`lang/id`, `lang/en`) dan pastikan responsnya mengikuti `Accept-Language` atau `?lang=`.
- [ ] **6b.6** ⏱S — Sisir sisa string hardcode; tambahkan aturan lint agar teks mentah di JSX tidak masuk lagi.

> **✅ CP-6b — "i18n lengkap"**
> **Verifikasi:** telusuri satu halaman per role dalam mode EN — tidak boleh ada teks Indonesia tersisa; `pnpm build` hijau.
> **Commit:** `feat(i18n): extract all UI strings to locale files and complete English translation`

---

## 8. Dampak ke Batch 7 (sinkronisasi dokumen)

Keputusan di atas mengubah isi tugas dokumentasi di A.2:

- **7.1** — Sitemap **tidak** ditulis ulang ke Indonesia. Yang diperbarui hanya ±9 baris struktural di §2 di atas, plus catatan Change Log bahwa kode dirapikan agar sesuai §8 (bukan sebaliknya).
- **7.4** — FE-052 / FE-056 / FR-040 / FR-044 tidak perlu ditandai "⚠ Belum dibuat" kalau Batch 5 selesai lebih dulu; cukup catat tanggal penyelesaiannya.
- **7.5** — Tambahkan: `app/Policies/` resmi tidak dipakai (K-3); otorisasi lewat middleware + scoping. `locales/` dan `providers/` sudah terisi setelah Batch 2c, jadi bagian itu justru kembali sesuai dokumen.
- **Baru** — Hapus tanda "⚠ Belum dibuat" pada FR-034, NFR-008, dan FE-051 setelah CP-6b.

---

## 9. Yang bisa dimulai tanpa menunggu apa pun

Batch 1 dan Batch 2 tidak terpengaruh keempat keputusan ini dan bisa langsung dikerjakan.
