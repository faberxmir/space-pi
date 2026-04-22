# space-pi game design

Living design document for the space-pi wargame. Captures decisions that are locked in, open questions still under discussion, and the infrastructure the game requires. Update as decisions are made. When a section contradicts older notes, the newer section wins — don't keep stale options around.

## Premise

Two or more students pilot spaceships on a shared network. The ships are physical 3D-printed models (Raspberry Pi 3B+) with LED muzzles, an OLED display, and a buzzer. Students act on each other through commands that map to real networking primitives: ARP, DHCP, DNS, ICMP, routing, and firewalling. Winning requires thinking about network structure, not just reflexes.

## Current implementation state (game mechanisms)

As of this writing, the Pi-side ship software already does the following:

- On boot, reads `cockpit/pilot.json` for ship name, pilot name, and profile picture.
- If the config is empty, the OLED shows the ship's IP address and `NO_PILOT`, indicating the seat is unclaimed.
- A student claims a ship by SSH-ing into the Pi, editing `cockpit/pilot.json`, putting in name, shipname, and a pilot image.
- Once claimed, the ship exposes a web terminal that the student uses to issue game commands. The web UI is how the pilot plays; SSH was only the onboarding ritual.
- The web terminal currently has no authentication. Anyone who navigates to a claimed ship's web page can access anything accessible on the web page.

## Current implementation state (hardware and hardware access)
- the system boots in phase based manner, making sure that all systems are accessible, or it fails.
- There are working modules for handling buzzer, the shift register controlling the lights, and the oled.
- There are a few functions implemented to do actions with leds and buzzer.

The rest of this document describes the game that gets built on top of this foundation.

## Pedagogical goals

Players should end a session with working intuition for:

- IP addresses as identity, and the relationship between address, mask, and subnet membership.
- Broadcast domains (L2) versus routed domains (L3) — why ARP stays local but ping crosses subnets.
- DHCP as the mechanism that grants identity and binds a ship to a network segment.
- VLANs as discrete broadcast domains, addressable only if you know the VLAN ID.
- Name resolution as a convenience layer on top of addressing.
- Firewall rules as specificity-vs-coverage trade-offs (least privilege, written the hard way).

Advanced sessions layer in routing tables, traffic observation, and infrastructure-attack concepts.

## Core design decisions (locked in)

The following have been agreed and should not be revisited without a reason:

