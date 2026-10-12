# Phase 1 — Product Discovery: Indeks Dokumen

**Proyek:** Harmoni Clothing Website

Dokumen ini adalah peta navigasi untuk 7 dokumen Phase 1. Gunakan ini untuk menemukan "informasi X ada di dokumen mana" tanpa perlu membuka semua file satu per satu.

---

## Daftar Dokumen

| # | Dokumen | File | Isi Singkat |
|---|---|---|---|
| 1.1 | Project Brief | Bagian 1.1 | Definisi produk menyeluruh: masalah, solusi, target user, scope, KPI, risiko. Ini adalah **Dokumen akar**, artinya semua dokumen lain merujuk ke sini. |
| 1.2 | Requirement Gathering | Bagian 1.2 | Kebutuhan sistem rinci: Functional Requirements (FR), Business Rules (BR), Non-Functional Requirements (NFR), user stories, acceptance criteria. |
| 1.3 | User Persona | Bagian 1.3 | 3 persona (Rangga/Customer, Nadia/Creator, Pak Budi/Admin) berisi goals, pain points, journey masing-masing + catatan journey singkat Guest. |
| 1.4 | Competitor Research | Bagian 1.4 | Riset 5 direct competitor (Printful, Printify, Redbubble, Threadless, Tees.co.id) + 3 indirect untuk gap analysis & diferensiasi. |
| 1.5 | Feature List | Bagian 1.5 | **Single source of truth** untuk seluruh 57 fitur (FE-ID), lengkap dengan priority, complexity, value, dependency, technical notes, risks. |
| 1.6 | MVP Definition | Bagian 1.6 | Konfirmasi scope v1.0 (semua 57 fitur, satu rilis), success criteria, launch checklist. |
| 1.7 | Product Roadmap | Bagian 1.7 | Timeline pengembangan 1 bulan, urutan modul, milestone, resource planning. |

---

## Dokumen Terkait

