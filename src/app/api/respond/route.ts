import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import {
  applyContentAction,
  ApplyError,
  validateContentAction,
} from "@/lib/content-apply";
import {
  appendJsonl,
  DATA_FILES,
  loadState,
  readJson,
  savePartial,
  touchMeta,
} from "@/lib/storage";
import { forwardToGrokbot } from "@/lib/webhook";
import type {
  InboxMessage,
  OrgBundle,
  ProjectsBundle,
  ScheduleItem,
  SchedulesBundle,
  SopItem,
  SopsBundle,
} from "@/lib/types";

const MAX_BODY = 16 * 1024;

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return randomBytes(6).toString("hex");
}

async function appendInbox(message: InboxMessage): Promise<boolean> {
  const res = await appendJsonl(DATA_FILES.inbox, message);
  return res.ok;
}

export async function POST(req: Request) {
  if ((req.headers.get("content-type") ?? "").split(";")[0].trim() !== "application/json") {
    return NextResponse.json({ ok: false, error: "Content-Type must be application/json" }, { status: 415 });
  }

  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > MAX_BODY) {
    return NextResponse.json({ ok: false, error: "Request too large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const type = body.type as string | undefined;
  const at = nowIso();
  let applied = false;
  let payload: Record<string, unknown> = { ...body, submitted_at: at, id: newId() };

  try {
    if (!type) {
      return NextResponse.json({ ok: false, error: "Missing type" }, { status: 400 });
    }

    if (type === "content_action") {
      const validated = validateContentAction(body);
      if (validated.error || !validated.record) {
        return NextResponse.json(
          { ok: false, error: validated.error ?? "Invalid content_action" },
          { status: 400 },
        );
      }
      const { itemId } = await applyContentAction(validated.record, at);
      applied = true;
      payload = { ...validated.record, item_id: itemId, submitted_at: at, id: payload.id };
    } else if (type === "project_response") {
      const project_id = body.project_id;
      const response = body.response;
      if (typeof project_id !== "number" || !Number.isInteger(project_id)) {
        return NextResponse.json({ ok: false, error: "project_id must be an integer" }, { status: 400 });
      }
      if (typeof response !== "string" || !response.trim() || response.length > 2000) {
        return NextResponse.json({ ok: false, error: "response required (max 2000)" }, { status: 400 });
      }

      const projects = (await readJson<ProjectsBundle>(DATA_FILES.projects)) ?? (await loadState()).projects;
      const project = projects.projects.find((p) => p.id === project_id);
      if (!project) {
        return NextResponse.json({ ok: false, error: "Unknown project" }, { status: 404 });
      }

      project.updated = at;
      const write = await savePartial("projects", { ...projects, updated_at: at });
      if (!write.ok) {
        return NextResponse.json({ ok: false, applied: false, demo: true, error: "Storage read-only" }, { status: 503 });
      }

      const inboxMsg: InboxMessage = {
        id: newId(),
        type: "user",
        from: "Operator",
        subject: `Response: ${project.project}`,
        body: response.trim(),
        at,
        status: "unread",
        module: "projects",
      };
      await appendInbox(inboxMsg);
      applied = true;
      payload = {
        type,
        project_id,
        project_name: project.project,
        response: response.trim(),
        recipient: body.recipient,
        submitted_at: at,
        id: payload.id,
      };
    } else if (type === "schedule_action") {
      applied = await applyScheduleAction(body, at);
      if (!applied) {
        return NextResponse.json({ ok: false, error: "Invalid schedule_action" }, { status: 400 });
      }
    } else if (type === "sop_action") {
      applied = await applySopAction(body, at);
      if (!applied) {
        return NextResponse.json({ ok: false, error: "Invalid sop_action" }, { status: 400 });
      }
    } else if (type === "org_action") {
      applied = await applyOrgAction(body, at);
      if (!applied) {
        return NextResponse.json({ ok: false, error: "Invalid org_action" }, { status: 400 });
      }
    } else if (type === "inbox_message") {
      const msg = buildInboxMessage(body, at);
      if (!msg) {
        return NextResponse.json({ ok: false, error: "Invalid inbox_message" }, { status: 400 });
      }
      const ok = await appendInbox(msg);
      if (!ok) {
        return NextResponse.json({ ok: false, applied: false, demo: true }, { status: 503 });
      }
      applied = true;
      payload = { ...msg, type };
    } else if (type === "routine_action") {
      applied = true;
      payload = {
        type,
        action: body.action,
        owner_bot: body.owner_bot,
        routine_name: body.routine_name,
        fields: body.fields ?? {},
        note: body.note ?? "",
        recipient: body.recipient,
        submitted_at: at,
        id: payload.id,
      };
    } else {
      return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
    }

    await touchMeta({ updated_at: at });
    const forward = await forwardToGrokbot(payload);

    return NextResponse.json({
      ok: true,
      applied,
      forward_status: forward.forward_status,
      error: forward.error,
      ...(type === "content_action" && "item_id" in payload
        ? { item_id: payload.item_id }
        : {}),
    });
  } catch (err) {
    if (err instanceof ApplyError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.code });
    }
    console.error("respond error", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

function buildInboxMessage(body: Record<string, unknown>, at: string): InboxMessage | null {
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!subject || !text || subject.length > 400 || text.length > 8000) return null;
  const from = typeof body.from === "string" && body.from.trim() ? body.from.trim() : "Webhook";
  const msgType = body.message_type;
  const allowed = new Set(["agent_feedback", "webhook", "system", "user"]);
  const type = allowed.has(String(msgType)) ? (msgType as InboxMessage["type"]) : "webhook";
  return {
    id: newId(),
    type,
    from,
    subject,
    body: text,
    at,
    status: "unread",
    module: typeof body.module === "string" ? (body.module as InboxMessage["module"]) : "inbox",
    link: typeof body.link === "string" ? body.link : undefined,
  };
}

async function applyOrgAction(body: Record<string, unknown>, at: string): Promise<boolean> {
  const action = body.action;
  if (typeof action !== "string") return false;
  const bundle = (await readJson<OrgBundle>(DATA_FILES.org)) ?? (await loadState()).org;

  if (action === "publish") {
    bundle.status = "published";
    bundle.updated_at = at;
    return (await savePartial("org", bundle)).ok;
  }
  if (action === "draft") {
    bundle.status = "draft";
    bundle.updated_at = at;
    return (await savePartial("org", bundle)).ok;
  }
  if (action === "update" && body.dept && typeof body.dept === "string") {
    const deptKey = body.dept;
    const dept = bundle.depts[deptKey];
    if (!dept) return false;
    const nodes = body.nodes;
    if (Array.isArray(nodes)) dept.nodes = nodes as typeof dept.nodes;
    bundle.updated_at = at;
    return (await savePartial("org", bundle)).ok;
  }
  return false;
}

async function applySopAction(body: Record<string, unknown>, at: string): Promise<boolean> {
  const action = body.action;
  if (typeof action !== "string") return false;
  const bundle = (await readJson<SopsBundle>(DATA_FILES.sops)) ?? (await loadState()).sops;

  if (action === "publish") {
    bundle.status = "published";
    bundle.updated_at = at;
    return (await savePartial("sops", bundle)).ok;
  }

  const item = body.item as Partial<SopItem> | undefined;
  if (action === "create" && item?.title && item?.dept) {
    const row: SopItem = {
      id: item.id ?? newId(),
      dept: String(item.dept),
      title: String(item.title).slice(0, 400),
      summary: String(item.summary ?? "").slice(0, 2000),
      steps: String(item.steps ?? "").slice(0, 4000),
      source_path: item.source_path,
    };
    bundle.items.push(row);
    bundle.updated_at = at;
    return (await savePartial("sops", bundle)).ok;
  }

  if ((action === "update" || action === "delete") && typeof body.id === "string") {
    const idx = bundle.items.findIndex((r) => r.id === body.id);
    if (idx < 0) return false;
    if (action === "delete") {
      bundle.items.splice(idx, 1);
    } else if (item) {
      bundle.items[idx] = { ...bundle.items[idx], ...item, id: bundle.items[idx].id };
    }
    bundle.updated_at = at;
    return (await savePartial("sops", bundle)).ok;
  }

  return false;
}

async function applyScheduleAction(body: Record<string, unknown>, at: string): Promise<boolean> {
  const action = body.action;
  if (typeof action !== "string") return false;
  const bundle = (await readJson<SchedulesBundle>(DATA_FILES.schedules)) ?? (await loadState()).schedules;

  const fields = (body.fields ?? {}) as Partial<ScheduleItem>;
  if (action === "create") {
    if (!fields.time || !fields.days || !fields.routine) return false;
    const row: ScheduleItem = {
      id: typeof body.id === "string" ? body.id : newId(),
      time: String(fields.time),
      days: String(fields.days),
      routine: String(fields.routine).slice(0, 400),
      owner: String(fields.owner ?? "Operator"),
      dept: String(fields.dept ?? "ops"),
      status: String(fields.status ?? "active"),
    };
    bundle.items.push(row);
    bundle.updated_at = at;
    return (await savePartial("schedules", bundle)).ok;
  }

  if (typeof body.id !== "string") return false;
  const idx = bundle.items.findIndex((r) => r.id === body.id);
  if (idx < 0) return false;

  if (action === "delete") {
    bundle.items.splice(idx, 1);
  } else if (action === "update") {
    bundle.items[idx] = { ...bundle.items[idx], ...fields, id: bundle.items[idx].id };
  } else if (action === "pause") {
    bundle.items[idx].status = "paused";
  } else if (action === "resume") {
    bundle.items[idx].status = "active";
  } else {
    return false;
  }

  bundle.updated_at = at;
  return (await savePartial("schedules", bundle)).ok;
}