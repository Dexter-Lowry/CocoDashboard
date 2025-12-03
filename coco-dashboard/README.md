# Coco Beach Dashboard (Web-first)

Monorepo for a Cocoa Beach community dashboard. Phase one now targets the web so the experience can launch quickly, while the Android client remains scaffolded for later.

## Project Structure
- `apps/web` - Vite + React + TypeScript dashboard (current focus)
- `app/` - Android app module (Jetpack Compose prototype)
- `Plan.md` - product + architecture plan (tracks both platforms)

## Web App
The web dashboard mirrors the four core modules (Launch tracker, Tide tracker, Live music, Beach cam) with placeholder data + loading states so stakeholders can react to the UX before wiring real APIs.

### Run locally
1. `cd apps/web`
2. `npm install` (first run only)
3. `npm run dev` (or `npm run build && npm run preview` for a production build)

### Implementation Notes
- React + TypeScript via Vite.
- Global styling handled via CSS variables in `src/index.css` plus layout styles in `src/App.css`.
- `src/modules/dashboard` owns card metadata + a `useDashboardCards` hook that currently simulates async loads via mock data.
- Each card renders through a generic `DashboardCard` component so future API modules can share layout + state transitions (loading, ready, error).
- The Rocket Tracker tile already hits Launch Library 2 for Cape/KSC launches and shows a live countdown + CTA to visitspacecoast.com.

## Android App (on pause)
The Compose client remains for future parity work:
- `app/src/main/java/com/cocodashboard/dashboard` – placeholder UI + state models
- `app/src/main/java/com/cocodashboard/ui/theme` – Material 3 theme

To resume Android development:
1. Open the root folder in Android Studio.
2. Sync Gradle (`gradlew` wrapper already configured with AGP 8.5.2 / Kotlin 1.9.24 / Compose Compiler 1.5.14).
3. Run the `app` configuration on an Android 8.0+ emulator/device.

The app currently displays four simulated cards and a Refresh action. Once the web APIs are finalized, the plan is to port the same controllers/workflows to the Android client.
