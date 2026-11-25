import type { Lang } from "@/lib/types";

export type I18nVars = Record<string, string | number>;

const en: Record<string, string> = {
  "app.title": "Grokbot Command Center",
  "app.tagline": "Mission Control for your agent fleet",
  "app.demoBadge": "Demo mode",
  "app.customizeBanner":
    "This template is not customized yet. Point your agent at the repo to enable modules, branding, and bot wiring.",

  "tabs.overview": "Overview",
  "tabs.projects": "Projects",
  "tabs.reports": "Bot reports",
  "tabs.content": "Content",
  "tabs.org": "Org chart",
  "tabs.schedules": "Schedules",
  "tabs.docs": "Docs",
  "tabs.inbox": "Inbox",
  "tabs.about": "About",

  "kpi.projectsActive": "Active projects",
  "kpi.projectsWaiting": "Waiting on you",
  "kpi.contentPipeline": "Content in pipeline",
  "kpi.reportsToday": "Reports today",
  "kpi.schedulesDue": "Routines next",
  "kpi.inboxUnread": "Unread inbox",
  "kpi.agentsOnline": "Agents reporting",
  "kpi.deadlinesSoon": "Deadlines soon",

  "buttons.save": "Save",
  "buttons.cancel": "Cancel",
  "buttons.close": "Close",
  "buttons.refresh": "Refresh",
  "buttons.retry": "Try again",
  "buttons.add": "Add",
  "buttons.edit": "Edit",
  "buttons.delete": "Delete",
  "buttons.approve": "Approve",
  "buttons.submit": "Submit",
  "buttons.export": "Export",
  "buttons.import": "Import",
  "buttons.demoOn": "Enable demo data",
  "buttons.demoOff": "Use live data",
  "buttons.tour": "Take a tour",
  "buttons.theme": "Theme",
  "buttons.language": "Language",
  "buttons.cmdk": "Command palette",
  "buttons.back": "Back",
  "buttons.next": "Next",
  "buttons.finish": "Finish",
  "buttons.learnMore": "Learn more",

  "content.status.draft": "Draft",
  "content.status.awaiting_approval": "Awaiting approval",
  "content.status.needs_feedback": "Needs feedback",
  "content.status.approved": "Plan approved",
  "content.status.creative_review": "Creative review",
  "content.status.creative_changes": "Creative revision",
  "content.status.creative_approved": "Creative approved",
  "content.status.posted": "Published",

  "content.action.create": "Add",
  "content.action.update": "Edit",
  "content.action.delete": "Delete",
  "content.action.respond": "Comment",
  "content.action.approve": "Approve plan",
  "content.action.request_changes": "Request plan changes",
  "content.action.approve_creative": "Approve creative",
  "content.action.request_creative_changes": "Request creative changes",

  "tour.welcome.title": "Welcome aboard",
  "tour.welcome.body":
    "This command center unifies projects, content, org, and agent reports in one mission-control view.",
  "tour.overview.title": "Mission overview",
  "tour.overview.body":
    "The KPI strip and pipeline show fleet health at a glance. Use filters by area when your board grows.",
  "tour.cmdk.title": "Command palette",
  "tour.cmdk.body":
    "Press {{shortcut}} to jump to any module, toggle demo mode, or switch language without leaving the keyboard.",
  "tour.content.title": "Two-gate content",
  "tour.content.body":
    "Plans must be approved before creative work. Only creative-approved items may be posted with a public URL.",
  "tour.org.title": "Org & agents",
  "tour.org.body":
    "Sketch humans and agents on the org canvas. Changes stay in draft until you publish.",
  "tour.done.title": "You are set",
  "tour.done.body":
    "Connect your Grokbots via ingest keys and webhooks. Customize this template with your agent when you are ready.",

  "about.title": "About this template",
  "about.lead":
    "Grokbot Command Center is an open template combining an ops portfolio board, content pipeline, org canvas, SOPs, schedules, and bot report ingest.",
  "about.stack": "Built with Next.js, TypeScript, and Tailwind CSS.",
  "about.license": "MIT License — deploy on Vercel or your own host.",
  "about.agentOnboarding":
    "When customized is false in config, your coding agent should interview you for modules, branding, RBAC, and bot endpoints.",
  "about.links.repo": "Repository",
  "about.links.docs": "Documentation",
  "about.links.ingest": "Bot ingest guide",

  "cmdk.placeholder": "Type a command or search…",
  "cmdk.noResults": "No matching commands",
  "cmdk.group.navigation": "Go to",
  "cmdk.group.actions": "Actions",
  "cmdk.group.settings": "Settings",
  "cmdk.go.overview": "Open overview",
  "cmdk.go.projects": "Open projects",
  "cmdk.go.reports": "Open bot reports",
  "cmdk.go.content": "Open content board",
  "cmdk.go.org": "Open org chart",
  "cmdk.go.schedules": "Open schedules",
  "cmdk.go.docs": "Open docs",
  "cmdk.go.inbox": "Open inbox",
  "cmdk.go.about": "Open about",
  "cmdk.action.demoToggle": "Toggle demo mode",
  "cmdk.action.langEn": "Switch to English",
  "cmdk.action.langId": "Switch to Indonesian",
  "cmdk.action.themeCycle": "Cycle theme (auto / light / dark)",
  "cmdk.action.tour": "Start guided tour",

  "empty.projects": "No projects yet. Add a row or enable demo data to preview the board.",
  "empty.reports": "No bot reports in the last 30 days.",
  "empty.content": "No content items. Create a draft or load demo data.",
  "empty.org": "Org chart is empty. Add departments in draft mode.",
  "empty.schedules": "No agent routines scheduled.",
  "empty.docs": "No documentation sections yet.",
  "empty.inbox": "Inbox is clear — agent feedback will appear here.",
  "empty.search": "Nothing matched “{{query}}”.",

  "banner.demo":
    "You are viewing fictional sample data. Changes in demo mode stay in your browser.",
  "banner.offline": "Cannot reach the API. Showing cached or sample data.",
  "banner.rbac":
    "Your role is {{role}}. Some actions are hidden per the RBAC matrix.",
  "banner.contentGated":
    "Content changes require approval actions — direct edits to posted items are blocked.",
  "banner.uncustomized":
    "Template not customized — run agent onboarding to set brand, modules, and bots.",

  "reports.status.ok": "OK",
  "reports.status.info": "Info",
  "reports.status.warning": "Warning",
  "reports.status.error": "Error",

  "area.engineering": "Engineering",
  "area.content": "Content",
  "area.ops": "Operations",
  "area.executive": "Executive",
  "area.personal": "Personal",

  "role.admin": "Admin",
  "role.approver": "Approver",
  "role.operator": "Operator",
  "role.viewer": "Viewer",

  "theme.auto": "Auto",
  "theme.light": "Light",
  "theme.dark": "Dark",

  "lang.en": "English",
  "lang.id": "Indonesian",

  "misc.loading": "Loading…",
  "misc.error": "Something went wrong",
  "misc.updated": "Updated {{when}}",
};

