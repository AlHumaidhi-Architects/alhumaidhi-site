"use client";

import { useState } from "react";
import type { Project, SiteContent } from "@/lib/content";
import { Toggle } from "@/components/admin/fields";

/* shared button styles, matching the rest of the admin */
const primaryBtn =
  "rounded-md bg-[#b89b78] px-3 py-1.5 text-xs font-semibold text-[#0b0b0d] transition enabled:hover:bg-[#c9ac88] disabled:opacity-40";
const ghostBtn =
  "rounded-md border border-white/10 px-3 py-1.5 text-xs text-[#a39e94] transition enabled:hover:border-white/25 enabled:hover:text-[#e8e4db] disabled:opacity-30";
const dangerBtn =
  "rounded-md border border-white/10 px-3 py-1.5 text-xs text-red-300 transition enabled:hover:border-red-400/40 enabled:hover:bg-red-500/10 disabled:opacity-30";

type Status = { label: string; className: string };

function statusOf(project: Project, isHomepage: boolean): Status {
  if (isHomepage)
    return {
      label: "★ Homepage",
      className: "border-[#b89b78]/50 bg-[#b89b78]/15 text-[#e8e4db]",
    };
  if (project.published)
    return {
      label: "Published",
      className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    };
  return {
    label: "Draft",
    className: "border-white/15 bg-white/[0.04] text-[#a39e94]",
  };
}

function ShareLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/p/${slug}`;

  async function copy() {
    try {
      const full = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the link is still visible to copy by hand */
    }
  }

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5">
      <span className="truncate font-mono text-[0.72rem] text-[#cfcabf]" title={path}>
        {path}
      </span>
      <button
        type="button"
        onClick={copy}
        className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[0.68rem] text-[#a39e94] transition hover:bg-white/5 hover:text-[#e8e4db]"
        title="Copy share link"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <a
        href={path}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded px-1.5 py-0.5 text-[0.68rem] text-[#a39e94] transition hover:bg-white/5 hover:text-[#e8e4db]"
        title="Open share link"
      >
        Open ↗
      </a>
    </div>
  );
}

function ProjectCard({
  project,
  isHomepage,
  canDelete,
  onEdit,
  onDuplicate,
  onDelete,
  onTogglePublish,
  onSetHomepage,
}: {
  project: Project;
  isHomepage: boolean;
  canDelete: boolean;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, published: boolean) => void;
  onSetHomepage: (id: string) => void;
}) {
  const thumb = project.sections?.cover?.media?.src ?? "";
  const status = statusOf(project, isHomepage);
  const meta = [project.info?.typology, project.info?.location].filter(Boolean).join(" · ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition hover:border-white/20">
      {/* Cover thumbnail — click to edit */}
      <button
        type="button"
        onClick={() => onEdit(project.id)}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-black/40 text-left"
        title="Edit this project"
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[0.7rem] text-[#5f5c57]">
            no cover image
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[0.66rem] tracking-wide backdrop-blur ${status.className}`}
        >
          {status.label}
        </span>
        {project.approval ? (
          <span
            className="absolute right-3 top-3 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[0.66rem] tracking-wide text-emerald-200 backdrop-blur"
            title={`Approved by ${project.approval.approvedBy}`}
          >
            ✓ Approved
          </span>
        ) : project.comments ? (
          <span
            className="absolute right-3 top-3 rounded-full border border-red-400/40 bg-red-500/15 px-2.5 py-1 text-[0.66rem] tracking-wide text-red-200 backdrop-blur"
            title="Client drafted comments"
          >
            With Comments
          </span>
        ) : null}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/70 to-transparent py-2 text-xs font-medium text-[#e8e4db] opacity-0 transition group-hover:opacity-100">
          Edit project →
        </span>
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="display truncate text-lg leading-tight text-[#e8e4db]" title={project.title}>
            {project.title}
          </h3>
          <p className="mt-0.5 truncate text-[0.72rem] text-[#6f6c66]">
            {meta || "No location set"}
            {project.info?.year ? ` · ${project.info.year}` : ""}
          </p>
        </div>

        <ShareLink slug={project.slug} />

        {/* Primary actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => onEdit(project.id)} className={primaryBtn}>
            Edit
          </button>
          <button type="button" onClick={() => onDuplicate(project.id)} className={ghostBtn}>
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => onDelete(project.id)}
            disabled={!canDelete}
            className={`ml-auto ${dangerBtn}`}
            title={canDelete ? "Delete project" : "You can't delete the last project"}
          >
            Delete
          </button>
        </div>

        {/* Publish + homepage */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <Toggle
            checked={project.published}
            onChange={(v) => onTogglePublish(project.id, v)}
            label={project.published ? "Published" : "Draft"}
          />
          {isHomepage ? (
            <span className="text-[0.68rem] uppercase tracking-[0.18em] text-[#b89b78]">★ Homepage</span>
          ) : (
            <button
              type="button"
              onClick={() => onSetHomepage(project.id)}
              className="text-[0.7rem] text-[#a39e94] underline-offset-4 transition hover:text-[#e8e4db] hover:underline"
              title="Show this project at the site root (/)"
            >
              Set as homepage
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProjectsGrid({
  content,
  onNew,
  onEdit,
  onDuplicate,
  onDelete,
  onTogglePublish,
  onSetHomepage,
}: {
  content: SiteContent;
  onNew: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, published: boolean) => void;
  onSetHomepage: (id: string) => void;
}) {
  const projects = content.projects;
  const publishedCount = projects.filter((p) => p.published).length;

  return (
    <section>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-3xl text-[#e8e4db]">Projects</h1>
          <p className="mt-1 text-xs text-[#6f6c66]">
            {projects.length} {projects.length === 1 ? "presentation" : "presentations"} · {publishedCount} published ·
            duplicate a deck to start a new one
          </p>
        </div>
        <button type="button" onClick={onNew} className={`${primaryBtn} px-4 py-2 text-sm`}>
          + New project
        </button>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            isHomepage={content.publishedId === p.id}
            canDelete={projects.length > 1}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onTogglePublish={onTogglePublish}
            onSetHomepage={onSetHomepage}
          />
        ))}

        {/* New project tile */}
        <button
          type="button"
          onClick={onNew}
          className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-transparent text-[#a39e94] transition hover:border-[#b89b78]/60 hover:bg-white/[0.02] hover:text-[#b89b78]"
        >
          <span className="text-3xl leading-none">+</span>
          <span className="text-sm font-medium">New project</span>
          <span className="text-[0.7rem] text-[#5f5c57]">Start from the template</span>
        </button>
      </div>
    </section>
  );
}