[[Phase 1 - Product Discovery#1.1 Project Brief — Harmoni Clothing|1.1 Project Brief]], [[Phase 1 - Product Discovery#1.2 Requirement Gathering — Harmoni Clothing|1.2 Requirement Gathering]], [[Phase 1 - Product Discovery#1.3 User Persona — Harmoni Clothing|1.3 User Persona]], [[Phase 1 - Product Discovery#1.4 Competitor Research — Harmoni Clothing|1.4 Competitor Research]], [[Phase 1 - Product Discovery#1.5 Feature List — Harmoni Clothing|1.5 Feature List]], [[Phase 1 - Product Discovery#1.6 MVP Definition — Harmoni Clothing|1.6 MVP Definition]], [[Phase 1 - Product Discovery#1.7 Product Roadmap — Harmoni Clothing|1.7 Product Roadmap]]

---

---

# 1.1 Project Brief — Harmoni Clothing

**Output :** Bagian 1.1
**Tujuan :** Mendefinisikan produk secara menyeluruh sebelum masuk ke tahap analisis dan desain.
**Referensi :** Dokumen akar — tidak merujuk dokumen lain.
**Digunakan Oleh :** [[Phase 1 - Product Discovery#1.2 Requirement Gathering — Harmoni Clothing|1.2 Requirement Gathering]], [[Phase 1 - Product Discovery#1.3 User Persona — Harmoni Clothing|1.3 User Persona]], [[Phase 1 - Product Discovery#1.4 Competitor Research — Harmoni Clothing|1.4 Competitor Research]], [[Phase 1 - Product Discovery#1.5 Feature List — Harmoni Clothing|1.5 Feature List]], [[Phase 1 - Product Discovery#1.6 MVP Definition — Harmoni Clothing|1.6 MVP Definition]], [[Phase 1 - Product Discovery#1.7 Product Roadmap — Harmoni Clothing|1.7 Product Roadmap]]
**Roadmap :** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

## 1. Informasi Proyek

| Item | Isi |
|---|---|
| Nama Project | Harmoni Clothing Website (Custom Apparel & Design Marketplace Platform) |
| Nama Produk | Harmoni Clothing Website |
| Versi | 1.0 (MVP) |
| Tanggal dibuat | 07 Juli 2026 |
| Status | Planning |
| Product Owner | Anda |
| Project Manager | Anda (dibantu Claude sebagai PM / System Analyst / UI-UX Architect / Full Stack Developer) |
| Tim | 1 orang (solo founder) + AI assistant |

---

## 2. Executive Summary

Harmoni Clothing adalah platform **print-on-demand, design marketplace, dan fulfillment** yang mempertemukan customer, creator/desainer, dan proses produksi dalam satu ekosistem digital. Customer dapat memesan apparel dengan desain sendiri (upload/custom) atau memilih desain dari creator, lengkap dengan preview 3D interaktif sebelum checkout. Creator dapat mengunggah desain, membangun portofolio, dan memperoleh penghasilan dari setiap desain yang terjual. Harmoni Clothing menggantikan proses pemesanan manual via WhatsApp/Instagram dengan sistem yang terstruktur, transparan, dan mudah dipantau dari pemesanan hingga pengiriman.

---

## 3. Background

Proses pemesanan custom apparel saat ini mulai dari konsultasi, pencatatan pesanan, revisi desain, perhitungan harga, hingga pemantauan produksi masih dilakukan manual dan tersebar di berbagai channel (WhatsApp, Instagram, dll). Ini membuat proses lambat, rawan kesalahan pencatatan, dan sulit dipantau baik oleh customer maupun pihak konveksi. Di sisi lain, layanan print on demand yang terstruktur juga masih sulit dijangkau oleh pasar lokal, dan platform yang menggabungkan marketplace desain dengan proses pemesanan custom secara end-to-end (dari pemilihan/upload desain, produksi, hingga pengiriman) masih jarang ditemukan di Indonesia.

---

## 4. Problem Statement

- Pemesanan tersebar di banyak channel (chat, DM), sulit dilacak.
- Tidak ada visibilitas status produksi dan pengiriman secara real-time.
- Perhitungan harga masih dilakukan manual, rawan kesalahan dan miskomunikasi.
- Revisi desain masih dikomunikasikan lewat chat, mudah terlewat atau tidak tercatat dengan jelas.
- Customer kesulitan memvisualisasikan hasil akhir produk sebelum membayar.
- Creator/desainer independen belum punya wadah untuk menjual desain dan memperoleh penghasilan dari situ.
- Layanan print on demand yang terstruktur dan mudah diakses masih terbatas di pasar lokal.
- Belum banyak platform yang menyatukan marketplace desain dengan proses pemesanan custom secara end-to-end (desain → produksi → pengiriman) dalam satu sistem.
- Pemesanan dalam jumlah besar (komunitas, kelas, event) masih dilakukan manual dengan negosiasi harga per kuantitas yang tidak konsisten.

---

## 5. Solution

- Platform terintegrasi: marketplace desain + custom editor + fulfillment tracking dalam satu sistem.
- Perhitungan Harga Otomatis, harga dihitung sistem secara real-time.
- Kolom catatan pemesanan, customer dapat menuliskan permintaan revisi/khusus langsung saat checkout.
- Interactive 3D Product Editor untuk kustomisasi & preview produk.
- Order & production tracking otomatis (status real-time, resi otomatis via Biteship).
- Wadah bagi creator: upload desain, dashboard statistik, komisi penjualan.
- Payment terintegrasi (Midtrans) dan pengiriman terintegrasi (Biteship) mendukung kelancaran transaksi end-to-end.
- Pesanan Grup/Massal (Bulk Order), harga per-unit otomatis menyesuaikan kuantitas.

---

## 6. Goals

**Business Goal**
- Meningkatkan jumlah transaksi & omzet.
- Efisiensi operasional lewat digitalisasi pemesanan & manajemen produksi.

**User Goal (Customer)**
- Pemesanan custom apparel yang mudah, cepat, transparan, terorganisir.
- Tracking status pesanan & riwayat transaksi yang jelas.

**Creator Goal**
- Mudah mengunggah & menawarkan desain.
- Membangun portofolio dan memperoleh penghasilan dari desain.

---

## 7. Success Metrics (KPI)

| Metrik | Bulan 1 | Bulan 3 |
|---|---|---|
| Customer terdaftar | 40–70 | 250–400 |
| Creator terdaftar | 10–15 | 30–50 |
| Creator aktif upload desain | 25% dari terdaftar | 35% dari terdaftar |
| Transaksi | 25–40 | 150–250 (kumulatif) |
| Bulk Order (% dari total transaksi) | 5–10% | 10–20% |
| Conversion rate (visitor→checkout) | 0.8–1.5% | 2–4% |
| Repeat order rate | – | ≥15% |
| Lead time produksi (order reguler → kirim) | ≤7 hari kerja | ≤5 hari kerja |
| Lead time produksi (Bulk Order → kirim) | ≤14 hari kerja | ≤10 hari kerja |
| Rating rata-rata produk | ≥4.0/5 | ≥4.3/5 |

> Catatan: custom apparel adalah *considered purchase* (bukan impulse buy), jadi conversion rate wajar lebih rendah dari e-commerce fashion umum, jangan dibandingkan dengan benchmark toko baju biasa.

---

## 8. Target Users

**Customer** : Gen Z & Milenial, komunitas, mahasiswa, UMKM, perusahaan kecil (kebutuhan: merch komunitas/event, hadiah).

**Creator/Designer** : Desainer freelance, ilustrator, mahasiswa desain, content creator.

**Admin** : Pemilik & tim operasional Harmoni Clothing (produksi internal).

**Guest** : Calon customer yang belum login/register, browsing marketplace desain & Katalog Produk.

---

## 9. Scope

### In Scope (MVP)

- **Authentication & User Management** : Registrasi, login, kelola profil, KYC Creator.
- **Marketplace & Product Catalog** : Browsing & pencarian desain/produk, profil Creator, katalog blank product.
- **Product Customization (3D Editor)** : Kustomisasi produk lewat 3D Product Editor (mode custom & marketplace), termasuk Detail Produk & Desain.
- **Order Management** : Keranjang, checkout, perhitungan harga otomatis, Bulk Order, pembatalan pesanan, riwayat & reorder, wishlist.
- **Payment** : Payment Gateway (Midtrans), invoice otomatis.
- **Shipping** : Integrasi Biteship, auto tracking resi, tracking produksi & pengiriman.
- **Notification** : Notifikasi real-time & konfigurasi jenis notifikasi.
- **Review & Rating** : Rating & ulasan setelah pesanan selesai.
- **Communication** : Chat Customer–Admin, chat management terpusat.
- **Creator Management** : Dashboard, upload & kelola desain multi-apparel, statistik & komisi.
- **Admin Dashboard** : User/Creator management, approval, order & production management, sales report.
- **Analytics** : Sales report & statistik operasional dasar.
- **Localization** : Bahasa Indonesia & Inggris.

*Rincian lengkap 57 fitur per modul: lihat Bagian 1.5*

### Out of Scope (Fase 2)

- **Creator** : Payout otomatis, riwayat pencairan komisi otomatis, penjualan desain sebagai file digital terpisah (desain hanya dapat digunakan lewat alur pemesanan cetak).
- **Order & Payment** : Refund/pengembalian dana otomatis (ditangani manual oleh Admin di luar sistem), pembayaran sebagian/DP (Down Payment), semua order wajib lunas di muka, pembatalan/refund sebagian item dari satu order (MVP hanya mendukung pembatalan/refund per-order penuh), faktur pajak resmi/NPWP (invoice MVP cukup sebagai bukti transaksi biasa, bukan dokumen pajak).
- **Authentication** : Social login (Google OAuth, dll) — MVP cukup autentikasi email/password.
- **Product Customization** : 3D Editor dengan simulasi fisika kain/"True 3D" (MVP menggunakan pendekatan 3D Ringan — model statis + decal, tanpa simulasi lipatan/jatuhnya kain).
- **Business Intelligence** : Advanced Analytics (AOV, CLV, Cohort Analysis, Funnel, Profit Analysis, dll).
- **Marketing** : Voucher, Promo Engine, Loyalty Point, Membership, Referral Program, Affiliate Program.
- **AI Features** : AI Generate Design, AI Generate Mockup, AI Background Removal, AI Upscale Image, AI Design Recommendation, AI-plagiarism detection.
- **Enterprise Features** : Multi Admin & Role Permission, Multi Store, Multi Warehouse.
- **Mobile** : Aplikasi Android, Aplikasi iOS.
- **Bahasa** : Multi language selain Indonesia & Inggris (misal Mandarin, Arab, dll).
- **Trust & Safety / Personalisasi** : Permintaan hapus akun/data mandiri (dihapus manual via kontak Admin di luar sistem untuk MVP), deklarasi orisinalitas desain formal saat upload, moderasi review oleh Admin, preferensi notifikasi personal per-user (mute/opt-out individual), notifikasi via email/SMS (MVP hanya in-app), watermark/proteksi resolusi preview desain di Marketplace (MVP menampilkan preview resolusi penuh).
---

## 10. Product Vision

> Menjadi platform custom apparel paling praktis dan transparan di Indonesia, menghubungkan customer, creator, dan produksi dalam satu ekosistem yang mudah dipercaya.

---

## 11. Value Proposition

Dibanding **Printful/Printify** (fokus seller/e-commerce, kurang fleksibel untuk custom lokal, komunikasi dengan konveksi terbatas, biaya kirim internasional) dan **Threadless/Redbubble** (fokus jual desain jadi, bukan custom sesuai kebutuhan), Harmoni Clothing menawarkan:

- **Satu ekosistem end-to-end** yang menghubungkan customer, creator, dan produksi tidak perlu berpindah platform atau channel untuk konsultasi, desain, dan tracking.
- **Harga transparan & instan** lewat Perhitungan Harga Otomatis, tanpa perlu nego manual atau menunggu quote dari admin.
- **Wadah penghasilan bagi creator lokal**, dengan komisi yang jelas dan terintegrasi ke dalam harga jual.
- **Mendukung pemesanan kelompok** (kelas, komunitas, event) dengan harga per-unit yang otomatis menyesuaikan kuantitas, belum dilayani baik oleh kompetitor manapun yang diriset (lihat Competitor Research 1.4).
- **Fokus pasar Indonesia** (bahasa, metode pembayaran, ongkir lokal), sekaligus mendukung Bahasa Inggris untuk jangkauan lebih luas.

---

## 12. Main Features

3D Product Editor, Marketplace Desain, Perhitungan Harga Otomatis, Pesanan Grup/Massal (Bulk Order), Order & Production Tracking, Creator Dashboard & Komisi.

---

## 13. User Roles

- **Customer** : pengguna yang memesan produk, baik dengan mengunggah desain sendiri maupun memilih desain dari creator.
- **Creator / Designer** : pengguna yang mengunggah dan menjual desain di marketplace, memperoleh komisi dari setiap penjualan. Creator adalah upgrade dari akun dasar (Customer) setelah melalui KYC & approval Admin.
- **Admin** : mencakup baik pengelola operasional platform maupun tim produksi; keduanya menggunakan akses Admin yang sama tanpa role terpisah.
- **Guest** : pengunjung yang belum login; dapat browsing marketplace desain & katalog produk, tetapi wajib login/register saat akan menambahkan ke keranjang atau checkout langsung.

---

## 14. Assumptions

**Bisnis**
- Pengelolaan platform (website & operasional admin) dilakukan oleh satu orang pada tahap awal, sedangkan proses produksi (konveksi/cetak) ditangani oleh tim tersendiri.
- Seluruh harga & transaksi menggunakan mata uang Rupiah (IDR) — dukungan Bahasa Inggris murni untuk aksesibilitas pembaca (misal WNA di Indonesia), bukan sinyal target pasar internasional; tidak ada dukungan multi-currency di MVP.
- Tidak ada batas kapasitas produksi harian yang diberlakukan sistem — order tetap diterima berapapun volumenya; Admin memantau & mengatur prioritas antrian secara manual dari dashboard (FR-021). Kalau volume order melampaui kapasitas produksi riil secara konsisten, ini jadi keputusan operasional (misal early-stopping penerimaan Bulk Order), bukan batasan teknis di sistem.
- Tim produksi menggunakan akses Admin yang sama untuk memperbarui status produksi secara langsung di platform, tidak menggunakan role terpisah.
- Aset mockup produk untuk setiap kombinasi varian (warna, jenis potongan, dll) disiapkan sendiri oleh pemilik (Product Owner), bukan digenerate otomatis oleh sistem.
- Creator bersedia bergabung dan mengunggah desain ke marketplace.
- Customer lebih memilih proses pemesanan digital dibandingkan chat manual.
- Payment gateway dan layanan logistik pihak ketiga memiliki tingkat ketersediaan (availability) yang baik.

**Pengguna**
- Customer memiliki koneksi internet stabil untuk mengakses editor dan checkout.
- Creator mengunggah desain yang memenuhi standar kualitas cetak serta tidak melanggar hak cipta.
- Pengguna telah terbiasa menggunakan metode pembayaran digital.
- Customer dapat membatalkan pesanan selama pesanan belum masuk antrian produksi; setelah masuk produksi, pesanan tidak dapat dibatalkan.
- Semua pengguna memiliki email aktif.
- Pengguna menggunakan browser modern yang mendukung WebGL (Chrome, Firefox, Safari, Edge terbaru).

---

## 15. Constraints

**Waktu**
- Target peluncuran MVP adalah 1 bulan, sehingga pengembangan diprioritaskan pada fitur inti yang memberikan nilai bisnis terbesar.
- Aset mockup produk (per kombinasi warna & jenis potongan) perlu disiapkan oleh Product Owner secara paralel dengan development Product Editor. Selama aset asli belum lengkap, development dapat menggunakan placeholder (foto/warna sementara) untuk membuktikan sistem berfungsi, namun seluruh aset mockup asli wajib sudah 100% siap sebelum rilis.

**Anggaran**
- Pengembangan dilakukan dengan biaya seminimal mungkin, memanfaatkan layanan gratis (free tier) selama masih memenuhi kebutuhan operasional.

**Teknologi**
- Payment Gateway: Midtrans.
- Pengiriman: Biteship.
- Object Storage: Cloudflare R2.
- Stack development: Laravel + Next.js + MySQL + Redis + Laravel Reverb + Three.js/WebGL.
- Deployment: VPS Linux, dikemas dengan Docker Compose.
- Menggunakan layanan pihak ketiga sehingga sistem bergantung pada API, kuota, dan kebijakan masing-masing penyedia layanan.

---

## 16. Risks

| Risiko | Mitigasi |
|---|---|
| Pelanggaran hak cipta dari desain yang diunggah creator | Moderasi & proses approval desain sebelum tayang, verifikasi identitas (KYC sederhana) Creator sebelum dapat mengunggah desain |
| Ketidaksesuaian hasil cetak dengan ekspektasi pelanggan | Quality control sebelum pengiriman, preview 3D sebagai acuan visual (bukan jaminan 100%) |
| Ketergantungan pada layanan pihak ketiga (Midtrans, Biteship) | Pemantauan integrasi layanan pihak ketiga secara berkala |
| Chargeback/pembatalan pembayaran paksa dari bank setelah order masuk produksi | Di luar kendali sistem (proses dispute ditangani Midtrans-bank), ditangani manual oleh Admin di luar sistem jika terjadi |
| Keterlambatan produksi / inkonsistensi kualitas produk | Penerapan SOP produksi yang jelas, produksi ulang gratis (biaya ditanggung pihak produksi) jika kesalahan terjadi dari sisi produksi |
| Ketidakpatuhan terhadap UU PDP (data pribadi Customer/Creator) | Enkripsi data sensitif, consent Kebijakan Privasi saat registrasi (lihat Requirement Gathering NFR-011/012) |
| Preview desain resolusi penuh tanpa watermark (Fase 2) dapat di-screenshot/download tanpa membeli | Diterima sebagai risiko yang sengaja ditanggung di MVP; watermark/proteksi resolusi jadi prioritas awal Fase 2 jika terbukti jadi masalah nyata |

---

## 17. Timeline (high-level)

```
Planning
   ↓
Design (UI/UX di Figma)
   ↓
Development (Backend + Frontend)
   ↓
Quality Assurance
   ↓
Deployment
```
*Timeline mingguan rinci ada di Bagian 1.7 Bagian 2 & 11.*

---

## 18. Deliverables

**Phase 1 — Product Discovery**: Project Brief, Requirement Document, Persona Document, Competitor Analysis, Master Feature List, MVP Scope, Roadmap Document

**Phase 2 — Information Architecture**: Sitemap, Role Matrix, Flow Diagram, Navigation Tree, Permission Matrix

**Phase 3 — System Architecture**: Tech Stack Document, Architecture Diagram, Module Document, Folder Structure, Coding Guideline

**Phase 4 — Database Design**: Entity List, ERD, Database Schema, Validation Document, Migration Files

**Phase 5 — API & Backend Planning**: Business Rule Document, API List, API Documentation, Auth Flow, Error Standard, Security Checklist

**Phase 6 — UI/UX Design**: Moodboard, Design System, Wireframe, UI Mockup, Prototype, Responsive Design

**Phase 7 — Backend Development**: Backend Project, Database Connected, Auth Module, CRUD APIs, Service Layer, Upload Service, Tested API

**Phase 8 — Frontend Development**: Frontend Project, Base Layout, UI Components, Functional Pages, Connected Application, State Store, Validated Forms, Error UI

**Phase 9 — Quality Assurance**: Unit Test, Integration Test, E2E Test, Stable Version, Optimized Build, Security Report

**Phase 10 — Deployment**: Production Build, Live Website, Secure Website, Monitoring Dashboard, Backup System

**Phase 11 — Maintenance & Improvement**: Bug List, Feature Backlog, Performance Report, Updated Application, Updated Documentation

---

# 1.2 Requirement Gathering — Harmoni Clothing

**Output:** Bagian 1.2
**Tujuan:** Mendokumentasikan seluruh kebutuhan sistem secara rinci.
**Referensi:** [[Phase 1 - Product Discovery#1.1 Project Brief — Harmoni Clothing|1.1 Project Brief]] — dokumen ini tidak boleh bertentangan dengan Project Brief.
**Digunakan Oleh:** [[Phase 1 - Product Discovery#1.3 User Persona — Harmoni Clothing|1.3 User Persona]], [[Phase 1 - Product Discovery#1.5 Feature List — Harmoni Clothing|1.5 Feature List]], [[Phase 2 - Information Architecture#2.1 Sitemap — Harmoni Clothing|2.1 Sitemap]], [[Phase 2 - Information Architecture#2.3 User Flow — Harmoni Clothing|2.3 User Flow]], [[Phase 5 - API & Backend Planning#5.1 Business Rules — Harmoni Clothing|5.1 Business Rules]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

## 1. Pendahuluan

- **Tujuan dokumen**: Mendokumentasikan seluruh kebutuhan fungsional & non-fungsional sistem Harmoni Clothing sebagai acuan development.
- **Ruang lingkup sistem**: Platform web (bukan mobile app) untuk marketplace desain, custom product editor 3D, fulfillment tracking, untuk 4 role (Customer, Creator, Admin, Guest).
- **Definisi istilah**:
  - *Blank Product* : produk polos sebelum ada desain.
  - *Mockup* : aset visual 3D dasar per varian produk (warna, jenis potongan).
  - *Fulfillment* : proses produksi hingga pengiriman.
  - *KYC* : Know Your Customer, verifikasi identitas sederhana.
- **Referensi dokumen**: Project Brief (1.1).

---

## 2. Stakeholder

| Stakeholder | Peran |
|---|---|
| Product Owner (Anda) | Pemilik bisnis, pengambil keputusan produk & prioritas |
| Admin / Tim Produksi | Operasional harian, approval, update status produksi |
| Customer | Pengguna yang memesan produk |
| Creator | Pengguna yang menjual desain |
| Developer (Claude, via Claude Code) | Implementasi teknis |
| Designer (Anda, via Figma) | Desain UI/UX |
| QA | Pengujian fungsional (dilakukan Developer + Product Owner untuk MVP, mengingat tim solo) |

---

## 3. User Roles

*Definisi & deskripsi tiap role: lihat Project Brief (1.1) Bagian 13. Tabel di bawah fokus pada tujuan dan hak akses tingkat sistem yang spesifik untuk Requirement Gathering.*

| Role | Tujuan | Hak Akses Tingkat Tinggi |
|---|---|---|
| **Customer** | Memesan apparel dengan mudah & transparan | CRUD data sendiri (profil, pesanan, wishlist), read publik (marketplace, katalog) |
| **Creator** | Mendapat penghasilan dari desain | CRUD desain milik sendiri, read statistik & komisi sendiri |
| **Admin** | Mengelola operasional end-to-end | Full access ke seluruh data operasional (user, order, produksi, payment, konten) |
| **Guest** | Eksplorasi sebelum daftar | Read-only marketplace desain & katalog produk |

---

## 4. Functional Requirements

**Modul: Authentication & Profil**

| ID | Requirement |
|---|---|
| FR-001 | User dapat registrasi untuk membuat satu akun dasar |
| FR-002 | User dapat login & logout |
| FR-003 | User dapat reset password lewat email |
| FR-004 | User dapat mengelola profil (data diri, foto) |
| FR-048 | Customer dapat menyimpan & mengelola satu atau lebih alamat pengiriman (address book), memilih alamat tersimpan saat checkout tanpa perlu mengetik ulang |
| FR-005 | Guest dapat browsing tanpa login, wajib login/register saat akan menambahkan produk ke keranjang atau checkout langsung — tidak ada keranjang belanja untuk Guest |

**Modul: Marketplace & Katalog**

| ID | Requirement |
|---|---|
| FR-006 | User dapat browsing & search/filter desain di Marketplace |
| FR-007 | User dapat melihat profil publik Creator |
| FR-008 | User dapat browsing Katalog Produk (blank product) |

**Modul: Product Editor**

| ID | Requirement |
|---|---|
| FR-009 | Customer dapat memilih bahan/ukuran/warna/jenis potongan produk secara bebas (jalur Katalog Produk) |
| FR-010 | Customer dapat upload desain sendiri & mengatur posisi/ukuran/rotasi di editor 3D — **➡ Ditunda ke v1.1** (2026-08-01, keputusan user): upload file sudah ada di Product Editor 2D v1.0, tapi atur posisi/ukuran/rotasi (drag, resize, rotate) bagian dari 3D Editor yang ditunda (lihat FE-016, 1.5 §12). |
| FR-011 | Customer dapat memilih desain dari Creator (jalur Marketplace), dengan posisi/rotasi/ukuran desain terkunci |
| FR-012 | Sistem menampilkan preview 3D (Three.js) yang otomatis berganti model sesuai kombinasi warna/jenis potongan — **➡ Ditunda ke v1.1** (2026-08-01, keputusan user): Product Editor v1.0 menampilkan foto mockup yang berganti sesuai warna (2D), bukan model 3D Three.js/WebGL — lihat 1.5 §12. |
| FR-013 | Customer dapat menuliskan catatan pemesanan (revisi/permintaan khusus) |
| FR-014 | Customer melihat halaman Detail Produk & Desain (ringkasan sebelum keranjang) |

**Modul: Order & Payment**

| ID | Requirement |
|---|---|
| FR-015 | Customer dapat menambah item ke keranjang |
| FR-016 | Sistem menghitung harga otomatis berdasarkan bahan/ukuran/kuantitas |
| FR-017 | Customer dapat checkout & membayar via Midtrans |
| FR-018 | Sistem generate invoice otomatis setelah pembayaran berhasil |
| FR-019 | Customer dapat melihat riwayat pesanan & melakukan reorder |
| FR-020 | Customer dapat menambah produk ke wishlist |
| FR-036 | Customer dapat membatalkan pesanan selama status masih "Menunggu Approval" (belum masuk produksi) |
| FR-040 | Customer dapat melakukan pemesanan grup/massal (Bulk Order) dengan satu desain untuk banyak unit, dengan harga per-unit otomatis menyesuaikan kuantitas — selesai 2026-07-29 (Code Audit Batch 5.1) |
| FR-043 | Admin dapat menolak (reject) order pada status "Menunggu Approval" dengan alasan wajib diisi, sebelum order masuk antrian produksi |
| FR-044 | Customer dapat memasukkan kombinasi ukuran berbeda (S/M/L/XL, dst.) dalam satu Bulk Order; harga per-unit bertingkat (BR-012) dihitung dari total kuantitas keseluruhan, bukan per-ukuran — selesai 2026-07-29 (Code Audit Batch 5.1) |

**Modul: Fulfillment & Tracking**

| ID | Requirement |
|---|---|
| FR-021 | Admin dapat mengelola antrian produksi & update status |
| FR-022 | Sistem terintegrasi dengan Biteship untuk pengiriman & auto tracking resi |
| FR-023 | Customer dapat melacak status produksi & pengiriman secara real-time |
| FR-042 | Customer dapat mengonfirmasi penerimaan pesanan secara manual ("Konfirmasi Diterima") setelah status pengiriman "Delivered" dari Biteship |

**Modul: Creator**

| ID | Requirement |
|---|---|
| FR-024 | Creator dapat upload desain dan memilih satu atau lebih jenis apparel (blank product) yang kompatibel dengan desain tersebut |
| FR-025 | Admin melakukan approval sebelum desain tayang di marketplace |
| FR-026 | Creator dapat melihat statistik penjualan & komisi dasar |
| FR-035 | Creator mengisi data KYC sederhana (nama lengkap & nomor identitas) sebagai bagian dari proses approval Creator |
| FR-041 | User yang sudah memiliki akun dapat mengajukan diri menjadi Creator (upgrade akun) langsung dari dalam akunnya, tanpa perlu membuat akun baru |
| FR-037 | Creator menggunakan varian Interactive 3D Product Editor yang diadaptasi untuk multi-apparel. Memungkinkan Creator memeriksa penempatan desain di beberapa jenis apparel sekaligus dengan lebih efisien dibanding alur single-product milik Customer, sebelum submit ke Admin untuk approval — **➡ Ditunda ke v1.1** (2026-08-01), bergantung pada 3D Editor (FE-023, 1.5 §12) |

**Modul: Review & Komunikasi**

| ID | Requirement |
|---|---|
| FR-027 | Customer dapat memberi rating & review setelah pesanan selesai — **⚠ Belum dibuat** (2026-07-21): endpoint backend (`POST /orders/{id}/reviews`) sudah ada dan berfungsi, tapi belum ada form/tombol di frontend manapun untuk memicunya (lihat FE-039 di Feature List). |
| FR-028 | User dapat chat dengan Admin |
| FR-029 | Sistem mengirim notifikasi real-time (status pesanan, chat, dll) — **⚠ Belum selesai** (2026-07-21): notifikasi & chat tersimpan dan tampil di database/UI, tapi belum "real-time" — belum ada Laravel Reverb (WebSocket) yang jalan, jadi user baru lihat notifikasi/pesan baru setelah refresh/reload halaman, bukan didorong otomatis. Lihat BR-027 dan Bagian 3.1 Bagian 9. |
| FR-038 | Admin dapat mengelola & membalas seluruh chat masuk dari Customer dalam satu dashboard terpusat |
| FR-039 | Admin dapat mengkonfigurasi jenis notifikasi yang dikirim ke user (order update, approval, dll) |

**Modul: Admin**

| ID | Requirement |
|---|---|
| FR-030 | Admin dapat mengelola user & creator (termasuk approval creator) |
| FR-031 | Admin dapat mengelola Product Catalog (termasuk aset mockup 3D per varian) |
| FR-032 | Admin dapat mengelola pembayaran & invoice |
| FR-033 | Admin dapat melihat sales report & statistik operasional dasar |

**Modul: Bahasa**

| ID | Requirement |
|---|---|
| FR-034 | Sistem mendukung 2 bahasa (Indonesia default, Inggris) dengan language switcher — selesai 2026-07-30 (Code Audit Batch 2c+6b): frontend memakai next-intl (`locales/id.json`/`en.json`, cookie `NEXT_LOCALE`, tanpa URL locale routing — lihat Bagian 3.1 §9), seluruh 42 halaman + shared component sudah dipindah dari string hardcode ke key translasi. Backend juga sudah bilingual penuh (`lang/id`/`lang/en`, deteksi `?lang=`/`Accept-Language` — Code Audit Batch 6b.5). Lihat NFR-008 dan FE-051 di Feature List. |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-001 | Waktu respons halaman < 3 detik pada koneksi 4G standar (termasuk render 3D editor) |
| NFR-002 | Responsive di desktop, tablet, dan mobile (mobile: browsing/checkout; 3D editor prioritas desktop, tetap fungsional di mobile) |
| NFR-003 | Password di-hash (bcrypt/Argon2), data pembayaran tidak disimpan di server sendiri (delegated ke Midtrans) |
| NFR-004 | Backup database harian otomatis |
| NFR-005 | Mendukung ±100 pengguna aktif bersamaan pada bulan pertama (sesuai proyeksi KPI di Brief) |
| NFR-006 | Uptime target 99% (di luar maintenance terjadwal) |
| NFR-007 | Model 3D & tekstur di-cache di browser untuk mengurangi loading berulang |
| NFR-008 | Seluruh teks UI, notifikasi, dan konten dinamis (nama produk, deskripsi desain) dirancang dengan struktur i18n (internationalization) sejak awal development, sehingga penambahan bahasa tidak memerlukan refactor besar di frontend — selesai 2026-07-30 (Code Audit Batch 2c+6b), lihat FR-034 untuk detail implementasi. Notifikasi in-app (title/body tersimpan di DB saat aksi terjadi) sengaja dikecualikan — localizing berdasar locale request Admin tidak match locale Customer penerima, beda kelas masalah dari string UI statis. Sebuah ESLint rule (`i18next/no-literal-string`, Batch 6b.6) mencegah regresi string hardcode baru. |
| NFR-009 | Kode disusun modular mengikuti pola arsitektur standar (Service + Repository + Form Request + Policy di Laravel backend, komponen reusable di Next.js frontend), sehingga mudah dibaca, diuji, dan dikembangkan lebih lanjut pasca-MVP |
| NFR-010 | Seluruh aturan berbasis waktu di sistem (timeout pembayaran, window komplain, auto-complete, dll) menggunakan WIB (UTC+7) sebagai timezone standar |
| NFR-011 | Data pribadi sensitif (nomor identitas KYC, alamat pengiriman, nomor HP) disimpan terenkripsi di database, sesuai UU PDP (UU No. 27/2022) |
| NFR-012 | User wajib menyetujui Kebijakan Privasi dan Syarat & Ketentuan (Terms of Service) — consent checkbox, wajib dicentang — saat registrasi sebelum akun dapat dibuat |

---

## 6. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Creator wajib melalui approval Admin sebelum bisa upload desain ke marketplace |
| BR-002 | Setiap desain wajib melalui approval Admin sebelum tayang publik |
| BR-003 | Pembayaran harus berhasil (dikonfirmasi Midtrans) sebelum pesanan masuk antrian produksi |
| BR-004 | Customer hanya dapat memberi rating & review setelah status pesanan "Selesai". Jika "Selesai" dipicu oleh konfirmasi manual Customer (FR-042), form rating ditampilkan langsung dalam alur yang sama (opsional, dapat di-skip). Jika "Selesai" dipicu oleh auto-complete (BR-014, tanpa aksi Customer), rating tetap tersedia belakangan lewat Riwayat Pesanan |
| BR-005 | Desain yang diunggah Creator hanya dapat digunakan lewat alur pemesanan cetak, tidak dijual sebagai file digital |
| BR-006 | Refund/pengembalian dana ditangani manual oleh Admin (untuk MVP versi 1.0) |
| BR-007 | Komisi Creator dihitung otomatis dari setiap transaksi yang melibatkan desainnya, tapi pencairan dilakukan manual oleh Admin (untuk MVP versi 1.0) |
| BR-008 | Creator wajib melengkapi KYC sederhana (identitas diri) sebagai syarat approval, sebelum bisa upload desain |
| BR-009 | Tidak ada minimum order quantity, pemesanan 1 pcs tetap dilayani |
| BR-010 | Pesanan hanya dapat dibatalkan customer selama status "Menunggu Approval"; setelah masuk antrian produksi, pesanan tidak dapat dibatalkan |
| BR-011 | Jika terjadi kesalahan produksi (bukan kesalahan dari desain/input customer), Harmoni Clothing menyediakan produksi ulang gratis, dengan biaya ditanggung pihak produksi (owner/tim produksi) |
| BR-012 | Bulk Order menggunakan skema harga per-unit bertingkat (semakin banyak kuantitas, harga per-unit semakin turun), dihitung dari total kuantitas keseluruhan dalam satu Bulk Order meski ukurannya campuran (FR-044); lead time produksi Bulk Order dihitung terpisah dari pesanan reguler karena volume lebih besar |
| BR-013 | Akun Creator adalah upgrade dari akun dasar (Customer), bukan tipe akun terpisah, satu akun (satu email) dapat berperan sebagai Customer dan Creator sekaligus setelah approval; tidak ada registrasi Creator yang berdiri sendiri |
| BR-014 | Status pesanan otomatis berubah menjadi "Menunggu Konfirmasi" saat Biteship melaporkan status "Delivered". Customer dapat mengonfirmasi manual ("Konfirmasi Diterima") kapan saja untuk langsung mengubah status jadi "Selesai"; jika tidak ada konfirmasi/komplain dalam 3 hari kerja sejak "Delivered", sistem otomatis mengubah status jadi "Selesai" |
| BR-015 | Jika produksi gagal total (misal bahan tertentu habis/discontinued), Admin wajib menawarkan alternatif (bahan/warna pengganti) ke Customer via Chat terlebih dahulu; jika Customer menolak seluruh alternatif, refund penuh diproses manual (BR-006) |
| BR-016 | Customer dapat mengajukan komplain kualitas dalam 7 hari kalender setelah status pesanan "Selesai" (baik dari konfirmasi manual maupun auto-complete), via Chat ke Admin, ditangani case-by-case manual (tidak ada refund/reproduksi otomatis). Setelah 7 hari, status "Selesai" dianggap final |
| BR-017 | Order otomatis "Dibatalkan" jika pembayaran tidak diselesaikan dalam 24 jam sejak checkout (mengikuti masa berlaku transaksi Midtrans); Customer perlu checkout ulang jika masih ingin memesan |
| BR-018 | Pembatalan & refund berlaku per-order (seluruh order), bukan per-item, MVP tidak mendukung pembatalan/refund sebagian item dari satu order maupun pembayaran sebagian (DP) |
| BR-019 | Jika Creator dinonaktifkan/di-ban, desainnya otomatis ditarik dari marketplace (tidak dapat dibeli lagi); order yang sudah checkout sebelum ban tetap lanjut diproduksi & dikirim seperti biasa, Customer tidak terdampak |
| BR-020 | Komisi Creator yang di-ban termasuk dari order yang sudah checkout sebelum ban namun belum/sedang diproses tetap dibayar jika ban bukan karena pelanggaran hak cipta; ditahan seluruhnya jika ban karena pelanggaran hak cipta terbukti (berlaku untuk semua transaksi yang melibatkan desain tersebut) |
| BR-021 | Dugaan plagiarisme antar-Creator tidak memiliki alur/UI dispute khusus di MVP — laporan ditangani manual oleh Admin melalui kontak biasa (Chat/email), dengan keputusan approve/reject/ban sepenuhnya berdasarkan investigasi manual Admin |
| BR-022 | Pembatalan Bulk Order berlaku seluruhnya atau tidak sama sekali (all-or-nothing, konsisten dengan BR-018) — tidak dapat mengurangi sebagian unit; tetap tunduk pada aturan waktu pembatalan umum (BR-010, sebelum masuk produksi) |
| BR-023 | Ban Creator karena pelanggaran hak cipta terbukti berlaku di level akun (bukan cuma sisi Creator) — akses Customer pada akun yang sama juga ikut disuspend, konsisten dengan model akun unified (BR-013) |
| BR-024 | Produk/desain yang sudah ditambahkan ke Wishlist tetap muncul meski kemudian tidak tersedia (Creator di-ban, produk discontinued), ditandai badge "Tidak Tersedia" dan tidak dapat di-checkout; tidak dihapus otomatis dari Wishlist |
| BR-025 | Harga yang berlaku untuk item adalah harga saat item ditambahkan ke keranjang (bukan harga saat checkout); jika Admin mengubah harga bahan/tingkat setelah item ada di keranjang, harga lama tetap berlaku untuk item tersebut selama belum dihapus dari keranjang |
| BR-026 | Bulk Order dan item reguler tidak dapat digabung dalam satu transaksi checkout — harus checkout terpisah, karena lead time produksi keduanya dihitung berbeda (BR-012) |
| BR-027 | Notifikasi (FR-029) dikirim melalui in-app saja untuk MVP (WebSocket real-time); notifikasi via email/SMS belum didukung, dipindah ke Fase 2 — **⚠ Belum selesai** (2026-07-21): bagian "in-app saja, bukan email/SMS" sudah benar, tapi bagian "WebSocket real-time"-nya belum — Laravel Reverb belum jalan, notifikasi baru muncul setelah refresh/reload. |
| BR-028 | Desain yang ditolak Admin (status "Ditolak") dapat direvisi dan disubmit ulang oleh Creator sebagai entry yang sama (bukan submission baru dari nol); status kembali jadi "Menunggu Approval" setelah revisi disubmit |

---

## 7. User Stories

- Sebagai **Customer**, saya ingin mencari desain berdasarkan kategori, sehingga saya lebih cepat menemukan desain yang sesuai.
- Sebagai **Customer**, saya ingin melihat preview 3D produk saya sebelum checkout, sehingga saya yakin dengan hasil akhirnya.
- Sebagai **Customer**, saya ingin menuliskan catatan revisi saat checkout, sehingga permintaan khusus saya tidak hilang di chat.
- Sebagai **Customer**, saya ingin membatalkan pesanan sebelum masuk produksi, sehingga saya tidak terikat jika berubah pikiran.
- Sebagai **Creator**, saya ingin memeriksa preview desain saya di berbagai jenis apparel sekaligus, sehingga saya yakin desain saya cocok di semua produk yang saya pilih.
- Sebagai **Creator**, saya ingin melihat statistik penjualan desain saya, sehingga saya tahu desain mana yang paling laku.
- Sebagai **Admin**, saya ingin melihat antrian produksi terurut berdasarkan prioritas, sehingga saya bisa memproses pesanan tepat waktu.
- Sebagai **Admin**, saya ingin mengelola seluruh chat customer dalam satu dashboard, sehingga tidak ada pesan yang terlewat.
- Sebagai **Guest**, saya ingin browsing marketplace tanpa perlu daftar dulu, sehingga saya bisa lihat-lihat sebelum berkomitmen.

---

## 8. Acceptance Criteria

**Login (FR-002)**
- Email & password valid → berhasil login, redirect ke dashboard.
- Password salah → muncul pesan error, tidak mengunci akun (kecuali setelah 5x percobaan gagal → captcha/cooldown).
- Akun belum verifikasi email → akses ditolak, muncul opsi kirim ulang verifikasi.

**Checkout (FR-017)**
- Semua item di keranjang valid (stok bahan tersedia) → lanjut ke halaman pembayaran.
- Pembayaran Midtrans berhasil → status pesanan otomatis jadi "Menunggu Approval", invoice ter-generate.
- Pembayaran gagal/timeout → status pesanan "Belum Dibayar", item tetap di keranjang.

**Konfirmasi Penerimaan Pesanan (FR-042, BR-014)**
- Biteship melaporkan status "Delivered" → status pesanan otomatis jadi "Menunggu Konfirmasi", tombol "Konfirmasi Diterima" aktif untuk Customer.
- Customer klik "Konfirmasi Diterima" → status langsung jadi "Selesai", form rating & review muncul otomatis di alur yang sama (opsional, dapat di-skip).
- Customer tidak melakukan apapun dalam 3 hari kerja sejak "Delivered" → sistem otomatis mengubah status jadi "Selesai" (tanpa prompt rating; Customer tetap dapat memberi rating belakangan lewat Riwayat Pesanan).

**Pembatalan Pesanan (FR-036, BR-010)**
- Status pesanan "Menunggu Approval" → tombol "Batalkan Pesanan" aktif; pembatalan berhasil → status jadi "Dibatalkan", refund diproses manual oleh Admin (BR-006).
- Status pesanan sudah "Diproses/Produksi" atau lebih lanjut → tombol batal tidak tersedia/disabled.

**Approval Creator dengan KYC (FR-035, BR-008)**
- Creator submit data KYC lengkap → status "Menunggu Approval".
- Data KYC tidak lengkap → submit ditolak sistem, muncul pesan field yang kurang.
- Admin approve → Creator dapat upload desain. Admin reject → Creator menerima notifikasi alasan.

**Approval Desain (FR-025, BR-002, BR-028)**
- Desain baru diunggah → status default "Menunggu Approval", belum tampil di marketplace.
- Admin approve → status "Aktif", tampil di marketplace.
- Admin reject → status "Ditolak", Creator menerima notifikasi alasan penolakan.
- Creator merevisi desain yang "Ditolak" dan submit ulang → status kembali jadi "Menunggu Approval" (entry yang sama, bukan submission baru).

**Submit Desain Multi-Apparel (FR-024, FR-037)**
- Creator memilih ≥1 jenis apparel → wajib preview & konfirmasi tiap jenis sebelum tombol "Submit" aktif.
- Ada jenis apparel yang belum di-preview/dikonfirmasi → submit ditolak sistem, muncul indikator jenis apparel mana yang belum dicek.

---

## 9. Use Case List

Registrasi, Login, Kelola Profil, Ajukan Upgrade jadi Creator, Browsing Marketplace Desain, Browsing Katalog Produk, Kustomisasi Produk (3D Editor), Kelola Keranjang, Pesan Grup/Massal (Bulk Order), Checkout & Pembayaran, Lihat Invoice, Lacak Pesanan, Konfirmasi Pesanan Diterima, Reorder, Batalkan Pesanan, Kelola Wishlist, Beri Rating & Review, Chat dengan Admin, Upload Desain Multi-Apparel (Creator), Kelola Desain (Creator), Lihat Statistik & Komisi (Creator), Lengkapi KYC (Creator), Approval Creator (Admin), Approval Desain (Admin), Kelola Katalog Produk (Admin), Kelola Pesanan & Produksi (Admin), Kelola Pembayaran & Invoice (Admin), Kelola Pengiriman (Admin), Kelola Chat & Notifikasi (Admin), Lihat Sales Report (Admin).

---

## 10. External Integrations

| Layanan | Fungsi |
|---|---|
| Midtrans | Payment Gateway |
| Biteship | Pengiriman & auto tracking resi |
| Cloudflare R2 | Penyimpanan file desain & aset mockup 3D |
| Laravel Reverb (self-hosted) | WebSocket untuk Chat & Notifikasi real-time |

---

---

# 1.3 User Persona — Harmoni Clothing

**Output:** Bagian 1.3
**Tujuan:** Mendefinisikan karakteristik pengguna utama beserta kebutuhan, tujuan, dan permasalahannya.
**Referensi:** [[Phase 1 - Product Discovery#1.1 Project Brief — Harmoni Clothing|1.1 Project Brief]], [[Phase 1 - Product Discovery#1.2 Requirement Gathering — Harmoni Clothing|1.2 Requirement Gathering]]
**Digunakan Oleh:** [[Phase 2 - Information Architecture#2.2 User Roles — Harmoni Clothing|2.2 User Roles]], [[Phase 2 - Information Architecture#2.3 User Flow — Harmoni Clothing|2.3 User Flow]], [[Phase 2 - Information Architecture#2.4 Navigation Structure — Harmoni Clothing|2.4 Navigation Structure]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

## 1. Persona Overview

| Persona | Role | Prioritas |
|---|---|---|
| Rangga | Customer | Primary |
| Nadia | Creator | Primary |
| Pak Budi | Admin/Owner | Secondary |

*Catatan: Guest tidak dibuat sebagai persona terpisah karena perilakunya setara dengan Customer sebelum mendaftar — journey singkatnya ada di Bagian 3.*

---

## 2. Persona Profiles

### Persona 2.1: Rangga (Customer)

**Profile**
- Umur: 22 tahun
- Pekerjaan: Mahasiswa semester akhir, aktif di organisasi kampus
- Lokasi: Bandung
- Pendidikan: S1 (sedang berjalan)
- Pengalaman teknologi: Terbiasa belanja online (Shopee, Tokopedia), aktif media sosial

**Goals**
- Memesan kaos komunitas/angkatan dengan desain sendiri, cepat dan tanpa ribet.
- Memesan dalam jumlah banyak (misal untuk 1 angkatan/kelas) dengan harga per-unit yang jelas dan lebih murah, tanpa nego manual.
- Melihat hasil akhir produk sebelum bayar, supaya tidak salah pesan.
- Tahu progres pesanan tanpa harus tanya-tanya ke admin.

**Pain Points**
- Selama ini pesan kaos custom lewat WA, harus kirim referensi gambar bolak-balik, sering miskomunikasi soal ukuran/warna.
- Tidak tahu kapan pesanan selesai diproduksi, cuma bisa nunggu kabar dari penjual.
- Ragu desainnya bakal pas di kaos beneran atau tidak.

**Needs**
- Editor yang bisa preview hasil akhir sebelum bayar.
- Kalkulator harga otomatis (biar tidak perlu tanya harga manual).
- Alur pemesanan grup/massal yang jelas saat pesan untuk banyak orang sekaligus.
- Tracking status pesanan real-time.
- Metode pembayaran yang familiar & aman (Midtrans).

**Behaviors**
- Lebih banyak akses dari HP dibanding laptop.
- Suka membandingkan harga & baca review sebelum memutuskan.
- Kalau checkout terlalu ribet/lama, sering batal beli.

**Motivations**
- Harga terjangkau untuk budget mahasiswa.
- Bisa custom desain sendiri sesuai identitas kelompok/komunitas.
- Proses simpel, tidak perlu japri sana-sini.

**Frustrations**
- Loading lama pas buka editor desain.
- Tidak ada kejelasan berapa lama produksi akan selesai.
- Revisi desain harus mulai dari awal / hilang saat chat.

**Preferred Devices**
- Android (utama), sesekali laptop kalau mengerjakan desain lebih detail.

**Digital Literacy**
- Intermediate, terbiasa aplikasi umum, tapi bukan desainer profesional.

**User Journey Summary**
```
Cari referensi kaos komunitas
        ↓
Buka Katalog Produk / Marketplace Desain
        ↓
Upload/pilih desain di 3D Product Editor
        ↓
Lihat ringkasan di Detail Produk & Desain
        ↓
Isi catatan pemesanan (jumlah, request khusus)
        ↓
Pilih pemesanan reguler ATAU Bulk Order (untuk kaos komunitas/angkatan)
        ↓
Checkout & bayar (Midtrans)
        ↓
Pantau tracking produksi & pengiriman (Biteship)
        ↓
Terima produk, beri rating & review
```

**Opportunities**
- Preview 3D yang meyakinkan mengurangi keraguan sebelum bayar.
- Notifikasi otomatis di tiap perubahan status (mengurangi kebutuhan tanya admin).
- Perhitungan harga transparan meningkatkan kepercayaan dibanding nego manual.

---

### Persona 2.2: Nadia (Creator)

**Profile**
- Umur: 25 tahun
- Pekerjaan: Ilustrator freelance, side income dari jual desain
- Lokasi: Yogyakarta
- Pendidikan: S1 Desain Komunikasi Visual
- Pengalaman teknologi: Mahir software desain (Procreate, Adobe Illustrator), aktif portofolio di Instagram

**Goals**
- Menjual desain ke lebih banyak orang tanpa harus urus produksi/pengiriman sendiri.
- Membangun portofolio yang bisa dilihat calon pembeli.
- Dapat penghasilan tambahan yang jelas dan terlacak (bukan sekadar japri "aku mau beli desainmu").

**Pain Points**
- Selama ini jual desain cuma lewat DM Instagram, repot urus pembayaran & pengiriman sendiri.
- Tidak ada cara memastikan desainnya benar-benar pas di berbagai jenis produk sebelum orang beli.
- Susah menghitung komisi kalau jualan manual.

**Needs**
- Tempat upload & showcase desain yang rapi (marketplace).
- Cara cek preview desain di banyak jenis apparel sekaligus, sebelum di-submit.
- Dashboard statistik penjualan & komisi yang jelas.

**Behaviors**
- Aktif cek statistik/insight di platform sosial media secara rutin.
- Suka platform yang kasih kontrol penuh atas karya (approval, revisi).

**Motivations**
- Penghasilan pasif dari karya yang sudah dibuat.
- Ingin karyanya dipakai banyak orang (validasi kreatif).
- Kepercayaan bahwa platform tidak menyalahgunakan desainnya.

**Frustrations**
- Proses approval yang lama/tidak jelas statusnya.
- Tidak tahu kenapa desain ditolak admin.
- Takut desain dipakai di luar kesepakatan (isu hak cipta).

**Preferred Devices**
- Laptop/desktop (untuk kerja desain), HP untuk cek statistik on-the-go.

**Digital Literacy**
- Advanced, mahir tools digital, terbiasa platform kreator (Instagram, Behance).

**User Journey Summary**
```
Sudah punya akun dasar (Customer) — daftar dulu kalau belum punya
        ↓
Ajukan Upgrade jadi Creator dari dalam akun (bukan akun baru)
        ↓
Lengkapi Verifikasi Data Diri (KYC sederhana)
        ↓
Menunggu approval Admin
        ↓
Upload desain + pilih jenis apparel yang kompatibel
        ↓
Cek preview 3D di tiap jenis apparel
        ↓
Submit desain untuk approval
        ↓
Desain tayang di marketplace
        ↓
Pantau statistik penjualan & komisi
```
*Catatan: Akun Creator adalah upgrade dari akun dasar (Customer) yang sama, bukan registrasi terpisah — satu email bisa berperan sebagai Customer & Creator sekaligus setelah approval (lihat BR-013, Requirement Gathering 1.2).*

**Opportunities**
- Notifikasi status approval yang jelas (diterima/ditolak + alasan) mengurangi kecemasan menunggu.
- Preview multi-apparel yang efisien jadi nilai jual dibanding platform lain yang cuma preview 1 produk.
- Statistik yang mudah dibaca meningkatkan motivasi Creator tetap aktif.

---

### Persona 2.3: Pak Budi (Admin/Owner)

**Profile**
- Umur: 55 tahun
- Pekerjaan: Pemilik sekaligus pengelola operasional Harmoni Clothing (dibantu tim produksi)
- Lokasi: Magelang
- Pendidikan: S1
- Pengalaman teknologi: Terbiasa pakai tools bisnis (Excel, WhatsApp Business), bukan technical background

**Goals**
- Semua pesanan tercatat rapi di satu tempat, tidak tersebar di banyak chat.
- Bisa approve creator & desain dengan cepat tanpa proses ribet.
- Tahu kondisi bisnis (omzet, produk terlaris) tanpa harus hitung manual.

**Pain Points**
- Pesanan selama ini tercatat manual, gampang miss atau salah catat.
- Sulit memantau progres produksi banyak pesanan sekaligus.
- Tidak ada laporan penjualan otomatis, semua rekap manual di Excel.

**Needs**
- Dashboard terpusat untuk semua pesanan & status produksi.
- Sistem approval (creator & desain) yang cepat dan jelas.
- Laporan penjualan otomatis (omzet, produk terlaris, dll).

**Behaviors**
- Cek dashboard setiap pagi untuk lihat pesanan baru.
- Lebih nyaman kerja dari desktop/laptop untuk pekerjaan administratif.
- Mengandalkan notifikasi untuk hal-hal yang butuh tindakan cepat (approval, komplain).

**Motivations**
- Operasional bisnis yang lebih efisien (tidak buang waktu di hal manual).
- Bisa scale bisnis tanpa nambah beban kerja secara linear.
- Data yang akurat untuk pengambilan keputusan bisnis.

**Frustrations**
- Banyak channel komunikasi customer yang harus dipantau manual.
- Tidak ada cara cepat tahu produksi mana yang sudah terlambat.
- Approval creator/desain makan waktu kalau tidak ada sistem jelas.

**Preferred Devices**
- Desktop/laptop (utama untuk kerja operasional), HP untuk cek cepat/notifikasi.

**Digital Literacy**
- Intermediate, bisa pakai tools bisnis umum, bukan technical, butuh UI yang jelas dan tidak rumit.

**User Journey Summary**
```
Cek dashboard (pesanan baru, approval pending)
        ↓
Approve creator / desain
        ↓
Kelola antrian produksi & update status
        ↓
Kelola pembayaran, invoice, pengiriman
        ↓
Balas chat customer
        ↓
Lihat sales report & statistik operasional
```

**Opportunities**
- Dashboard dengan prioritas otomatis (misal: approval pending ditampilkan paling atas) mengurangi beban mental mencari yang perlu ditindak.
- Notifikasi otomatis untuk hal yang butuh aksi cepat (pesanan baru, komplain) mengurangi risiko kelewat.
- Laporan otomatis mengurangi waktu yang tadinya dipakai rekap manual.

---

## 3. Guest — Catatan Journey Singkat

*Guest tetap tidak dibuat sebagai persona penuh (lihat catatan Bagian 1) karena profil demografis & motivasinya identik dengan Rangga (Customer) sebelum mendaftar. Journey singkat di bawah ditambahkan sebagai referensi untuk Phase 6 (UI/UX Design), supaya alur "sebelum login" tidak luput dari desain.*

**User Journey Summary**
```
Buka website tanpa login
        ↓
Browsing Katalog Produk / Marketplace Desain (read-only)
        ↓
Lihat profil publik Creator, search & filter desain
        ↓
Coba tambah ke keranjang / lanjut checkout / tambah Wishlist
        ↓
Diarahkan ke Login/Register (wajib, sebelum aksi ini dapat dilanjutkan — FR-005)
        ↓
Setelah daftar/login, lanjut sebagai Customer dari titik yang sama
```

**Catatan Penting**
- Tidak ada keranjang belanja untuk Guest — status keranjang tidak tersimpan lintas sesi sebelum login (lihat FR-005 revisi, Requirement Gathering 1.2).
- Titik "wajib login" ini adalah titik gesekan (friction point) yang perlu didesain hati-hati di Phase 6, supaya tidak terasa seperti dead-end bagi calon Customer yang sudah browsing lama.

---

# 1.4 Competitor Research — Harmoni Clothing

**Output:** Bagian 1.4
**Tujuan:** Memahami standar industri, menemukan kekurangan kompetitor, dan mengidentifikasi peluang diferensiasi.
**Referensi:** [[Phase 1 - Product Discovery#1.1 Project Brief — Harmoni Clothing|1.1 Project Brief]]
**Digunakan Oleh:** [[Phase 1 - Product Discovery#1.5 Feature List — Harmoni Clothing|1.5 Feature List]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

## 1. Research Objective

- **Mengapa kompetitor dipilih**: Direct competitor dipilih karena sama-sama bermain di print-on-demand + marketplace desain. Tees.co.id ditambahkan di luar daftar awal karena merupakan pemain lokal dengan model bisnis paling mendekati Harmoni Clothing (custom upload + marketplace kreator dalam satu platform).
- **Apa yang ingin dipelajari**: Standar fitur industri POD, model komisi/royalti kreator, pengalaman checkout & editor produk, serta celah yang belum terisi di pasar Indonesia.
- **Aspek yang dibandingkan**: Fitur, UX/UI, model bisnis, harga, kekuatan & kelemahan tiap platform.

---

## 2. Competitor List

**Direct Competitor**
- Printful.com (global)
- Printify.com (global)
- Redbubble.com (global)
- Threadless.com (global)
- Tees.co.id (Indonesia)

**Indirect Competitor**
- Canva (tools desain, bukan fulfillment)
- Shopee (marketplace umum, dipakai jual custom manual)
- Tokopedia (marketplace umum, dipakai jual custom manual)

---

## 3. Company Overview

| Kompetitor | Berdiri | Negara | Target Market | Model Bisnis | Kelebihan Utama |
|---|---|---|---|---|---|
| Printful.com | 2013 | Latvia/AS | Seller e-commerce (Shopify, Etsy, dll) | Fulfillment pay-per-order + subscription opsional (Growth \$24.99/bln, gratis di atas \$12K/thn penjualan) | Kualitas & konsistensi produk tinggi, katalog 370+ produk, 20+ integrasi e-commerce |
| Printify.com | 2015 | Latvia/AS | Seller e-commerce | Fulfillment marketplace 80+ print provider, harga bersaing antar provider + subscription opsional (Premium \$39/bln atau \$24.99/bln tahunan) | Harga base cost termurah di kelas POD, katalog 1.300+ produk terluas |
| Redbubble.com | 2006 | Australia | Artist/designer independen | Marketplace, komisi (artist margin default 20%, bisa diatur 0–30%) | Traffic organik besar (SEO kuat), 650rb+ artist, tanpa biaya sama sekali untuk seller |
| Threadless.com | 2000 | AS (Chicago) | Artist/designer independen | Marketplace + Artist Shops (toko sendiri), tanpa fee, artist bisa atur harga sendiri | Model komisi lebih tinggi dari rata-rata marketplace, kontrol harga penuh untuk artist |
| Tees.co.id | 2012 | Indonesia | Kreator lokal + pembeli custom apparel | Marketplace + custom upload dalam satu platform, kreator dapat komisi dari selisih harga jual | Sudah mapan di Indonesia (~50.000 kreator, ~400.000 desain), model hybrid persis mirip Harmoni Clothing, editor custom sendiri (pilih bahan/warna/ukuran + upload desain + preview) |
| Canva *(indirect)* | 2013 | Australia | Semua kalangan (desainer s/d awam) | Freemium + subscription (Canva Pro) | Tools desain termudah dipakai, tidak perlu skill desain tinggi |
| Shopee *(indirect)* | 2015 (ID) | Singapura/regional | Semua penjual online | Marketplace umum, komisi + iklan | Traffic sangat besar, infrastruktur logistik matang |
| Tokopedia *(indirect)* | 2009 | Indonesia | Semua penjual online | Marketplace umum, komisi + iklan | Traffic besar, kepercayaan lokal tinggi |

---

## 4. Feature Comparison Matrix

| Feature | Harmoni Clothing | Printful.com | Printify.com | Redbubble.com | Threadless.com | Tees.co.id |
|---|---|---|---|---|---|---|
| Login/Register | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Marketplace desain (beli dari creator) | ✔ | ✖ | ✖ | ✔ | ✔ | ✔ |
| Upload desain sendiri (custom) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| 3D/Interactive Product Editor | ✔ | Preview 2D/mockup | Preview 2D/mockup | Preview 2D | Preview 2D | Preview 2D (kanvas + bentuk dasar) |
| Kalkulator harga otomatis | ✔ | ✔ (base cost tetap) | ✔ (base cost bervariasi per provider) | ✔ (base + markup) | ✔ | ✔ |
| Bulk/Group Order dedicated flow | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ (hanya input kuantitas manual) |
| Komisi/royalti creator | ✔ (jelas, per transaksi) | – (bukan marketplace) | – (bukan marketplace) | ✔ (artist margin 10-30%) | ✔ (di atas rata-rata marketplace) | ✔ (selisih harga jual) |
| Order & Production Tracking real-time | ✔ | ✔ | ✔ (tergantung provider) | ✔ (dasar) | ✔ (dasar) | Tidak real-time (via email/dashboard sederhana) |
| Integrasi pengiriman lokal (Indonesia) | ✔ (Biteship) | ✖ (fokus internasional) | ✖ (fokus internasional) | ✖ | ✖ | ✔ (JNE) |
| Payment lokal (Indonesia) | ✔ (Midtrans) | ✖ | ✖ | ✖ | ✖ | ✔ |
| Bahasa Indonesia | ✔ | ✖ | ✖ | ✖ | ✖ | ✔ |
| KYC/verifikasi creator | ✔ | – | – | ✖ (tanpa verifikasi) | ✖ (tanpa verifikasi) | Tidak dipublikasikan jelas |

---

## 5. UX Analysis

*Catatan: analisis berdasarkan riset publik (review, dokumentasi resmi), bukan hands-on testing langsung, kedalaman akan diperdalam lagi saat UI/UX Design (Phase 6) kalau diperlukan studi banding visual.*

- **Homepage**: Printful.com / Printify.com berorientasi ke seller (bahasa "start selling", bukan konsumen akhir) — beda target dari Harmoni Clothing yang customer-facing langsung. Redbubble.com / Threadless.com / Tees.co.id lebih mirip marketplace konsumen biasa (kategori produk, pencarian desain).
- **Navigation**: Marketplace desain (Redbubble.com, Threadless.com, Tees.co.id) umumnya kategori by produk & tag/keyword, mengandalkan SEO pencarian daripada kurasi manual.
- **Search**: Redbubble.com sangat bergantung pada tag/keyword yang diisi artist, kualitas hasil pencarian tidak konsisten (disebut berulang di review sebagai kelemahan).
- **Checkout**: Printful.com / Printify.com checkout terjadi di platform e-commerce seller (Shopify.com / Etsy.com), bukan di platform POD itu sendiri, beda dengan Harmoni Clothing yang checkout terjadi langsung di platform sendiri.
- **Dashboard**: Printify.com / Printful.com dashboard-nya untuk seller (kelola produk/pesanan), bukan untuk end-customer, Redbubble.com / Threadless.com dashboard untuk artist (statistik & earnings).
- **Mobile Experience**: Tidak ada data spesifik ditemukan soal kualitas mobile UX kompetitor, perlu dicatat sebagai limitasi riset.
- **Creator Experience**: Threadless.com unggul di transparansi (kreator bisa atur harga sendiri, 0 fee) dibanding Redbubble.com (margin diatur platform secara default 20%).

---

## 6. UI Analysis

*Catatan: sama seperti UX Analysis, ini observasi awal dari materi publik, bukan audit visual mendalam.*

- Kompetitor global (Printful.com, Printify.com) menggunakan UI clean, minim warna, dominan putih/abu — kesan "tools bisnis" bukan "toko yang menyenangkan".
- Redbubble.com / Threadless.com / Tees.co.id lebih playful dan penuh warna, sesuai target artist/consumer.
- Tidak ditemukan data rinci soal tipografi/komponen spesifik dari sumber publik *bagian ini akan lebih akurat diisi nanti saat proses Design System (6.2), dengan screenshot langsung sebagai referensi visual, bukan cuma dari artikel review.*

---

## 7. Business Model Analysis

| Kompetitor | Model Monetisasi |
|---|---|
| Printful.com | Pay-per-order (jual base cost produk) + subscription opsional (Growth plan) |
| Printify.com | Margin dari base cost (marketplace 80+ provider bersaing harga) + subscription opsional (Premium) |
| Redbubble.com | Komisi dari selisih base price vs harga jual (artist margin) |
| Threadless.com | Marketplace: komisi ke artist dari harga jual. Artist Shops: gratis, Threadless untung dari volume penjualan lewat traffic sendiri |
| Tees.co.id | Marketplace: komisi dari selisih harga jual creator. Custom order: margin dari harga produksi |
| Harmoni Clothing | Margin dari harga jual custom order (produksi sendiri) + komisi otomatis untuk creator dari transaksi yang melibatkan desainnya |

---

## 8. Pricing Analysis

| Aspek | Printful.com | Printify.com | Redbubble.com | Threadless.com | Tees.co.id |
|---|---|---|---|---|---|
| Biaya join/upload | Gratis | Gratis | Gratis | Gratis | Gratis |
| Biaya langganan opsional | \$24.99/bln (gratis di atas \$12K/thn) | \$24.99–39/bln | Tidak ada | Tidak ada | Tidak dipublikasikan |
| Komisi/royalti creator | – (bukan marketplace) | – (bukan marketplace) | 10–30% (diatur artist, default 20%) | Di atas rata-rata marketplace (~2x), tidak dipublikasikan pasti | Selisih harga jual (diatur creator) |
| Ongkir | Dihitung per zona, mulai ~$4 (domestik AS) | Dihitung per provider | Termasuk dalam harga | Termasuk dalam harga | Terintegrasi JNE, harga lokal |

*Harmoni Clothing tidak mengenakan biaya join/upload untuk creator (sejalan dengan standar industri), dan tidak ada biaya langganan untuk customer maupun creator, pendapatan murni dari margin transaksi, sesuai Business Rules (1.2).*

---

## 9. SWOT Analysis

**Printful.com**
- *Strength*: Kualitas & konsistensi produk, katalog luas, integrasi e-commerce kuat.
- *Weakness*: Harga base cost lebih mahal dari kompetitor, bukan untuk konsumen akhir (murni tools seller), tidak fokus pasar Indonesia.
- *Opportunity*: Ekspansi ke pasar custom lokal/personal (di luar seller e-commerce).
- *Threat*: Printify.com yang lebih murah, marketplace lokal seperti Tees.co.id untuk pasar Indonesia.

**Printify.com**
- *Strength*: Harga termurah, katalog terluas, model marketplace-provider fleksibel.
- *Weakness*: Kualitas tidak konsisten (tergantung provider), tidak ada kurasi marketplace desain.
- *Opportunity*: Menambah lapisan marketplace desain di atas jaringan provider yang sudah ada.
- *Threat*: Sensitif terhadap kualitas provider yang buruk merusak reputasi platform.

**Redbubble.com**
- *Strength*: Traffic organik besar, basis artist sangat besar, tanpa biaya sama sekali.
- *Weakness*: Margin artist makin ditekan (perubahan fee 2025), kualitas desain makin tersaturasi termasuk konten AI, tidak ada kontrol kualitas ketat.
- *Opportunity*: Pasar yang kecewa dengan penurunan margin bisa beralih ke platform dengan komisi lebih transparan.
- *Threat*: Ketergantungan penuh pada SEO/algoritma platform untuk penjualan.

**Threadless.com**
- *Strength*: Model komisi paling menguntungkan artist di antara marketplace sejenis, kontrol harga oleh artist.
- *Weakness*: Basis pengguna/traffic lebih kecil dibanding Redbubble.com, skala global lebih terbatas.
- *Opportunity*: Diferensiasi lewat transparansi komisi bisa ditiru untuk menarik creator yang kecewa dari platform lain.
- *Threat*: Marketplace besar dengan traffic lebih tinggi tetap jadi pilihan utama artist baru.

**Tees.co.id**
- *Strength*: Sudah mapan di Indonesia, model hybrid (custom + marketplace) sudah tervalidasi pasar, integrasi lokal (JNE) sejak lama.
- *Weakness*: Preview produk masih 2D/kanvas datar (bukan 3D), tracking produksi tidak real-time, belum terlihat ada sistem KYC/verifikasi creator yang jelas dari sumber publik, integrasi payment gateway modern (seperti Midtrans) tidak terkonfirmasi jelas dari riset.
- *Opportunity*: Pasar custom apparel Indonesia yang sudah tervalidasi Tees.co.id bisa direbut sebagian dengan pengalaman lebih modern (3D preview, tracking real-time).
- *Threat*: Sebagai pemain lama, sudah punya basis creator & customer loyal yang sulit dipindah tanpa insentif kuat.

---

## 10. Gap Analysis

**Yang sudah dimiliki hampir semua kompetitor (standar industri, wajib ada):**
- Upload desain sendiri, kalkulator harga, checkout, order tracking dasar.

**Yang belum dimiliki kompetitor manapun (termasuk Tees.co.id) — peluang diferensiasi utama Harmoni Clothing:**
- **Interactive 3D Product Editor** : semua kompetitor riset (termasuk Tees.co.id) masih pakai preview 2D/kanvas datar, bukan model 3D yang bisa diputar.
- **Production tracking real-time terintegrasi** : kompetitor lokal (Tees.co.id) belum terlihat punya tracking status produksi yang real-time ke customer.
- **KYC/verifikasi creator terstruktur** : tidak ada satupun kompetitor riset (termasuk Redbubble.com / Threadless.com global) yang mempublikasikan proses verifikasi identitas creator secara jelas.
- **Payment & logistik lokal terintegrasi modern** (Midtrans + Biteship) dalam satu platform custom + marketplace : kombinasi ini belum ditemukan di kompetitor lokal maupun global untuk niche custom apparel.
- **Bulk/Group Order dengan harga bertingkat otomatis** : tidak ada satupun kompetitor riset yang punya flow khusus ini (semua hanya input kuantitas manual tanpa skema harga bertingkat).

---

## 11. Best Practices

- **Threadless.com** : transparansi komisi & kontrol harga oleh creator meningkatkan kepercayaan creator terhadap platform.
- **Printify.com** : model harga yang jelas dan predictable (base cost + margin) tanpa biaya tersembunyi.
- **Tees.co.id** : proses upload desain & custom order dalam satu alur yang sudah terbukti dipahami pasar Indonesia (jadi validasi bahwa model hybrid Harmoni Clothing bisa diterima pasar).
- **Redbubble.com** : kemudahan search & discovery lewat tag, meski kualitasnya perlu dikurasi lebih baik dibanding Redbubble saat ini.

---

## 12. Opportunities

- 3D Product Editor sebagai pembeda visual utama vs seluruh kompetitor riset.
- Production tracking real-time sebagai nilai jual kepercayaan (belum ada di kompetitor lokal).
- KYC creator sebagai sinyal kepercayaan & mitigasi risiko hak cipta yang belum jadi standar di kompetitor manapun.
- Kombinasi payment + logistik lokal modern dalam satu ekosistem custom apparel.

---

## 13. Conclusion

**Yang harus dipertahankan:**
- Model hybrid (custom order + marketplace desain), sudah tervalidasi pasar oleh Tees.co.id, jadi bukan risiko model bisnis, hanya perlu eksekusi lebih baik.
- Integrasi lokal (Midtrans, Biteship), konsisten dengan kebutuhan pasar Indonesia yang belum sepenuhnya dilayani kompetitor global.

**Yang harus dihindari:**
- Model komisi yang tidak transparan / berubah sepihak (pelajaran dari Redbubble.com yang kehilangan kepercayaan artist akibat perubahan fee 2025).
- Preview produk yang terlalu sederhana/flat sehingga customer ragu sebelum bayar (kelemahan hampir semua kompetitor riset).

**Keunggulan utama Harmoni Clothing (posisi kompetitif):**
Harmoni Clothing adalah satu-satunya platform (dari yang diriset) yang menggabungkan **3D Product Editor**, **production tracking real-time**, **KYC creator**, **integrasi payment + logistik lokal modern**, dan **Bulk/Group Order berharga bertingkat** dalam satu ekosistem custom apparel, sebuah kombinasi yang belum dimiliki baik oleh pemain global (Printful.com, Printify.com, Redbubble.com, Threadless.com) maupun pemain lokal yang sudah mapan (Tees.co.id).

---

# 1.5 Feature List — Harmoni Clothing

**Output:** Bagian 1.5
**Tujuan:** Mendata seluruh fitur produk secara terstruktur.
**Referensi:** [[Phase 1 - Product Discovery#1.2 Requirement Gathering — Harmoni Clothing|1.2 Requirement Gathering]], [[Phase 1 - Product Discovery#1.4 Competitor Research — Harmoni Clothing|1.4 Competitor Research]]
**Digunakan Oleh:** [[Phase 1 - Product Discovery#1.6 MVP Definition — Harmoni Clothing|1.6 MVP Definition]], [[Phase 2 - Information Architecture#2.1 Sitemap — Harmoni Clothing|2.1 Sitemap]], [[Phase 3 - System Architecture#3.2 System Architecture — Harmoni Clothing|3.2 System Architecture]], [[Phase 3 - System Architecture#3.3 Module Breakdown — Harmoni Clothing|3.3 Module Breakdown]], [[Phase 5 - API & Backend Planning#5.1 Business Rules — Harmoni Clothing|5.1 Business Rules]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

## 1. Feature Overview

- **Definisi fitur**: Sebuah kemampuan yang dapat dilakukan pengguna atau sistem (what the product can do), bukan rincian teknis cara membangunnya (how to build it).
- **Ruang lingkup**: Mencakup seluruh 57 fitur MVP (diturunkan dari 45 Functional Requirement di Requirement Gathering) ditambah ide-ide fitur masa depan yang belum masuk MVP (Future Features).
- **Cara pengelompokan**: Berdasarkan modul fungsional (15 kategori), konsisten dengan Feature Breakdown di Requirement Gathering (1.2).

---

## 2. Feature Categories

Authentication, User Management, Marketplace, Product Catalog, Product Customization, Creator Management, Order Management, Payment, Shipping, Notification, Review & Rating, Communication, Admin Dashboard, Analytics, Settings/Localization.

---

## 3. Feature Inventory

*Kolom Priority (MoSCoW), Complexity, dan Business Value digabung ke tabel yang sama untuk efisiensi (lihat Bagian 6–8 untuk penjelasan skala).*

| ID     | Modul                 | Nama Fitur                       | Deskripsi                                                                                              | Priority | Complexity | Value  |
| ------ | --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ---------- | ------ |
| FE-001 | Authentication        | Register                         | User membuat satu akun dasar (otomatis dapat berperan sebagai Customer)                                | Must     | Low        | Tinggi |
| FE-002 | Authentication        | Login                            | User masuk ke akun                                                                                     | Must     | Low        | Tinggi |
| FE-003 | Authentication        | Logout                           | User keluar dari akun                                                                                  | Must     | Low        | Sedang |
| FE-004 | Authentication        | Reset Password                   | Reset password lewat email                                                                             | Must     | Low        | Sedang |
| FE-005 | Authentication        | Guest Access                     | Browsing tanpa login                                                                                   | Must     | Low        | Sedang |
| FE-006 | User Management       | Kelola Profil                    | Edit data diri & foto                                                                                  | Must     | Low        | Sedang |
| FE-060 | User Management       | Address Book                     | Simpan & kelola alamat pengiriman, pilih saat checkout                                                 | Must     | Medium     | Tinggi |
| FE-007 | User Management       | KYC Creator                      | Verifikasi identitas sederhana sebelum approval Creator                                                | Must     | Medium     | Tinggi |
| FE-053 | User Management       | Ajukan Upgrade jadi Creator      | User dengan akun dasar mengajukan diri menjadi Creator tanpa akun baru; masuk ke alur KYC & approval   | Must     | Low        | Tinggi |
| FE-008 | Marketplace           | Browsing Desain                  | Menjelajah desain dari Creator                                                                         | Must     | Low        | Tinggi |
| FE-009 | Marketplace           | Search Desain                    | Mencari desain                                                                                         | Must     | Medium     | Tinggi |
| FE-010 | Marketplace           | Filter Desain                    | Filter kategori/tag desain                                                                             | Must     | Medium     | Sedang |
| FE-011 | Marketplace           | Profil Publik Creator            | Melihat profil & portofolio Creator                                                                    | Must     | Low        | Sedang |
| FE-012 | Product Catalog       | Browsing Katalog Produk          | Menjelajah blank product                                                                               | Must     | Low        | Tinggi |
| FE-013 | Product Catalog       | Detail Produk & Desain           | Halaman ringkasan sebelum keranjang                                                                    | Must     | Medium     | Tinggi |
| FE-014 | Product Customization | 3D Editor — Mode Custom          | Pilih bahan/ukuran/warna/jenis potongan bebas — **➡ Ditunda ke v1.1** (2026-08-01, keputusan user: terlalu berat untuk v1.0, lihat §12) | Won't (v1.0) | High       | Tinggi |
| FE-015 | Product Customization | Upload Desain Sendiri            | Upload file desain (PNG/SVG)                                                                           | Must     | Medium     | Tinggi |
| FE-016 | Product Customization | Atur Posisi Desain               | Drag, resize, rotate desain di editor — **➡ Ditunda ke v1.1** (2026-08-01), bagian dari 3D Editor       | Won't (v1.0) | High       | Tinggi |
| FE-017 | Product Customization | 3D Editor — Mode Marketplace     | Posisi desain terkunci, pilihan varian terbatas opsi Creator — **➡ Ditunda ke v1.1** (2026-08-01)      | Won't (v1.0) | High       | Tinggi |
| FE-018 | Product Customization | Preview 3D Real-time             | Model 3D berganti sesuai kombinasi varian — **➡ Ditunda ke v1.1** (2026-08-01)                         | Won't (v1.0) | High       | Tinggi |
| FE-019 | Product Customization | Kolom Catatan Pemesanan          | Customer tulis permintaan revisi/khusus                                                                | Must     | Low        | Sedang |
| FE-020 | Creator Management    | Dashboard Creator                | Ringkasan aktivitas Creator                                                                            | Must     | Medium     | Sedang |
| FE-021 | Creator Management    | Upload & Kelola Desain           | CRUD desain milik Creator                                                                              | Must     | Medium     | Tinggi |
| FE-022 | Creator Management    | Pilih Apparel Kompatibel         | Creator pilih jenis apparel untuk desainnya (multi-apparel)                                            | Must     | Medium     | Tinggi |
| FE-023 | Creator Management    | Editor Preview Multi-Apparel     | Cek penempatan desain di banyak jenis apparel sekaligus — **➡ Ditunda ke v1.1** (2026-08-01), bergantung 3D Editor | Won't (v1.0) | High       | Tinggi |
| FE-024 | Creator Management    | Statistik Penjualan & Komisi     | Dashboard earning Creator                                                                              | Must     | Medium     | Sedang |
| FE-025 | Order Management      | Keranjang Belanja                | Menyimpan item sebelum checkout                                                                        | Must     | Low        | Tinggi |
| FE-026 | Order Management      | Perhitungan Harga Otomatis       | Hitung harga real-time (bahan/ukuran/kuantitas)                                                        | Must     | Medium     | Tinggi |
| FE-027 | Order Management      | Checkout                         | Proses pemesanan & pembayaran                                                                          | Must     | Medium     | Tinggi |
| FE-028 | Order Management      | Riwayat Pesanan                  | Melihat histori transaksi                                                                              | Must     | Low        | Sedang |
| FE-029 | Order Management      | Reorder                          | Pesan ulang dari riwayat                                                                               | Must     | Low        | Sedang |
| FE-030 | Order Management      | Wishlist                         | Simpan produk favorit                                                                                  | Must     | Low        | Rendah |
| FE-031 | Order Management      | Pembatalan Pesanan               | Batalkan sebelum masuk produksi                                                                        | Must     | Medium     | Sedang |
| FE-052 | Order Management      | Pesanan Grup/Massal (Bulk Order) | Pesan satu desain untuk banyak unit, harga per-unit bertingkat sesuai kuantitas — selesai 2026-07-29 (Code Audit Batch 5.1) | Must     | Medium     | Tinggi |
| FE-056 | Order Management      | Kombinasi Ukuran di Bulk Order   | Input kuantitas per ukuran (S/M/L/XL) dalam satu Bulk Order, harga tetap dihitung dari total kuantitas — selesai 2026-07-29 (Code Audit Batch 5.1) | Must     | Medium     | Tinggi |
| FE-032 | Payment               | Payment Gateway                  | Integrasi Midtrans                                                                                     | Must     | Medium     | Tinggi |
| FE-033 | Payment               | Invoice Otomatis                 | Generate invoice usai pembayaran                                                                       | Must     | Low        | Sedang |
| FE-034 | Shipping              | Integrasi Biteship               | Kalkulasi & booking pengiriman                                                                         | Must     | Medium     | Tinggi |
| FE-035 | Shipping              | Auto Tracking Resi               | Update status kirim otomatis                                                                           | Must     | Medium     | Tinggi |
| FE-036 | Shipping              | Tracking Produksi & Pengiriman   | Customer lihat status real-time                                                                        | Must     | Medium     | Tinggi |
| FE-054 | Shipping              | Konfirmasi Pesanan Diterima      | Customer konfirmasi manual setelah "Delivered"; auto-complete 3 hari kerja jika tidak ada aksi         | Must     | Medium     | Tinggi |
| FE-037 | Notification          | Notifikasi Real-time             | Push notifikasi status/chat                                                                            | Must     | Medium     | Tinggi |
| FE-038 | Notification          | Konfigurasi Notifikasi           | Admin atur jenis notifikasi terkirim                                                                   | Should   | Low        | Rendah |
| FE-039 | Review & Rating       | Rating & Review                  | Beri nilai setelah pesanan selesai — **⚠ Belum dibuat** (2026-07-21, endpoint backend sudah ada, frontend belum) | Must     | Low        | Sedang |
| FE-040 | Communication         | Chat dengan Admin                | Komunikasi langsung di platform                                                                        | Must     | Medium     | Sedang |
| FE-041 | Communication         | Chat Management                  | Admin kelola semua chat terpusat                                                                       | Must     | Medium     | Sedang |
| FE-042 | Admin Dashboard       | Dashboard Admin                  | Ringkasan operasional                                                                                  | Must     | Medium     | Tinggi |
| FE-043 | Admin Dashboard       | User & Creator Management        | Kelola akun pengguna                                                                                   | Must     | Medium     | Tinggi |
| FE-044 | Admin Dashboard       | Approval Creator                 | Approve/reject pendaftaran Creator (+ KYC)                                                             | Must     | Low        | Tinggi |
| FE-045 | Admin Dashboard       | Approval Desain                  | Approve/reject desain sebelum tayang                                                                   | Must     | Low        | Tinggi |
| FE-046 | Admin Dashboard       | Product Catalog Management       | Kelola blank product + aset mockup 3D                                                                  | Must     | High       | Tinggi |
| FE-047 | Admin Dashboard       | Order & Production Management    | Kelola antrian & status produksi                                                                       | Must     | Medium     | Tinggi |
| FE-055 | Admin Dashboard       | Penolakan Order                  | Admin reject order sebelum produksi dengan alasan wajib diisi                                          | Must     | Low        | Sedang |
| FE-048 | Admin Dashboard       | Payment & Invoice Management     | Kelola pembayaran & invoice                                                                            | Must     | Low        | Sedang |
| FE-049 | Admin Dashboard       | Shipment Management              | Kelola pengiriman                                                                                      | Must     | Low        | Sedang |
| FE-050 | Analytics             | Sales Report                     | Laporan omzet, produk terlaris, dll                                                                    | Must     | Medium     | Tinggi |
| FE-051 | Settings/Localization | Bahasa ID/EN                     | Language switcher — selesai 2026-07-30 (Code Audit Batch 2c+6b), lihat NFR-008                        | Must     | Medium     | Sedang |

*Total: 57 fitur inti.*

---

## 4. Feature Description *(fitur kompleks/kritis, dijabarkan)*

**FE-015/016 — Upload & Atur Desain Sendiri**
- Deskripsi: Customer/Creator mengunggah file desain dan mengatur tampilannya di produk.
- Fungsi: Upload PNG/SVG, drag posisi, resize, rotate, preview real-time, hapus/ganti file.

**FE-014/017/018 — 3D Product Editor**
- Deskripsi: Editor interaktif berbasis Three.js/WebGL (3D ringan — model statis + decal, tanpa simulasi fisika kain, sesuai keputusan System Architecture).
- Fungsi: Pilih varian produk, tempel tekstur desain ke model 3D, putar kamera 360°, ganti mockup otomatis sesuai kombinasi warna/jenis potongan.

**FE-023 — Editor Preview Multi-Apparel (Creator)**
- Deskripsi: Varian dari 3D Product Editor yang diadaptasi supaya Creator bisa memeriksa satu desain di banyak jenis apparel sekaligus, lebih efisien dibanding alur single-product Customer.
- Fungsi: Pilih ≥1 jenis apparel, preview & konfirmasi tiap jenis, wajib dikonfirmasi semua sebelum submit ke Admin.

**FE-026 — Perhitungan Harga Otomatis**
- Deskripsi: Sistem menghitung harga final berdasarkan kombinasi bahan, ukuran, dan kuantitas tanpa input manual admin.
- Fungsi: Update harga real-time saat customer mengubah pilihan di editor/keranjang.

**FE-007/044 — KYC & Approval Creator**
- Deskripsi: Creator mengisi data identitas sederhana sebagai syarat approval sebelum dapat mengunggah desain.
- Fungsi: Form KYC (nama lengkap, nomor identitas), validasi kelengkapan, status Menunggu Approval → Aktif/Ditolak.

---

## 5. Feature Dependencies

```
Checkout (FE-027)
│
├── Login (FE-002)
├── Keranjang Belanja (FE-025)
├── Perhitungan Harga Otomatis (FE-026)
├── Payment Gateway (FE-032)
└── Invoice Otomatis (FE-033)
```

```
Upload Desain ke Marketplace (FE-021)
│
├── Login sebagai Creator (FE-002)
├── KYC Creator (FE-007)
├── Approval Creator (FE-044)
├── Pilih Apparel Kompatibel (FE-022)
├── Editor Preview Multi-Apparel (FE-023)
└── Approval Desain (FE-045)
```

```
Tracking Produksi & Pengiriman (FE-036)
│
├── Checkout berhasil (FE-027)
├── Order & Production Management (FE-047)
└── Integrasi Biteship + Auto Tracking Resi (FE-034, FE-035)
```

---

## 6. Feature Priority (MoSCoW)

| Priority | Arti | Jumlah Fitur |
|---|---|---|
| Must Have | Wajib ada di v1.0 | 51 |
| Should Have | Sangat penting, bisa menyusul di awal | 1 (FE-038) |
| Could Have | Bagus jika ada, tidak prioritas | 0 |
| Won't Have (v1.0) | Ditunda ke v1.1 — 3D Product Editor (FE-014/016/017/018/023), lihat §12 | 5 |
| Won't Have | Tidak dikerjakan sekarang | *(lihat Bagian 11 — Future Features, scope v2.0)* |

---

## 7. Feature Complexity

| Level | Arti | Contoh Fitur |
|---|---|---|
| Low | Implementasi standar, pola umum (CRUD sederhana) | Login, Wishlist, Reset Password |
| Medium | Perlu logika tambahan/integrasi pihak ketiga | Checkout, Payment Gateway, KYC |
| High | Kompleksitas teknis signifikan, butuh riset/effort lebih | 3D Product Editor (semua varian), Product Catalog Management (aset mockup) |

---

## 8. Feature Value

| Skor | Arti |
|---|---|
| Tinggi | Fitur inti yang langsung menjawab Problem Statement di Project Brief |
| Sedang | Fitur pendukung yang meningkatkan pengalaman, bukan blocker utama |
| Rendah | Nice-to-have, dampak bisnis kecil jika ditunda |

---

## 9. Technical Notes

- **Upload Desain (FE-015)**: Maksimal 20 MB, format PNG/SVG (AI/PSD tidak didukung di MVP), disimpan di Cloudflare R2.
- **3D Product Editor (FE-014/017/018/023)**: Three.js + WebGL, model 3D statis (tanpa fisika kain), 1 set mockup per kombinasi produk × jenis potongan × warna disiapkan manual oleh Product Owner. Optimasi performa: format model .glTF/.glb dengan Draco compression (kompres geometry mesh), tekstur dengan Basis Universal/KTX2 compression, lazy load per produk (model dimuat saat Product Editor dibuka, bukan di-preload di Katalog), dynamic import Three.js di Next.js (library 3D tidak ikut termuat di halaman non-editor).
- **Gambar (produk, desain, thumbnail)**: Format WebP sebagai default, memakai `<Image>` component Next.js (auto-format & lazy-load bawaan).
- **Delivery & Caching**: Cloudflare CDN dipasangkan dengan Cloudflare R2 (satu ekosistem, zero egress fee) untuk mempercepat delivery aset statis sekaligus menekan biaya, sejalan dengan Constraints anggaran minim di Project Brief.
- **Perhitungan Harga Otomatis (FE-026)**: Formula harga berdasarkan bahan + ukuran + kuantitas, dihitung di backend (bukan client-side) untuk mencegah manipulasi harga.
- **Chat & Notifikasi (FE-037/040/041)**: Menggunakan Laravel Reverb (WebSocket self-hosted).
- **KYC (FE-007)**: Data identitas disimpan terenkripsi, tidak divalidasi ke pihak ketiga resmi (Dukcapil dll) di MVP — hanya pengecekan kelengkapan data. **Catatan penamaan**: "KYC" dipakai sebagai istilah internal/teknis di seluruh dokumen Phase 1 karena sudah familiar untuk tim. Untuk UI/copy yang dilihat Creator (Phase 6 ke atas), gunakan istilah yang lebih jujur seperti **"Verifikasi Data Diri"** atau **"Lengkapi Data Identitas"**, bukan "KYC" — supaya tidak membentuk ekspektasi bahwa data sudah divalidasi resmi, padahal MVP hanya cek kelengkapan.
- **Bulk Order (FE-052)**: Tabel tingkat harga per-kuantitas dikelola Admin (Product Catalog Management), dihitung backend seperti FE-026. Lead time produksi terpisah dari pesanan reguler (BR-012, Requirement Gathering).
- **Bahasa ID/EN (FE-051)**: Struktur i18n disiapkan sejak awal development (NFR-008, Requirement Gathering) — seluruh teks UI, notifikasi, dan konten dinamis melalui key translasi, bukan hardcoded string, supaya tidak perlu refactor besar saat menambah bahasa.

---

## 10. Risks

| Fitur | Risiko |
|---|---|
| Upload Desain (FE-015/021) | File terlalu besar, format rusak, pelanggaran hak cipta |
| 3D Product Editor (FE-014/017/018) | Performa render lambat di device low-end, aset mockup belum lengkap saat development (mitigasi: placeholder, lihat Project Brief Constraints) |
| KYC (FE-007) | Data identitas palsu (mitigasi: hanya cek kelengkapan, bukan validasi resmi di MVP) |
| Payment Gateway (FE-032) | Downtime/API error dari Midtrans mengganggu checkout |
| Approval Desain (FE-045) | Bottleneck operasional jika volume submission tinggi dan Admin solo |

---

## 11. Future Features *(Backlog, Won't Have — Fase 2+)*

Konsisten dengan Project Brief Bagian 9 (Out of Scope):
- Payout otomatis Creator, riwayat pencairan komisi otomatis
- Advanced Analytics (AOV, CLV, Cohort Analysis, Funnel, Profit Analysis)
- Marketing Engine (Voucher, Promo, Loyalty Point, Membership, Referral, Affiliate)
- AI Features (Generate Design, Generate Mockup, Background Removal, Upscale, Recommendation, Deteksi Plagiarisme)
- Enterprise Features (Multi Admin & Role Permission, Multi Store, Multi Warehouse)
- Mobile App (Android, iOS)
- Multi language selain Indonesia & Inggris
- Penjualan desain sebagai file digital terpisah
- Pembayaran sebagian/DP (Down Payment)
- Pembatalan/refund sebagian item dari satu order
- Permintaan hapus akun/data mandiri, deklarasi orisinalitas desain formal, moderasi review Admin, preferensi notifikasi per-user, notifikasi via email/SMS

Ide tambahan baru (belum pernah dibahas, murni brainstorming untuk dicatat sebagai referensi masa depan):
- Design Contest/Voting Komunitas (terinspirasi model Threadless di Competitor Research)
- True 3D Editor dengan simulasi fisika kain (upgrade dari 3D Ringan saat ini)
- Multi-currency untuk ekspansi pasar luar Indonesia

---

## 12. Keputusan Penundaan 3D Editor ke v1.1 (2026-08-01)

FE-014/016/017/018/023 (3D Product Editor — mode custom, mode marketplace, preview real-time, atur posisi desain, dan varian preview multi-apparel Creator yang bergantung padanya) **ditunda ke v1.1**, bukan bagian dari rilis v1.0. Keputusan langsung dari user: kompleksitas teknis ("High") terbukti terlalu berat untuk diselesaikan dalam timeline v1.0 solo-developer.

- **v1.0 tetap punya Product Editor**, hanya versi 2D: pilih warna/ukuran, upload desain sendiri, kolom catatan, mockup foto statis yang berganti sesuai varian (kode saat ini di `frontend/app/(customer)/customize/[slug]/page.tsx`) — bukan model 3D interaktif.
- Konsekuensi: FE-023 (Editor Preview Multi-Apparel Creator) ikut tertunda karena secara teknis adalah varian dari 3D Editor yang sama.
- Dampak ke dokumen lain: Bagian 1.6 §3/§5/§6/§8, Bagian 1.2 (FR-010, FR-012, FR-037) diperbarui senada.
- Lihat [[project_harmoni_remaining_gaps]] (memori sesi) untuk histori teknis lengkap kenapa ini sulit.

---

*Dokumen ini bersifat inventaris kemampuan produk, bukan instruksi teknis pembangunan — detail implementasi akan dijabarkan di fase System Architecture (Phase 3) dan seterusnya.*

---

# 1.6 MVP Definition — Harmoni Clothing

**Output:** Bagian 1.6
**Tujuan:** Menentukan ruang lingkup versi pertama (v1.0) agar proyek dapat diluncurkan sesuai waktu, biaya, dan sumber daya yang tersedia.
**Referensi:** [[Phase 1 - Product Discovery#1.5 Feature List — Harmoni Clothing|1.5 Feature List]]
**Digunakan Oleh:** [[Phase 1 - Product Discovery#1.7 Product Roadmap — Harmoni Clothing|1.7 Product Roadmap]], [[Phase 3 - System Architecture#3.1 Technology Stack — Harmoni Clothing|3.1 Technology Stack]]
**Roadmap:** [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]]

---

## 1. MVP Objective

- **Mengapa pendekatan MVP**: Proyek solo-founder dengan timeline 1 bulan dan anggaran minim (Project Brief Bagian 15). MVP memastikan fokus pada fitur yang langsung menjawab Problem Statement, bukan membangun semua ide sekaligus.
- **Target waktu rilis**: 1 bulan sejak development dimulai.
- **Target pengguna awal**: 40–70 customer & 10–15 creator terdaftar di bulan pertama (sesuai KPI Project Brief Bagian 7).
- **Nilai utama yang ingin dibuktikan**: Platform mampu menggantikan proses pemesanan custom apparel manual (WhatsApp/Instagram) dengan pengalaman yang terstruktur, transparan, dan tepercaya, sekaligus memberi wadah penghasilan yang jelas bagi creator lokal.

*Catatan: Seluruh 57 fitur di Master Feature List (1.5) — termasuk FE-038 (Should Have) — dirilis dalam satu rilis v1.0 tunggal, tanpa staging fast-follow, **kecuali 3D Product Editor (FE-014/016/017/018/023, 5 fitur) yang ditunda ke v1.1 (keputusan 2026-08-01, lihat 1.5 §12 — terlalu berat untuk timeline solo-developer).** Karena tidak ada fase fast-follow lain, status MoSCoW (Must/Should) di 1.5 hanya dipakai sebagai penanda prioritas pengerjaan internal, bukan penentu apa yang dirilis — 3D Editor adalah satu-satunya pengecualian eksplisit.*

---

## 2. Success Criteria

MVP dianggap berhasil jika:
- Website berhasil diluncurkan dan dapat diakses publik.
- Customer dapat memesan produk, baik lewat custom desain sendiri (Katalog Produk) maupun memilih desain Creator (Marketplace).
- Pembayaran melalui Midtrans berhasil diproses.
- Pesanan dapat masuk antrian produksi dan dikelola Admin hingga selesai.
- Customer dapat melacak status produksi & pengiriman secara real-time.
- Creator dapat mendaftar, melalui KYC & approval, lalu mengunggah desain hingga tayang di marketplace.
- Admin dapat mengelola seluruh operasional (user, approval, produksi, pembayaran, pengiriman) dari satu dashboard.
- Minimal satu transaksi end-to-end (order → pembayaran → produksi → pengiriman → selesai) berhasil tanpa intervensi manual di luar sistem.

---

## 3. MVP Scope

52 dari 57 fitur (15 modul: Authentication, User Management, Marketplace, Product Catalog, Product Customization, Creator Management, Order Management, Payment, Shipping, Notification, Review & Rating, Communication, Admin Dashboard, Analytics, Localization) berstatus **MVP v1.0**, termasuk FE-038 (Konfigurasi Notifikasi, satu-satunya fitur berlabel "Should Have" di 1.5) yang tetap dirilis di v1.0 karena tidak ada fase fast-follow.

**Dikecualikan dari v1.0, ditunda ke v1.1:** FE-014, FE-016, FE-017, FE-018, FE-023 — 3D Product Editor secara keseluruhan (mode custom, atur posisi desain, mode marketplace, preview real-time, dan preview multi-apparel Creator yang bergantung padanya). v1.0 tetap punya Product Editor, tapi versi 2D (pilih warna/ukuran, upload desain, mockup foto statis) — bukan model 3D interaktif. Lihat Bagian 1.5 §12 untuk keputusan lengkap.

*Rincian lengkap per fitur ada di Bagian 1.5 (57 fitur, ID FE-001 s/d FE-060, penomoran tidak selalu berurutan karena beberapa fitur ditambahkan belakangan lewat protokol approval).*

---

## 4. Post-MVP Scope (Fase 2)

Konsisten dengan Project Brief Bagian 9 (Out of Scope):
- Payout otomatis Creator, riwayat pencairan komisi otomatis
- Advanced Analytics (AOV, CLV, Cohort Analysis, Funnel, Profit Analysis)
- Marketing Engine (Voucher, Promo, Loyalty Point, Membership, Referral, Affiliate)
- AI Features (Generate Design, Generate Mockup, Background Removal, Upscale, Recommendation, Deteksi Plagiarisme)
- Enterprise Features (Multi Admin & Role Permission, Multi Store, Multi Warehouse)
- Mobile App (Android, iOS)
- Multi language selain Indonesia & Inggris
- Penjualan desain sebagai file digital terpisah
- Pembayaran sebagian/DP (Down Payment)
- Pembatalan/refund sebagian item dari satu order
- Permintaan hapus akun/data mandiri, deklarasi orisinalitas desain formal, moderasi review Admin, preferensi notifikasi per-user, notifikasi via email/SMS

---

## 5. Release Strategy

| Versi | Isi |
|---|---|
| **v1.0** | 52 dari 57 fitur MVP (Bagian 3) — satu rilis tunggal |
| **v1.1** | Perbaikan/penyempurnaan berdasarkan feedback pengguna nyata pasca-launch (polish & bug fix), **plus satu pengecualian: 3D Product Editor (FE-014/016/017/018/023) yang ditunda dari v1.0** |
| **v1.2** | Penyempurnaan Creator Tools & pengembangan lanjutan lain (belum ditentukan) |
| **v2.0** | Seluruh item Post-MVP Scope (Bagian 4) |

---

## 6. Risks

Karena seluruh fitur tetap masuk v1.0 (tidak ada yang digeser ke fast-follow), risiko utama bukan pada *fitur yang hilang*, melainkan pada **beban development untuk solo developer dalam 1 bulan**:

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Timeline 1 bulan untuk 52 fitur sekaligus | Berpotensi molor dari target launch | Prioritas pengerjaan mengikuti urutan dependency di Bagian 1.5 Bagian 5 |
| Tidak ada fase fast-follow sebagai buffer | Bug/kekurangan kecil harus diperbaiki di tengah semua fitur sekaligus aktif | QA (Phase 9 roadmap) perlu dialokasikan waktu cukup sebelum deployment |
| 3D Editor (High complexity) sempat masuk v1.0 lalu ditunda ke v1.1 (2026-08-01) — bukti langsung bahwa estimasi kompleksitas fitur ini sebelumnya kurang akurat | Risiko serupa bisa terjadi lagi jika ada fitur High-complexity lain yang belum dites | Untuk v1.1, validasi kelayakan teknis (proof-of-concept kecil) sebelum mengunci scope, bukan langsung commit ke MoSCoW |

---

## 7. Assumptions

- Customer bersedia menggunakan platform web (belum perlu mobile app) untuk memesan produk custom.
- Volume transaksi di awal peluncuran masih dalam kapasitas yang bisa ditangani satu Admin/tim produksi kecil.
- Marketplace desain cukup berjalan dengan fitur dasar (browsing, search, filter) tanpa rekomendasi algoritmik di v1.0.
- Tidak ada fase fast-follow berarti QA harus lebih ketat sebelum launch, karena tidak ada "jaring pengaman" fitur susulan.

---

## 8. Acceptance Checklist *(Launch Checklist)*

- [ ] Register & Login berjalan (Customer, Creator, Admin)
- [ ] Guest dapat browsing tanpa login
- [ ] Address Book (simpan & pilih alamat pengiriman) berjalan
- [ ] Verifikasi Data Diri (KYC sederhana) & approval Creator berjalan
- [ ] Ajukan Upgrade jadi Creator dari akun Customer yang sudah ada berjalan
- [ ] Upload desain & approval desain berjalan (termasuk revisi desain "Ditolak" dapat disubmit ulang)
- [ ] Product Editor 2D berjalan (pilih warna/ukuran, upload desain sendiri, mockup foto statis berganti sesuai varian) — **3D Editor ditunda ke v1.1, tidak masuk checklist v1.0** (lihat 1.5 §12)
- [ ] Perhitungan harga otomatis akurat
- [ ] Checkout & pembayaran (Midtrans) berhasil
- [ ] Bulk/Group Order dapat dipesan dengan harga per-unit bertingkat, termasuk kombinasi ukuran (S/M/L/XL) dalam satu Bulk Order
- [ ] Bulk Order & item reguler wajib checkout terpisah (tidak bisa digabung)
- [ ] Pembatalan pesanan berjalan (hanya selagi status "Menunggu Approval")
- [ ] Admin dapat menolak (reject) order sebelum produksi dengan alasan wajib diisi
- [ ] Invoice ter-generate otomatis
- [ ] Ongkir (Biteship) berhasil dihitung & resi ter-track otomatis
- [ ] Admin dapat memproses pesanan dari antrian produksi hingga selesai
- [ ] Tracking status produksi & pengiriman tersedia untuk Customer
- [ ] Konfirmasi Pesanan Diterima berjalan (manual oleh Customer, dan auto-complete setelah 3 hari kerja tanpa aksi)
- [ ] Notifikasi real-time berjalan (order, chat, approval)
- [ ] Konfigurasi jenis notifikasi oleh Admin berjalan (FE-038)
- [ ] Chat Customer–Admin berjalan, termasuk Chat Management terpusat di sisi Admin
- [ ] Rating & Review dapat diberikan setelah pesanan selesai (baik lewat konfirmasi manual maupun lewat Riwayat Pesanan pasca auto-complete)
- [ ] Riwayat Pesanan, Reorder, dan Wishlist berjalan
- [ ] Sales Report menampilkan data akurat
- [ ] Website responsive (desktop, tablet, mobile)
- [ ] Bahasa Indonesia & Inggris berfungsi (language switcher)
- [ ] Tidak ada bug kritis pada alur checkout & pembayaran

---

# 1.7 Product Roadmap — Harmoni Clothing

**Output:** Bagian 1.7
**Tujuan:** Menentukan kapan setiap fitur dikembangkan dan dirilis.
**Referensi:** [[Phase 1 - Product Discovery#1.6 MVP Definition — Harmoni Clothing|1.6 MVP Definition]], [[Roadmap_Website_Harmoni_Clothing.xlsx|Roadmap Website Harmoni Clothing]] (roadmap 11 fase)
**Digunakan Oleh:** — (mengarahkan seluruh proses development selanjutnya; dokumen Phase 6+ belum dibuat)

---

## 1. Roadmap Objective

- **Tujuan roadmap**: Memetakan urutan pengembangan 57 fitur MVP ke dalam timeline 1 bulan yang realistis untuk solo developer (dibantu Claude Code).
- **Target peluncuran**: v1.0 dalam 1 bulan sejak development dimulai (sesuai Project Brief Constraints).
- **Strategi pengembangan**: MVP (v1.0, satu rilis penuh) → Iterasi perbaikan (v1.1) → Scale/fitur lanjutan (v1.2, v2.0).

---

## 2. Product Vision Timeline

```
Discovery (Phase 1 — selesai)
      ↓
Planning (Phase 2–5 — Information Architecture, System Architecture, Database, API)
      ↓
Design (Phase 6 — UI/UX di Figma)
      ↓
Development (Phase 7–8 — Backend & Frontend)
      ↓
Testing (Phase 9 — QA)
      ↓
Launch (Phase 10 — Deployment)
      ↓
Growth (Phase 11 — Maintenance & Improvement)
```

---

## 3. Milestones

| Milestone | Target |
|---|---|
| Project Kickoff | ✔ Selesai |
| Project Brief selesai (1.1) | ✔ Selesai |
| Requirement Gathering selesai (1.2) | ✔ Selesai |
| User Persona selesai (1.3) | ✔ Selesai |
| Competitor Research selesai (1.4) | ✔ Selesai |
| Feature List & MVP Definition selesai (1.5–1.6) | ✔ Selesai |
| Information Architecture selesai (Phase 2) | Belum |
| System Architecture & Database Design selesai (Phase 3–4) | Belum |
| API & Backend Planning selesai (Phase 5) | Belum |
| UI/UX Design selesai (Phase 6) | Belum |
| Backend Development selesai (Phase 7) | Belum |
| Frontend Development selesai (Phase 8) | Belum |
| QA selesai (Phase 9) | Belum |
| Go Live (Phase 10) | Belum |

---

## 4. Development Phases

| Fase | Isi |
|---|---|
| Phase A | Planning (Information Architecture, System Architecture, Database Design, API & Backend Planning) |
| Phase B | UI/UX Design (Figma) |
| Phase C | Backend Development |
| Phase D | Frontend Development |
| Phase E | Testing (QA) |
| Phase F | Deployment |

---

## 5. Module Roadmap

```
Localization / i18n Foundation (struktur key translasi, disiapkan sejak awal — NFR-008)
        ↓
Authentication & Profil (termasuk Address Book)
        ↓
Product Catalog & Marketplace (browsing)
        ↓
Product Customization (3D Editor)
        ↓
Order Management (Cart, Perhitungan Harga, Wishlist, Reorder, Pembatalan)
        ↓
Payment (Midtrans)
        ↓
Shipping (Biteship)
        ↓
Creator Tools (Verifikasi Data Diri, Upload Desain, Approval)
        ↓
Fulfillment & Tracking
        ↓
Review & Rating
        ↓
Communication (Chat & Notifikasi)
        ↓
Admin Dashboard & Analytics
```

*Catatan: Localization/i18n bukan modul yang dikerjakan sekali di awal lalu selesai — strukturnya (key translasi, bukan hardcoded string) diterapkan sejak modul pertama dibangun dan diikuti secara konsisten di semua modul berikutnya, sesuai NFR-008. Baris pertama di atas menandai kapan fondasinya disiapkan, bukan kapan seluruh teks UI selesai diterjemahkan.*

---

## 6. Risks & Mitigation

| Risiko | Mitigasi |
|---|---|
| Scope bertambah di tengah jalan | MVP Scope sudah di-freeze di dokumen 1.6, perubahan wajib lewat protokol approval + reasoning + tinjauan ulang |
| Integrasi Midtrans/Biteship terlambat terintegrasi | Gunakan sandbox/API testing kedua layanan sejak awal Phase 7 (Backend Development), jangan ditunda ke akhir |
| Revisi desain UI/UX berkepanjangan di Figma | Approval per milestone (per halaman/modul), bukan menunggu seluruh desain selesai baru direview |
| Bug kritis menjelang launch | Alokasikan buffer waktu QA (Phase 9) yang cukup, jangan dipepetkan ke H-1 deployment |

---

## 7. Resource Planning

| Area | PIC |
|---|---|
| Product Management, Requirement, Business Decision | Anda (Product Owner) |
| UI/UX Design (Figma) | Anda |
| System Architecture, Backend Development, Frontend Development | Claude (via Claude Code di VS Code) |
| QA (testing fungsional) | Anda + Claude |
| Deployment & DevOps (VPS, Docker Compose) | Claude (dengan approval Anda untuk aksi yang berdampak, sesuai protokol) |
| Produksi & Fulfillment fisik | Tim Produksi (di luar scope pengembangan software) |

---

## 8. Timeline

| Minggu | Fokus |
|---|---|
| 1 | Information Architecture, System Architecture, Database Design, API & Backend Planning (Phase 2–5) + mulai UI/UX Design di Figma (Phase 6, paralel) |
| 2 | UI/UX Design lanjut/selesai + mulai Backend Development (Auth, Marketplace, Product Catalog, Product Customization) |
| 3 | Backend Development lanjut (Order, Payment, Shipping, Creator Tools, Admin) + mulai Frontend Development untuk modul backend yang sudah siap |
| 4 | Frontend Development selesai + Testing (QA) + Deployment |

---

## 9. Launch Criteria *(Go-Live Checklist)*

*Kelengkapan fitur (Register, KYC, 3D Editor, Bulk Order, dst.): lihat `MVP_Definition.md` (1.6) Bagian 8 (Acceptance Checklist). Bagian ini fokus pada kesiapan infrastruktur & deployment.*

- [ ] Semua 57 fitur MVP selesai dan lulus Acceptance Criteria (Requirement Gathering 1.2)
- [ ] Seluruh aset mockup 3D (per kombinasi produk × jenis potongan × warna) sudah 100% siap (bukan placeholder)
- [ ] Domain aktif & terhubung
- [ ] SSL aktif
- [ ] Backup database otomatis terjadwal (NFR-004)
- [ ] Monitoring aktif

---

*Catatan: Dokumen ini adalah roadmap strategis (arah & prioritas), bukan Gantt chart harian. Detail task-level akan diturunkan ke backlog/sprint saat development dimulai di Claude Code.*
