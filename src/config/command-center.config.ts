import type { CommandCenterConfig, ModuleId, ModulePermissions } from "@/lib/types";

const allModules: ModuleId[] = [
  "overview",
  "projects",
  "reports",
  "content",
  "org",
  "schedules",
  "docs",
  "inbox",
  "about",
];

function fullAccess(): ModulePermissions {
  return {
    view: true,
    create: true,
    update: true,
    delete: true,
    approve: true,
  };
}

function viewOnly(): ModulePermissions {
  return {
    view: true,
    create: false,
    update: false,
    delete: false,
    approve: false,
  };
}

function operatorModule(approve = false): ModulePermissions {
  return {
    view: true,
    create: true,
    update: true,
    delete: false,
    approve,
  };
}

function approverModule(approve = true): ModulePermissions {
  return {
    view: true,
    create: true,
    update: true,
    delete: false,
    approve,
  };
}

function buildRolePermissions(
  matrix: Partial<Record<ModuleId, ModulePermissions>>,
): Record<ModuleId, ModulePermissions> {
  const out = {} as Record<ModuleId, ModulePermissions>;
  for (const id of allModules) {
    out[id] = matrix[id] ?? viewOnly();
  }
  return out;
}

export const commandCenterConfig: CommandCenterConfig = {
  brand: {
    name: "Grokbot Command Center",
    tagline: "Mission Control for your agent fleet",
    accent: "#22d3ee",
    logoText: "GB",
  },
  customized: false,
  defaultLang: "en",
  modules: {
    overview: true,
    projects: true,
    reports: true,
    content: true,
    org: true,
    schedules: true,
    docs: true,
    inbox: true,
    about: true,
  },
  areas: [
    {
      id: "engineering",
      label: { en: "Engineering", id: "Teknik" },
      color: "#38bdf8",
    },
    {
      id: "content",
      label: { en: "Content", id: "Konten" },
      color: "#a78bfa",
    },
    {
      id: "ops",
      label: { en: "Operations", id: "Operasi" },
      color: "#34d399",
    },
    {
      id: "executive",
      label: { en: "Executive", id: "Eksekutif" },
      color: "#fbbf24",
    },
    {
      id: "personal",
      label: { en: "Personal", id: "Personal" },
      color: "#fb7185",
    },
  ],
  bots: [
    {
      id: "lucius",
      name: "Lucius",
      role: "Chief of Staff",
      role_id: "Kepala Staf",
      description: "Triage, priorities, and nightly digest across the fleet.",
      description_id: "Triase, prioritas, dan ringkasan malam di seluruh armada.",
      ingest: true,
    },
    {
      id: "ichi",
      name: "Ichi",
      role: "Ops reporter",
      role_id: "Pelapor operasi",
      description: "Daily ops scan, anomalies, and infrastructure health.",
      description_id: "Pemindaian operasi harian, anomali, dan kesehatan infrastruktur.",
      ingest: true,
    },
    {
      id: "hal",
      name: "Hal",
      role: "Content producer",
      role_id: "Produser konten",
      description: "Editorial calendar drafts and creative hand-offs.",
      description_id: "Draf kalender editorial dan serah terima kreatif.",
      ingest: false,
    },
    {
      id: "qclaw",
      name: "QClaw",
      role: "Monitor",
      role_id: "Monitor",
      description: "Workstation watchdog and scheduled heartbeat reports.",
      description_id: "Pengawas workstation dan laporan heartbeat terjadwal.",
      ingest: true,
    },
  ],
  rbac: {
    singleUser: true,
    defaultRole: "admin",
    roles: [
      {
        id: "admin",
        label: { en: "Admin", id: "Admin" },
        permissions: buildRolePermissions(
          Object.fromEntries(allModules.map((m) => [m, fullAccess()])) as Record<
            ModuleId,
            ModulePermissions
          >,
        ),
      },
      {
        id: "approver",
        label: { en: "Approver", id: "Penyetuju" },
        permissions: buildRolePermissions({
          overview: viewOnly(),
          projects: approverModule(true),
          reports: viewOnly(),
          content: approverModule(true),
          org: approverModule(false),
          schedules: operatorModule(false),
          docs: approverModule(false),
          inbox: approverModule(true),
          about: viewOnly(),
        }),
      },
      {
        id: "operator",
        label: { en: "Operator", id: "Operator" },
        permissions: buildRolePermissions({
          overview: viewOnly(),
          projects: operatorModule(false),
          reports: viewOnly(),
          content: operatorModule(false),
          org: operatorModule(false),
          schedules: operatorModule(false),
          docs: operatorModule(false),
          inbox: operatorModule(false),
          about: viewOnly(),
        }),
      },
      {
        id: "viewer",
        label: { en: "Viewer", id: "Pembaca" },
        permissions: buildRolePermissions({}),
      },
    ],
  },
  crud: {
    overview: "read_only",
    projects: "full_crud",
    reports: "read_only",
    content: "gated_approval",
    org: "draft_only",
    schedules: "draft_only",
    docs: "draft_only",
    inbox: "read_only",
    about: "read_only",
  },
  contentStatuses: [
    {
      id: "draft",
      tone: "muted",
      label: { en: "Draft", id: "Draft" },
    },
    {
      id: "awaiting_approval",
      tone: "warning",
      label: { en: "Awaiting approval", id: "Menunggu persetujuan" },
    },
    {
      id: "needs_feedback",
      tone: "wait",
      label: { en: "Needs feedback", id: "Perlu masukan" },
    },
    {
      id: "approved",
      tone: "info",
      label: { en: "Plan approved", id: "Rencana disetujui" },
    },
    {
      id: "creative_review",
      tone: "warning",
      label: { en: "Creative review", id: "Review kreatif" },
    },
    {
      id: "creative_changes",
      tone: "wait",
      label: { en: "Creative revision", id: "Revisi kreatif" },
    },
    {
      id: "creative_approved",
      tone: "success",
      label: { en: "Creative approved", id: "Kreatif disetujui" },
    },
    {
      id: "posted",
      tone: "success",
      label: { en: "Published", id: "Terbit" },
    },
  ],
  contentActions: [
    {
      id: "create",
      label: { en: "Add", id: "Tambah" },
    },
    {
      id: "update",
      label: { en: "Edit", id: "Ubah" },
    },
    {
      id: "delete",
      label: { en: "Delete", id: "Hapus" },
    },
    {
      id: "respond",
      label: { en: "Comment", id: "Komentar" },
    },
    {
      id: "approve",
      label: { en: "Approve plan", id: "Setujui rencana" },
    },
    {
      id: "request_changes",
      label: { en: "Request plan changes", id: "Revisi rencana" },
    },
    {
      id: "approve_creative",
      label: { en: "Approve creative", id: "Setujui kreatif" },
    },
    {
      id: "request_creative_changes",
      label: { en: "Request creative changes", id: "Revisi kreatif" },
    },
  ],
};