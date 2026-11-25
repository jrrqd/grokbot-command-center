// Grokbot Command Center — shared domain types

export type ModuleId =
  | "overview"
  | "projects"
  | "reports"
  | "content"
  | "org"
  | "schedules"
  | "docs"
  | "inbox"
  | "about";

export type ThemeMode = "auto" | "light" | "dark";

export type Lang = "en" | "id";

export type RoleId = "admin" | "approver" | "operator" | "viewer";

export type CrudPolicy =
  | "read_only"
  | "draft_only"
  | "full_crud"
  | "gated_approval";

export type ContentStatus =
  | "draft"
  | "awaiting_approval"
  | "needs_feedback"
  | "approved"
  | "creative_review"
  | "creative_changes"
  | "creative_approved"
  | "posted";

export type ContentAction =
  | "create"
  | "update"
  | "delete"
  | "respond"
  | "approve"
  | "request_changes"
  | "approve_creative"
  | "request_creative_changes";

export type ReportStatus = "ok" | "info" | "warning" | "error";

export type ContentTone =
  | "muted"
  | "warning"
  | "wait"
  | "info"
  | "success";

export type AreaId =
  | "engineering"
  | "content"
  | "ops"
  | "executive"
  | "personal";

export type BotId = "lucius" | "ichi" | "hal" | "qclaw";

export type OrgNodeKind = "human" | "agent";

export type InboxMessageStatus = "unread" | "read" | "archived";

export interface LocalizedLabel {
  en: string;
  id: string;
}

export interface Project {
  id: number;
  project: string;
  owner: string;
  status: string;
  next_step: string;
  deadline: string;
  updated: string;
  area: AreaId;
  deadline_warning?: boolean;
}

export interface ProjectsBundle {
  updated_at: string;
  updated_label?: string;
  note?: string;
  note_en?: string;
  projects: Project[];
}

export interface ContentFeedback {
  action_id: string;
  action: ContentAction | string;
  note: string;
  at: string;
  recipient?: string;
}

export interface ContentItem {
  id: number;
  title: string;
  pillar: string;
  planned_date: string;
  platform: string;
  format: string;
  hook: string;
  caption: string;
  source_url?: string;
  relevance_until?: string;
  status: ContentStatus;
  posted_url?: string;
  notes: string;
  updated: string;
  feedback: ContentFeedback[];
}

export interface ContentSopMeta {
  updated: string;
  post_gate: ContentStatus;
  plan_gate: ContentStatus;
  statuses: ContentStatus[];
  actions: Record<string, string>;
  rules: string[];
}

export interface ContentBundle {
  brand?: string;
  updated_at: string;
  note?: string;
  note_en?: string;
  sop?: ContentSopMeta;
  actions_done?: string[];
  actions_rejected?: string[];
  items: ContentItem[];
}

export interface BotReport {
  id: string;
  bot: BotId | string;
  title: string;
  summary: string;
  status: ReportStatus;
  timestamp: string;
  received_at?: string;
  link?: string;
}

export interface ReportsBundle {
  updated_at: string;
  reports: BotReport[];
}

export interface OrgNode {
  id: string;
  label: string;
  kind: OrgNodeKind;
  holder: string;
  x: number;
  y: number;
}

export interface OrgEdge {
  from: string;
  to: string;
}

export interface OrgDept {
  label: string;
  approver: string;
  nodes: OrgNode[];
  edges: OrgEdge[];
}

export interface OrgBundle {
  updated_at: string;
  status?: "draft" | "published";
  source?: string;
  depts: Record<string, OrgDept>;
}

export interface SopItem {
  id: string;
  dept: string;
  title: string;
  source_path?: string;
  summary: string;
  steps: string;
}

export interface SopsBundle {
  updated_at: string;
  status?: "draft" | "published";
  items: SopItem[];
}

export interface ScheduleItem {
  id: string;
  time: string;
  days: string;
  routine: string;
  owner: string;
  dept: string;
  status: string;
}

export interface SchedulesBundle {
  updated_at: string;
  updated_label?: string;
  note?: string;
  items: ScheduleItem[];
}

export type DocBlock =
  | { type: "text"; text: string; text_en?: string }
  | {
      type: "callout";
      tone?: "info" | "warning" | "success";
      lead?: string;
      lead_en?: string;
      text: string;
      text_en?: string;
    }
  | {
      type: "list";
      ordered?: boolean;
      items: string[];
      items_en?: string[];
    }
  | {
      type: "table";
      cards?: boolean;
      columns: string[];
      columns_en?: string[];
      rows: string[][];
    }
  | {
      type: "org";
      top: { label: string; detail: string };
      hub?: { label: string; detail: string };
      members: Array<{ label: string; detail: string; dashed?: boolean }>;
    }
  | {
      type: "schedule";
      items: Array<{ time: string; label: string; detail?: string }>;
    }
  | { type: "code"; lang?: string; text: string };

export interface DocSection {
  id: string;
  heading: string;
  heading_en?: string;
  blocks: DocBlock[];
}

export interface DocsBundle {
  title: string;
  summary: string;
  summary_en?: string;
  updated_at: string;
  updated_label?: string;
  sections: DocSection[];
}

export interface InboxMessage {
  id: string;
  type: "agent_feedback" | "webhook" | "system" | "user";
  from: string;
  subject: string;
  body: string;
  at: string;
  status: InboxMessageStatus;
  module?: ModuleId;
  link?: string;
}

export interface AreaDef {
  id: AreaId;
  label: LocalizedLabel;
  color: string;
}

export interface BotDef {
  id: BotId;
  name: string;
  role: string;
  role_id?: string;
  description?: string;
  description_id?: string;
  ingest?: boolean;
}

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  approve: boolean;
}

export interface RoleDef {
  id: RoleId;
  label: LocalizedLabel;
  permissions: Record<ModuleId, ModulePermissions>;
}

export interface RbacConfig {
  singleUser: boolean;
  defaultRole: RoleId;
  roles: RoleDef[];
}

export type ModuleCrudConfig = Record<ModuleId, CrudPolicy>;

export interface ContentStatusDef {
  id: ContentStatus;
  tone: ContentTone;
  label: LocalizedLabel;
}

export interface ContentActionDef {
  id: ContentAction;
  label: LocalizedLabel;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  accent: string;
  logoText: string;
}

export type ModulesConfig = Record<ModuleId, boolean>;

export interface CommandCenterConfig {
  brand: BrandConfig;
  /** When false, agent onboarding interviews the user to customize the template. */
  customized: boolean;
  defaultLang: Lang;
  modules: ModulesConfig;
  areas: AreaDef[];
  bots: BotDef[];
  rbac: RbacConfig;
  crud: ModuleCrudConfig;
  contentStatuses: ContentStatusDef[];
  contentActions: ContentActionDef[];
}

export interface CommandCenterState {
  updated_at: string;
  lang: Lang;
  theme: ThemeMode;
  role: RoleId;
  demo: boolean;
  tour_done: boolean;
  projects: ProjectsBundle;
  content: ContentBundle;
  reports: ReportsBundle;
  org: OrgBundle;
  sops: SopsBundle;
  schedules: SchedulesBundle;
  docs: DocsBundle;
  inbox: InboxMessage[];
}