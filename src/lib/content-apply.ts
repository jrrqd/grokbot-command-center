import type { ContentAction, ContentBundle, ContentItem, ContentStatus } from "@/lib/types";
import { DATA_FILES, readJson, writeJsonAtomic, type WriteResult } from "@/lib/storage";

export const CONTENT_ACTIONS: ContentAction[] = [
  "create",
  "update",
  "delete",
  "respond",
  "approve",
  "request_changes",
  "approve_creative",
  "request_creative_changes",
];

export const CONTENT_STATUSES: ContentStatus[] = [
  "draft",
  "awaiting_approval",
  "needs_feedback",
  "approved",
  "creative_review",
  "creative_changes",
  "creative_approved",
  "posted",
];

const CREATIVE_REVIEW_STATUSES: ContentStatus[] = [
  "approved",
  "creative_review",
  "creative_changes",
];

const POSTABLE_STATUSES: ContentStatus[] = ["creative_approved", "posted"];

const CONTENT_FIELDS: Record<string, number> = {
  title: 400,
  pillar: 400,
  planned_date: 10,
  platform: 40,
  format: 400,
  hook: 2000,
  caption: 2000,
  source_url: 2000,
  relevance_until: 10,
  status: 40,
  posted_url: 2000,
  notes: 2000,
};

const CONTENT_MULTILINE = new Set(["hook", "caption", "notes"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class ApplyError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = "ApplyError";
  }
}

function fieldStr(
  fields: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  const v = fields[key];
  return typeof v === "string" ? v : fallback;
}

function cleanText(
  value: unknown,
  maxLen: number,
  opts?: { multiline?: boolean; required?: boolean },
): [string, string | null] {
  if (value === undefined || value === null || value === "") {
    if (opts?.required) return ["", "must not be empty"];
    return ["", null];
  }
  if (typeof value !== "string") return ["", "must be a string"];
  let v = value;
  if (!opts?.multiline) {
    v = v.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").trim();
  } else {
    v = v.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
  }
  if (opts?.required && !v) return ["", "must not be empty"];
  if (v.length > maxLen) return ["", `max ${maxLen} characters`];
  return [v, null];
}

function httpsUrl(v: string): boolean {
  if (v.length > 2000 || /[\s<>"']/.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !!u.hostname && !u.username;
  } catch {
    return false;
  }
}

export interface ContentActionBody {
  type: "content_action";
  action: ContentAction;
  item_id?: number;
  fields?: Record<string, string>;
  note?: string;
  action_id: string;
  recipient?: string;
}

export function validateContentAction(
  body: Record<string, unknown>,
): { record: ContentActionBody; error: null } | { record: null; error: string } {
  const allowed = new Set([
    "type",
    "action",
    "item_id",
    "fields",
    "note",
    "action_id",
    "recipient",
  ]);
  const extra = Object.keys(body).filter((k) => !allowed.has(k));
  if (extra.length) return { record: null, error: `Unknown fields: ${extra.join(", ")}` };

  const action = body.action as ContentAction;
  if (!CONTENT_ACTIONS.includes(action)) {
    return {
      record: null,
      error: `action must be one of: ${CONTENT_ACTIONS.join(", ")}`,
    };
  }

  const action_id = body.action_id;
  if (typeof action_id !== "string" || !action_id.trim() || action_id.length > 80) {
    return { record: null, error: "action_id is required" };
  }

  let item_id = body.item_id as number | undefined;
  if (
    item_id !== undefined &&
    (typeof item_id !== "number" ||
      !Number.isInteger(item_id) ||
      item_id < 0 ||
      item_id > 1e9)
  ) {
    return { record: null, error: "item_id must be a non-negative integer" };
  }
  if (action !== "create" && item_id === undefined) {
    return { record: null, error: `item_id required for ${action}` };
  }

  const fields = (body.fields ?? {}) as Record<string, unknown>;
  if (typeof fields !== "object" || Array.isArray(fields)) {
    return { record: null, error: "fields must be an object" };
  }

  const badKeys = Object.keys(fields).filter((k) => !(k in CONTENT_FIELDS));
  if (badKeys.length) {
    return { record: null, error: `Unknown fields: ${badKeys.join(", ")}` };
  }

  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    const [cv, err] = cleanText(v, CONTENT_FIELDS[k], {
      multiline: CONTENT_MULTILINE.has(k),
    });
    if (err) return { record: null, error: `fields.${k} ${err}` };
    if (cv) clean[k] = cv;
  }

  for (const k of ["planned_date", "relevance_until"] as const) {
    if (k in clean && !DATE_RE.test(clean[k])) {
      return { record: null, error: `fields.${k} must be YYYY-MM-DD` };
    }
  }

  if ("status" in clean && !CONTENT_STATUSES.includes(clean.status as ContentStatus)) {
    return {
      record: null,
      error: `fields.status must be one of: ${CONTENT_STATUSES.join(", ")}`,
    };
  }

  for (const k of ["source_url", "posted_url"] as const) {
    if (k in clean && !httpsUrl(clean[k])) {
      return { record: null, error: `fields.${k} must be a valid https URL` };
    }
  }

  if (clean.status === "posted" && !clean.posted_url) {
    return { record: null, error: "posted_url required when status is posted" };
  }

  if (
    ["delete", "respond", "approve", "request_changes", "approve_creative", "request_creative_changes"].includes(
      action,
    ) &&
    Object.keys(clean).length
  ) {
    return { record: null, error: `fields must be empty for ${action}` };
  }

  if (action === "create") {
    if (!clean.title) return { record: null, error: "create requires fields.title" };
    if (!clean.format) clean.format = "carousel";
    if (!clean.status) clean.status = "draft";
  }

  if (action === "update" && !Object.keys(clean).length) {
    return { record: null, error: "update requires at least one field" };
  }

  const [note, noteErr] = cleanText(body.note, 2000, { multiline: true });
  if (noteErr) return { record: null, error: `note ${noteErr}` };
  if ((action === "respond" || action === "request_creative_changes") && !note) {
    return { record: null, error: `${action} requires note` };
  }

  return {
    record: {
      type: "content_action",
      action,
      item_id,
      fields: clean,
      note,
      action_id: action_id.trim(),
      recipient: typeof body.recipient === "string" ? body.recipient : undefined,
    },
    error: null,
  };
}

