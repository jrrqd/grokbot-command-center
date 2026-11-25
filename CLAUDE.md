# Grokbot Command Center — Claude Agent Notes

Same mandate as `AGENTS.md`, condensed for Claude Code and other Claude agents.

## First action

Check `src/config/command-center.config.ts`:

- If `customized: false` (or default template branding), **run grill-me onboarding before coding**.
- Follow `.cursor/skills/customize-command-center/SKILL.md`.

## Grill-me

1. **1–2 questions per turn** until all branches are decided.
2. Produce a **configuration blueprint** checklist; get explicit approval.
3. Then edit config, seed data, `.env.example`, and set `customized: true`.

## Branches to close

| Area | Config keys |
|------|-------------|
| Categories & KPIs | `areas`, `contentStatuses`, `modules` |
| RBAC | `rbac.singleUser`, `rbac.roles`, `rbac.defaultRole` |
| CRUD | `crud` per `ModuleId` |
| Bots | `bots`, ingest keys via `npm run generate-bot-key`, webhook env |
| Brand & deploy | `brand`, `defaultLang`, deployment target (Vercel/Docker/local) |

## Safety

- No secrets in git; sample data only.
- No production deploy or overwrite without user confirm.

## Next.js

App Router under `src/app/`. Verify Next 16 docs under `node_modules/next/dist/docs/` when touching framework code.