"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  defaultContent,
  SECTION_LABELS,
  SECTION_ORDER,
  slugify,
  type Project,
  type SectionId,
  type SequenceItem,
  type SiteContent,
} from "@/lib/content";
import { projectInfoSchema, sectionSchemas, studioSchema, themeSchema } from "@/lib/admin-schema";
import { PanelFields, Toggle, inputBase, type UploadFn } from "@/components/admin/fields";
import { ProjectsGrid } from "@/components/admin/ProjectsGrid";
import type { SupabaseStatus } from "@/lib/supabase-admin";

type TabKey = "sequence" | "info" | SectionId | "studio" | "theme";
type View = "dashboard" | "editor";

/* ── id + slug helpers ── */
function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function uniqueSlug(projects: Project[], base: string, excludeId?: string): string {
  const root = slugify(base);
  const taken = new Set(projects.filter((p) => p.id !== excludeId).map((p) => p.slug));
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
/** Deterministic (UTC) date formatting, matching the public deck. */
function formatApprovalDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function TabButton({
  active,
  muted,
  onClick,
  children,
}: {
  active: boolean;
  muted?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? "border-[#b89b78] bg-[#b89b78]/15 text-[#e8e4db]"
          : "border-white/10 text-[#a39e94] hover:border-white/25 hover:text-[#e8e4db]"
      } ${muted ? "line-through decoration-[#6f6c66]/70" : ""}`}
    >
      {children}
    </button>
  );
}

function PanelHeading({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="display text-2xl text-[#e8e4db]">{title}</h2>
      <p className="mt-1 text-xs text-[#6f6c66]">{desc}</p>
    </div>
  );
}

const ghostBtn =
  "rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#a39e94] transition enabled:hover:border-white/25 enabled:hover:text-[#e8e4db] disabled:opacity-30";

export function AdminDashboard({
  initialContent,
  supabase,
}: {
  initialContent: SiteContent;
  supabase: SupabaseStatus;
}) {
  const router = useRouter();
  const supabaseReady = supabase.configured;
  const canUpload = supabase.configured && supabase.storage === "ok";
  const [content, setContent] = useState<SiteContent>(() => structuredClone(initialContent));
  const [savedSnapshot, setSavedSnapshot] = useState<SiteContent>(() => structuredClone(initialContent));
  const [activeId, setActiveId] = useState<string>(
    () => initialContent.publishedId || initialContent.projects[0]?.id || "",
  );
  const [tab, setTab] = useState<TabKey>("sequence");
  const [view, setView] = useState<View>("dashboard");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const dirty = useMemo(() => JSON.stringify(content) !== JSON.stringify(savedSnapshot), [content, savedSnapshot]);

  const activeProject = useMemo(
    () => content.projects.find((p) => p.id === activeId) ?? content.projects[0],
    [content.projects, activeId],
  );

  useEffect(() => {
    const handler = (ev: BeforeUnloadEvent) => {
      if (dirty) {
        ev.preventDefault();
        ev.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const upload = useCallback<UploadFn>(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed.");
    if (!data?.url) throw new Error("File uploaded but no URL was returned.");
    return { url: data.url as string, warning: data.warning as string | undefined };
  }, []);

  /* ── content mutators ── */
  // Every edit stamps the project's updatedAt; the renderer uses it to cache-bust
  // this deck's uploaded media (?v=updatedAt) so re-saves always serve fresh files.
  const patchProject = (id: string, fn: (p: Project) => Project) =>
    setContent((c) => ({
      ...c,
      projects: c.projects.map((p) => (p.id === id ? { ...fn(p), updatedAt: Date.now() } : p)),
    }));

  const setInfo = (value: any) => patchProject(activeProject.id, (p) => ({ ...p, info: value }));
  const setSection = (sectionId: SectionId, value: any) =>
    patchProject(activeProject.id, (p) => ({ ...p, sections: { ...p.sections, [sectionId]: value } }));
  const setSequence = (seq: SequenceItem[]) => patchProject(activeProject.id, (p) => ({ ...p, sequence: seq }));
  // The logo lives on `studio` (shared) — bump the active deck so its logo busts too.
  const setStudio = (value: any) =>
    setContent((c) => ({
      ...c,
      studio: value,
      projects: c.projects.map((p) => (p.id === activeProject.id ? { ...p, updatedAt: Date.now() } : p)),
    }));
  const setTheme = (value: any) => setContent((c) => ({ ...c, theme: value }));

  const clearApproval = () =>
    patchProject(activeProject.id, (p) => {
      const next = { ...p };
      delete next.approval;
      return next;
    });

  const setTitle = (title: string) => patchProject(activeProject.id, (p) => ({ ...p, title }));
  const setSlug = (slug: string) =>
    setContent((c) => ({
      ...c,
      projects: c.projects.map((p) =>
        p.id === activeProject.id ? { ...p, slug: uniqueSlug(c.projects, slug || p.title, p.id) } : p,
      ),
    }));

  const setPublished = (id: string, published: boolean) =>
    setContent((c) => {
      let publishedId = c.publishedId;
      if (!published && publishedId === id) {
        publishedId = c.projects.find((p) => p.id !== id && p.published)?.id || "";
      }
      return { ...c, publishedId, projects: c.projects.map((p) => (p.id === id ? { ...p, published } : p)) };
    });

  const setHomepage = (id: string) =>
    setContent((c) => ({
      ...c,
      publishedId: id,
      projects: c.projects.map((p) => (p.id === id ? { ...p, published: true } : p)),
    }));

  const openEditor = (id: string) => {
    setActiveId(id);
    setTab("info");
    setMessage(null);
    setView("editor");
  };

  const newProject = () =>
    setContent((c) => {
      const template = structuredClone(defaultContent.projects[0]);
      const id = makeId();
      const project: Project = {
        ...template,
        id,
        title: "New project",
        slug: uniqueSlug(c.projects, "new-project"),
        published: false,
        info: { ...template.info, name: "New Project", codename: "NEW PROJECT" },
      };
      setActiveId(id);
      setTab("info");
      setView("editor");
      return { ...c, projects: [...c.projects, project] };
    });

  const duplicateProject = (id: string) =>
    setContent((c) => {
      const src = c.projects.find((p) => p.id === id);
      if (!src) return c;
      const copy = structuredClone(src);
      const newPid = makeId();
      copy.id = newPid;
      copy.title = `${src.title} (copy)`;
      copy.slug = uniqueSlug(c.projects, `${src.slug}-copy`);
      copy.published = false;
      setActiveId(newPid);
      return { ...c, projects: [...c.projects, copy] };
    });

  const deleteProject = (id: string) => {
    if (content.projects.length <= 1) {
      setMessage({ kind: "err", text: "You can't delete the last project." });
      return;
    }
    const target = content.projects.find((p) => p.id === id);
    if (!window.confirm(`Delete “${target?.title}”? This can't be undone after you save.`)) return;
    setContent((c) => {
      const projects = c.projects.filter((p) => p.id !== id);
      let publishedId = c.publishedId;
      if (publishedId === id) publishedId = projects.find((p) => p.published)?.id || projects[0]?.id || "";
      if (activeId === id) setActiveId(projects[0]?.id || "");
      return { ...c, projects, publishedId };
    });
  };

  /* ── sequence editing ── */
  const moveSeq = (i: number, d: number) => {
    const seq = [...activeProject.sequence];
    const j = i + d;
    if (j < 0 || j >= seq.length) return;
    [seq[i], seq[j]] = [seq[j], seq[i]];
    setSequence(seq);
  };
  const toggleSeq = (i: number) =>
    setSequence(activeProject.sequence.map((s, idx) => (idx === i ? { ...s, visible: !s.visible } : s)));
  const setSeqLabel = (i: number, label: string) =>
    setSequence(activeProject.sequence.map((s, idx) => (idx === i ? { ...s, label } : s)));
  const resetSequence = () =>
    setSequence(SECTION_ORDER.map((id) => ({ id, label: SECTION_LABELS[id], visible: true })));

  /* ── persistence ── */
  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't save.");
      setSavedSnapshot(structuredClone(content));
      // Tell the editor exactly where the change is (and isn't) visible.
      const isHome = content.publishedId === activeProject.id;
      const text = isHome
        ? `Saved — live now at / and /p/${activeProject.slug}.`
        : activeProject.published
          ? `Saved — live at /p/${activeProject.slug}. This isn't the homepage, so / still shows the homepage project.`
          : `Saved as a draft — preview at /p/${activeProject.slug}. Publish it and “Set as homepage” to show it at /.`;
      setMessage({ kind: "ok", text });
      router.refresh();
    } catch (ex: any) {
      setMessage({ kind: "err", text: ex?.message || "Couldn't save." });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (dirty && !window.confirm("Discard all unsaved changes?")) return;
    setContent(structuredClone(savedSnapshot));
    setMessage(null);
  }

  async function logout() {
    if (dirty && !window.confirm("You have unsaved changes. Log out anyway?")) return;
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  if (!activeProject) {
    return <div className="p-10 text-sm text-[#a39e94]">No projects found.</div>;
  }

  const isSectionTab = (SECTION_ORDER as string[]).includes(tab);
  const sectionId = tab as SectionId;
  const isHomepage = content.publishedId === activeProject.id;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 sm:px-6">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 -mx-4 mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#0b0b0d]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {view === "editor" && (
          <button
            type="button"
            onClick={() => setView("dashboard")}
            className="flex items-center gap-1.5 text-xs text-[#a39e94] transition hover:text-[#e8e4db]"
            title="Back to all projects"
          >
            ← Projects
          </button>
        )}
        <div className="mr-auto flex items-baseline gap-3">
          <span className="display text-xl text-[#e8e4db]">
            {view === "editor" ? activeProject.title || "Untitled project" : "Presentation Studio"}
          </span>
          <span className="hidden text-[0.7rem] uppercase tracking-[0.2em] text-[#6f6c66] sm:inline">
            {content.studio.name}
          </span>
        </div>
        {dirty && (
          <span className="flex items-center gap-1.5 text-[0.7rem] text-amber-300/90" title="You have unsaved changes">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Unsaved
          </span>
        )}
        <a href="/" target="_blank" rel="noreferrer" className="text-xs text-[#a39e94] underline-offset-4 transition hover:text-[#e8e4db] hover:underline">
          View site ↗
        </a>
        <button type="button" onClick={logout} className="text-xs text-[#a39e94] underline-offset-4 transition hover:text-[#e8e4db] hover:underline">
          Log out
        </button>
        <button type="button" onClick={discard} disabled={!dirty} className={ghostBtn}>
          Discard
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-md bg-[#b89b78] px-4 py-1.5 text-xs font-semibold text-[#0b0b0d] transition enabled:hover:bg-[#c9ac88] disabled:opacity-40"
        >
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
      </header>

      {message && (
        <div
          className={`mb-4 rounded-md border px-3 py-2 text-xs ${
            message.kind === "ok"
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-400/30 bg-red-500/10 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
      {!supabaseReady ? (
        <div className="mb-4 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
          <strong>Supabase isn&rsquo;t connected on the server</strong>, so saving changes and uploading images are
          turned off. Set <code className="rounded bg-black/30 px-1 text-amber-100">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-black/30 px-1 text-amber-100">SUPABASE_SERVICE_ROLE_KEY</code> (locally in{" "}
          <code className="rounded bg-black/30 px-1 text-amber-100">.env.local</code> and in your Vercel project&rsquo;s
          Environment Variables), then restart / redeploy. You can keep editing here and{" "}
          <strong>paste an image URL</strong> for any photo in the meantime.
        </div>
      ) : supabase.table !== "ok" ? (
        <div className="mb-4 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
          Connected to Supabase, but the <code className="rounded bg-black/30 px-1 text-amber-100">site_content</code>{" "}
          table {supabase.table === "missing" ? "doesn’t exist yet" : "couldn’t be read"}, so{" "}
          <strong>saving won&rsquo;t work</strong> until it&rsquo;s created. Run the one SQL command from the README.
          {supabase.detail ? ` (${supabase.detail})` : ""}
        </div>
      ) : supabase.storage !== "ok" ? (
        <div className="mb-4 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
          Connected to Supabase, but the <code className="rounded bg-black/30 px-1 text-amber-100">site-media</code>{" "}
          storage bucket isn&rsquo;t ready, so <strong>file uploads are off</strong> — paste an image URL instead.
          {supabase.detail ? ` (${supabase.detail})` : ""}
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-1.5 text-[0.7rem] text-emerald-300/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Supabase connected — saving &amp; image uploads are live.
        </div>
      )}

      {/* ══ Dashboard: visual project cards ══ */}
      {view === "dashboard" && (
        <ProjectsGrid
          content={content}
          onNew={newProject}
          onEdit={openEditor}
          onDuplicate={duplicateProject}
          onDelete={deleteProject}
          onTogglePublish={setPublished}
          onSetHomepage={setHomepage}
        />
      )}

      {/* ══ Editor: single-project deep edit ══ */}
      {view === "editor" && (
        <>
      {/* ── Project switcher ── */}
      <section className="mb-6 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.7rem] uppercase tracking-[0.2em] text-[#6f6c66]">Project</span>
          <select
            value={activeProject.id}
            onChange={(ev) => setActiveId(ev.target.value)}
            className={`${inputBase} w-auto min-w-56 grow-0`}
          >
            {content.projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0b0b0d]">
                {p.title}
                {content.publishedId === p.id ? "  ★ homepage" : p.published ? "  · published" : "  · draft"}
              </option>
            ))}
          </select>
          <button type="button" onClick={newProject} className={ghostBtn}>
            + New
          </button>
          <button type="button" onClick={() => duplicateProject(activeProject.id)} className={ghostBtn}>
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => deleteProject(activeProject.id)}
            disabled={content.projects.length <= 1}
            className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-red-300 transition enabled:hover:border-red-400/40 enabled:hover:bg-red-500/10 disabled:opacity-30"
          >
            Delete
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[0.78rem] font-medium text-[#a39e94]">Project title</label>
            <input className={inputBase} value={activeProject.title} onChange={(ev) => setTitle(ev.target.value)} />
            <p className="mt-1 text-[0.72rem] text-[#6f6c66]">Internal name, shown only here.</p>
          </div>
          <div>
            <label className="mb-1 block text-[0.78rem] font-medium text-[#a39e94]">Share link</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6f6c66]">/p/</span>
              <input
                className={inputBase}
                value={activeProject.slug}
                onChange={(ev) => setSlug(ev.target.value)}
                onBlur={(ev) => setSlug(ev.target.value || activeProject.title)}
              />
              <a
                href={`/p/${activeProject.slug}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-xs text-[#a39e94] underline-offset-4 transition hover:text-[#e8e4db] hover:underline"
              >
                Open ↗
              </a>
            </div>
            <p className="mt-1 text-[0.72rem] text-[#6f6c66]">The per-client URL for this presentation.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4">
          <Toggle
            checked={activeProject.published}
            onChange={(v) => setPublished(activeProject.id, v)}
            label={activeProject.published ? "Published" : "Draft"}
          />
          {isHomepage ? (
            <span className="rounded-full border border-[#b89b78]/40 bg-[#b89b78]/15 px-3 py-1 text-[0.7rem] text-[#e8e4db]">
              ★ Homepage (shown at /)
            </span>
          ) : (
            <button type="button" onClick={() => setHomepage(activeProject.id)} className={ghostBtn}>
              Set as homepage
            </button>
          )}
        </div>
      </section>

      {/* ── Tabs ── */}
      <nav className="mb-7 flex flex-wrap items-center gap-1.5">
        <TabButton active={tab === "sequence"} onClick={() => setTab("sequence")}>
          Sequence
        </TabButton>
        <TabButton active={tab === "info"} onClick={() => setTab("info")}>
          Project info
        </TabButton>
        <span className="mx-1 h-5 w-px bg-white/10" />
        {activeProject.sequence.map((item) => (
          <TabButton key={item.id} active={tab === item.id} muted={!item.visible} onClick={() => setTab(item.id)}>
            {SECTION_LABELS[item.id]}
          </TabButton>
        ))}
        <span className="mx-1 h-5 w-px bg-white/10" />
        <TabButton active={tab === "studio"} onClick={() => setTab("studio")}>
          Studio &amp; brand
        </TabButton>
        <TabButton active={tab === "theme"} onClick={() => setTab("theme")}>
          Colours
        </TabButton>
      </nav>

      <div className="max-w-2xl space-y-6">
        {tab === "sequence" && (
          <>
            <PanelHeading
              title="Presentation sequence"
              desc="Reorder the sections, rename their menu labels, and show or hide them. Each floor inside the Floors section becomes its own slide automatically."
            />
            <div className="space-y-2">
              {activeProject.sequence.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
                >
                  <span className="w-6 shrink-0 text-center text-[0.7rem] tabular-nums text-[#6f6c66]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <input
                      className={`${inputBase} ${item.visible ? "" : "opacity-50 line-through"}`}
                      value={item.label}
                      onChange={(ev) => setSeqLabel(i, ev.target.value)}
                    />
                    <span className="mt-1 block text-[0.66rem] uppercase tracking-[0.18em] text-[#5f5c57]">
                      {SECTION_LABELS[item.id]}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSeq(i, -1)}
                      disabled={i === 0}
                      className="flex h-7 w-7 items-center justify-center rounded border border-white/10 text-xs text-[#a39e94] transition enabled:hover:border-white/25 enabled:hover:text-[#e8e4db] disabled:opacity-25"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSeq(i, 1)}
                      disabled={i === activeProject.sequence.length - 1}
                      className="flex h-7 w-7 items-center justify-center rounded border border-white/10 text-xs text-[#a39e94] transition enabled:hover:border-white/25 enabled:hover:text-[#e8e4db] disabled:opacity-25"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <Toggle checked={item.visible} onChange={() => toggleSeq(i)} label="" />
                </div>
              ))}
            </div>
            <button type="button" onClick={resetSequence} className={ghostBtn}>
              Reset to default order
            </button>
          </>
        )}

        {tab === "info" && (
          <>
            <PanelHeading title="Project info" desc="Names, dates and labels used across this deck." />

            {/* Client approval status — recorded from the deck's "Approved" button */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#b89b78]">
                    Client approval
                  </p>
                  {activeProject.approval ? (
                    <p className="mt-1.5 text-sm text-[#e8e4db]">
                      Approved by <span className="font-semibold">{activeProject.approval.approvedBy}</span>
                      <span className="text-[#6f6c66]">
                        {" · "}
                        {formatApprovalDate(activeProject.approval.approvedAt)}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1.5 text-sm text-[#a39e94]">Not approved yet.</p>
                  )}
                </div>
                {activeProject.approval && (
                  <button
                    type="button"
                    onClick={clearApproval}
                    className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-red-300 transition hover:border-red-400/40 hover:bg-red-500/10"
                  >
                    Clear approval
                  </button>
                )}
              </div>
              {activeProject.approval && (
                <p className="mt-2 text-[0.72rem] text-[#6f6c66]">
                  Clearing removes the recorded sign-off. Don&rsquo;t forget to Save.
                </p>
              )}
            </div>

            <PanelFields
              fields={projectInfoSchema.fields}
              value={activeProject.info}
              onChange={setInfo}
              upload={upload}
              canUpload={canUpload}
            />
          </>
        )}

        {isSectionTab && (
          <>
            <PanelHeading
              title={`${SECTION_LABELS[sectionId]} section`}
              desc="Edit everything that appears in this part of the presentation."
            />
            <PanelFields
              fields={sectionSchemas[sectionId].fields}
              value={(activeProject.sections as any)[sectionId]}
              onChange={(v) => setSection(sectionId, v)}
              upload={upload}
              canUpload={canUpload}
            />
          </>
        )}

        {tab === "studio" && (
          <>
            <PanelHeading title="Studio & brand" desc="Shared across every project — studio name, logo wording, contact details and links." />
            <PanelFields fields={studioSchema.fields} value={content.studio} onChange={setStudio} upload={upload} canUpload={canUpload} />
          </>
        )}

        {tab === "theme" && (
          <>
            <PanelHeading title="Colours" desc="The shared palette behind the whole platform." />
            <PanelFields fields={themeSchema.fields} value={content.theme} onChange={setTheme} upload={upload} canUpload={canUpload} />
          </>
        )}
      </div>
        </>
      )}
    </div>
  );
}
