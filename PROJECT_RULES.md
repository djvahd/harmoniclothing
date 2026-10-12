# Harmoni Clothing — Aturan Projek & Kekurangan yang Diketahui

Dokumen ini merangkum **apa yang benar-benar berlaku di kode** (bukan sekadar rencana).
Sumber kebenaran rinci tetap di `Required Document/` — terutama `Phase 1 - Product Discovery.md`, bagian 1.2 sub-bagian 6 (BR-001–028).
Terakhir diperbarui: 2026-10-13.

---

## 1. Aturan bisnis

### 1.1 Pesanan & pembayaran

| Aturan | Perilaku di kode | Lokasi |
|---|---|---|
| **BR-003** | Pesanan masuk antrian produksi (`menunggu_approval`) hanya setelah Midtrans mengonfirmasi bayar. Status dibaca ulang server-ke-server dari Midtrans, bukan dipercaya dari body webhook. | `MidtransWebhookService`, `MidtransService` |
| **BR-009** | Tidak ada minimum order; 1 pcs tetap dilayani. | — |
| **BR-010** | Customer hanya bisa membatalkan saat `menunggu_approval`. Setelah produksi dimulai tidak bisa. | `OrderService::cancel` |
| **BR-017** | `belum_dibayar` > **24 jam** → otomatis `dibatalkan` (job per jam). | `orders:cancel-unpaid`, `config/business.php` |
| **BR-014** | Biteship "Delivered" → `menunggu_konfirmasi`. Customer bisa konfirmasi manual; bila tidak, otomatis `selesai` setelah **3 hari kerja** (Senin–Jumat). | `orders:auto-complete-deliveries`, `OrderService::confirmReceived` |
| **BR-018 / BR-022** | Batal/refund per-order (seluruh order), tidak per-item, tanpa pembayaran sebagian/DP. Bulk Order: semua atau tidak sama sekali. | `OrderService` |
| **BR-025** | Harga item dikunci saat masuk keranjang (`unit_price_snapshot`); perubahan harga admin tidak mengubah item yang sudah di keranjang. Reorder memakai harga terkini. | `CartService`, `OrderService::reorder` |
| **BR-026** | Bulk Order dan item reguler **tidak boleh** digabung: `POST /checkout` (harga per item) vs `POST /checkout/bulk` (tier harga). | `CheckoutService` |
| **BR-012** | Harga Bulk bertingkat berdasarkan **total kuantitas** semua ukuran dalam satu order (bukan per varian). Tidak ada tier yang cocok → ditolak. | `PricingService::bulkUnitPriceFor` |
| **BR-006 / BR-015** | Refund diproses **manual** oleh admin (belum ada otomatisasi). | — |
| **BR-011 / BR-016** | Produksi ulang gratis bila salah produksi; komplain kualitas 7 hari setelah `selesai`, via Chat, ditangani manual. | proses manual |
| Ongkir | Harga ongkir selalu dihitung ulang dari Biteship di server berdasar kurir pilihan customer; tidak dipercaya dari request. Berat tetap 250 g/item (`BITESHIP_ITEM_WEIGHT_GRAMS`). | `CheckoutService::resolveShippingCost` |
| Pengiriman | Admin memesan kurir hanya saat `diproses_produksi`; default memakai kurir pilihan customer. Status `dikirim` hanya digerakkan webhook Biteship. | `OrderService::bookShipment` |

Alur status: `belum_dibayar → menunggu_approval → diproses_produksi → dikirim → menunggu_konfirmasi → selesai`; cabang `dibatalkan` dan `ditolak`.

### 1.2 Creator & komisi

