Dias Sin Accidentes
===================

Digital safety board for Optoelectrónica Icalma deployed across dev, prod, and Ecolab environments.

What’s here
- `src/`: Express server with HTTPS support, admin password flow, daily counter scheduler, Chile timezone helpers.
- `public/`: Single-page UI showing days without accidents, record, admin modal, and blue hero box.
- `data/`: JSON storage location (ignored in Git); `data.prod.json` / `data.test.json` kept locally for service use.
- `systemd-services/`: Unit files for dev/prod/Ecolab instances with centralized cert paths.
- `Certs/`: TLS assets from CPanel (ignored by Git) referenced by systemd and Docker.
- `docker/` scripts in `package.json`: build/run dev container on port 3001 with mounted data/logs.
- `instructions.txt`: original spec and operational requirements.

Key behaviors
- Counter auto-increments once per Chile day via scheduler but only updates `recordAnterior` when admins submit it.
- Admin passwords resolved as: env `ADMIN_PASSWORD`, dev override `DEV_ADMIN_PASSWORD`, fallback `jefecito`.
- Optional HTTP mode when `ALLOW_HTTP_IN_PRODUCTION=1`.

Common commands
- `npm install`
- `npm run dev`
- `npm test`
- `npm run docker:up`

Support files
- `manage.sh`, `update-ddns.sh`, `nginx-config/` retained for legacy orchestration.
- TLS certificates must be populated under `Certs/{dev,prod,ecolab}` before enabling HTTPS.
