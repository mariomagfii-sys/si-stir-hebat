# Codex instructions — SI STIR HEBAT

## Canonical workspace and project boundaries
- This directory (`D:\code\SI_STIR_HEBAT_Starter\si-stir-hebat`) is the canonical project root. Keep the VS Code/Codex workspace here and run project commands from here.
- Keep all SI STIR HEBAT source, docs, tests, and migrations inside this directory. Do not create or edit sibling projects or parent-directory files unless explicitly asked.
- The main application is the existing Vite/React app. The owner’s 20 November 2026 override locks React 19 + Vite + TypeScript + React Router + Supabase and prohibits Next.js migration. Do not copy Next.js-only SSR/proxy code.
- `D:\code\my-app` is a separate Next.js setup example, not part of SI STIR HEBAT or its source of truth. Do not continue work there.

## Identity and purpose
Build and maintain SI STIR HEBAT, a school information system for SDN 03 Wonosari, Boalemo, Gorontalo. Work in Indonesian for user-facing documentation and UI. This is a real application, not a mockup.

## Source of truth
Read `docs/references/README.md` and the seven copied reference documents before designing domain models or permissions. Authority order: hard rules > latest owner decisions (`docs/DECISIONS.md`, especially 20 November 2026) > PRD > SAD/API > Blueprint > code. Current owner decisions lock Vite/no-Next.js, DEV-only demo, temporary child-data retention, habits, guardian absence reports, palette migration, and hosted gates. Historical D1–D6 labels from 15 November are superseded where they conflict. Primary references:
- `PRD_SI_STIR_HEBAT_v1_0.md`: product requirements.
- `Database_Blueprint_SI_STIR_HEBAT.md`: draft database entities; reconcile against real schema before changing.
- `RBAC_matriks.md`: roles and authorization scope.
- `API_specifiqation.md`: API reference (spelling preserved).
- `UI_UX_Blueprint_SI_STIR_HEBAT.md`: UI and design.
- `Implementation.md`: implementation plan.
- `kerangka_app.md`: architecture/structure.

If references disagree, flag the conflict and choose conservative reversible steps; do not invent document requirements.

## Stack
React 19 + Vite + TypeScript + React Router; Supabase Auth/PostgreSQL/Storage/RLS; Git; deployment to Vercel only when explicitly approved. Next.js migration is prohibited by the active owner decision. Tailwind, Zod, and monorepo are not required. Keep existing dependencies compatible; do not rewrite the project gratuitously.

## Rules of engagement
1. Audit current workspace, Git status, code, migrations, tests and configuration before editing. Existing local code is more current than any imported handoff archive.
2. Preserve user changes; do not reset, delete, overwrite, or push without permission.
3. Avoid credential disclosure. Never print `.env.local`, access tokens, passwords, service-role or secret keys. Only publishable/anon client keys may exist in frontend; use RLS regardless.
4. Do not apply migrations to a live remote project, reset DB, import personal student data, deploy or push to remote without explicit approval.
5. Follow documented RBAC: administrator, kepala sekolah, guru, siswa, orang tua/wali. Scope teachers to assignments, parents to verified child relationships, students to their own authorized/published data. Admin is not implicitly academic approver.
6. Never rely on UI hiding for authorization: enforce PostgreSQL RLS and server validation.
7. Work incrementally: audit -> plan -> implement -> test -> report. Don't claim verification for tests not run.
8. Keep `docs/PROJECT_STATUS.md` and `docs/IMPLEMENTATION_LOG.md` up to date.
9. Use labels 'Data Contoh' for seeded/mock UI content; do not expose real school data.
10. Follow the latest user design brief in `PROJECT_CONTEXT.md` for new features and explicitly requested polish: mobile-first, deep purple/lilac/light blue/pink, and a professional playful font style. Do not restyle completed pages unless requested; preserve accessibility and sufficient contrast.

## Current handoff baseline — 21 November 2026
- This is an established React 19 + Vite + TypeScript + React Router application with Supabase Auth/PostgreSQL/Storage; `src/` is the application source. The active owner decision prohibits Next.js migration. See `README.md`, `docs/PROJECT_STATUS.md`, and `docs/IMPLEMENTATION_LOG.md` for current feature and verification details.
- Existing Supabase browser integration and email/password auth are in `src/lib/supabase.ts` and `src/app/`. Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; `.env.local` is ignored by Git and must never be printed.
- The hosted project had 23 recorded migrations through `20261113074045_create_private_todos` on the latest read-only check; 39 migration files are now local and the next 16 (including `20261121090000_school_configuration.sql`) are not hosted. Reconcile every timestamp immediately before any approved hosted change; do not reapply recorded migrations or skip a pending one. Hosted migration work remains gated by clean Security Advisor, backup/restore evidence, Supabase local, and `check:supabase`.
- The canonical local check is `npm run check` under Node 24; latest evidence is 149/149 unit/database tests, isolated build 1,789 modules, and 30 JS bundles audited without demo accounts. Release `npm run build` also succeeded on 21 November 2026 and rebuilt `dist/` (same module/bundle audit). Browser tests use mock APIs and do not establish real-account UAT. Real-account UAT, email delivery, hosted migration gates, and production operational readiness remain outstanding. Check the project status docs before repeating verification claims.

## Start work
1. Check `pwd`, file tree, Git state and `package.json`.
2. Verify Node/npm; use `npm ci` only if dependencies need restoring, then run the narrowest relevant check (usually `npm run check`).
3. Audit `src/app/App.tsx`, `src/lib/supabase.ts`, migration SQL and `.env.example`. Never output secret values.
4. Document actual results and blockers in `docs/PROJECT_STATUS.md`.
5. Implement highest-priority safe missing foundation steps. Seek explicit approval before changing remote database or deploying.
- Latest verification (21 November 2026): Node v24.22.3 `npm run check` EXIT 0; 140/140 unit/database tests, isolated build 1,789 modules, 30 JS bundles audited with no demo accounts. Browser full suite 420/420 EXIT 0 (port 5191; see `docs/logs/browser-full-2026-11-21-port5191-reuse.log`). `npm run build` also rebuilt `dist/` successfully and audited 30 JS bundles with no demo accounts. PDF chunk warning 790.69 kB.