const id: Record<string, string> = {
  "app.title": "Grokbot Command Center",
  "app.tagline": "Pusat kendali untuk armada agen Anda",
  "app.demoBadge": "Mode demo",
  "app.customizeBanner":
    "Template ini belum dikustomisasi. Arahkan agen Anda ke repo untuk mengaktifkan modul, merek, dan koneksi bot.",

  "tabs.overview": "Ikhtisar",
  "tabs.projects": "Proyek",
  "tabs.reports": "Laporan bot",
  "tabs.content": "Konten",
  "tabs.org": "Bagan organisasi",
  "tabs.schedules": "Jadwal",
  "tabs.docs": "Dokumen",
  "tabs.inbox": "Kotak masuk",
  "tabs.about": "Tentang",

  "kpi.projectsActive": "Proyek aktif",
  "kpi.projectsWaiting": "Menunggu Anda",
  "kpi.contentPipeline": "Konten di pipeline",
  "kpi.reportsToday": "Laporan hari ini",
  "kpi.schedulesDue": "Rutinitas berikutnya",
  "kpi.inboxUnread": "Kotak masuk belum dibaca",
  "kpi.agentsOnline": "Agen melapor",
  "kpi.deadlinesSoon": "Deadline mendekat",

  "buttons.save": "Simpan",
  "buttons.cancel": "Batal",
  "buttons.close": "Tutup",
  "buttons.refresh": "Muat ulang",
  "buttons.retry": "Coba lagi",
  "buttons.add": "Tambah",
  "buttons.edit": "Ubah",
  "buttons.delete": "Hapus",
  "buttons.approve": "Setujui",
  "buttons.submit": "Kirim",
  "buttons.export": "Ekspor",
  "buttons.import": "Impor",
  "buttons.demoOn": "Aktifkan data demo",
  "buttons.demoOff": "Gunakan data live",
  "buttons.tour": "Tur panduan",
  "buttons.theme": "Tema",
  "buttons.language": "Bahasa",
  "buttons.cmdk": "Palet perintah",
  "buttons.back": "Kembali",
  "buttons.next": "Lanjut",
  "buttons.finish": "Selesai",
  "buttons.learnMore": "Pelajari lebih lanjut",

  "content.status.draft": "Draft",
  "content.status.awaiting_approval": "Menunggu persetujuan",
  "content.status.needs_feedback": "Perlu masukan",
  "content.status.approved": "Rencana disetujui",
  "content.status.creative_review": "Review kreatif",
  "content.status.creative_changes": "Revisi kreatif",
  "content.status.creative_approved": "Kreatif disetujui",
  "content.status.posted": "Terbit",

  "content.action.create": "Tambah",
  "content.action.update": "Ubah",
  "content.action.delete": "Hapus",
  "content.action.respond": "Komentar",
  "content.action.approve": "Setujui rencana",
  "content.action.request_changes": "Revisi rencana",
  "content.action.approve_creative": "Setujui kreatif",
  "content.action.request_creative_changes": "Revisi kreatif",

  "tour.welcome.title": "Selamat datang",
  "tour.welcome.body":
    "Pusat kendali ini menyatukan proyek, konten, organisasi, dan laporan agen dalam satu tampilan.",
  "tour.overview.title": "Ikhtisar misi",
  "tour.overview.body":
    "Strip KPI dan pipeline menunjukkan kesehatan armada. Gunakan filter area saat papan Anda bertambah.",
  "tour.cmdk.title": "Palet perintah",
  "tour.cmdk.body":
    "Tekan {{shortcut}} untuk pindah modul, mengalihkan mode demo, atau ganti bahasa tanpa mouse.",
  "tour.content.title": "Konten dua gerbang",
  "tour.content.body":
    "Rencana harus disetujui sebelum kreatif. Hanya item creative_approved yang boleh diterbitkan dengan URL publik.",
  "tour.org.title": "Org & agen",
  "tour.org.body":
    "Gambar manusia dan agen di kanvas org. Perubahan tetap draft sampai Anda terbitkan.",
  "tour.done.title": "Siap",
  "tour.done.body":
    "Hubungkan Grokbots lewat kunci ingest dan webhook. Kustomisasi template dengan agen Anda kapan siap.",

  "about.title": "Tentang template ini",
  "about.lead":
    "Grokbot Command Center adalah template terbuka: papan portofolio, pipeline konten, kanvas org, SOP, jadwal, dan ingest laporan bot.",
  "about.stack": "Dibangun dengan Next.js, TypeScript, dan Tailwind CSS.",
  "about.license": "Lisensi MIT — deploy di Vercel atau host Anda sendiri.",
  "about.agentOnboarding":
    "Saat customized false di config, agen coding harus mewawancarai Anda untuk modul, merek, RBAC, dan endpoint bot.",
  "about.links.repo": "Repositori",
  "about.links.docs": "Dokumentasi",
  "about.links.ingest": "Panduan ingest bot",

  "cmdk.placeholder": "Ketik perintah atau cari…",
  "cmdk.noResults": "Tidak ada perintah yang cocok",
  "cmdk.group.navigation": "Buka",
  "cmdk.group.actions": "Aksi",
  "cmdk.group.settings": "Pengaturan",
  "cmdk.go.overview": "Buka ikhtisar",
  "cmdk.go.projects": "Buka proyek",
  "cmdk.go.reports": "Buka laporan bot",
  "cmdk.go.content": "Buka papan konten",
  "cmdk.go.org": "Buka bagan org",
  "cmdk.go.schedules": "Buka jadwal",
  "cmdk.go.docs": "Buka dokumen",
  "cmdk.go.inbox": "Buka kotak masuk",
  "cmdk.go.about": "Buka tentang",
  "cmdk.action.demoToggle": "Alihkan mode demo",
  "cmdk.action.langEn": "Ganti ke Inggris",
  "cmdk.action.langId": "Ganti ke Indonesia",
  "cmdk.action.themeCycle": "Ganti tema (auto / terang / gelap)",
  "cmdk.action.tour": "Mulai tur panduan",

  "empty.projects":
    "Belum ada proyek. Tambah baris atau aktifkan data demo untuk pratinjau.",
  "empty.reports": "Tidak ada laporan bot dalam 30 hari terakhir.",
  "empty.content": "Belum ada konten. Buat draft atau muat data demo.",
  "empty.org": "Bagan org kosong. Tambah departemen dalam mode draft.",
  "empty.schedules": "Belum ada rutinitas agen terjadwal.",
  "empty.docs": "Belum ada bagian dokumentasi.",
  "empty.inbox": "Kotak masuk bersih — masukan agen akan muncul di sini.",
  "empty.search": "Tidak ada yang cocok dengan “{{query}}”.",

  "banner.demo":
    "Anda melihat data sampel fiktif. Perubahan mode demo tetap di browser Anda.",
  "banner.offline": "Tidak dapat menjangkau API. Menampilkan data cache atau sampel.",
  "banner.rbac":
    "Peran Anda {{role}}. Beberapa aksi disembunyikan sesuai matriks RBAC.",
  "banner.contentGated":
    "Perubahan konten memerlukan aksi persetujuan — edit langsung ke item terbit diblokir.",
  "banner.uncustomized":
    "Template belum dikustomisasi — jalankan onboarding agen untuk merek, modul, dan bot.",

  "reports.status.ok": "OK",
  "reports.status.info": "Info",
  "reports.status.warning": "Peringatan",
  "reports.status.error": "Error",

  "area.engineering": "Teknik",
  "area.content": "Konten",
  "area.ops": "Operasi",
  "area.executive": "Eksekutif",
  "area.personal": "Personal",

  "role.admin": "Admin",
  "role.approver": "Penyetuju",
  "role.operator": "Operator",
  "role.viewer": "Pembaca",

  "theme.auto": "Otomatis",
  "theme.light": "Terang",
  "theme.dark": "Gelap",

  "lang.en": "Inggris",
  "lang.id": "Indonesia",

  "misc.loading": "Memuat…",
  "misc.error": "Terjadi kesalahan",
  "misc.updated": "Diperbarui {{when}}",
};

export const dictionaries: Record<Lang, Record<string, string>> = { en, id };

function interpolate(text: string, vars?: I18nVars): string {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`,
  );
}

/** Resolve a dictionary key for the given language, with EN fallback and {{var}} substitution. */
export function t(lang: Lang, key: string, vars?: I18nVars): string {
  const dict = dictionaries[lang];
  const raw = dict[key] ?? dictionaries.en[key] ?? key;
  return interpolate(raw, vars);
}

/** Pick a bilingual field from a record (e.g. note vs note_en), ops-dashboard style. */
export function pick<T extends Record<string, unknown>>(
  lang: Lang,
  obj: T,
  key: string,
): string {
  if (lang === "en") {
    const enKey = `${key}_en` as keyof T;
    const enVal = obj[enKey];
    if (typeof enVal === "string" && enVal.trim()) return enVal;
  }
  const val = obj[key as keyof T];
  return typeof val === "string" ? val : "";
}