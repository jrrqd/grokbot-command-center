# Grokbot Command Center — Agent Protocol

Any coding agent that opens this repository must follow the **grill-me onboarding protocol** before changing application code, unless the template is already customized.

## 1. Detect customization state

1. Open `src/config/command-center.config.ts`.
2. If `customized: false`, or branding still matches the template defaults (`name: "Grokbot Command Center"`, placeholder `logoText: "GB"`, generic areas/bots), **stop feature work** and run the grill-me interview first.
3. If `customized: true` and the user only asks for a small change, confirm whether to re-run onboarding for that branch or patch directly.

## 2. Grill-me rules (mandatory)

- Ask **one to two focused questions at a time** — never dump a long questionnaire.
- Cover every decision branch until none are open; use the decision trees below as checklists.
- When the interview is complete, present a **configuration blueprint** (markdown checklist) and wait for explicit user confirmation.
- **Only after confirmation**, edit:
  - `src/config/command-center.config.ts`
  - seed / demo data (when present under `src/data/` or similar)
  - `.env.example` / local `.env` (never commit real secrets)
  - enabled modules and branding assets
- Set `customized: true` only after the user approves the implemented blueprint.

**Primary skill:** read and follow `.cursor/skills/customize-command-center/SKILL.md` for the full interview script, answer mapping, and implementation order.

## 3. Decision trees

### A. Task & monitoring categories

| Branch | Resolve |
|--------|---------|
| **Domains / areas** | Which `areas[]` (id, labels en/id, colors) represent the user’s work domains? Keep, rename, merge, or add? |
| **Status pipelines** | For content and projects: use default `contentStatuses[]` or customize ids, tones, labels? |
| **SLA / KPIs** | What appears on Overview and Reports? Report cadence, warning thresholds (`deadline_warning`), anomaly labels? |
| **Modules** | Toggle `modules.*` — disable unused surfaces (e.g. `content`, `org`, `schedules`). |

### B. RBAC & access control

| Branch | Resolve |
|--------|---------|
| **Single vs multi-user** | `rbac.singleUser: true` (demo) vs `false` (team). |
| **Roles** | Use `admin`, `approver`, `operator`, `viewer` or document custom labels only (ids stay typed). |
| **Permissions** | Per-module `view/create/update/delete/approve` in `rbac.roles[].permissions`. |
| **Auth mode** | Demo role switcher only, future SSO, API keys, or external IdP — document in blueprint; don’t wire production auth without confirm. |
| **Default role** | `rbac.defaultRole` for new sessions. |

### C. CRUD & write-back

| Branch | Resolve |
|--------|---------|
| **Per-module policy** | Map each module to `read_only`, `draft_only`, `full_crud`, or `gated_approval` in `crud`. |
| **Soft delete** | Prefer status/archive over hard delete in seed and future APIs. |
| **Storage backend** | In-memory/demo JSON vs file vs DB — note in blueprint; template ships demo-first. |
| **Approval gates** | Which modules require `approve` permission and `gated_approval`? |

### D. Grokbot fleet & routing

| Branch | Resolve |
|--------|---------|
| **Roster** | Replace or extend `bots[]` (id, name, role, descriptions, `ingest: true/false`). |
| **Schedules** | Which bots emit reports and on what cadence (document in seed/schedules when added). |
| **Ingest keys** | Run `npm run generate-bot-key` per bot; store secrets in `.env` only. |
| **Webhook / ingest URL** | Base URL for deployment; document env vars in `.env.example`. |

### E. Brand, UX & deployment

| Branch | Resolve |
|--------|---------|
| **Name & tagline** | `brand.name`, `brand.tagline`, `brand.logoText`, `brand.accent`. |
| **Logo** | Text mark vs future image asset path. |
| **Palette & theme** | Accent color; respect existing dark UI tokens in `globals.css`. |
| **Language** | `defaultLang`: `en`, `id`, or both via `LocalizedLabel`. |
| **Modules in nav** | Final `modules` map. |
| **Deploy target** | Vercel, Docker, or local/Cursor dev — note env and ingest URLs; **do not overwrite live deployments** without explicit user confirm. |

## 4. Safety

- **Never commit secrets** — API keys, bot ingest tokens, production URLs with credentials.
- **Sample data only** in repo — fictional names, demo projects, placeholder inboxes.
- **No destructive deploys** — no `vercel --prod`, production DNS, or wiping remote state without user confirmation.
- **Minimize scope** — onboarding edits config and seed; avoid unrelated refactors.

## 5. After onboarding

- Run `npm run lint` and `npm run build` when config types change.
- Remind the user to copy `.env.example` → `.env` and run `npm run generate-bot-key` for each ingest-enabled bot.

---

<!-- BEGIN:nextjs-agent-rules -->

### Next.js note

This project uses **Next.js 16** with the App Router (`src/app/`). Read `node_modules/next/dist/docs/` for APIs and conventions that may differ from older Next versions before changing framework code.

<!-- END:nextjs-agent-rules -->