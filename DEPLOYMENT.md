# Temporary deploy: Netlify (frontend) + Railway (backend)

Status: **temporary/testing deploy**, not the final infra plan (roadmap Phase 10 is VPS + Docker
Compose for both). This gets the app live on the internet now, on free/cheap tiers.
Cloudflare R2 (file uploads) is live in production as of 2026-08-22. Midtrans (payment) and
Biteship (shipping) credentials are still pending — those two features will not work until added
later — everything else (auth, catalog, cart, orders, chat/notifications via Reverb, email via
Mailtrap, file uploads via R2) works.

Repo: `github.com/djvahd/harmoniclothing` (private). Both Railway and Netlify connect directly to it.

## 1. Railway — backend

Create one Railway **project** containing four services:

| Service | Source | Root directory | Start command override |
|---|---|---|---|
| `mysql` | Railway MySQL plugin | — | — |
| `redis` | Railway Redis plugin | — | — |
| `api` | this repo | `backend` | *(none — uses Dockerfile `CMD ["web"]`)* |
| `reverb` | this repo | `backend` | `/entrypoint.sh reverb` |

Both `api` and `reverb` build from `backend/Dockerfile` (same image, different process — see the
file's header comment). Add the MySQL and Redis plugins first so their variables exist to
reference.

### Env vars — `api` service

Copy from `backend/.env.example` as a base, then override for production:

```
APP_NAME=Harmoni Clothing
APP_ENV=production
APP_KEY=                      # generate locally: php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://<api-service>.up.railway.app

APP_LOCALE=id
APP_FALLBACK_LOCALE=id

BCRYPT_ROUNDS=12
LOG_CHANNEL=stack
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true    # also auto-defaults true when APP_ENV=production, see config/session.php
SESSION_DOMAIN=null

BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=redis
CACHE_STORE=redis

REDIS_CLIENT=phpredis
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}

REVERB_APP_ID=                # any random string, e.g. `openssl rand -hex 8`
REVERB_APP_KEY=                # any random string
REVERB_APP_SECRET=             # any random string
REVERB_HOST=<reverb-service>.up.railway.app
REVERB_PORT=443
REVERB_SCHEME=https

MAIL_MAILER=smtp
MAIL_HOST=live.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=api
MAIL_PASSWORD=<mailtrap API token — already set locally in backend/.env, reuse the same one>
MAIL_FROM_ADDRESS=hello@demomailtrap.co
MAIL_FROM_NAME=Harmoni Clothing
MAILTRAP_API_TOKEN=<same token>

# R2: live in production as of 2026-08-22 (real credentials set on Railway).
# FILESYSTEM_DISK_PUBLIC/PRIVATE must be r2_public/r2_private (not just the
# AWS_* creds) or FileUploadService falls back to the ephemeral local disk.
# league/flysystem-aws-s3-v3 must be a real (non-dev) composer dependency
# for the s3-driver disks to resolve at all — see commit de2a9ad.
FILESYSTEM_DISK_PUBLIC=r2_public
FILESYSTEM_DISK_PRIVATE=r2_private
AWS_ACCESS_KEY_ID=<set on Railway — see `railway variables --service API`>
AWS_SECRET_ACCESS_KEY=<set on Railway — see `railway variables --service API`>
AWS_DEFAULT_REGION=auto
AWS_BUCKET_PUBLIC=harmoni-public
AWS_BUCKET_PRIVATE=harmoni-private
AWS_ENDPOINT=<R2 S3 API endpoint, e.g. https://<account-id>.r2.cloudflarestorage.com>
AWS_URL=<R2 bucket's Public Development URL, e.g. https://pub-<id>.r2.dev — must also be allowlisted in frontend/next.config.mjs>
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
BITESHIP_API_KEY=
BITESHIP_WEBHOOK_TOKEN=

FRONTEND_URL=https://<your-site>.netlify.app
SANCTUM_STATEFUL_DOMAINS=<your-site>.netlify.app
CORS_ALLOWED_ORIGINS=https://<your-site>.netlify.app
```

Notes:
- `${{MySQL.MYSQLHOST}}` etc. is Railway's variable-reference syntax — after adding the MySQL/Redis
  plugins, Railway's variable editor autocompletes these; use the autocomplete rather than typing
  blind, exact names vary slightly by plugin version.
- `CORS_ALLOWED_ORIGINS` isn't in `.env.example` (defaults to `localhost:3000` in
  `backend/config/cors.php`) — it must be set explicitly here or the frontend's API calls will be
  blocked by CORS.
