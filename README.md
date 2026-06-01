# Known Dashboard
The companion app for Known, the on-device network privacy monitor by
Northsline. It connects to the Known device over
your local network, pulls the weekly audit, and shows every conversation your
devices are having, on your own machine.

Known is a **passive monitor**: it logs and analyzes DNS queries and shows you
what's happening on your network. It does **not** block, redirect, or interfere with traffic: every connection goes through normally. The dashboard shows what happened, not "what iit blocked."

![Dashboard screenshot](static/dashboard_screenshot.png)

## Stack

- **SvelteKit** (Svelte 5 runes) + **Vite** + **TypeScript**
- Static adapter, ships as a self-contained client bundle with no server
- No runtime dependencies beyond the framework

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run check    # type-check (must be clean)
npm run build    # outputs to ./build
npm run preview  # serve the production build locally
```

## Setup flow (first run)

1. **Sticker gate.** With no stored device code, the app opens to a full-screen
   onboarding gate. Enter the code from the sticker on the underside of your
   Known: format `KNOWN-XXXX-XXXX` (segments are `[A-Z0-9]`).
   - The two segment fields auto-advance, accept pastes of the whole code, and
     validate on format. A bad code shakes and shows an inline error.
   - "Remember this device" (on by default) persists the code to
     `localStorage` under `known:sticker`, so the gate is skipped next time.
2. **Searching.** Once a code is accepted, the app enters the dashboard and
   begins discovery. Until a device answers, every surface shows its empty /
   searching state, and the global connection banner reports that the Known is
   not yet detected.
3. **Reset.** "Reset device" in the sidebar footer clears the stored code and
   returns to the gate.

## Connection architecture

The UI never holds business logic. State lives in a single runes store
([`src/lib/stores/known.svelte.ts`](src/lib/stores/known.svelte.ts)); components
read derived views from it. The store talks to the device through one seam:

- [`src/lib/api/client.ts`](src/lib/api/client.ts): `KnownClient`, the device
  connection. It will discover the Known on the local network (mDNS /
  `known.local`), authenticate with the sticker code, and stream events over
  HTTP + WebSocket.

**This is currently a scaffold.** Every method resolves to "nothing found"
(`connect()` returns `false`, `fetchEvents()` returns `[]`, etc.) so the app
exercises its searching and empty states end to end. To make the dashboard live,
implement the `KnownClient` method bodies; the store and components already
consume the right shapes (see [`src/lib/types.ts`](src/lib/types.ts)).

Connection lifecycle on the store:

- `start()`: called on mount once onboarded; instantiates the client and runs
  discovery.
- `discover()`: retry discovery (wired to the TopBar **Connect** button).
- `connected` / `connecting` / `paused`: drive the global connection banner and
  the disabled states of the Pause / Connect / Export controls.


## Local QA with simulated data

For design and QA you can replay simulated traffic without a device. Flip the
flag in [`src/lib/config.ts`](src/lib/config.ts):

```ts
export const DEV_MOCK = true;
```

The mock modules ([`src/lib/data/generate.ts`](src/lib/data/generate.ts),
[`src/lib/data/static.ts`](src/lib/data/static.ts)) are dynamically imported
only when this is `true`, so production builds tree-shake them out. Leave it
`false` for shipping builds. Static detection metadata lives separately in
[`src/lib/data/detections.ts`](src/lib/data/detections.ts) (used in production,
not mock data, kept apart so importing it never drags the mock device list into
the bundle).

## Sticker code format

```
KNOWN-XXXX-XXXX        X in [A-Z0-9]
^^^^^ fixed prefix
      ^^^^ ^^^^ two editable 4-char segments
```

Validation is format-only for now (`/^KNOWN-[A-Z0-9]{4}-[A-Z0-9]{4}$/`,
in `src/lib/config.ts`). Server-side and device-side validation arrive with the
real `KnownClient`.

## Internationalization

Lightweight, dependency-free. All UI copy lives in
[`src/lib/i18n/en.ts`](src/lib/i18n/en.ts) as a typed `Dict`; components import
the active dictionary as `t` from [`src/lib/i18n`](src/lib/i18n/index.ts) and
read e.g. `t.onboarding.welcome`. v1 is **English-only**. To add a locale later:
create `xx.ts` satisfying `Dict`, register it in `index.ts`, and point
`activeLocale` at a stored or `navigator` preference.


## Project shape

```
src/
  lib/
    api/client.ts        KnownClient - device connection scaffold
    components/          Sidebar, TopBar, StickerGate, EmptyState, cards, charts
    config.ts            DEV_MOCK flag, storage keys, sticker regex
    data/detections.ts   static DETECTIONS metadata (production, not mock)
    data/{generate,static}.ts   DEV-only mock generator + seed data
    i18n/                en.ts (Dict) + index.ts (active `t`)
    stores/known.svelte.ts   central runes store + connection lifecycle
    styles/app.css       design system (tokens, primitives)
    types.ts             domain model (NetEvent, Device, AllowEntry...)
    utils.ts             formatting helpers
  routes/
    +layout.svelte       gates the app behind onboarding; mounts shell + banner
    +page.svelte         Monitor: stats, traffic chart (1h/6h/24h), live feed, alerts
    manage/+page.svelte  Manage: device grid + allowlist rules
```

The app is two surfaces, kept deliberately small so it maps cleanly onto the
device and is easy to keep in sync:

- **Monitor** (`/`)  at-a-glance stats, the traffic chart with a 1h/6h/24h
  range toggle, the searchable/filterable live event feed, the detections
  breakdown, and the top alert.
- **Manage** (`/manage`)  the device grid (All / Flagged / Watched / Trusted)
  and the allowlist (add rules + active rules).

## Out of scope (tracked elsewhere)

Real Pico API implementation, device-side sticker validation, desktop packaging and actual mDNS network discovery.
