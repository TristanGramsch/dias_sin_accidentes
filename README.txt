Dias Sin Accidentes
===================

Digital safety board for Optoelectrónica Icalma deployed across dev, prod, and Ecolab environments.

What’s here
- `src/`: Express server with HTTPS support, admin password flow, daily counter scheduler, Chile timezone helpers.
- `public/`: Single-page UI showing days without accidents, record, admin modal, and blue hero box.
- `data/`: JSON storage location (ignored in Git); `data.prod.json` / `data.test.json` kept locally for service use.
- `systemd-services/`: Unit files for dev/prod/Ecolab instances with centralized cert paths.
- `Certs/`: TLS assets from CPanel (ignored by Git) referenced by systemd and Docker.
- `credentials/`: central placeholder for secrets (ignored by Git), e.g. PEMs, .env files.
- `docker/` scripts in `package.json`: build/run dev container on port 3001 with mounted data/logs.
- `instructions.txt`: original spec and operational requirements.

Key behaviors
- Counter auto-increments once per Chile day via scheduler but only updates `recordAnterior` when admins submit it.
- Admin passwords resolved as: env `ADMIN_PASSWORD`, dev override `DEV_ADMIN_PASSWORD`, fallback `jefecito`.
- Optional HTTP mode when `ALLOW_HTTP_IN_PRODUCTION=1`.
- `/api/config` exposes branding per instance (e.g., Ecolab logo via `BRAND_LOGO_URL`).
- `/api/track` for lightweight usage tracking (client events, API calls logged to `logs/usage.log`).

Common commands
- `npm install`
- `npm run dev`
- `npm test`
- `npm run docker:up`

Docker
- Build: `npm run docker:build`
- Run: `npm run docker:run` (mounts `data/` and `logs/`)
- Stop: `npm run docker:stop`

Auto-restart
- Systemd unit samples under `systemd-services/` include `Restart=always`.
- Docker run uses `--restart unless-stopped` for resilience.

Credentials
- Place PEMs and secrets in `credentials/` (ignored by Git) or `Certs/`.
- Provide runtime env via `.env` or `docker/.env.dev`.

Environment variables
- `ADMIN_PASSWORD`, `DEV_ADMIN_PASSWORD` (dev), `INSTANCE_NAME`, `BRAND_NAME`, `BRAND_LOGO_URL`
- `CERT_PATH`, `KEY_PATH`, `CA_PATH` (if terminating TLS in app; otherwise use reverse proxy)

CI/CD (mock)
- Use the `ensayo` branch to deploy to ensayo URL via reverse proxy to port 3001.
- Use the `main` or `prod` branch to deploy to production URL to port 3002.
- `ecolab` branch deploys to port 3003 and sets `BRAND_LOGO_URL` to a company logo.

Mock pipeline
- Branch `ensayo` -> build/test -> deploy to port 3001 (reverse-proxied by `ensayo-dias-...`).
- Branch `main` or `prod` -> build/test -> deploy to port 3002 (`dias-sin-accidentes...`).
- Branch `ecolab` -> build/test -> deploy to port 3003 with `BRAND_LOGO_URL`.
- On failure, leave current deployment untouched.

Support files
- `manage.sh`, `update-ddns.sh`, `nginx-config/` retained for legacy orchestration.
- TLS certificates must be populated under `Certs/{dev,prod,ecolab}` before enabling HTTPS.
