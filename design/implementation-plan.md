# space-pi implementation plan

How this document works: iterations are ordered in the sequence we intend to build them. Each iteration lists its goal, scope, and concrete deliverables. When a deliverable is implemented, mark it done in place (strike through, tick, or move to a "completed" section at the bottom of the iteration) — or delete it outright if it's fully superseded. The plan should always reflect the current state of the codebase, not a historical snapshot.

Terminology note: "iteration" in this document is a development milestone. "Phase" is reserved for bootstrap phases in `src/bootstrap/phases/` and should not be used for dev milestones — the two words were colliding and we've chosen separate terms to keep them distinct.

Detailed planning lives in the active iteration only. Iterations 2 and beyond are short outlines and will be fleshed out when we're closer to starting them — premature detail there tends to go stale.

## Iteration sequence (proposed)

1. **Secure ship claim.** Claim flow end-to-end, web terminal authenticated via OS password through PAM, security-level ladder. *Active.*
2. **Game controller scaffolding.** Central authoritative service ships talk to; state model; event log.
3. **Movement prototype.** Simulated VLANs; DHCP-tag-based subnet change; OLED reflects identity change.
4. **Minimum-viable discovery.** Own-subnet ARP sweep; combat disclosure on incoming actions; callsign-addressable web UI (DNS).
5. **Combat.** Targeting handshake, fire action, LED muzzle flashes, OLED alerts, HP model.
6. **Firewalls + energy.** Per-ship deny rules as toggles; specificity-scaled cost and idle drain; energy pool.
7. **Extended discovery.** Cross-subnet ping/probe; gateway interrogation.
8. **Advanced abilities.** Passive traffic sniffing; any remaining recon abilities.
9. **HARDENED tier onboarding.** Student-facing helpers and docs for SSH key-only; bonus mechanics tied to security level.
10. **Polish + balance.** Playtesting, tuning numbers, visual polish, teacher-facing docs.

Iteration order is open to revision. Iterations 2 and 3 in particular are interchangeable depending on how we want the first demo to feel — game-controller-first gives us infrastructure to build against; movement-first gives us a visible player-facing mechanic earlier.

---

## Iteration 1: Secure ship claim

**Status:** partially implemented. The claim flow's foundations are in place; remaining work is authentication, security-level awareness, and onboarding docs.

**Goal.** A student can securely claim a ship end-to-end: SSH in with the default password, fill in `cockpit/pilot.json`, rotate the OS password, and log into the web terminal using that same new password. The ship visibly reports its security level on both the OLED and the web UI and rewards hardening to `HARDENED`. No game content is required after login — the terminal lands on the existing command interface.

**Out of scope.** Any game mechanic: no targeting, firing, movement, energy, firewalls, or discovery. Those are later iterations.

### What's already in place

Relevant existing code, so we don't rewrite it:

- `cockpit/pilot.json` exists and defines `shipName`, `pilotName`, `pilot_image`.
- `src/bootstrap/phases/cockpit_up.js` watches `pilot.json` and responds to board/depart events with OLED updates, LED sequences, and buzzer fanfares. It already distinguishes `OPEN` (unclaimed) from `CLAIMED` via `isPilotConfigured()`.
- `src/bootstrap/phases/routes_up.js` starts the HTTP server and runs the initial presence/absence response on startup.
- `src/bootstrap/phases/terminal_up.js` attaches a terminal service driven by `src/config/terminal-commands.json`.
- `src/http/app.js` wires the Express app together. `src/http/routes/terminal_routes.js` handles `POST /terminal/:command`. `src/http/routes/page_routes.js` renders `index` and `api-docs` via EJS. Views live under `views/` with shared partials in `views/partials/`.
- Static assets are served from `public/`; cockpit assets (e.g. profile image) from `/cockpit`.

This iteration adds auth on top of this without disturbing the existing shape.

### Security mechanism (full description)

See `design/gamedesign.md` → "Authentication and session security" for the canonical design. Summary here:

**Single credential.** The ship has one secret: the OS password for the `student` user. SSH verifies via the OS. The web terminal verifies against the same password by calling PAM. No separate hash lives in `pilot.json`; no password tool is needed on the game side.

**Four-level ladder.**

- `OPEN` — `pilot.json` unconfigured. Already detected today.
- `CLAIMED` — `pilot.json` populated, default OS password still valid. Anyone who knows the default can SSH in or log into the web terminal.
- `LOCKED` — default OS password no longer valid (student ran `passwd`). Student is sole authenticator for both methods. Minimum classroom state.
- `HARDENED` — `LOCKED`, plus effective sshd config has `PasswordAuthentication no` and `~/.ssh/authorized_keys` has at least one key.

**Detection.**

- `OPEN` vs `CLAIMED` — already handled by `isPilotConfigured()`.
- `CLAIMED` vs `LOCKED` — attempt a PAM authentication with `student` and the known default password (sourced from `.env`). Success = default still active. Failure = student rotated.
- `LOCKED` vs `HARDENED` — scan `/etc/ssh/sshd_config` and `/etc/ssh/sshd_config.d/*.conf` for the effective `PasswordAuthentication` directive; count non-comment lines in `~/.ssh/authorized_keys`. Both unprivileged reads.

**PAM integration.** The node process needs a way to ask PAM to verify a password without running as root. Two acceptable implementations; decision deferred to implementation time:

1. A Node native PAM binding (e.g. `authenticate-pam`). Clean API; requires `libpam0g-dev` and native compile during image build.
2. A small setuid-root helper binary that reads `user\npassword\n` on stdin and exits 0/1. Node `spawn`s it. Keeps node fully unprivileged.

### Iteration 1 deliverables checklist

Mark items done or remove them as they land.