- **Real-time play, not round-based.** Action throttling is done per-action cooldown, not by global ticks. Speed of typing doesn't matter; decision quality does.
- **Team-per-subnet is the preferred scale mode.** 1v1 is the MVP. Everything should be designed so that scaling to 2v2 or larger team play doesn't require re-architecture.
- **Combat requires a handshake.** Targeting is a request-ack sequence (maps to TCP three-way handshake) before any fire command is legal. Targets are informed that they've been targeted.
- **Engagement reveals position.** When a ship is targeted or fired on, the attacker's source IP is exposed on the victim's OLED.
- **Energy is the universal currency.** Abilities draw from a regenerating pool. Movement, firewalling, firing, and recon all have costs. No separate ammo.
- **Firewall rules are toggles with idle drain scaled by rule breadth.** A `/32` deny costs little to hold; a `/16` bleeds energy continuously. This enforces specificity without moralising. Toggling the same rule has a cooldown to prevent flicker-exploits.
- **LEDs are muzzle flashes.** Nine guns, purely for visual effect during a fire action. Information display lives on the OLED.
- **Four VLANs, four subnets, four DHCP scopes.** MVP topology. Subnets are routed together (see below).
- **Subnets are routed.** A central router connects the four subnets. Cross-subnet ping and long-range attacks are possible but cost more than same-subnet equivalents. ARP remains subnet-local (physics — broadcast domains don't extend across routers), so ARP-based discovery still requires physical presence on the target subnet.
- **Out-of-band / social communication is allowed.** Shouting across the classroom is part of the game. Real attackers social-engineer; students can too.
- **One credential per ship: the OS password.** SSH and the web terminal both authenticate against the same `student`-user password via PAM. No separate web password, no hash in `pilot.json`.

## Discovery mechanisms (enabled / deferred)

Enabled for MVP:

- **Own-subnet ARP sweep.** Cheap. Finds neighbours. Teaches that broadcast is bounded.
- **DNS / name resolve.** Dynamic registration: on DHCP ACK, the ship registers its callsign against its current IP. `resolve <callsign>` returns the IP; student infers subnet from IP + known netmask. Renaming the ship triggers re-registration, analogous to dynamic DNS update.
- **VLAN sweep via DHCP with VLAN tags.** The explicit movement mechanic. Doubles as reconnaissance because getting a lease on a new VLAN gives you ARP access to that subnet.
- **Cross-subnet ping/probe.** Routed; costs energy; defender's firewall can block.
- **Combat disclosure.** Attacker's IP shown on victim's OLED on any incoming action.

Deferred to later sessions:

- **Gateway interrogation** (ARP cache / route table inspection via router query).
- **Passive traffic observation** (sniff on a trunk-adjacent position; read-only tap on the controller's event log, gated by position and energy).

## Movement mechanic

Movement is entirely mediated by DHCP. A ship does not "fly" to a new subnet in any spatial sense — it renews its lease with a specific VLAN tag and, if the DHCP server on that VLAN responds, is now addressable on that subnet.

The move sequence, player-side:

1. Player issues `move --vlan <id>`.
2. Ship releases its current lease (DHCPRELEASE).
3. Ship sends DHCPDISCOVER tagged with the requested VLAN ID.
4. If that VLAN has a DHCP scope with free leases, an OFFER comes back, followed by REQUEST/ACK.
5. Ship is now on the new subnet, with a new IP, netmask, and gateway.

Consequences, deliberate:

- **In-transit vulnerability.** During the handshake, the ship has no valid address on any subnet. Incoming actions against the old IP miss; the ship cannot fire or defend. Duration is the natural pacing lever — long enough to matter (a few seconds), short enough not to bore.
- **Firewall rules drop on IP change.** New address means old rules no longer apply; the ship reboots its ACL state. Prevents rule-stacking across subnets.
- **Active targeting is broken by movement.** If A has targeted B and B moves, A's target lock is on a stale IP. A has to re-discover and re-handshake.
- **Energy cost proportional to the move.** A same-subnet renew (keeping IP) is cheap; a VLAN change is expensive. Makes movement a committed decision.

Open question on movement: **should a failed DHCP request (no free lease, or no scope on that VLAN) drop the ship into a disconnected state, or bounce it back to its previous lease?** The former is dramatic and realistic; the latter is kinder. Leaning toward disconnected with a manual retry, because "you broke your own connection" is a memorable lesson.

## Infrastructure requirements

To run the MVP we need, in addition to the ship Pis:

### Network fabric

Four VLANs, one /24 subnet each. Mask decision: `/24` for every subnet in MVP, to keep netmask arithmetic uniform. Later sessions can introduce mixed masks as a didactic exercise.

Open decision — **real VLANs or simulated VLANs?**

- *Real* means managed switches with 802.1Q trunking, Pis configured to tag frames, actual L2 segmentation. Authentic, but deployment is a whole project of its own, and any classroom that wants to run this needs the hardware.
- *Simulated* means the game controller tracks which ship is on which VLAN as state, and enforces visibility, routing, and ARP boundaries in software over a single flat LAN. Students experience the same commands and the same constraints; the underlying transport is just UDP to the controller.

Recommendation: simulated for MVP. It makes the game deployable on a single unmanaged switch and a power strip, which is what a classroom actually has. "Real" can be a stretch goal for a networking lab that already has the kit.

### DHCP service

Four scopes, one per VLAN. Each scope issues:

- IP from the VLAN's `/24` range (reserve a few addresses for infrastructure).
- Netmask.
- Default gateway (the router's address on that VLAN).
- DNS server address.
- Lease time — short enough that lapsing matters, long enough that students aren't constantly renewing. Start at something like 120 s and tune.

The DHCP service must honour VLAN tags on incoming requests. In the simulated model this is just reading a `vlan_id` field from the request payload.

### Router / gateway

One logical router with an interface on each of the four subnets. Responsibilities:

- Forward L3 packets (game actions) between subnets when source and destination differ.
- Maintain an ARP cache keyed by subnet (for future interrogation ability).
- Maintain a routing table (for future interrogation ability).
- Enforce the rule that ARP-class traffic does not cross it.

In the simulated model this is a component of the game controller.

### DNS service

Dynamic, authoritative for a single game-domain zone. Registers on DHCP ACK; de-registers on lease expiry or release. A student's name change triggers an update. Reachable from all four VLANs.

Open decision: **callsign format.** Proposal — `<pilot>.<ship>.fleet` so both names participate in the identifier. Team play later can add a team prefix. Needs to be typeable quickly on whatever input device students use.

### Game controller

Central authoritative service. Owns:

- The canonical state of every ship (HP, energy, current lease, active firewall rules, cooldown timers).
- The event log (every action, for later sniff / audit abilities).
- Rule enforcement (handshake validity, energy deductions, firewall checks, cooldowns).
- Broadcasting state changes to ships for display on their OLEDs.

Exposes an API surface the ships talk to over the LAN. Ship-side software sends intents (`move`, `target`, `fire`, `deny`), controller validates and responds.

### Ship client (the Pi)

Runs the existing `src/` bootstrap stack plus new game-logic phases. Responsibilities:

- Present state on OLED (own IP, energy, active rules, incoming alerts).
- Drive LEDs as muzzle flashes on fire events.
- Buzzer for notable events (targeted, hit, lease lost, energy critical).
- Accept player input via the local web terminal (already present). SSH is used only for onboarding / claiming the ship; all in-game commands go through the web UI.

### Per-ship firewall

Managed by ship client in coordination with controller. Rules are toggles. Each active rule:

- Has a cost-to-hold that scales with breadth (narrower = cheaper).
- Drains energy continuously while active.
- Has a minimum lifetime / toggle cooldown to prevent flicker.
- Is cleared on IP change (movement).

## Authentication and session security

The ship has exactly one credential: the OS password for the `student` user (the account baked into the ship image). SSH verifies against that password via the OS. The web terminal verifies against the *same* password by calling PAM. There is no separate web password, no hash stored in `pilot.json`, no password-management tool on the game's side of the line. When the student runs `passwd` to rotate, both auth methods rotate in lockstep because they consult the same source of truth.

This single-credential model carries three lessons at once: the account is the identity, the password is the secret, and SSH versus the web terminal are two authentication *methods* that both consume the same credential. When the student later moves SSH to key-only, the password still exists and still guards the web GUI — which teaches that disabling one auth method doesn't delete the account secret.

Deliberately out of scope: cross-ship SSO, password resets, anything that requires a central identity service. The whole point is per-ship sovereignty.

### Security-level ladder

- `OPEN` — `cockpit/pilot.json` has empty pilot / ship / image. Unclaimed. The ship advertises its availability on the OLED (IP + `NO_PILOT`). No web-terminal login is offered, because there is no identity configured yet. *Already partially implemented via `cockpit_up.js`.*
- `CLAIMED` — `pilot.json` is populated, but the default OS password is still in effect. Anyone who knows that password — which is everyone, since it's openly distributed — can SSH in or log into the web terminal. Functional but wide open. The ship should nag the pilot on both surfaces to rotate the password.
- `LOCKED` — the default password has been changed. The student is the only one who can log in, by either method. Minimum responsible state for classroom play.
- `HARDENED` — `LOCKED`, plus the effective sshd configuration has `PasswordAuthentication no` and `~/.ssh/authorized_keys` contains at least one key. SSH requires the student's private key; the password still authenticates the web GUI.

### Detection

- `OPEN` vs `CLAIMED` — already detected today via `isPilotConfigured()` in the cockpit watcher.
- `CLAIMED` vs `LOCKED` — the ship attempts a PAM authentication using the known default password. Success means the password is still default; failure with "invalid credentials" means the student has rotated. The default password is baked into the image (it's openly distributed anyway) and exposed to the detector as an `.env` value. The result is cached and re-checked on startup and on demand.
- `LOCKED` vs `HARDENED` — two unprivileged reads. Scan `/etc/ssh/sshd_config` and `/etc/ssh/sshd_config.d/*.conf` for the effective `PasswordAuthentication` directive (pragmatic "last uncommented match outside a Match block" parser is sufficient for classroom ships). Count non-comment lines in `~/.ssh/authorized_keys`.

### Web terminal login

Unauthenticated requests to any game route are redirected to `/login`. The login page presents a username field (pre-filled with the configured pilot name, editable) and a password field, posts to `/login`, and on success issues a session token as an HTTP-only cookie. On failure it records the attempt (see below) and re-renders with an error.

Sessions are in-memory, indexed by random token, with a creation time and a TTL sourced from `.env`. Ship reboot invalidates all sessions — a minor teaching moment, not worth persisting for MVP. Sessions are **not** bound to the ship's IP: movement (a core mechanic in later iterations) changes the URL but not the pilot's identity, so a session survives a VLAN change. The pilot reconnects at the new URL — eventually by callsign once DNS exists — with the same token.

### PAM integration

The web server needs to ask the system "is this password correct for this user?" without running the node process as root. Two acceptable implementations; decision deferred until we see how the Pi reacts to the install:

1. A Node native PAM binding such as `authenticate-pam`. Requires `libpam0g-dev` and a compile step during image build. Gives a clean async API.
2. A small setuid-root helper binary (C, ~30 lines) that reads `user\npassword\n` on stdin and exits 0/1. Node `spawn`s it. Standard Linux login pattern; isolated and auditable; keeps the node process fully unprivileged.

Leaning toward option 1 for developer ergonomics, with option 2 as a fallback if the native module proves painful on Pi 3B+.

### Login failure disclosure and rate limiting

Consistent with the broader "engagement reveals position" theme, auth probes are treated as engagements:

- Every failed login is logged server-side with source IP, timestamp, and attempted username.
- The OLED briefly displays the source IP of the failed attempt, so the pilot sees they're being probed.
- Rate limit: after N failures from the same source IP within M seconds, further attempts from that IP are rejected for T seconds. All three values live in `.env`; suggested defaults N=5, M=60, T=60. Tune during playtesting.

### Security-level display

- **OLED.** A short label on the status screen (e.g. `SEC: LOCKED`). At `CLAIMED` the label alternates with a nag string so the pilot can't miss that the password is still the default.
- **Web UI.** A badge in the shared header partial, color-coded: `OPEN` grey, `CLAIMED` red, `LOCKED` yellow, `HARDENED` green. The badge links to a short explainer page describing how to advance.
- Level changes are picked up live. When the student runs `passwd` in their SSH session, the next security re-check (on an interval, or triggered by a button in the web UI) updates the badge.

### Upgrade paths (post-MVP)

- Game-mechanic bonuses for higher security levels — small passive advantages (energy regen, reduced sniff footprint, etc.) that reward hardening with play advantage.
- SSH-key challenge-response for the web GUI itself, so the same private key signs into both surfaces. Currently orthogonal; the password-via-PAM path is sufficient and keeps the single-credential story clean.

## Energy model (first-pass numbers, to be tuned)

Numbers here are placeholders so the model has shape; real values come out of playtesting.

- Pool size: 100.
- Regen: +2 per second.
- Same-subnet ping: 2 energy.
- Cross-subnet ping: 5 energy.
- DNS resolve: 1 energy.
- Target handshake: 5 energy.
- Fire (same subnet): 10 energy.
- Fire (cross subnet): 20 energy.
- Move to new VLAN: 30 energy + unavailable during handshake.
- Deny rule `/32`: 3 to set, 0.1/s to hold.
- Deny rule `/24`: 10 to set, 1/s to hold.
- Deny rule `/16`: 25 to set, 4/s to hold.

All numeric values will live in `.env` / config, not in code (per project standards).

## Open questions

Tracked here so nothing quietly falls off:

- Real vs simulated VLANs for MVP. *Leaning simulated.*
- DNS callsign format. *Proposed `pilot.ship.fleet`.*
- Web terminal auth mechanism. *Decided: use the OS password verified via PAM; single credential shared with SSH. PAM integration approach (native module vs setuid helper) deferred to implementation time.*
- Which passive bonus `HARDENED` ships should get. *Options on the table; pick one during balance tuning.*
- Behaviour on failed DHCP request (disconnected vs bounce back). *Leaning disconnected.*
- Lease duration. *Start at 120 s, tune.*
- How HP is represented on the OLED given the LEDs are muzzles not damage.
- Win condition. *Presumably first to reduce opponent's HP to zero, but session-length constraints may demand a timer.*

## Next steps

1. Decide real vs simulated VLANs and the input-device question — both shape the infrastructure implementation.
2. Sketch the game-controller API surface (what messages ships send, what they receive back).
3. Prototype the movement mechanic end-to-end (DHCP renew with tag → lease issued → IP changed → OLED updated) before anything else, because it's the backbone everything else depends on.
4. Then combat handshake, then firewalls, then discovery abilities beyond own-subnet ARP.