- Generate `APP_KEY` locally with `php artisan key:generate --show` and paste the value — don't let
  it regenerate on every deploy, that would invalidate all sessions and encrypted data each time.
- The Dockerfile's entrypoint runs `php artisan migrate --force` on every boot of the `web` process
  (see `backend/docker/entrypoint.sh`) — fine for this temporary single-instance setup, but don't
  scale the `api` service to multiple instances or migrations could race.

### Env vars — `reverb` service

Same as `api` above (simplest: duplicate the whole set, or use Railway's "shared variables" at the
project level) — Reverb needs `REDIS_*`/`DB_*` too since it shares the same Laravel app boot.

### Networking

- Railway auto-assigns a public `*.up.railway.app` domain per service if you enable "Public
  Networking" in each service's Settings → Networking tab. Enable it for both `api` and `reverb`.
- Reverb's default port is 8080 internally, but Railway's public networking terminates TLS and
  proxies to your service's `$PORT` — the entrypoint script already binds to `$PORT` for both
  processes, so no extra config needed beyond enabling public networking.

## 2. Netlify — frontend

1. "Add new site" → "Import an existing project" → GitHub → `djvahd/harmoniclothing`.
2. Netlify should auto-detect `netlify.toml` at the repo root (base directory `frontend`, build
   command `pnpm install --frozen-lockfile && pnpm build`, `@netlify/plugin-nextjs` plugin). If it
   asks to confirm build settings, they should already be pre-filled from the toml.
3. Env vars (Site settings → Environment variables):

```
NEXT_PUBLIC_API_URL=https://<your-site>.netlify.app
NEXT_PUBLIC_REVERB_APP_KEY=<same value as Railway's REVERB_APP_KEY>
NEXT_PUBLIC_REVERB_HOST=<reverb-service>.up.railway.app
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
```

(Confirmed against `frontend/lib/api.ts` and `frontend/lib/echo.ts` — these are the exact env vars
the frontend code reads.)

**`NEXT_PUBLIC_API_URL` points at the Netlify site itself, not the Railway URL** — `netlify.toml`
proxies `/api/*`, `/sanctum/*`, `/broadcasting/*`, and `/storage/*` through to the Railway `api`
service so Sanctum's session cookie stays first-party (modern browsers increasingly block
third-party cookies, which broke login with a CSRF token mismatch when this pointed straight at
`.up.railway.app`). Reverb's websocket still points directly at Railway since an HTTP redirect
proxy can't carry a WS upgrade.

4. Deploy. Netlify gives you a `https://<random-name>.netlify.app` URL (renameable in Site settings
   → Domain management → Site details, no cost).

## 3. Verify live end-to-end

- Load the Netlify URL, confirm the homepage renders and products load (proves frontend → Railway
  API connectivity + CORS is correct).
- Register/login (proves session/Sanctum cookie + Redis works, and proves Mailtrap email delivery
  for verification emails).
- Open two browser sessions (e.g. customer + admin) and trigger a notification or chat message
  (proves Reverb websocket connectivity).
- Confirm `php artisan migrate` ran cleanly — check Railway's `api` service deploy logs.

## 4. Domain migration — DONE (2026-09-08)

Real domain `harmoniclothing.com` is live (Hostinger registrar, Cloudflare DNS/nameservers, Netlify custom domain + SSL). All of the following were completed:

- `FRONTEND_URL` — set to `https://harmoniclothing.com` on Railway `api`.
- `MAIL_FROM_ADDRESS` — `hello@harmoniclothing.com`, domain verified in Mailtrap (SPF/DKIM/DMARC CNAMEs+TXT added in Cloudflare) — no longer on the shared `demomailtrap.co` testing domain, can now email any recipient, not just the Mailtrap account owner.
- `CORS_ALLOWED_ORIGINS` / `SANCTUM_STATEFUL_DOMAINS` — both include `harmoniclothing.com` and `harmoniclothing.netlify.app` (kept as a fallback) on Railway.
- `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_REVERB_*` — unchanged (backend URL on Railway itself did not change, only the frontend-facing domain did).
- **`netlify.toml`'s `[[redirects]]` targets** (code change) — the `/api/*`, `/sanctum/*`,
  `/broadcasting/*`, `/storage/*` rules hardcode the Railway `api` URL as their `to =` target; update
  if the backend URL changes.
- **`frontend/next.config.mjs`'s `images.remotePatterns`** (code change) — must list whatever
  hostname `NEXT_PUBLIC_API_URL` resolves to (currently the Netlify domain, since image URLs are
  proxied same-origin) or every product/design photo 400s through Next's image optimizer.
