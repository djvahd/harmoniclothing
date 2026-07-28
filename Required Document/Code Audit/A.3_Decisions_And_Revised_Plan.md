# A.3 Keputusan & Urutan Kerja Revisi — Harmoni Clothing

**Tanggal keputusan:** 2026-07-29
**Sumber:** [A.1_Audit_Report.md](A.1_Audit_Report.md) · [A.2_Fix_Checklist.md](A.2_Fix_Checklist.md)
**Status:** menggantikan bagian "Keputusan yang dibutuhkan dari Anda" dan "Ringkasan usaha" di A.2. Isi batch di A.2 tetap berlaku; yang berubah adalah **urutan** dan **tiga batch baru**.

---

## 1. Keputusan yang sudah diambil

| # | Keputusan | Konsekuensi |
|---|---|---|
| **K-1** | **URL diubah ke Bahasa Inggris**, mengikuti `2.1_Sitemap.md` §8. | 39 route direname. ±22 baris Sitemap otomatis cocok; ±9 baris tetap diperbarui karena bedanya struktural, bukan bahasa (lihat §2). |
| **K-2** | **Bangun alur Bulk Order terpisah** sesuai BR-026. | `POST /checkout/bulk` + halaman `/bulk-order/{slug}` + `/checkout/bulk`. **Dan** hentikan penerapan harga bulk otomatis di checkout reguler — perilaku sekarang membuat item reguler ikut dapat harga bulk pada keranjang campuran. |
| **K-3** | **Resmikan middleware + scoping** sebagai pola otorisasi; Policies tidak dibuat. | Hanya dokumen yang berubah: `3.4_Folder_Structure.md` dan `2.5_Permission_Matrix.md` §7 menyebut middleware `admin` / `creator.active` + scoping di controller, bukan `app/Policies/`. Kode tidak disentuh. |
| **K-4** | **i18n dikerjakan sekarang**, bukan ditunda ke Fase 2. | FR-034 / NFR-008 / FE-051 keluar dari daftar gap. Dipecah jadi dua tahap agar tidak menyentuh file yang sama dua kali (lihat §3). |

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

**Peta rename lengkap** ada di laporan [A.1 §2.1](A.1_Audit_Report.md). Yang ikut berubah selain nama direktori: seluruh `href` internal, `router.push` (4 tempat), konfigurasi `AccountSidebar` / `CreatorSidebar` / `AdminSidebar`, dan redirect di `AdminGuard`.

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

- [ ] **2b.1** ⏱M — Rename 39 direktori route sesuai peta di [A.1 §2.1](A.1_Audit_Report.md), dengan penyesuaian struktural §2 di atas (`/account/profile`, `/account/orders`, `/account/wishlist`, `/customize/{slug}`, `/creator/designs/{id}`).
- [ ] **2b.2** ⏱S — Perbarui seluruh `href` internal (13 href unik terdeteksi saat audit) dan `router.push` di `katalog-produk/[slug]`, `lapak-desain/[slug]`, `checkout`, `AdminGuard`.
- [ ] **2b.3** ⏱S — Perbarui konfigurasi `AccountSidebar`, `CreatorSidebar`, `AdminSidebar`, dan menu di `SiteHeader` / `MobileDrawer`.
- [ ] **2b.4** ⏱XS — Perbaiki link rusak `/admin/notifikasi` sekalian di sini kalau butir 2.2 belum menyelesaikannya.
- [ ] **2b.5** ⏱S — Telusuri ulang seluruh `href` setelah rename; pastikan tidak ada yang menunjuk ke route lama.

> **✅ CP-2b — "URL Inggris"**
> **Verifikasi:** `pnpm build` hijau; klik setiap item di ketiga sidebar dan seluruh menu header — tidak boleh ada 404. Bandingkan daftar `href` hasil grep dengan daftar direktori route.
> **Commit:** `refactor(routes): rename all routes to English per Sitemap 2.1 §8`

---

## 6. Batch 2c — i18n Tahap A: infrastruktur (baru)

- [ ] **2c.1** ⏱S — Pasang library i18n untuk App Router (`next-intl` direkomendasikan — dukungan Server Component matang). Catat pilihannya di `3.1_Technology_Stack.md`.
- [ ] **2c.2** ⏱S — Buat `providers/I18nProvider.tsx` dan pasang di `app/layout.tsx`; `frontend/providers/` selama ini hanya berisi `AppProviders.tsx`.
- [ ] **2c.3** ⏱S — Buat `locales/id.json` dan `locales/en.json` dengan struktur namespace per modul (`common`, `catalog`, `marketplace`, `cart`, `checkout`, `order`, `creator`, `admin`, `auth`). Isi awal: namespace `common` saja (tombol, label loading, empty state, pesan error) — sisanya menyusul di Tahap B.
- [ ] **2c.4** ⏱S — Buat komponen `LanguageSwitcher` dan pasang di `SiteHeader` + `Footer`; simpan pilihan bahasa di cookie agar bertahan lintas sesi.
- [ ] **2c.5** ⏱S — Sambungkan bahasa aktif ke parameter `?lang=` yang **sudah didukung backend** (`ResolvesLocale`, kolom `name_id` / `name_en`) — teruskan dari `lib/api.ts` supaya nama & deskripsi produk ikut berganti bahasa. Ini bagian yang selama ini terbangun di backend tapi tidak pernah dipakai frontend.
- [ ] **2c.6** ⏱XS — Perbarui `app/layout.tsx`: atribut `<html lang>` mengikuti bahasa aktif, bukan `"id"` mati.

> **✅ CP-2c — "i18n siap"**
> **Verifikasi:** ganti bahasa lewat switcher → label `common` berubah, nama produk dari API ikut berubah (bukti `?lang=` tersambung), pilihan bertahan setelah reload.
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
