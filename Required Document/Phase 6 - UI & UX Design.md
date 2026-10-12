# 6.0 Design Reference Brief — Harmoni Clothing

**Output:** Bagian 6.0
**Tujuan:** Titik awal referensi untuk pengerjaan Phase 6 (Moodboard, Design System, Wireframe, High Fidelity Design, Interactive Prototype, Responsive Design) di Figma.
**Referensi:** Bagian 1.1, Bagian 1.3, Bagian 1.4, Bagian 2.1, Bagian 2.4

**Catatan peran**: Sesuai protokol kerja (Phase 6 bertipe Design di Roadmap), dokumen ini murni referensi/arahan — bukan moodboard, wireframe, atau mockup jadi. Eksekusi desain aktual dikerjakan langsung di Figma oleh Product Owner.

---

### 1. Ringkasan Brand & Positioning

Dari Project Brief (1.1): Harmoni Clothing menggantikan pemesanan custom apparel manual (WA/Instagram) dengan platform terstruktur — marketplace desain + editor 3D + fulfillment tracking dalam satu sistem. Kata kunci yang layak jadi acuan mood: **terstruktur, transparan, dapat dipercaya** (lawan dari chaos chat manual yang jadi Problem Statement-nya) — bukan sekadar "trendy e-commerce".

---

### 2. Arahan Mood per Segmen Pengguna Utama

Tiga persona (1.3) punya konteks pemakaian yang cukup berbeda — layak didesain beda tone, bukan satu skin generik untuk semua.

| Persona | Konteks Pakai | Arahan Mood |
|---|---|---|
| **Rangga (Customer)** | Mobile-first, mahasiswa, biasa Shopee/Tokopedia | Familiar e-commerce pattern, ringan, cepat dipahami. Checkout harus terasa "aman & jelas" — dia batal beli kalau ribet (Frustration tercatat eksplisit di 1.3). |
| **Nadia (Creator)** | Desktop, desainer profesional, portofolio-minded | Lebih editorial/showcase — desainnya harus "terlihat bagus" saat dipajang, bukan sekadar thumbnail generik. Dashboard statistik perlu terasa credible, bukan sekadar angka. |
| **Pak Budi (Admin)** | Desktop, non-technical, butuh efisiensi | Utilitarian, dashboard-first — prioritas otomatis (approval pending di atas), bukan dekoratif. Ini bukan tempat untuk hero section yang flashy. |

---

### 3. Referensi Kompetitor

Riset lengkap sudah ada di Bagian 1.4 (5 direct: Printful, Printify, Redbubble, Threadless, Tees.co.id + 3 indirect). Saran pemakaian saat moodboard: buka lagi bagian diferensiasi di dokumen itu sebagai pengingat "apa yang TIDAK boleh disamakan" — jangan cuma meniru visual kompetitor tanpa mengacu gap analysis-nya.

---

### 4. Prioritas Halaman untuk Wireframe

45 halaman di Sitemap (2.1) terlalu banyak untuk didesain sekaligus. Urutan disarankan mengikuti Module Roadmap (1.7 Bagian 5) — desain halaman yang jadi jalur kritis dulu:

1. **Golden path Customer**: Beranda → Katalog/Marketplace → Product Editor → Cart → Checkout → Order Tracking (halaman ini menentukan rasa "terstruktur & transparan" dari positioning).
2. **Golden path Creator**: Upload Desain → Editor Preview Multi-Apparel → Dashboard Statistik.
3. **Golden path Admin**: Dashboard → Approval (Creator/Desain) → Antrian Produksi.
4. Sisanya (Address Book, Wishlist, Chat, halaman legal) — desain belakangan, polanya lebih standar/rendah risiko.

---

### 5. Komponen yang Butuh Perhatian Ekstra

Bukan komponen CRUD biasa — ini yang menentukan apakah produk terasa premium atau murahan:

- **3D Product Editor** (FE-014/017/018) — state kosong, loading, hasil akhir harus meyakinkan (mengurangi keraguan Rangga sebelum bayar, disebut eksplisit sebagai Opportunity di 1.3).
- **Konfigurasi Bulk Order** (FE-052/056) — kombinasi ukuran + harga bertingkat harus terasa transparan, bukan tabel Excel yang membingungkan.
- **Guest → Login redirect** (dicatat eksplisit di 1.3 Bagian 3 sebagai *friction point* yang harus didesain hati-hati, bukan terasa dead-end).
- **Admin Dashboard prioritization** — approval pending & pesanan terlambat harus "kelihatan duluan" tanpa Pak Budi perlu mencari.