let contentLock: Promise<void> = Promise.resolve();

async function withContentLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = contentLock;
  let release!: () => void;
  contentLock = new Promise<void>((r) => {
    release = r;
  });
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

export async function applyContentAction(
  rec: ContentActionBody,
  at: string,
): Promise<{ itemId: number; write: WriteResult }> {
  return withContentLock(async () => {
    const data = await readJson<ContentBundle>(DATA_FILES.content);
    if (!data?.items || !Array.isArray(data.items)) {
      throw new ApplyError(409, "content.json not ready");
    }

    const done = data.actions_done ?? [];
    if (done.includes(rec.action_id)) {
      throw new ApplyError(409, "action already applied");
    }

    const items = data.items;
    const idx = new Map<number, number>();
    items.forEach((it, i) => {
      if (typeof it?.id === "number") idx.set(it.id, i);
    });

    const { action, note = "" } = rec;
    const fields = rec.fields ?? {};
    let itemId: number;

    if (action === "create") {
      for (const k of ["planned_date", "platform"] as const) {
        if (!fields?.[k]) throw new ApplyError(400, `create requires fields.${k}`);
      }
      const ids = items
        .map((it) => it.id)
        .filter((id) => Number.isInteger(id));
      itemId = (ids.length ? Math.max(...ids) : 0) + 1;
      const it: ContentItem = {
        id: itemId,
        title: fieldStr(fields, "title"),
        pillar: fieldStr(fields, "pillar"),
        planned_date: fieldStr(fields, "planned_date"),
        platform: fieldStr(fields, "platform"),
        format: fieldStr(fields, "format", "carousel"),
        hook: fieldStr(fields, "hook"),
        caption: fieldStr(fields, "caption"),
        notes: fieldStr(fields, "notes"),
        status: (fieldStr(fields, "status") as ContentStatus) || "draft",
        updated: at,
        feedback: [],
      };
      const sourceUrl = fieldStr(fields, "source_url");
      if (sourceUrl) it.source_url = sourceUrl;
      const relevanceUntil = fieldStr(fields, "relevance_until");
      if (relevanceUntil) it.relevance_until = relevanceUntil;
      const postedUrl = fieldStr(fields, "posted_url");
      if (postedUrl) it.posted_url = postedUrl;
      if (note) {
        it.feedback = [{ action_id: rec.action_id, action, note, at }];
      }
      items.push(it);
    } else {
      itemId = rec.item_id as number;
      const pos = idx.get(itemId);
      if (pos === undefined) {
        throw new ApplyError(404, `Item #${itemId} not found`);
      }

      if (action === "delete") {
        items.splice(pos, 1);
      } else {
        const it = items[pos];
        if (action === "update") {
          const merged = { ...it, ...fields };
          if (merged.status === "posted") {
            const url = merged.posted_url ?? it.posted_url;
            if (!url || !httpsUrl(url)) {
              throw new ApplyError(400, "posted_url (https) required when status is posted");
            }
            if (!POSTABLE_STATUSES.includes(it.status)) {
              throw new ApplyError(
                400,
                `Only creative_approved items may be posted (now: ${it.status})`,
              );
            }
          }
          Object.assign(it, fields);
        } else if (action === "approve") {
          it.status = "approved";
        } else if (action === "request_changes") {
          it.status = "needs_feedback";
        } else if (action === "approve_creative") {
          if (!CREATIVE_REVIEW_STATUSES.includes(it.status)) {
            throw new ApplyError(
              400,
              `approve_creative only from approved/creative_review/creative_changes (now: ${it.status})`,
            );
          }
          it.status = "creative_approved";
        } else if (action === "request_creative_changes") {
          if (![...CREATIVE_REVIEW_STATUSES, "creative_approved"].includes(it.status)) {
            throw new ApplyError(400, `request_creative_changes not allowed from ${it.status}`);
          }
          it.status = "creative_changes";
        } else if (action === "respond") {
          if (it.status === "approved" || it.status === "creative_changes") {
            it.status = "creative_review";
          }
        }

        if (
          note ||
          action === "respond" ||
          action === "request_changes" ||
          action === "request_creative_changes" ||
          action === "approve_creative"
        ) {
          if (!Array.isArray(it.feedback)) it.feedback = [];
          it.feedback.push({
            action_id: rec.action_id,
            action,
            note,
            at,
            recipient: rec.recipient,
          });
        }
        it.updated = at;
      }
    }

    data.actions_done = [...done, rec.action_id];
    data.updated_at = at;
    const write = await writeJsonAtomic(DATA_FILES.content, data);
    if (!write.ok) throw new ApplyError(503, "Storage is read-only");
    return { itemId, write };
  });
}