import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

import { seedState } from "@/data/seed";
import type {
  BotReport,
  CommandCenterState,
  ContentBundle,
  DocsBundle,
  InboxMessage,
  OrgBundle,
  ProjectsBundle,
  ReportsBundle,
  SchedulesBundle,
  SopsBundle,
} from "@/lib/types";

export const DATA_DIR = path.join(process.cwd(), "data");

export const DATA_FILES = {
  projects: "projects.json",
  content: "content.json",
  org: "org.json",
  sops: "sops.json",
  schedules: "schedules.json",
  docs: "docs.json",
  reports: "reports.jsonl",
  inbox: "inbox.jsonl",
  meta: "state-meta.json",
} as const;

export type StateSliceKey = keyof typeof DATA_FILES;

export type WriteResult = { ok: true } | { ok: false; demo: true; error?: string };

export interface StateMeta {
  updated_at: string;
  lang: CommandCenterState["lang"];
  theme: CommandCenterState["theme"];
  role: CommandCenterState["role"];
  demo: boolean;
  tour_done: boolean;
}

function filePath(name: string): string {
  return path.join(DATA_DIR, name);
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readJson<T>(filename: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath(filename), "utf8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") return null;
    throw err;
  }
}

export async function writeJsonAtomic(
  filename: string,
  data: unknown,
): Promise<WriteResult> {
  try {
    await ensureDataDir();
    const target = filePath(filename);
    const tmp = `${target}.${randomBytes(8).toString("hex")}.tmp`;
    const body = `${JSON.stringify(data, null, 2)}\n`;
    await writeFile(tmp, body, { encoding: "utf8", mode: 0o644 });
    await rename(tmp, target);
    return { ok: true };
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
      return { ok: false, demo: true, error: String(err) };
    }
    return { ok: false, demo: true, error: String(err) };
  }
}

export async function appendJsonl(
  filename: string,
  record: unknown,
): Promise<WriteResult> {
  try {
    await ensureDataDir();
    const line = `${JSON.stringify(record)}\n`;
    await writeFile(filePath(filename), line, {
      encoding: "utf8",
      flag: "a",
      mode: 0o644,
    });
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, demo: true, error: String(err) };
  }
}

export async function readJsonl<T>(filename: string): Promise<T[]> {
  try {
    const raw = await readFile(filePath(filename), "utf8");
    const rows: T[] = [];
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        rows.push(JSON.parse(trimmed) as T);
      } catch {
        // skip corrupt lines
      }
    }
    return rows;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    throw err;
  }
}

async function fileExists(filename: string): Promise<boolean> {
  try {
    await readFile(filePath(filename));
    return true;
  } catch {
    return false;
  }
}

function metaFromState(state: CommandCenterState): StateMeta {
  return {
    updated_at: state.updated_at,
    lang: state.lang,
    theme: state.theme,
    role: state.role,
    demo: state.demo,
    tour_done: state.tour_done,
  };
}

async function bundleFilesPresent(): Promise<boolean> {
  const bits = await Promise.all(
    (
      [
        DATA_FILES.projects,
        DATA_FILES.content,
        DATA_FILES.org,
        DATA_FILES.sops,
        DATA_FILES.schedules,
        DATA_FILES.docs,
      ] as const
    ).map(fileExists),
  );
  return bits.some(Boolean);
}

export async function persistFullState(state: CommandCenterState): Promise<WriteResult> {
  const results = await Promise.all([
    writeJsonAtomic(DATA_FILES.meta, metaFromState(state)),
    writeJsonAtomic(DATA_FILES.projects, state.projects),
    writeJsonAtomic(DATA_FILES.content, state.content),
    writeJsonAtomic(DATA_FILES.org, state.org),
    writeJsonAtomic(DATA_FILES.sops, state.sops),
    writeJsonAtomic(DATA_FILES.schedules, state.schedules),
    writeJsonAtomic(DATA_FILES.docs, state.docs),
  ]);
  const failed = results.find((r) => !r.ok);
  if (failed && !failed.ok) return failed;
  for (const msg of state.inbox) {
    const r = await appendJsonl(DATA_FILES.inbox, msg);
    if (!r.ok) return r;
  }
  for (const report of state.reports.reports) {
    const r = await appendJsonl(DATA_FILES.reports, report);
    if (!r.ok) return r;
  }
  return { ok: true };
}

export async function loadState(options?: {
  persistSeed?: boolean;
}): Promise<CommandCenterState> {
  const hasBundles = await bundleFilesPresent();
  if (!hasBundles) {
    const state = structuredClone(seedState);
    const shouldPersist =
      options?.persistSeed !== false &&
      process.env.CC_DEMO_MODE !== "true" &&
      process.env.CC_DEMO_MODE !== "1";
    if (shouldPersist) {
      const wrote = await persistFullState(state);
      if (!wrote.ok) state.demo = true;
    }
    return state;
  }

  const meta =
    (await readJson<StateMeta>(DATA_FILES.meta)) ??
    metaFromState(structuredClone(seedState));

  const projects =
    (await readJson<ProjectsBundle>(DATA_FILES.projects)) ?? seedState.projects;
  const content =
    (await readJson<ContentBundle>(DATA_FILES.content)) ?? seedState.content;
  const org = (await readJson<OrgBundle>(DATA_FILES.org)) ?? seedState.org;
  const sops = (await readJson<SopsBundle>(DATA_FILES.sops)) ?? seedState.sops;
  const schedules =
    (await readJson<SchedulesBundle>(DATA_FILES.schedules)) ??
    seedState.schedules;
  const docs = (await readJson<DocsBundle>(DATA_FILES.docs)) ?? seedState.docs;

  const reportRows = await readJsonl<BotReport>(DATA_FILES.reports);
  reportRows.sort(
    (a, b) =>
      (b.received_at ?? b.timestamp).localeCompare(
        a.received_at ?? a.timestamp,
      ),
  );
  const reports: ReportsBundle = {
    updated_at: reportRows[0]?.received_at ?? meta.updated_at,
    reports: reportRows.slice(0, 200),
  };

  const inboxRows = await readJsonl<InboxMessage>(DATA_FILES.inbox);
  const inbox = inboxRows.length > 0 ? inboxRows : seedState.inbox;

  return {
    updated_at: meta.updated_at,
    lang: meta.lang,
    theme: meta.theme,
    role: meta.role,
    demo: meta.demo,
    tour_done: meta.tour_done,
    projects,
    content,
    reports,
    org,
    sops,
    schedules,
    docs,
    inbox: inbox.slice(-500),
  };
}

export async function savePartial(
  key: StateSliceKey,
  data: unknown,
): Promise<WriteResult> {
  if (key === "reports" || key === "inbox") {
    return { ok: false, demo: true, error: "Use appendJsonl for jsonl slices" };
  }
  return writeJsonAtomic(DATA_FILES[key], data);
}

export async function touchMeta(
  patch: Partial<StateMeta>,
): Promise<WriteResult> {
  const current =
    (await readJson<StateMeta>(DATA_FILES.meta)) ??
    metaFromState(structuredClone(seedState));
  return writeJsonAtomic(DATA_FILES.meta, { ...current, ...patch });
}

/** Remove a stale temp file if rename failed mid-flight. */
export async function cleanupTmpFiles(): Promise<void> {
  try {
    const { readdir } = await import("node:fs/promises");
    const names = await readdir(DATA_DIR);
    await Promise.all(
      names
        .filter((n) => n.endsWith(".tmp"))
        .map((n) => unlink(filePath(n)).catch(() => undefined)),
    );
  } catch {
    // ignore
  }
}