| Aturan | Perilaku di kode |
|---|---|
| **BR-001 / 002 / 008** | Creator wajib KYC + approval admin sebelum upload; setiap desain wajib approval admin sebelum tayang. |
| **BR-013** | Creator = upgrade dari akun Customer (satu email, satu akun), bukan registrasi terpisah. |
| **BR-028** | Desain `ditolak` direvisi sebagai entri yang sama dan kembali ke `menunggu_approval`. |
| **BR-005** | Desain Creator hanya bisa dipakai lewat pemesanan cetak, tidak dijual sebagai file digital. |
| **BR-007** | Komisi dibuat otomatis saat order dibayar: **20 %** dari subtotal item (`CREATOR_COMMISSION_RATE`, *placeholder*). Pencairan **otomatis mingguan** bila total terhutang ≥ **Rp 50.000** (`CREATOR_PAYOUT_MINIMUM`, *placeholder*) dan Creator punya rekening tujuan. Komisi baru ditandai `dibayar` setelah transfer benar-benar terkonfirmasi. |
| **BR-019 / 020 / 023** | Creator di-ban → desain ditarik dari marketplace; order yang sudah checkout tetap diproduksi. Komisi tetap dibayar, **kecuali** ban karena pelanggaran hak cipta (semua komisi ditahan, akun Customer ikut disuspend). |
| **BR-021** | Dispute plagiarisme tidak punya UI khusus; ditangani manual admin. |

### 1.3 Lain-lain

- **BR-004**: rating/review hanya setelah `selesai`.
- **BR-024**: item Wishlist yang tak tersedia tetap tampil dengan badge "Tidak Tersedia", tidak bisa di-checkout.
- **BR-027**: notifikasi hanya in-app (tanpa email/SMS), real-time via WebSocket.
- **Angka aturan bisnis** (24 jam, 3 hari kerja, komisi, minimum payout) ada di satu file: `backend/config/business.php`.

---

## 2. Aturan teknis & proses

**Arsitektur**
- Backend berlapis: Controller → Service → Repository; validasi lewat Form Request; tidak ada logika bisnis di Controller.
- Otorisasi: middleware `admin` / `creator.active` + *scoping* query (`$user->relation()->findOrFail($id)` → 404, bukan 403). Policy class tidak dipakai (keputusan K-3).
- Status pesanan diubah di dalam `DB::transaction` + `lockForUpdate()` (anti race condition).
- Tidak ada harga/formula hardcoded di luar `PricingService`; teks UI lewat `locales/id.json` & `en.json` (next-intl, cookie `NEXT_LOCALE`).
- URL berbahasa Inggris (Sitemap §8).

**Migration & dokumen**
- Migration yang sudah di-commit **tidak boleh diedit** — perubahan lewat migration baru.
- Ubah skema → perbarui ERD (4.2) & Table Design (4.3). Ubah endpoint → perbarui API List (5.2) & Spesifikasi (5.3). Catat di Change Log dengan tanggal & alasan.

**Kode**
- PHP: PSR-12. Frontend: ESLint + Prettier, TypeScript `strict`.
- Penamaan: komponen React `PascalCase`; fungsi/variabel `camelCase`; kolom DB `snake_case`; endpoint `kebab-case` jamak.
- Responsif: Tailwind default (`md:` 768, `lg:` 1024). Publik & Customer mobile-first; Creator & Admin desktop-first tapi tetap fungsional di mobile.

**Git**
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`), satu commit per topik. Cabang `feature/<modul>-<deskripsi>` / `fix/<deskripsi>`.

**Keamanan (hasil audit OWASP ASVS, semua temuan sudah ditutup)**
- Sesi Sanctum cookie httpOnly; tidak ada token di localStorage; tidak ada `dangerouslySetInnerHTML`.
- Webhook Biteship wajib `?token=` yang cocok (fail-closed); webhook Midtrans diverifikasi signature + re-fetch status.
- Upload SVG disanitasi (`enshrined/svg-sanitize`). Cookie `secure` otomatis di production.
- Secret tidak boleh masuk repo; `.env.production` frontend hanya berisi nilai publik.

**Pengujian**
- Backend: `php artisan test` (232 tes, SQLite; kredensial Midtrans/Biteship/AWS dikosongkan di `phpunit.xml` agar tes tidak memanggil layanan asli).
- Frontend: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`.

---

## 3. Kekurangan website saat ini

