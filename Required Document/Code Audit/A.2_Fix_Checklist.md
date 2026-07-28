# A.2 Checklist Perbaikan — Harmoni Clothing

**Sumber:** [A.1_Audit_Report.md](A.1_Audit_Report.md) · **Dibuat:** 2026-07-28 · **Baseline commit:** `20a92c6`

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

- [ ] **2.1** 🔴 ⏱S — Buat `AuthGuard` (mengikuti pola `components/auth/AdminGuard.tsx`) dan pasang di `app/(customer)/layout.tsx`; buat `CreatorGuard` yang memeriksa role creator untuk `app/(creator)/layout.tsx`. Sekalian ini menghapus duplikasi tiga layout identik. (§4.2, §6.10)
- [ ] **2.2** 🟠 ⏱XS — Perbaiki link rusak `AdminHeader.tsx:20`: arahkan ke `/admin/notifikasi-config`, atau hapus ikon lonceng sampai halaman inbox admin ada. (§4.3)
- [ ] **2.3** 🟠 ⏱S — Ganti `/admin/pesanan` agar memakai `GET /admin/orders` (sudah ada di `routes/api.php:150`) dan **hapus paragraf keterangan yang sudah tidak benar** di `page.tsx:38–41`. Tambahkan `getOrders()` di `services/admin.ts`. (§4.5, §7.5)
- [ ] **2.4** 🟠 ⏱S — Ubah `updateOrderStatus(id)` di `services/admin.ts:196` agar menerima parameter `status`, dan sediakan pilihan `dikirim`/`selesai` di UI `/admin/produksi`. (§4.4)
- [ ] **2.5** 🟡 ⏱XS — Hapus direktori kosong `app/(auth)/login/`, `app/(auth)/register/`, `app/(auth)/lupa-password/`. (§7.6)
- [ ] **2.6** 🟡 ⏱XS — Hapus `backend/tests/Feature/ExampleTest.php` dan `backend/tests/Unit/ExampleTest.php`. (§7.6)

> **✅ CP-2 — "Perbaikan cepat"**
> **Verifikasi:** buka `/checkout` sebagai guest (harus muncul overlay login), `/creator/dashboard` sebagai customer biasa (harus ditolak dengan jelas), klik lonceng admin (tidak 404), `php artisan test` tetap hijau.
> **Commit:** `fix(frontend): guard customer/creator routes, repair admin links and order status control`
> **Konteks untuk sesi baru:** `frontend/app/*/layout.tsx`, `frontend/components/auth/AdminGuard.tsx`, `frontend/services/admin.ts`, laporan §4.

---

## Batch 3 — Hapus duplikasi (🔴/🟠, murni refactor)

> Kerjakan setelah Batch 2, karena Batch 2 sudah menghapus tiga layout kembar.

### 3a. Backend

- [ ] **3.1** 🔴 ⏱S — Buat `app/Support/SlugGenerator.php` (atau trait `GeneratesUniqueSlug`) dan pakai di `CatalogService`, `CreatorDesignService`, `CreatorService` — hapus tiga salinan `generateSlug`. Beri docblock: *"Menghasilkan slug unik dari teks; menambah sufiks -1, -2, … bila slug sudah dipakai model terkait."* (§6.2)
- [ ] **3.2** 🟠 ⏱S — Angkat `applySort` ke trait bersama (mis. `app/Repositories/Concerns/SortsListings.php`) dengan kolom harga sebagai parameter; pakai di `ProductRepository` dan `DesignRepository`. (§6.3)

### 3b. Frontend — lapisan bersama

- [ ] **3.3** 🟠 ⏱S — Buat `lib/query.ts` berisi satu `buildQuery(params)` yang menangani nilai skalar dan array (`key[]`). Pakai di `catalog.ts`, `marketplace.ts` (2 tempat), `admin.ts` (3 tempat); hapus dua salinan `appendArrayParam`. (§6.4, §6.5)
- [ ] **3.4** 🟠 ⏱XS — Pindahkan `interface Paginated<T>` ke `types/api.ts`, impor dari 3 service. (§6.6)
- [ ] **3.5** 🟠 ⏱XS — Ekspor `API_URL` dari `lib/api.ts`; pakai di `lib/storage.ts` dan `services/admin.ts:96`. (§6.7)
- [ ] **3.6** 🟠 ⏱S — Tambah `getErrorMessage(err, fallback)` di `lib/api.ts`; ganti 13 kemunculan `err instanceof ApiError ? … : …`. (§6.8)
- [ ] **3.7** 🟠 ⏱XS — Tambah `formatDate()` dan `formatDateTime()` di `lib/format.ts`; ganti 6 pemanggilan `toLocaleDateString("id-ID")` inline. (§6.9)

