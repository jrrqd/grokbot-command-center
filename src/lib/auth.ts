import { createHash, timingSafeEqual } from "node:crypto";

const INGEST_LIMIT_PER_HOUR = 30;
const ingestWindows = new Map<string, number[]>();

export function hashBotKey(key: string): string {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

function loadBotKeys(): Record<string, string> {
  const raw = process.env.GROKBOT_KEYS_JSON?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore invalid JSON
  }
  return {};
}

export function verifyBotKey(bot: string, key: string): boolean {
  if (!bot || !key) return false;
  const expected = loadBotKeys()[bot];
  if (!expected || typeof expected !== "string") return false;
  const actual = hashBotKey(key);
  try {
    const a = Buffer.from(actual, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return actual === expected;
  }
}

export function checkBasicAuth(req: Request): boolean {
  const user = process.env.COMMAND_CENTER_USER?.trim();
  const pass = process.env.COMMAND_CENTER_PASSWORD?.trim();
  if (!pass) return true;
  if (!user) return false;

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const colon = decoded.indexOf(":");
    if (colon < 0) return false;
    const u = decoded.slice(0, colon);
    const p = decoded.slice(colon + 1);
    return u === user && p === pass;
  } catch {
    return false;
  }
}

export function checkIngestRateLimit(bot: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const bucket = ingestWindows.get(bot) ?? [];
  const recent = bucket.filter((t) => t > now - windowMs);
  if (recent.length >= INGEST_LIMIT_PER_HOUR) {
    const oldest = recent[0] ?? now;
    return {
      ok: false,
      retryAfterSec: Math.ceil((oldest + windowMs - now) / 1000),
    };
  }
  recent.push(now);
  ingestWindows.set(bot, recent);
  return { ok: true };
}

export function unauthorizedBasicResponse(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Grokbot Command Center"',
    },
  });
}