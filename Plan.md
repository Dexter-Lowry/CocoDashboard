This document tracks the plan for a Cocoa Beach dashboard product. Phase 1 focused on Android; we are now pivoting to build the web experience first.

## Goal
Ship a modular mobile dashboard where each card is powered by a different API:
- Rocket launch tracker (Launch Library 2 or similar)
- Tide tracker for Cocoa Beach
- Upcoming live music events in the area
- Live beach view (webcam or streaming source)

## Target Platform & Stack
- Android app built with Kotlin + Jetpack Compose (Material 3)
- Retrofit/OkHttp for HTTP, Kotlinx Serialization or Moshi for parsing
- WorkManager or coroutines for periodic refresh
- Simple dependency injection (Hilt or manual ServiceLocator) so each API module is pluggable

## Architecture Outline
1. **Dashboard Shell**
   - Single-activity Compose app with a dashboard screen.
   - `DashboardViewModel` orchestrates loading each card but keeps API logic isolated.
2. **Module Interfaces**
   - Each card implements `DashboardCardController` with methods for `load()`, `refresh()`, and `UiState`.
   - Controllers live in their own packages: `launches`, `tides`, `music`, `liveview`.
3. **Networking & Caching**
   - Shared `NetworkClient` (Retrofit) configured once.
   - Optional local cache (Room or simple in-memory store) so cards render offline.

## API Modules
1. **Rocket Launch Tracker**
   - Source: Launch Library 2 (Cape/KSC filter).
   - Shows next launch details, countdown, pad info.
2. **Tide Tracker**
   - Source ideas: NOAA Tides & Currents or worldtides.info.
   - Shows today’s high/low tides, trend indicator, timestamp.
3. **Live Music**
   - Potential APIs: Bandsintown, Songkick, Ticketmaster.
   - Shows upcoming shows with venue + link to tickets/details.
4. **Live Beach View**
   - Embed a trusted webcam stream thumbnail; tap to open full stream (maybe WebView or external intent).

## Data Flow
- App start → Dashboard screen requests each controller to load.
- Controllers fetch remote data via Retrofit service + mapper → emit `Loading`, `Success`, or `Error`.
- Compose observes state flows and renders cards accordingly.
- Pull-to-refresh triggers `refresh()` on all controllers.

## Web Pivot (Primary Focus)
- **Goal**: Launch a responsive web dashboard (desktop + mobile browser) with the same four modules before returning to the Android client.
- **Stack**: Vite + React + TypeScript, Tailwind (or CSS Modules) for styling, TanStack Query for API data fetching/caching.
- **Deployment**: Netlify/Vercel or GitHub Pages for quick sharing; use environment variables for API keys.

### Web Architecture Outline
1. `apps/web` (new folder) bootstrapped with Vite React TS template.
2. Shared layout with a dashboard grid; each module lives under `src/modules/{launches|tides|music|liveview}` with:
   - `types.ts` (response + UI models)
   - `api.ts` (fetch helpers)
   - `Card.tsx` (UI component)
   - `useData.ts` (React Query hook)
3. Global providers: Theme (light/dark), QueryClientProvider, and a simple settings context to hold API keys or feature flags.

### Immediate Web Tasks
1. Scaffold Vite React TS project inside `apps/web`.
2. Add global styles, theme tokens, and a responsive grid layout with placeholder cards mirroring the Android design.
3. Wire mock data + loading states for each card so the dashboard feels alive before integrating real APIs.
4. Research APIs + authentication flows (LL2, NOAA/worldtides, Songkick/Bandsintown, webcam provider) and document required keys in `apps/web/README.md`.
5. Implement Launch card end-to-end, then Tide, Music, Live View in that order (one PR each).
6. Add integration smoke tests (Playwright or React Testing Library) to ensure critical modules render without crashing.
7. Only after the web version is feature-complete, resume Android development so both clients share the same API contracts.
