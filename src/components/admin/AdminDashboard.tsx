"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SectionId, SiteContent } from "@/lib/content";
import {
  SECTION_LABELS,
  SECTION_ORDER,
  projectSchema,
  sectionSchemas,
  studioSchema,
  themeSchema,
} from "@/lib/admin-schema";
import { PanelFields, Toggle, inputBase, type UploadFn } from "@/components/admin/fields";

type TabKey = SectionId | "project" | "studio" | "theme";

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

export function AdminDashboard({
  initialContent,
  supabaseReady,
}: {
  initialContent: SiteContent;
  supabaseReady: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(() => structuredClone(initialContent));
  const [savedSnapshot, setSavedSnapshot] = useState<SiteContent>(() => structuredClone(initialContent));
  const [tab, setTab] = useState<TabKey>("cover");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(savedSnapshot),
    [content, savedSnapshot],
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
    return data.url as string;
  }, []);

  const setPresentationKey = (key: SectionId | "project", value: any) =>
    setContent((c) => ({ ...c, presentation: { ...c.presentation, [key]: value } }));
  const setStudio = (value: any) => setContent((c) => ({ ...c, studio: value }));
  const setTheme = (value: any) => setContent((c) => ({ ...c, theme: value }));
  const setVisibility = (id: SectionId, value: boolean) =>
    setContent((c) => ({ ...c, visibility: { ...c.visibility, [id]: value } }));
  const setNavLabel = (id: SectionId, label: string) =>
    setContent((c) => ({ ...c, nav: c.nav.map((n) => (n.id === id ? { ...n, label } : n)) }));

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
      setMessage({ kind: "ok", text: "Saved — your changes are live on the site." });
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

  const isSectionTab = (SECTION_ORDER as string[]).includes(tab);
  const sectionId = tab as SectionId;
  const navItem = content.nav.find((n) => n.id === sectionId);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 sm:px-6">
      <header className="sticky top-0 z-30 -mx-4 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#0b0b0d]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mr-auto flex items-baseline gap-3">
          <span className="display text-xl text-[#e8e4db]">Site Editor</span>
          <span className="hidden text-[0.7rem] uppercase tracking-[0.2em] text-[#6f6c66] sm:inline">
            {content.studio.name}
          </span>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#a39e94] underline-offset-4 transition hover:text-[#e8e4db] hover:underline"
        >
          View site ↗
        </a>
        <button
          type="button"
          onClick={logout}
          className="text-xs text-[#a39e94] underline-offset-4 transition hover:text-[#e8e4db] hover:underline"
        >
          Log out
        </button>
        <button
          type="button"
          onClick={discard}
          disabled={!dirty}
          className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#a39e94] transition enabled:hover:border-white/25 enabled:hover:text-[#e8e4db] disabled:opacity-30"
        >
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
      {!supabaseReady && (
        <div className="mb-4 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
          Supabase isn&rsquo;t configured on the server yet, so <strong>Save won&rsquo;t persist</strong>. You can
          still explore the editor. See the project README for the three environment variables and the one SQL
          command needed.
        </div>
      )}

      <nav className="mb-7 flex flex-wrap items-center gap-1.5">
        {SECTION_ORDER.map((id) => (
          <TabButton
            key={id}
            active={tab === id}
            muted={content.visibility[id] === false}
            onClick={() => setTab(id)}
          >
            {SECTION_LABELS[id]}
          </TabButton>
        ))}
        <span className="mx-1 h-5 w-px bg-white/10" />
        <TabButton active={tab === "project"} onClick={() => setTab("project")}>
          Project info
        </TabButton>
        <TabButton active={tab === "studio"} onClick={() => setTab("studio")}>
          Studio &amp; brand
        </TabButton>
        <TabButton active={tab === "theme"} onClick={() => setTab("theme")}>
          Colours
        </TabButton>
      </nav>

      <div className="max-w-2xl space-y-6">
        {isSectionTab && (
          <>
            <PanelHeading
              title={`${SECTION_LABELS[sectionId]} section`}
              desc="Edit everything that appears in this part of the page."
            />
            <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <Toggle
                checked={content.visibility[sectionId] !== false}
                onChange={(v) => setVisibility(sectionId, v)}
                label="Show this section on the site"
              />
              <div>
                <label className="mb-1 block text-[0.78rem] font-medium text-[#a39e94]">Menu name</label>
                <input
                  className={inputBase}
                  value={navItem?.label ?? ""}
                  onChange={(ev) => setNavLabel(sectionId, ev.target.value)}
                />
                <p className="mt-1 text-[0.72rem] text-[#6f6c66]">
                  The label used in the navigation menu and the section index.
                </p>
              </div>
            </div>
            <PanelFields
              fields={sectionSchemas[sectionId].fields}
              value={(content.presentation as any)[sectionId]}
              onChange={(v) => setPresentationKey(sectionId, v)}
              upload={upload}
              canUpload={supabaseReady}
            />
          </>
        )}

        {tab === "project" && (
          <>
            <PanelHeading title="Project info" desc="Names, dates and labels used across the deck." />
            <PanelFields
              fields={projectSchema.fields}
              value={content.presentation.project}
              onChange={(v) => setPresentationKey("project", v)}
              upload={upload}
              canUpload={supabaseReady}
            />
          </>
        )}

        {tab === "studio" && (
          <>
            <PanelHeading title="Studio & brand" desc="Your studio name, logo wording, contact details and links." />
            <PanelFields
              fields={studioSchema.fields}
              value={content.studio}
              onChange={setStudio}
              upload={upload}
              canUpload={supabaseReady}
            />
          </>
        )}

        {tab === "theme" && (
          <>
            <PanelHeading title="Colours" desc="The palette behind the whole site." />
            <PanelFields
              fields={themeSchema.fields}
              value={content.theme}
              onChange={setTheme}
              upload={upload}
              canUpload={supabaseReady}
            />
          </>
        )}
      </div>
    </div>
  );
}
