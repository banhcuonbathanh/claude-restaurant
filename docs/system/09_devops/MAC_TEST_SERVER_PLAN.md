# Mac Test Server Plan — Real Operation Experience

> **TL;DR:** The Mac **already serves the full stack on LAN** (Stage A, ✅ since 2026-06-11 —
> setup + gotchas in [`docs/devops/DEPLOY_RUNBOOK.md`](../../devops/DEPLOY_RUNBOOK.md)).
> This plan upgrades it from "a dev box that happens to serve" to an **operated test server**:
> deploys pulled from GitHub like production would, the Mac kept always-on, a daily ops
> routine, and rollback/backup drills — so by the time Stage B (VPS) happens, every
> operational motion has already been practiced. Phases M1–M5 below are the work items.

---

## Goal & Non-Goals

**Goal:** experience real operation — deploy on push, watch dashboards, take backups,
break things and roll back — on hardware you own, before paying for a VPS.

**Non-goals (cannot be proven on the Mac, deferred to Stage B):**
HTTPS/ACME certificates · GHCR image pulls + the real SSH deploy job · payment webhooks
(unless Phase M5 tunnel is used) · real-internet latency.

---

## Phase M0 — Baseline (✅ DONE, Stage A)

Full compose stack on the Mac, phones on shop Wi-Fi hit `http://<mac-ip>`, QR codes printed,
smoke test 8/8. **Do not redo** — daily commands and the 6 known gotchas are in
DEPLOY_RUNBOOK §A2–A3.

---

## Phase M1 — Make the Mac Behave Like a Server (always-on)

| # | Item | How | AC |
|---|---|---|---|
| M1-1 | Never sleep while plugged in | `sudo pmset -c sleep 0 -c disksleep 0` (display may still sleep: `displaysleep 10` is fine) | Stack reachable from a phone after 1 h untouched |
| M1-2 | Docker starts at login | Docker Desktop → Settings → "Start when you log in"; containers already `restart: unless-stopped` | Reboot Mac → stack serves with **zero** manual commands |
| M1-3 | Stable LAN IP | Router DHCP reservation for the Mac (DEPLOY_RUNBOOK already flags this) | IP survives router restart; printed QRs keep working |
| M1-4 | Firewall sanity | System Settings → Firewall: allow `com.docker.backend` (gotcha A3) | Phone loads `http://<mac-ip>` with firewall ON |

---

## Phase M2 — GitHub-Driven Deploys (code is on GitHub — use it)

Simulate the Stage B pipeline with a **pull-based deploy script** (recommended) instead of
exposing the Mac to SSH from CI.

| # | Item | How | AC |
|---|---|---|---|
| M2-1 | `scripts/deploy_mac.sh` | `git fetch && git reset --hard origin/main` (in a **dedicated clone**, e.g. `~/banhcuon-server/`, NOT the dev working copy) → `docker compose up -d --build be fe` → wait 15 s → `curl /health` → on failure print rollback hint | One command takes any pushed commit live on LAN |
| M2-2 | Deploy log | Script appends `date · commit SHA · result` to `~/banhcuon-server/deploy.log` | Every deploy traceable, like CI history |
| M2-3 | Rollback path | `git reset --hard <prev-sha>` + same build — script accepts an optional SHA arg | Roll back to previous commit in < 5 min |
| M2-4 *(optional)* | True push-to-deploy | GitHub Actions **self-hosted runner** on the Mac running M2-1's script on push to `main` | Push → live with no manual step |

> **Why a dedicated clone:** the dev working copy has uncommitted work and a checked-out
> feature branch; a server must only ever run what GitHub `main` has. This also rehearses
> the VPS layout (`/opt/banhcuon` = clean clone + `.env`).
> The Mac builds images locally (`--build`) — the GHCR pull path stays untested until Stage B.

---

## Phase M3 — Daily Operation Routine (the "real operation" part)

| When | Action |
|---|---|
| Open of day | Glance at Grafana `http://<mac-ip>:3001` — error rate ~0, no active alerts |
| After any deploy | `BASE_URL=http://<mac-ip> ./scripts/smoke_test.sh` → 8/8 |
| Nightly (automated) | `launchd` job (Mac's cron): `mysqldump | gzip` to `~/banhcuon-server/backups/`, keep 14 days — mirrors the VPS cron in DEPLOY_RUNBOOK §B4 |
| Weekly | Check disk: `docker system df -v`; prune dangling images from M2 builds: `docker image prune -f` |
| Close of day | Nothing — server stays up (M1) |

---

## Phase M4 — Drills (practice before it's real)

| # | Drill | Pass condition |
|---|---|---|
| M4-1 | **Rollback:** push a commit that breaks `/health`, deploy via M2-1, detect via health check, roll back via M2-3 | Service restored from the previous commit in < 5 min |
| M4-2 | **Restore:** wipe a **copy** of the DB (never `mysql_data` itself) and restore last night's dump into it | Restored DB serves the menu; you trust the backups |
| M4-3 | **Incident:** stop `redis` mid-service (`docker compose stop redis`), observe symptoms on KDS/Grafana, classify per SLA (P0/P1/P2 — [`ROLLBACK_PLAN.md`](../../devops/ROLLBACK_PLAN.md) §1), recover | Symptom → severity → fix documented in one paragraph |

---

## Phase M5 — Optional: Public Tunnel for Payment Sandbox (P7-7)

Only if you want VNPay/MoMo sandbox **before** Stage B: run `cloudflared tunnel` (free, no
account needed for quick tunnels) or `ngrok http 80` → set `WEBHOOK_BASE_URL=https://<tunnel-host>`.

⚠️ Two cautions:
- If customers should use the tunnel URL too, `NEXT_PUBLIC_API_URL` must change → **FE image rebuild** (baked at build time — the #1 Stage A gotcha). For webhook-only testing, leave FE on the LAN IP and change only `WEBHOOK_BASE_URL` (+ `docker compose up -d be`).
- A tunnel exposes the app to the internet with seed passwords (`admin123`...) — change them first, kill the tunnel when done.

---

## Execution Order & Sizing

M1 → M2 (each < 1 session) → M3 (launchd job, < 1 session) → M4 drills (1 session) → M5 only
when P7-7 starts. Register each phase as a row in `docs/tasks/MASTER_TASK.md` before starting it.

---

## Deep Dive Sources

- [`docs/devops/DEPLOY_RUNBOOK.md`](../../devops/DEPLOY_RUNBOOK.md) — Stage A setup, daily commands, gotchas (canonical)
- [GO_LIVE.md](GO_LIVE.md) — how this stage fits the full go-live path
- [MONITORING.md](MONITORING.md) — what to watch during operation
- [`docs/devops/ROLLBACK_PLAN.md`](../../devops/ROLLBACK_PLAN.md) — SLA used in drill M4-3