### 3c. Frontend — dua halaman detail

- [ ] **3.8** 🔴 ⏱L — Ekstrak blok bersama dari `katalog-produk/[slug]` dan `lapak-desain/[slug]` ke `components/product/`:
  - `ProductGallery` — gambar utama + thumbnail + badge Terlaris + tombol wishlist
  - `VariantPicker` — swatch warna + pemilih ukuran
  - `SizeChartTable` — satu sumber data ukuran
  - `TrustBadges` — 3 ikon jaminan
  - `ProductTabs` — tab bar + isi "perawatan"/"pengiriman" yang selama ini disalin
  - `DetailPageSkeleton` dan `DetailNotFound` — terparameter judul + link kembali
  - `RelatedGrid` — menggantikan dua `YouMightLike`, menerima daftar item + judul + href "Lihat Semua"

  Target: kedua halaman turun ke bawah 250 baris. (§6.1, §7.2)

> **✅ CP-3 — "Duplikasi dihapus"**
> **Verifikasi:** `php artisan test` hijau, `pnpm build` hijau, lalu bandingkan `/katalog-produk/[slug]` dan `/lapak-desain/[slug]` di browser — tampilan harus **identik dengan sebelum refactor**. Ini refactor tanpa perubahan perilaku.
> **Commit:** `refactor: extract shared slug/sort/query helpers and product detail components`
> **Konteks untuk sesi baru:** laporan §6 (tabel nomor baris ada di sana), `frontend/components/ui/`, `backend/app/Services/`, `backend/app/Repositories/`.

---

## Batch 4 — Konsistensi UI/UX (🟠)

- [ ] **4.1** 🟠 ⏱S — Tambah token semantik ke `tailwind.config.ts`: `danger`, `success`, `warning`, `info` (+ varian `-fg` untuk teks di atasnya). Pilih nada `warning` yang lolos WCAG AA dengan teks gelap, bukan `text-white` di atas `amber-500`. (§5.4)
- [ ] **4.2** 🟠 ⏱M — Ganti semua warna Tailwind mentah dengan token baru di `Badge.tsx`, `Button.tsx`, `Input.tsx`, `PasswordInput.tsx`, `SiteHeader.tsx`, `CartItemRow.tsx`, kartu rating, dan 8 halaman yang memakai `text-red-500`. (§5.4)
- [ ] **4.3** 🟠 ⏱M — Buat `components/ui/EmptyState.tsx` (ikon + judul + deskripsi + CTA opsional). Pakai di 17 lokasi; tambahkan ke `/admin/pengguna` dan `/admin/pembayaran` yang selama ini tidak punya empty state. Seragamkan kalimat: "Belum ada …" untuk kondisi normal, "Tidak ada … yang cocok" untuk hasil filter kosong. (§5.2)
- [ ] **4.4** 🟠 ⏱M — Buat `components/ui/LoadingState.tsx` + `Skeleton.tsx`. Ganti 21 `<p>Memuat…</p>` dengan skeleton yang menyerupai bentuk kontennya, sehingga halaman internal setara dengan halaman publik. (§5.1)
- [ ] **4.5** 🟠 ⏱M — Buat `components/ui/DataTable.tsx` yang menerima definisi kolom + `isLoading` + `emptyState`. Pakai di 6 halaman tabel admin. (§5.5)
- [ ] **4.6** 🟠 ⏱M — Tambah `components/ui/Pagination.tsx` dan hubungkan ke `meta` yang sudah dikembalikan API pada daftar admin. (§5.6)
- [ ] **4.7** 🟠 ⏱M — Tambah sistem toast (store Zustand + `<Toaster />` di `AppProviders`). Ganti pesan error inline, dan tambahkan konfirmasi sukses untuk aksi yang selama ini senyap (tambah ke keranjang, simpan alamat, approve/reject). (§5.3)
- [ ] **4.8** 🟠 ⏱S — Tambah `app/error.tsx` global dan `error.tsx` per route group. (§5.3)

> **✅ CP-4 — "UI konsisten"**
> **Verifikasi:** `pnpm build` hijau; telusuri satu halaman per role dalam kondisi loading, kosong, dan error; cek kontras Badge `warning` dengan pengecek kontras.
> **Commit:** `feat(ui): semantic color tokens, shared empty/loading/table/pagination/toast components`
> **Konteks untuk sesi baru:** laporan §5, `frontend/tailwind.config.ts`, `frontend/components/ui/`.

---

## Batch 5 — Menutup gap fitur (🔴/🟠)

> **5.1 perlu keputusan Anda dulu** — lihat K-2 di bawah.

