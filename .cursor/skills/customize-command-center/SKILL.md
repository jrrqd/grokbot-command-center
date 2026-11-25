---
name: customize-command-center
description: >-
  Grill-me interview and implementation workflow for the Grokbot Command Center
  template. Use when customized is false in command-center.config.ts, when the
  user wants to brand or configure the command center, or when onboarding a new
  fork of this repo.
---

# Customize Grokbot Command Center

## When to use

- `src/config/command-center.config.ts` has `customized: false`.
- User says: customize, onboard, brand, set up bots, configure RBAC, or deploy.
- User opens the repo fresh and wants their own mission control instance.

Do **not** start building unrelated features until onboarding is complete or the user opts out of customization for this session.

## Grill-me conduct

1. **Pace:** 1–2 questions per message.
2. **Completeness:** Every branch below must have a recorded answer or explicit “keep template default.”
3. **Blueprint:** After questions, output the [Blueprint confirmation template](#blueprint-confirmation-template).
4. **Gate:** No config/seed/env edits until the user confirms the blueprint (e.g. “approved”, “looks good”, “go ahead”).

## Suggested question order

Work top to bottom. Skip sections the user already answered.

### Phase 1 — Brand & scope

1. What is this command center called? Tagline? Short logo text (2–3 letters) or future image logo?
2. Primary accent color (hex)? Default language: English, Indonesian, or both?
3. Which modules do you need? (`overview`, `projects`, `reports`, `content`, `org`, `schedules`, `docs`, `inbox`, `about`)

**Example choices**

- Name: “Acme Ops Hub” / tagline: “Fleet status at a glance” / `logoText`: “AO”
- Accent: `#22d3ee` (cyan) or brand hex from style guide
- Modules off: e.g. disable `content` and `schedules` for a pure eng dashboard

### Phase 2 — Task & monitoring categories

4. What **areas** (domains) should tasks and reports roll up under? (Replace template: Engineering, Content, Ops, Executive, Personal.)
5. Content workflow: keep default approval pipeline (draft → awaiting approval → creative review → posted) or simplify?
6. What KPIs or report types matter on Overview/Reports? (Daily digest, infra health, editorial, personal reminders.)

**Example choices**

- Areas: `product`, `growth`, `support` with distinct colors
- Statuses: drop `creative_*` stages → only `draft`, `awaiting_approval`, `posted`
- KPIs: SLA breaches on projects, bot heartbeat errors

### Phase 3 — RBAC & access

7. Single operator (demo mode) or multi-user team?
8. Which roles do you need active? (admin / approver / operator / viewer)
9. Who can approve content or org changes? Any module view-only for operators?

**Example choices**

- `singleUser: true` for personal use
- `singleUser: false` with approver on `content` + `inbox` only
- Viewers: all modules view, no create

### Phase 4 — CRUD & write-back

10. Per enabled module, policy: read-only, drafts only, full CRUD, or approval-gated?
11. Deletes: archive/status change only (recommended) or hard delete in demo data?
12. Data storage: stay on bundled demo JSON for now, or plan external store (note only unless user requests implementation).

**Example choices**

- `projects`: `full_crud`; `reports`: `read_only`; `content`: `gated_approval`
- `inbox`: `read_only` with archive in UI later

### Phase 5 — Grokbot fleet

13. Bot names and roles — keep Lucius/Ichi/Hal/QClaw or rename/replace?
14. Which bots **ingest** webhooks (`ingest: true`)?
15. Report schedules (which bot, cadence) — document for seed/schedules module.
16. Deployment base URL for ingest (local, Vercel preview, production)?

**Example choices**

- Replace roster with 2 bots: `triage` (ingest) + `reporter` (ingest)
- Only `triage` ingests; others display-only

### Phase 6 — Deployment & env

17. Target: Vercel, Docker, or local/Cursor only?
18. Any existing production deployment that must **not** be overwritten?

## Mapping answers → files

| User decision | Where to implement |
|---------------|-------------------|
| Name, tagline, accent, logoText | `commandCenterConfig.brand` |
| Done onboarding | `customized: true` |
| Language default | `defaultLang` |
| Nav surfaces | `modules` boolean map |
| Work domains | `areas[]` — update `AreaId` in `src/lib/types.ts` if new ids |
| Workflow labels | `contentStatuses[]`, `contentActions[]` |
| Team mode | `rbac.singleUser`, `rbac.defaultRole` |
| Role matrix | `rbac.roles[]` and `buildRolePermissions` usage |
| Module mutability | `crud` record |
| Agents | `bots[]` — update `BotId` in `src/lib/types.ts` if ids change |
| Demo narratives | seed bundles in state/data files when added (`CommandCenterState` shapes in `types.ts`) |
| Secrets | `.env` locally; document keys in `.env.example` only |
| Ingest tokens | `BOT_<ID>_INGEST_KEY` or project convention in `.env.example` |

### TypeScript constraints

- `ModuleId`, `RoleId`, `BotId`, `AreaId`, `ContentStatus`, and `ContentAction` are string unions in `src/lib/types.ts`. Adding new ids requires extending those types and all references.

## Generate bot ingest keys

For each bot with `ingest: true`:

```bash
npm run generate-bot-key
```

Run once per bot; pass bot id if the script supports arguments (e.g. `npm run generate-bot-key -- lucius`). Store output **only** in `.env`, never in git.

Document variable names in `.env.example`:

```env
# Example — do not commit real values
LUCHIUS_INGEST_KEY=
WEBHOOK_BASE_URL=http://localhost:3000
```

## Blueprint confirmation template

After the interview, send a message in this shape (fill from answers):

```markdown
## Command Center configuration blueprint

**Brand**
- [ ] Name: …
- [ ] Tagline: …
- [ ] Accent: …
- [ ] Logo: …
- [ ] Default language: …

**Modules enabled**
- [ ] overview — on/off
- [ ] projects — on/off
- [ ] reports — on/off
- [ ] content — on/off
- [ ] org — on/off
- [ ] schedules — on/off
- [ ] docs — on/off
- [ ] inbox — on/off
- [ ] about — on/off

**Areas**
- [ ] …

**Content pipeline**
- [ ] Keep default statuses / Custom: …

**RBAC**
- [ ] Single-user: yes/no
- [ ] Default role: …
- [ ] Role notes: …

**CRUD (per enabled module)**
- [ ] overview: …
- [ ] projects: …
- [ ] …

**Bots**
| id | name | ingest | schedule notes |
|----|------|--------|----------------|
| … | … | yes/no | … |

**Deployment**
- [ ] Target: Vercel / Docker / local
- [ ] Ingest base URL: …
- [ ] Live deploy touch: none / confirm required

**Env vars to document** (no secret values in repo)
- [ ] …

Reply **approve** to implement, or edit any checkbox above.
```

## Implementation order (after confirmation)

1. Update `src/lib/types.ts` unions if new area/bot/status ids are introduced.
2. Edit `src/config/command-center.config.ts` (brand, modules, areas, bots, rbac, crud, statuses).
3. Adjust demo/seed data to match areas, bots, and sample projects (when data files exist).
4. Update `.env.example`; instruct user to create `.env` and run `npm run generate-bot-key` per ingest bot.
5. Set `customized: true`.
6. Run `npm run lint` and `npm run build`.
7. Summarize what changed and remind user of webhook URL and env setup.

## Safety reminders

- Sample personas and companies in seed data only.
- Do not run production deploys or commit `.env`.
- Do not overwrite an existing live deployment without explicit user confirmation.