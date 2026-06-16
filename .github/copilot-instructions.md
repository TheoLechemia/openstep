**Purpose**

This file provides guidance for GitHub Copilot and AI assistants working on the "openstep" repository. It describes the project's structure, coding conventions, safety rules, and interaction style to produce useful, safe, and consistent suggestions.

Project context

- Backend: Django (Python). Main backend package: `backend/openstep`.
- Frontend: Angular (TypeScript, SCSS). Main frontend source: `frontend/openstep/src`.
- Utility scripts in `scripts/` (for example `create_db.sh`).

This is an open-source project that provides a travel-book application for creating and hosting travel journals and trips.

Frontend style guidance: the frontend design should follow a "travel" aesthetic — photography-forward layouts, warm or natural color palettes, clear readable typography, map integration where relevant, and generous spacing to emphasize imagery and storytelling. The frontend should be designed with a mobile-first approach and must always be responsive across device sizes and orientations to ensure a great experience on phones, tablets, and desktops.

Expected behavior

- Be conservative: propose minimal, focused changes. Prefer fixing root causes over adding temporary workarounds.
- Explain briefly: for any non-trivial change, include 1–2 sentences explaining why.
- Ask before modifying the database, migrations, or deployment scripts.
- Do not run destructive commands (drop DB, reset, force-push) without explicit consent.

Code conventions

- Python/Django: follow PEP8, use 4-space indentation, group imports (stdlib, third-party, local). Add migrations only for model changes. Prefer tests using `pytest` or Django test runner if present.
- TypeScript/Angular: follow existing linting and formatting rules; use `strict` typing when adding new code but avoid large-scale refactors unless requested.
- SCSS/CSS: preserve existing structure and avoid `!important` except when justified.

Files to avoid changing without consent

- `backend/openstep/settings.py`, deployment scripts, and published historical migrations.

Interaction style

- Keep answers short and practical, in English by default for repository files.
- When applying a change: 1) state the goal, 2) show the diff or file changed, 3) explain how to test it.
