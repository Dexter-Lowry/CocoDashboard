# CocoDashboard Master Handoff

Welcome! This repository contains two primary projects and a set of shared expectations for agents working here. Follow the quick-start steps to get oriented and keep this document up to date with the verifier script described below.

## Quick-start
1. Read this file end-to-end before making changes.
2. After pulling the latest code, run the verifier agent to confirm these instructions are still accurate:
   ```bash
   python scripts/verify_handoff.py
   ```
3. Use repo-specific workflows when developing:
   - **Frontend (apps/web):** Vite + React project managed with `npm` (or `pnpm`/`yarn` if you prefer). Run `npm install` once, then `npm run dev` for local development and `npm test`/`npm run lint` for checks.
   - **Android (coco-dashboard):** Android app built with Gradle. Use `./gradlew assembleDebug` or `./gradlew test` from the `coco-dashboard` directory.
4. Keep changes minimal and clearly scoped. Prefer small, focused commits.
5. When you need a quick re-prompt or task list, run the manager agent:
   ```bash
   python scripts/manage_agents.py
   ```
6. To send a focused note to the head agent while reinforcing the mission, include delegation details:
   ```bash
   python scripts/manage_agents.py --delegate-note "What you want the head agent to drive" --mission "Optional mission override"
   ```
7. When creating or delegating tasks, reuse the delegation template for clarity:
   ```bash
   python scripts/manage_agents.py --delegate-note "Your request" --template
   ```
   You can also copy `templates/delegation_template.md` directly.
8. At the start of a new session, run the manager snapshot to capture changes and artifacts:
   ```bash
   python scripts/manage_agents.py --session-start
   ```
   This records the git status, untracked artifacts, and verifier results so instructions stay aligned.

## File structure snapshot
Refer to this high-level map when navigating the repo:

```
.
├─ AGENTS.md
├─ Plan.md
├─ apps/
│  └─ web/
│     ├─ src/
│     ├─ public/
│     ├─ package.json
│     └─ vite.config.ts
├─ coco-dashboard/
│  ├─ app/
│  ├─ README.md
│  ├─ build.gradle.kts
│  ├─ gradlew
│  └─ settings.gradle.kts
├─ templates/
│  └─ delegation_template.md
└─ scripts/
   ├─ manage_agents.py
   └─ verify_handoff.py
```

## Repository layout (validated by the verifier agent)
- `apps/web/`: Vite + React frontend. Key files include `package.json`, `vite.config.ts`, and `src/`.
- `coco-dashboard/`: Android project rooted here. Key files include `README.md`, `build.gradle.kts`, and `app/`.

## Working agreements
- **Always end your final response with a concise summary of what you changed.** This applies to all work in this repository.
- Run relevant tests for the areas you touch and record the results in your final response.
- When adding new instructions for future agents, also update the verifier script so it continues to enforce the truth of this document.
- Start every session by checking for changes, logging new artifacts, and confirming the verifier still passes.

## Delegation templates and workflow
Use the manager agent as your primary prompt for aligning on mission, compute hygiene, and suggested tasks. When you need to brief the head agent or delegate work, pair `--delegate-note` with `--template` to generate a fill-in-the-blank structure. The reusable template also lives at `templates/delegation_template.md` for quick copying into chats or notes.

## Verifier agent
The companion script at `scripts/verify_handoff.py` checks the existence of the directories and files called out above and ensures this document contains the working-agreement reminder. Run it after updates to keep this guide honest.

## Manager agent
Run `python scripts/manage_agents.py` whenever you need a fast re-prompt to align with the mission, conserve compute time, and receive a short task list. It summarizes the working agreements, highlights efficiency reminders, and proposes priority actions other agents can pick up immediately.

To brief the head agent directly, add `--delegate-note "your request"` (and optionally `--mission "custom mission"`). The manager will package a delegate brief with clear calls to action for tasking and follow-up.

For new sessions, include `--session-start` so the manager reports git status, highlights untracked artifacts, and runs the verifier snapshot before you continue.
