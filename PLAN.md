# Auto Code Redeemer v2 — Implementation Plan

> See **[AGENTS.md](./AGENTS.md)** for conventions, stack, and agent rules.

## Phases 1–6b ✅ COMPLETE

## Phase 7 — Azure VM / Docker Deployment ⏳ NOT STARTED

> **Design rule:** one running container = one **account + game** pair. Do not run multiple games or multiple accounts in a single container.

### Why one instance per (user × game)

| Dimension | Per instance | Shared across instances |
|-----------|--------------|-------------------------|
| `GAME_ID` | one game | — |
| Credentials | one email/password (+ server) | — |
| Code store | `<CODE_STORE_BASE_PATH>/<GAME_ID>/codes.json` | base path can be same mount root |
| Chrome profile | one `CHROME_USER_DATA_DIR` | — (never share between concurrent containers) |
| Cron schedule | one daily run | — |

Same Hoyoverse email may be used for Genshin and HSR, but each game still gets its **own container**, **own `.env`**, **own code JSON**, and **own Chrome profile volume**. Concurrent containers must not mount the same profile directory.

---

### Planned repo layout (deployment only)

```
deploy/
├── Dockerfile                      # shared image (Node 20 + Chromium)
├── docker-compose.yml              # optional: all instances on one host
├── .env.template                   # copy per new instance (not committed)
└── instances/
    ├── alice-genshin/
    │   └── .env                    # GAME_ID=genshin, GENSHIN_* creds
    ├── alice-hsr/
    │   └── .env                    # GAME_ID=hsr, HSR_* creds
    └── bob-genshin/
        └── .env                    # different account, same game
```

Instance folder name convention: `{accountLabel}-{gameId}` (e.g. `alice-genshin`). Used for volume paths and compose service names only — not read by the app.

---

### Dockerfile (to implement)

- [ ] Base: `node:20-bookworm-slim` (or Azure-compatible image)
- [ ] Install Chromium + deps required by `puppeteer-core`
- [ ] `npm ci` → `npm run build` → default `CMD` runs `npm run cron:prod`
- [ ] `EXECUTION_MODE=cron` and `HEADLESS=true` baked or set via env
- [ ] `CHROME_EXECUTABLE_PATH` points to container Chromium binary
- [ ] Run as non-root where possible; add Chrome sandbox flags if needed (`--no-sandbox`, `--disable-dev-shm-usage` for Docker)
- [ ] No secrets in image layers

---

### Per-instance `.env` (registration checklist)

When adding a **new user** or **new game**, create a new folder under `deploy/instances/<name>/` and a dedicated `.env`:

| Variable | Notes |
|----------|--------|
| `EXECUTION_MODE` | `cron` in Docker |
| `GAME_ID` | `genshin`, `hsr`, etc. |
| `CODE_STORE_BASE_PATH` | e.g. `/data/codes` (mounted volume) |
| `CHROME_USER_DATA_DIR` | e.g. `/data/chrome` (mounted volume, unique per instance) |
| `CHROME_EXECUTABLE_PATH` | Container Chromium path |
| `HEADLESS` | `true` |
| `CHROME_DEBUG_PORT` | Default ok if only one Chrome per container |
| Game credentials | `GENSHIN_*` or `HSR_*` matching `GAME_ID` |

**New user, same game:** copy an existing instance template → change credentials + instance name → new Chrome + code volumes.

**Same user, new game:** copy template → change `GAME_ID` + game credential vars → **new** instance folder and volumes (code store auto-segregates by `GAME_ID`; profile must not be shared concurrently).

---

### Docker Compose pattern (one service = one instance)

Each service:

- Builds from shared `Dockerfile` (or uses a published image tag)
- `env_file: ./instances/<name>/.env`
- Unique service name: `redeemer-<accountLabel>-<gameId>`
- Volumes:
  - `./instances/<name>/data/codes:/data/codes` — persists redemption JSON
  - `./instances/<name>/data/chrome:/data/chrome` — persists Hoyoverse login session
- Restart policy: `unless-stopped`
- Schedule: either
  - **A)** external — Azure Container Apps Job / VM cron / GitHub Actions calling `docker compose run` daily, or
  - **B)** in-container cron (e.g. supercronic) invoking `node dist/index.js` once per day

Prefer **A** for simpler logs and one-shot container lifecycle (matches current “run to completion, exit” design).

---

### Registering a new instance (operator runbook)

1. Create `deploy/instances/<accountLabel>-<gameId>/`
2. Copy `.env.template` → `.env`; set `GAME_ID` and game-specific credentials
3. Add compose service block (or a `docker run` script) with unique volume mounts
4. **Bootstrap login (one-time):** Chrome profile must contain a valid Hoyoverse session before headless cron works. Options:
   - Run container once interactively / with VNC on a dev machine, log in manually, persist profile volume; copy volume to server, or
   - Log in locally with the same app, copy `DebugProfile` contents into the instance’s `/data/chrome` volume
5. Run scrape + redeem once manually to verify; then enable daily cron trigger
6. Never commit `.env` or `data/` volumes to git (add to `.gitignore`)

---

### Multi-instance on one VM / host

- Each instance = separate compose service or separate `docker run` with distinct volume paths
- Do **not** reuse `CHROME_USER_DATA_DIR` or `CHROME_DEBUG_PORT` across running containers on the same host unless ports are explicitly mapped differently per service
- Code store paths can share one host directory root (`CODE_STORE_BASE_PATH=/data/codes`) because `GAME_ID` subfolder prevents collisions **within** one instance; separate instances should still use separate volume mounts for isolation

---

### Azure VM notes

- Same compose / instance model as local Docker
- VM cron: `docker compose -f deploy/docker-compose.yml run --rm redeemer-alice-genshin` daily
- Or Azure Container Instances / Container Apps Jobs — one job definition per instance, env + secrets injected from Key Vault
- Secrets: store `GENSHIN_PASSWORD`, `HSR_PASSWORD` in Key Vault / compose secrets, not plain files on shared disks

---

### Phase 7 tasks

- [ ] Add `deploy/Dockerfile`
- [ ] Add `deploy/.env.template` and document instance naming
- [ ] Add `deploy/docker-compose.yml` with at least one example instance service
- [ ] Add `deploy/README.md` (operator runbook: new user, new game, bootstrap login)
- [ ] `.gitignore`: `deploy/instances/**/.env`, `deploy/instances/**/data/`
- [ ] Verify headless Chromium redeem flow in container
- [ ] Document one-time login bootstrap procedure
- [ ] Wire VM / Azure daily trigger (cron or Container Apps Job)

---

## Phase 8 — Cleanup ✅ COMPLETE

- [x] Deleted legacy `scripts/`, `server/`, `src/db/`
- [x] Removed old GitHub Actions workflow
- [x] Removed unused errors, exports, and dead code

---

## Future TODO — Email Reporting

- [ ] `src/reporting/emailReporter.ts`

---

## Changelog

| Date | Phase | Notes |
|------|-------|-------|
| 2026-06-08 | 6 | Terminal prompts for manual scrape + credentials |
| 2026-06-08 | 6b | Single-instance env-only; JSON code store; no MongoDB |
| 2026-06-08 | 8 | Removed legacy folders and dead code |
| 2026-06-08 | 7-plan | Docker/instance model documented — one container per account×game |
