# Harmoni Clothing

Platform print-on-demand + custom apparel + marketplace desain. Monorepo:

| Folder | Isi |
|---|---|
| `backend/` | API Laravel 13 (PHP 8.3+), auth cookie Sanctum, MySQL |
| `frontend/` | Next.js 15 (App Router) + TypeScript + Tailwind, next-intl (ID/EN), SWR + Zustand |
| `Required Document/` | Dokumen perencanaan Phase 1–6, audit kode, checklist QC, roadmap |

## Mulai cepat

Satu perintah membuka backend (`:8000`) dan frontend (`:3000`) di dua jendela PowerShell:

```powershell
.\dev.ps1
```

Prasyarat: MySQL (XAMPP) harus sudah menyala — jalankan `C:\xampp\mysql_start.bat` dulu, bila tidak backend akan *hang*.

Manual:

```bash
cd backend  && composer install && cp .env.example .env && php artisan key:generate && php artisan migrate --seed && php artisan serve
cd frontend && pnpm install && pnpm dev
```

Akun demo (hasil seeder, password `password`): `test@example.com` (customer), `creator@harmoni.test`, `admin@harmoni.test`.

## Perintah yang sering dipakai

```bash
cd backend  && php artisan test              # 232 tes
cd backend  && php artisan schedule:work     # job terjadwal: batal otomatis, selesai otomatis, payout komisi
cd frontend && pnpm exec tsc --noEmit        # type-check
cd frontend && pnpm lint && pnpm build
```

## Peta kode

```
backend/
  app/Http/Controllers/Api   endpoint tipis → panggil Service
  app/Http/Requests          validasi input (Form Request)
  app/Services               logika bisnis (OrderService, CheckoutService, PricingService, ...)
  app/Repositories           query database
  app/Console/Commands       job terjadwal (lihat routes/console.php)
  config/business.php        SEMUA angka aturan bisnis (24 jam, 3 hari kerja, komisi, minimum payout)
  lang/{id,en}               pesan error backend
frontend/
  app/(public|auth|customer|creator|admin)   halaman per area akses
  components/ui              komponen dasar (Button, Input, DataTable, ...)
  components/<area>          komponen per area
  services/                  pemanggil API per modul
  hooks/ store/ lib/         data fetching, state global, utilitas
  locales/{id,en}.json       semua teks UI
```

## Dokumen penting

- [`PROJECT_RULES.md`](PROJECT_RULES.md) — aturan bisnis & teknis yang berlaku, dan daftar kekurangan website.
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — cara deploy saat ini (Cloudflare Workers + backend di laptop via tunnel) dan rencana pindah ke VPS.
- `Required Document/` — spesifikasi lengkap; aturan bisnis BR-001–028 ada di `Phase 1 - Product Discovery.md` → Bagian 1.2, sub-bagian 6.

## Layanan eksternal

Midtrans (pembayaran), Biteship (ongkir/kurir), Cloudflare R2 (file), Resend (email), Pusher/Reverb (realtime). Semua kunci lewat `.env` (lihat `backend/.env.example`) — jangan pernah di-commit.