### 3.1 Blocker sebelum "siap jual"
1. **Backend masih jalan di laptop** (tunnel Cloudflare). Laptop mati/sleep = seluruh API 502. Harus pindah ke VPS (Hostinger KVM) — lihat `DEPLOYMENT.md`.
2. **Midtrans & Biteship masih Sandbox.** Butuh kredensial Production (Midtrans: verifikasi bisnis).
3. **Nomor WhatsApp & email kontak** masih placeholder (`frontend/lib/contact.ts`) — akan diisi pemilik.
4. **Pencairan komisi belum benar-benar mengirim uang**: `PayoutService::disburse()` masih stub (belum ada provider seperti Midtrans Iris/Xendit). Komisi menumpuk `terhutang` dan tak pernah `dibayar`.
5. **Persentase komisi (20 %) & minimum payout (Rp 50.000) adalah placeholder** — belum ada keputusan bisnis.
6. **Belum ada QC menyeluruh** (`Required Document/QC_Manual_Testing_Checklist.xlsx`) dan belum ada uji beban.

### 3.2 Fitur belum lengkap
7. **Editor desain 3D ditunda ke v1.1** — `/customize` masih form 2D sederhana. Keputusan sadar, bukan bug.
8. **Tier harga Bulk tidak bisa diubah/dihapus** — API hanya menyediakan tambah (POST); salah input tier harus diperbaiki langsung di database atau dengan menambah endpoint. Tidak ada validasi tumpang-tindih rentang qty. (UI Ban Creator, edit produk, tambah tier, dan edit alamat sudah dibuat 2026-10-13.)
9. **Refund, produksi ulang, dan komplain 100 % manual** (BR-006/011/016) — tidak ada alur di sistem.
10. **Notifikasi hanya in-app** — tanpa email/SMS/WhatsApp untuk status pesanan (BR-027, Fase 2). Admin tidak punya inbox notifikasi (K-5).
11. **Berat pengiriman flat 250 g/item** — ongkir bisa meleset. Tidak ada berat per varian.
12. **Tidak ada stok bahan**: pesanan tidak mengecek ketersediaan (hanya `is_active` produk).
13. **Hanya satu gudang asal** (Magelang).
14. **Checkout gagal bila API Biteship down** (tidak ada ongkir cadangan).

### 3.3 Teknis & kualitas
15. **i18n belum 100 %** — Batch 6b (ekstraksi massal string + lint anti-teks-mentah) belum selesai. Pesan notifikasi backend (`CancelUnpaidOrders`, `AutoCompleteDeliveredOrders`, `OrderService::reject`, dll.) **masih hardcoded Bahasa Indonesia**, tidak mengikuti locale user.
16. **Rute publik tidak konsisten bahasa**: `/kontak` dan `/pusat-bantuan` berbahasa Indonesia, rute lain Inggris (`/faq`, `/about`, `/legal/*`).
17. **Dokumen perencanaan sudah disinkronkan dengan kode pada 2026-10-13** (Sitemap, API List, Table Design). Sisa selisih yang disengaja: tabel bawaan Laravel (`jobs`, `sessions`, `cache`, dst.) tidak dicatat di Table Design. Setiap perubahan rute/endpoint/kolom berikutnya wajib memperbarui dokumennya (kebijakan Documentation Sync).
18. **Tidak ada queue worker**: broadcast memakai `ShouldBroadcastNow`; email dikirim sinkron lewat HTTP Resend sehingga request melambat bila Resend lambat.
19. **Realtime dua jalur**: dev memakai Laravel Reverb, demo memakai Pusher Channels. Pilih satu saat pindah ke VPS.
20. **Tidak ada tes frontend** (hanya type-check + lint). Tes backend luas (232) tetapi integrasi Midtrans/Biteship hanya diuji dengan `Http::fake`.
21. **Tidak ada monitoring/alerting** (Sentry, UptimeRobot) dan backup database terjadwal.
22. **`docker-compose.yml` hanya untuk dev**, belum pernah diuji di mesin ini, dan memakai `php:8.3` sementara Dockerfile produksi memakai PHP 8.4.
23. **Local dev**: MySQL kini Laragon (XAMPP sudah ditinggalkan) dan dinyalakan oleh `start-demo.bat` / `dev.ps1`; bila MySQL mati, backend *hang* (bukan error).
24. **SEO dasar sudah ada** (sitemap, robots, Open Graph) tetapi belum ada structured data produk dan gambar OG per halaman.

> Hal yang sengaja ditunda pemilik (3D editor, pembayaran DP, multi-vendor, notifikasi email/SMS) hanya ditulis bila relevan di atas.