**Auth plumbing**

- [ ] Wire up PAM: try `authenticate-pam` native module first; fall back to a setuid helper if the native install proves painful on Pi 3B+.
- [ ] Document the default `student` password in `docs/pi-deploy.md` or `docs/pi_setup.md`, and expose it to the ship process as an `.env` value (e.g. `DEFAULT_STUDENT_PASSWORD`) so the security-level detector can test against it.
- [ ] Session store service (in-memory map keyed by random token, with TTL from `.env`). Attach to `context` from a new bootstrap phase.
- [ ] Express auth middleware that requires a valid session cookie on all non-login routes and redirects unauthenticated requests to `/login`. Apply it in `src/http/app.js` before the existing route mounts.

**Login UI and routes**

- [ ] `GET /login` renders `views/login.ejs` (re-uses `views/partials/head.ejs` / `foot.ejs`). Username field pre-fills from `pilot.json`; editable.
- [ ] `POST /login` verifies username + password via PAM; on success issues a session cookie and redirects to `/`; on failure records the attempt and re-renders with an error.
- [ ] `POST /logout` clears the session and redirects to `/login`.
- [ ] `public/login.css` for page-specific styling (per the project's per-page CSS rule).
- [ ] Update `views/api-docs.ejs` to document `/login`, `/logout`, and `/security` (per the project's "update docs when routes change" rule).

**Security-level detector**

- [ ] New service at `src/services/security/index.js`. Combines `isPilotConfigured()`, a PAM default-password check, an sshd config scan, and an authorized_keys count. Returns one of `OPEN | CLAIMED | LOCKED | HARDENED`. Caches the result; re-computes on demand and on an interval.
- [ ] New bootstrap phase `src/bootstrap/phases/security_up.js` that instantiates the detector and attaches `context.securityService`.
- [ ] Wire the phase into `src/bootstrap/index.js` after `cockpit_up`.

**Display**

- [ ] Extend `src/services/oled/oled_status.js` (or the status screen it drives) to include the security level as a short label. At `CLAIMED`, alternate with a nag string (e.g. `SET PASSWORD`).
- [ ] Add a security badge to the shared header partial (`views/partials/head.ejs`), color-coded. Rendered from a value passed in by `page_routes.js` via `securityService.currentLevel()`.
- [ ] `GET /security` returning the current level as JSON, so the UI can refresh the badge without a full reload.
- [ ] Explainer page (`views/security.ejs` + route in `page_routes.js`) describing each level and how to advance.

**Login failure handling**

- [ ] Rate limiter on `/login` using `.env` thresholds (default N=5, M=60, T=60).
- [ ] Server-side log of failed attempts (source IP, timestamp, attempted username).
- [ ] OLED briefly displays source IP of failed attempts. Extend the OLED service with a short-lived "toast" path if one doesn't exist.

**Documentation**

- [ ] `docs/claim-a-ship.md` walking a student through `OPEN` → `CLAIMED` → `LOCKED` → `HARDENED` with exact commands, framed in terms of which security level each step unlocks.
- [ ] Update `docs/pi-deploy.md` (and/or `docs/pi_setup.md`) with the PAM dependency install step and the default-password convention.

**`.env` additions**

- [ ] `DEFAULT_STUDENT_PASSWORD=<value>` — used by the security-level detector.
- [ ] `SESSION_TTL_SECONDS=3600` (tunable).
- [ ] `LOGIN_RATE_MAX=5`, `LOGIN_RATE_WINDOW_SECONDS=60`, `LOGIN_RATE_PENALTY_SECONDS=60`.

### Open questions in iteration 1

- PAM via native module vs setuid helper. Decide at implementation time; lean native.
- Whether the web terminal should be served at all in `CLAIMED` state. *Leaning: serve it with a visible nag*, so the student experiences the vulnerability rather than being protected from it.
- Detection frequency for `LOCKED`/`HARDENED` re-checks. PAM auth on every request is wasteful; startup + on-demand + a periodic recheck (e.g. every 30 s) is the probable shape.
- Whether the process should run as `student` with `shadow` group membership (simpler but more permissive) or as a less-privileged user delegating to a setuid helper (tighter isolation).

---

## Iteration 2 and beyond

Outlines only. Detail when active.

**Iteration 2 — Game controller scaffolding.** Central authoritative service for ship state; action/event log; API surface ships use to send intents and receive updates. Decide process boundary (own service vs. coroutine of a "lead" ship vs. runs on a teacher laptop).

**Iteration 3 — Movement prototype.** Simulated VLAN model in the controller. `move --vlan <id>` command from the web terminal. Handshake delay and in-transit disconnection. OLED reflects new IP.

**Iteration 4 — Minimum-viable discovery.** Own-subnet ARP sweep; combat disclosure on incoming actions; dynamic DNS so ships are reachable by callsign.

**Iteration 5 — Combat.** Target handshake sequence, fire action, LED muzzle flash mapped to firing, OLED alerts for incoming actions, HP reduction, defeat condition.

**Iteration 6 — Firewalls and energy.** Per-ship deny rules (toggle), specificity-scaled cost and idle drain, energy pool with regen, cost table driven by `.env`.

**Iteration 7 — Extended discovery.** Cross-subnet ping and probe; router/gateway interrogation exposing ARP cache and route table; cost and gating rules.

**Iteration 8 — Advanced abilities.** Passive sniffing on trunk-adjacent positions; any remaining recon abilities.

**Iteration 9 — HARDENED tier onboarding.** Helpers and docs for SSH key-only setup; game-mechanic bonuses tied to `HARDENED` security level.

**Iteration 10 — Polish and balance.** Playtest sessions, tune energy costs and cooldowns, visual polish, teacher-facing docs for running a session.
