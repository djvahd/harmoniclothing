# Deployment (current state, 2026-10-12)

Interim demo setup. The previous Railway + Netlify setup is gone (trial and credits ran out);
its full runbook is in git history: `git show cdafaa9:DEPLOYMENT.md`.

```
browser ──► harmoniclothing.com (Cloudflare Worker, OpenNext)
               │  next.config.mjs rewrites /api /sanctum /broadcasting /storage
               ▼
          api.harmoniclothing.com (Cloudflare named tunnel `harmoni-api`)
               ▼
          developer laptop: php artisan serve :8000 + MySQL (XAMPP)
```

Registrar is Hostinger (nameservers point at Cloudflare). DNS, SSL, Workers and the R2 buckets
live in the Cloudflare account `adrielharjanto@gmail.com`.

## Frontend — Cloudflare Workers (OpenNext)

- Repo `djvahd/harmoniclothing`, Worker `harmoni-frontend`, built by **Workers Builds** on every
  push to `master`: root directory `frontend`, build `pnpm install --frozen-lockfile && pnpm cf:build`,
  deploy `pnpm wrangler deploy`. Build variables: `NODE_VERSION=22`, `PNPM_VERSION=11.13.1`.
- Config: `frontend/wrangler.jsonc`, `frontend/open-next.config.ts`.
- Build-time values: `frontend/.env.production` (public values only — `NEXT_PUBLIC_*` is baked
  into the browser bundle). `NEXT_PUBLIC_API_URL` must be the site's **own** origin
  (`https://harmoniclothing.com`), never the backend host. `BACKEND_ORIGIN` is the rewrite target.
- `www` is redirected to the apex in `next.config.mjs`.
- Local `pnpm cf:build` does not work on Windows (pnpm symlinks need Developer Mode); build in
  Workers Builds or WSL instead.

## Backend — runs on a laptop for now

Three processes must be alive, or the site returns 502/500 on every API call:

1. MySQL: `C:\xampp\mysql_start.bat` (run from a normal terminal; it fails from background shells).
2. `php artisan serve --port=8000` in `backend/`.
3. `cloudflared tunnel run harmoni-api` (config in `~/.cloudflared/config.yml`, credentials JSON
   next to it — never commit either). The tunnel exposes `api.harmoniclothing.com` → `localhost:8000`.

If the laptop sleeps, the tunnel drops; restart the three above. The hostname never changes.

Backend env: start from `backend/.env.example`. Production-relevant keys: `FRONTEND_URL`,
`SANCTUM_STATEFUL_DOMAINS`, `CORS_ALLOWED_ORIGINS` (all must include `harmoniclothing.com`),
R2 (`FILESYSTEM_DISK_PUBLIC/PRIVATE=r2_*`, `AWS_*`), Midtrans, Biteship, Mailtrap.

## Moving to real hosting (VPS)

Planned: a VPS (see the infra roadmap). `backend/Dockerfile`, `backend/docker/entrypoint.sh` and
`docker-compose.yml` are kept for that. When the backend moves, only repoint the `api` DNS
record (or the tunnel's `service:`) — the frontend rewrites and cookies need no change.
