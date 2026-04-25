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

**Status: COMPLETE.**

**Goal.** A student can securely claim a ship end-to-end: SSH in with the default credentials from `cockpit/factory-settings.json`, create a user, add it to the OS `pilot` group, create `~/pilot.json`, rotate the OS password, and log into the web terminal using that same password. The ship visibly reports its security level on both the OLED and the web UI.

### What is in place

**Claim flow (group-based):**
- `src/services/cockpit/index.js` — watches `/etc/group` (1 s poll via `fs.watchFile`) for the `pilot` group. 0 members → unassigned/empty; 2+ → unassigned/tooMany; exactly 1 → resolves home dir from `/etc/passwd` and watches `~/pilot.json`. Validates `pilotName`, `shipName`, `pilotImage` (all non-empty strings) and checks file ownership against the group member's uid. Emits `assigned`, `unassigned`, `securityLevel` events. Calls `sessionService.destroyAll()` on unassignment.
- `src/bootstrap/phases/cockpit_up.js` — instantiates the cockpit service, registers event handlers for OLED boarding animation, LED sequence, fanfare, and NO PILOT screen.

**Boarding animation (OLED):**
- `oledService.boardingSequence(pilot, buzzerService)` — four steps: "Ship has been claimed by" slides from bottom to top (2 s, two beeps), pilot name centered (3 s), ship name size-2 (3 s), final status screen.
- `oledService.setRestoreState(snapshot)` — cockpit_up sets this on assignment/unassignment so toast notifications restore to the correct screen.

**Security levels (0 / 1 / 2):**
- Detected inside `src/services/cockpit/index.js` on state change and on a 30 s interval.
- Level 0: factory password still valid. Level 1: exactly one of (password changed, SSH key-only). Level 2: both.
- Web UI: pilot frame glows red/pulse (level 0), green/pulse (level 1), steady blue (level 2) via `.sec-0/.sec-1/.sec-2` CSS classes.

**Authentication (inline terminal):**
- `src/http/routes/auth_routes.js` — `GET /auth/status`, `POST /auth/login` (PAM, rate-limited, OLED toast on failure), `POST /auth/logout`.
- `src/http/routes/terminal_routes.js` — returns 401 when session is missing/expired.
- `src/services/session/index.js` — in-memory token store with TTL and `destroyAll()`.
- `public/js/terminal.js` — state machine: login mode (Linux-style `login:` / `Password:` prompts, POST to `/auth/login`) and shell mode (`$ `, handles `logout` command, switches to login mode on 401).

**Web UI states:**
- Unassigned: matrix animation canvas + factory settings (empty group) or "Too many pilots" (2+ members) in console area. 15 s auto-reload.
- Assigned + not logged in: terminal widget with `data-auth="false"`, starts in login mode.
- Assigned + logged in: terminal widget with `data-auth="true"`, starts in shell mode.

**`.env` keys in use:** `SESSION_TTL_SECONDS`, `LOGIN_RATE_MAX`, `LOGIN_RATE_WINDOW_SECONDS`, `LOGIN_RATE_PENALTY_SECONDS`. Factory password sourced from `cockpit/factory-settings.json`.

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
