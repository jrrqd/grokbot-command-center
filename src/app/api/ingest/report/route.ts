import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import { checkIngestRateLimit, verifyBotKey } from "@/lib/auth";
import { appendJsonl, DATA_FILES } from "@/lib/storage";
import type { BotReport, ReportStatus } from "@/lib/types";

const INGEST_MAX_BODY = 48 * 1024;
const REPORT_STATUSES: ReportStatus[] = ["ok", "info", "warning", "error"];
const BOT_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;

function cleanText(
  value: unknown,
  maxLen: number,
  required: boolean,
): [string, string | null] {
  if (value === undefined || value === null) {
    if (required) return ["", "required"];
    return ["", null];
  }
  if (typeof value !== "string") return ["", "must be a string"];
  const v = value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").trim();
  if (required && !v) return ["", "must not be empty"];
  if (v.length > maxLen) return ["", `max ${maxLen} characters`];
  return [v, null];
}

function httpsOptional(link: unknown): string | undefined {
  if (link === undefined || link === null || link === "") return undefined;
  if (typeof link !== "string" || link.length > 2000) return undefined;
  try {
    const u = new URL(link);
    if (u.protocol !== "https:" || !u.hostname || u.username) return undefined;
    return link;
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  const bot = (req.headers.get("x-ops-bot") ?? "").trim();
  const key = (req.headers.get("x-ops-bot-key") ?? "").trim();

  if (!bot || !BOT_RE.test(bot)) {
    return NextResponse.json({ ok: false, error: "Invalid bot" }, { status: 400 });
  }
  if (!verifyBotKey(bot, key)) {
    return NextResponse.json({ ok: false, error: "Invalid bot key" }, { status: 401 });
  }

  const contentType = (req.headers.get("content-type") ?? "").split(";")[0].trim();
  if (contentType !== "application/json") {
    return NextResponse.json({ ok: false, error: "Content-Type must be application/json" }, { status: 415 });
  }

  const length = Number(req.headers.get("content-length") ?? "0");
  if (!Number.isFinite(length) || length <= 0 || length > INGEST_MAX_BODY) {
    return NextResponse.json(
      { ok: false, error: `Body must be ≤ ${INGEST_MAX_BODY} bytes` },
      { status: 413 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.bot !== bot) {
    return NextResponse.json({ ok: false, error: "bot in body must match header" }, { status: 403 });
  }

  const [title, titleErr] = cleanText(body.title, 200, true);
  if (titleErr) {
    return NextResponse.json({ ok: false, error: `title ${titleErr}` }, { status: 400 });
  }

  const [summary, summaryErr] = cleanText(body.summary, 8000, true);
  if (summaryErr) {
    return NextResponse.json({ ok: false, error: `summary ${summaryErr}` }, { status: 400 });
  }

  const status = body.status;
  if (typeof status !== "string" || !REPORT_STATUSES.includes(status as ReportStatus)) {
    return NextResponse.json(
      { ok: false, error: `status must be one of: ${REPORT_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const timestamp = body.timestamp;
  if (typeof timestamp !== "string" || timestamp.length > 40) {
    return NextResponse.json({ ok: false, error: "timestamp must be ISO-8601 string" }, { status: 400 });
  }
  try {
    const dt = new Date(timestamp);
    if (Number.isNaN(dt.getTime())) throw new Error("invalid");
  } catch {
    return NextResponse.json({ ok: false, error: "timestamp must be valid ISO-8601" }, { status: 400 });
  }

  const link = httpsOptional(body.link);
  if (body.link && !link) {
    return NextResponse.json({ ok: false, error: "link must be https://" }, { status: 400 });
  }

  const rate = checkIngestRateLimit(bot);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded (30/hour per bot)" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    );
  }

  const received_at = new Date().toISOString();
  const record: BotReport = {
    id: randomBytes(6).toString("hex"),
    bot,
    title,
    summary,
    status: status as ReportStatus,
    timestamp,
    received_at,
    link,
  };

  const write = await appendJsonl(DATA_FILES.reports, record);
  if (!write.ok) {
    return NextResponse.json(
      { ok: false, error: "Storage unavailable", demo: true },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, id: record.id, received_at }, { status: 201 });
}