- [ ] **5.1** 🔴 ⏱XL — **Bulk Order** (FE-052/FE-056, FR-040/FR-044, BR-012/BR-026):
  - Backend: `POST /checkout/bulk`, `BulkCheckoutRequest`, `CheckoutService::checkoutBulk()` yang menulis `orders.type = 'bulk'`.
  - Backend: **hentikan penerapan harga bulk otomatis di checkout reguler** — sekarang keranjang campuran ikut mendapat harga bulk, melanggar BR-026. (§4.1)
  - Frontend: halaman `/bulk-order/{productSlug}` dengan input kuantitas per ukuran (FE-056) dan pratinjau harga bertingkat langsung.
  - Frontend: halaman `/checkout/bulk` terpisah dari checkout reguler.
  - Test: kasus BR-026 (bulk dan reguler tidak boleh tercampur) dan BR-012 (harga dari total kuantitas, bukan per ukuran).
- [ ] **5.2** 🟠 ⏱M — Halaman notifikasi admin di `/admin/notifikasi` (menyelesaikan butir 2.2 secara benar), atau putuskan resmi bahwa admin tidak punya inbox dan catat di Sitemap. (§4.3)
- [ ] **5.3** 🟠 ⏱M — Halaman `/admin/audit-log` yang memakai `GET /admin/audit-logs` — endpoint dan tipe frontend sudah ada, halamannya belum. (§3.1)
- [ ] **5.4** 🟠 ⏱M — Endpoint `GET /catalog/products/{slug}/reviews` + `GET /marketplace/designs/{slug}/reviews` dan render daftarnya, sehingga kalimat "akan tampil di sini setelah fitur listing ulasan tersedia" bisa dihapus dari layar pengguna. (§4.7)
- [ ] **5.5** 🟠 ⏱S — Tambah `export const metadata` (atau `generateMetadata` untuk route dinamis) di setiap halaman publik demi SEO dasar. (§4.8)
- [ ] **5.6** 🟠 ⏱S — Putuskan nasib halaman `/chat`: buat halaman penuh, atau catat di Sitemap bahwa `ChatWidget` menggantikannya. (§4.6)

> **✅ CP-5 — "Gap fitur tertutup"**
> **Verifikasi:** `php artisan test` hijau termasuk test BR-026 yang baru; telusuri alur Bulk Order dari halaman produk sampai order tercipta dengan `type = 'bulk'`.
> **Commit:** `feat(order): separate bulk order flow per BR-026, add audit log and review listing pages`
> **Konteks untuk sesi baru:** laporan §4.1, `backend/app/Services/CheckoutService.php`, `backend/app/Services/PricingService.php`, `1.2_Requirement_Gathering.md` (BR-012, BR-026).

---

## Batch 6 — Modularitas & keterbacaan (🟠)

- [ ] **6.1** 🟠 ⏱M — Isi `frontend/hooks/`: `useProducts`, `useDesigns`, `useCart`, `useOrders`, `useNotifications`, `useWishlist`. Pusatkan key SWR di `lib/swr-keys.ts` supaya `mutate()` tidak lagi bergantung pada string yang diketik manual. (§7.3)
- [ ] **6.2** 🟠 ⏱M — Pecah `components/layout/SiteHeader.tsx` (418 baris) menjadi `HeaderNav`, `CartPopover`, `NotificationPopover`, `HeaderSearch`. (§7.2)
- [ ] **6.3** 🟠 ⏱M — Pecah `app/(public)/page.tsx` (535 baris) menjadi komponen per section di `components/home/`. (§7.2)
- [ ] **6.4** 🟠 ⏱M — Pecah `app/(public)/lapak-desain/page.tsx`: pindahkan `DesainTab` dan `CreatorTab` ke file masing-masing. (§7.2)
- [ ] **6.5** 🟠 ⏱M — Pecah `app/(admin)/admin/katalog/page.tsx`: pisahkan `ProductForm` dan `VariantForm` dari daftar. (§7.2)
- [ ] **6.6** 🟠 ⏱M — Tambah docblock satu-dua kalimat di setiap komponen `components/ui/` dan setiap fungsi `services/`, meniru gaya backend: jelaskan *tujuan* dan *aturan yang berlaku*, bukan mengulang isi kode. Contoh yang sudah bagus: `lib/format.ts`. (§7.4)
- [ ] **6.7** 🟡 ⏱S — Hubungkan size chart ke data produk, atau beri label eksplisit sebagai panduan umum agar tidak menyesatkan. (§5.7)

> **✅ CP-6 — "Kode modular"**
> **Verifikasi:** `pnpm build` hijau; tidak ada file di `app/` atau `components/` yang melebihi ±300 baris.
> **Commit:** `refactor(frontend): domain hooks, component decomposition, and component docblocks`
> **Konteks untuk sesi baru:** laporan §7.

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
