# Harmoni Clothing

Print-on-demand + custom-apparel + design-marketplace platform. Monorepo: `backend/` (Laravel 13) + `frontend/` (Next.js 14).

Planning docs: [`Required Document/`](Required%20Document/) (Phase 1–6, complete). Tech stack rationale: [`Required Document/Phase 3 - System Architecture/3.1_Technology_Stack.md`](Required%20Document/Phase%203%20-%20System%20Architecture/3.1_Technology_Stack.md).

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind, TanStack Query (server state) + Zustand (client state)
- **Backend**: Laravel 13 (PHP 8.3+), Sanctum SPA auth (cookie-based)
- **Database**: MySQL 8 · **Cache/Queue**: Redis · **Realtime**: Laravel Reverb
- **Storage**: Cloudflare R2 · **Payment**: Midtrans · **Shipping**: Biteship

> Note: the original spec pinned Laravel 11.x / Next.js 14.x as of when Phase 3 was written. Laravel 11.x's security-patched releases are no longer available on Packagist, so the backend was scaffolded on **Laravel 13.x** instead (decided with the user, 2026-07-17). Frontend stayed on Next.js 14.x since it still installs cleanly.

## Local development (no Docker yet)

Backend (uses XAMPP's bundled MariaDB on `127.0.0.1:3306`, not Docker):

```
cd backend
composer install
cp .env.example .env   # already done; edit as needed
php artisan migrate
php artisan serve
```

Frontend:

```
cd frontend
pnpm install
pnpm dev
```

## Docker (once Docker is installed)

```
docker compose up
```

Orchestrates `backend`, `frontend`, `mysql`, `redis`, `reverb` — see `docker-compose.yml`. Switch `backend/.env` back to the Redis/Reverb driver values in `backend/.env.example` when using this path.

## External services still needed

Accounts/API keys to create manually before those features work: Midtrans (payment), Biteship (shipping), Cloudflare R2 (storage), SMTP provider (transactional email), Sentry + UptimeRobot (monitoring, optional early on).