---

### 6. Prinsip Teknis yang Mengikat Desain

- **Responsive**: 3D Editor prioritas desktop tapi wajib tetap fungsional di mobile (NFR-002) — jangan didesain desktop-only lalu "disusutkan" belakangan.
- **Dwibahasa (ID/EN)**: sediakan ruang untuk teks lebih panjang saat berganti bahasa (NFR-008) — hindari layout yang patah kalau string berubah panjang.
- **Aksesibilitas baseline**: kontras & focus state jelas (Navigation Structure 2.4 Bagian 9) — bukan komitmen WCAG formal, tapi jangan diabaikan.

---

### 7. Keputusan Desain (Hasil Interview Product Owner)

Hasil interview preferensi desain dengan Product Owner sebelum eksekusi di Figma (6.1 Moodboard & 6.2 Design System). Keputusan berikut mengikat untuk seluruh pengerjaan Figma di Phase 6.

**Arah Visual**: Hybrid — base minimal e-commerce (Customer, mobile-first, familiar) + editorial accent di halaman showcase Creator, sesuai arahan mood per-persona di Bagian 2.

**Warna** (basis warna logo `#49BB90` / `#067577`):
| Role | Hex | Pemakaian |
|---|---|---|
| Background | `#F8FAFC` | Latar utama seluruh halaman (abu-kebiruan cerah, bukan krem) |
| Primary | `#067577` | Nav, heading penting, brand mark |
| Aksen | `#49BB90` | CTA utama, status sukses/verified |
| Teks utama | `#1A1A1A` | Body copy, heading di atas background terang |
| Teks sekunder | `#475569` | Subtext, deskripsi |
| Border kartu | `#E2E8F0` | Border tipis (bukan shadow berat), konsisten dgn pola referensi |

**Tipografi**: Montserrat SemiBold/Medium untuk heading (H1/H2/H3) + Inter Regular/Medium untuk body/UI (form, checkout, dashboard Admin, caption). Revisi dari opsi serif awal — Montserrat dipilih untuk heading karena karakter geometrisnya kuat di ukuran besar (hero, judul showcase Creator), Inter dipertahankan untuk body karena dioptimasi legibility di ukuran kecil & dukungan dwibahasa ID/EN.

**Bentuk & Ikon**: Soft rounded — radius ~8–10px di button/card. Icon set gaya Feather (outline, stroke 2px, rounded line cap), implementasi teknis pakai **Lucide** (`lucide-react`) — fork aktif Feather, drop-in untuk Next.js, tersedia plugin Figma resmi.

**Referensi Layout** (mockup PNG dari Product Owner, diadaptasi ke palet & tipografi di atas — bukan direplikasi identik): Nav sticky + CTA ganda (outline/solid) → Hero produk di atas pedestal dengan backdrop bentuk lembut + badge social-proof mengambang → logo wall kepercayaan → grid fitur ikon 4 kolom → stepper "cara kerja" bergaris putus-putus → grid produk dengan harga → testimonial 3 kolom → CTA band gelap (primary) → footer gelap. Referensi ini juga menyertakan interaksi 3D parallax di hero — dicatat sebagai kandidat motion/interaksi saat Interactive Prototype (6.5), bukan blocking untuk Moodboard/Design System.

---

### 8. Checklist Sebelum Phase 7

- [ ] Moodboard & Design System (warna, tipografi, spacing, komponen) selesai di Figma
- [ ] Wireframe untuk 3 golden path di Bagian 4 selesai
- [ ] High Fidelity Design + Prototype interaktif untuk alur checkout & 3D editor (paling berisiko kalau salah desain)
- [ ] Responsive check di desktop/tablet/mobile

---

### Dependencies

**Depends On**

- Project Brief
- User Persona
- Competitor Research
- Sitemap
- Navigation Structure

**Used By**

- Moodboard
- Design System
- Wireframe
- High Fidelity Design
- Interactive Prototype
- Responsive Design
