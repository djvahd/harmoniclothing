# Temporary deploy: Netlify (frontend) + Railway (backend)

Status: **temporary/testing deploy**, not the final infra plan (roadmap Phase 10 is VPS + Docker
Compose for both). This gets the app live on the internet now, on free/cheap tiers, while
Midtrans/Biteship/Cloudflare R2 credentials are still pending. Payment, shipping, and file-upload
features will not work until those three are added later — everything else (auth, catalog, cart,
orders, chat/notifications via Reverb, email via Mailtrap) will.

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

# R2: leave FILESYSTEM_DISK_PUBLIC/PRIVATE and the AWS_* values blank until
# real R2 credentials exist — uploads fall back to the container's local
# disk (ephemeral! lost on every redeploy) until these are set. Once R2
# creds exist, set FILESYSTEM_DISK_PUBLIC=r2_public and
# FILESYSTEM_DISK_PRIVATE=r2_private too (not just the AWS_* creds) or
# FileUploadService keeps writing to the ephemeral local disk regardless.
FILESYSTEM_DISK_PUBLIC=
FILESYSTEM_DISK_PRIVATE=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=auto
AWS_BUCKET_PUBLIC=
AWS_BUCKET_PRIVATE=
AWS_ENDPOINT=
AWS_URL=
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
NEXT_PUBLIC_API_URL=https://<api-service>.up.railway.app
NEXT_PUBLIC_REVERB_APP_KEY=<same value as Railway's REVERB_APP_KEY>
NEXT_PUBLIC_REVERB_HOST=<reverb-service>.up.railway.app
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
```

(Confirmed against `frontend/lib/api.ts` and `frontend/lib/echo.ts` — these are the exact env vars
the frontend code reads.)

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

## 4. Domain migration checklist (for later, swapping temp URLs for real domains)

All of the following are env-var-driven — no code changes needed when moving off `.netlify.app` /
`.up.railway.app` to real domains:

- `FRONTEND_URL` (Railway `api`/`reverb`) — drives email link URLs (verify-email, reset-password).
- `MAIL_FROM_ADDRESS` + verify the real domain in Mailtrap (currently using Mailtrap's shared
  `demomailtrap.co` testing domain).
- `backend/config/cors.php`'s `CORS_ALLOWED_ORIGINS` env var (Railway).
- `SANCTUM_STATEFUL_DOMAINS` (Railway).
- `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_REVERB_*` (Netlify) — only if the backend URL also changes.
