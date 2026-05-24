"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import type { Field, FieldEntry } from "@/lib/admin-schema";
import { blankValue } from "@/lib/admin-schema";
import { bustCache } from "@/lib/media-url";

/** Resolves to the stored URL, plus an optional non-fatal warning to surface. */
export type UploadResult = { url: string; warning?: string };
export type UploadFn = (file: File) => Promise<UploadResult>;

/* Formats the presentation can render. Kept in sync with the upload route
 * (src/app/api/admin/upload/route.ts) and the renderer (ui/Media.tsx). */
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime";
const SUPPORTED_EXT = /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov|m4v)$/i;
const SUPPORTED_MIME = /^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime))$/i;

/** Client-side guard mirroring the server so users get instant feedback. */
function isSupportedClientFile(file: File): boolean {
  if (file.type && SUPPORTED_MIME.test(file.type)) return true;
  return SUPPORTED_EXT.test(file.name);
}

export const inputBase =
  "w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-[#e8e4db] placeholder:text-[#5f5c57] outline-none transition focus:border-[#b89b78]";

const addBtn =
  "rounded-md border border-dashed border-white/15 px-3 py-1.5 text-xs font-medium text-[#a39e94] transition hover:border-[#b89b78]/60 hover:text-[#b89b78]";

function Help({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-[0.72rem] leading-relaxed text-[#6f6c66]">{children}</p>;
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`flex h-7 w-7 items-center justify-center rounded border text-xs transition ${
        disabled
          ? "border-white/10 text-white/20"
          : danger
            ? "border-white/10 text-red-300 hover:border-red-400/40 hover:bg-red-500/10"
            : "border-white/10 text-[#a39e94] hover:border-white/25 hover:text-[#e8e4db]"
      }`}
    >
      {children}
    </button>
  );
}

function RowControls({
  onUp,
  onDown,
  onRemove,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <IconBtn onClick={onUp} disabled={disableUp} title="Move up">
        ↑
      </IconBtn>
      <IconBtn onClick={onDown} disabled={disableDown} title="Move down">
        ↓
      </IconBtn>
      <IconBtn onClick={onRemove} title="Remove" danger>
        ✕
      </IconBtn>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="group flex items-center gap-3 text-left">
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-[#b89b78]" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#0b0b0d] shadow transition-all ${
            checked ? "left-[1.125rem]" : "left-0.5"
          }`}
        />
      </span>
      <span className="text-sm text-[#e8e4db]">{label}</span>
    </button>
  );
}

function ColorField({
  value,
  onChange,
  help,
}: {
  value: any;
  onChange: (v: string) => void;
  help?: string;
}) {
  const v = typeof value === "string" && value ? value : "#888888";
  const hex = /^#[0-9a-fA-F]{6}$/.test(v) ? v : "#888888";
  return (
    <div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex}
          onChange={(ev) => onChange(ev.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
        />
        <input className={inputBase} value={v} onChange={(ev) => onChange(ev.target.value)} />
      </div>
      <Help>{help}</Help>
    </div>
  );
}

function ImageField({
  value,
  onChange,
  upload,
  canUpload,
  help,
}: {
  value: any;
  onChange: (v: string) => void;
  upload: UploadFn;
  canUpload: boolean;
  help?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  // Cache-bust the in-editor preview so a re-uploaded / fixed file shows fresh.
  const [bust, setBust] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const url = typeof value === "string" ? value : "";
  const previewUrl = bustCache(url, bust);

  async function onFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    setErr(null);
    setWarn(null);
    if (!isSupportedClientFile(file)) {
      setErr(`Unsupported file type${file.type ? ` (${file.type})` : ""}. Use JPG, PNG, WEBP, GIF, or MP4 / WEBM / MOV.`);
      return;
    }
    setBusy(true);
    try {
      const { url: next, warning } = await upload(file);
      if (!next) throw new Error("File uploaded but no URL was returned.");
      onChange(next);
      setBust(Date.now());
      if (warning) setWarn(warning);
    } catch (ex: any) {
      setErr(ex?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex gap-3">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40">
          {url ? (
            /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(url) ? (
              <video src={previewUrl} muted loop playsInline autoPlay className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[0.65rem] text-[#5f5c57]">
              no media
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            className={inputBase}
            value={url}
            onChange={(ev) => onChange(ev.target.value)}
            placeholder="https://… image URL"
          />
          <div className="flex flex-wrap items-center gap-2">
            {canUpload ? (
              <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={addBtn}>
                {busy ? "Uploading…" : "Upload file"}
              </button>
            ) : (
              <span
                className="rounded-md border border-dashed border-white/10 px-3 py-1.5 text-xs text-[#5f5c57]"
                title="Connect Supabase storage to enable file uploads"
              >
                File upload off — paste a URL above
              </span>
            )}
            {url && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-[#a39e94] underline-offset-2 transition hover:border-[#b89b78]/60 hover:text-[#b89b78]"
                title="Open the direct file URL in a new tab to verify it loads"
              >
                Open uploaded file ↗
              </a>
            )}
            {url && (
              <button type="button" onClick={() => onChange("")} className={addBtn}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={onFile}
      />
      {err && <p className="mt-1 text-[0.72rem] text-red-300">{err}</p>}
      {warn && <p className="mt-1 text-[0.72rem] text-amber-300">{warn}</p>}
      <Help>{help}</Help>
    </div>
  );
}

function FileField({
  value,
  onChange,
  upload,
  canUpload,
  help,
  accept = ".pdf,application/pdf",
}: {
  value: any;
  onChange: (v: string) => void;
  upload: UploadFn;
  canUpload: boolean;
  help?: string;
  accept?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = typeof value === "string" ? value : "";
  const name = url ? decodeURIComponent(url.split("?")[0].split("/").pop() || "file") : "";

  async function onFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    setErr(null);
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      setErr("Please choose a PDF file.");
      return;
    }
    setBusy(true);
    try {
      const { url: next } = await upload(file);
      if (!next) throw new Error("File uploaded but no URL was returned.");
      onChange(next);
    } catch (ex: any) {
      setErr(ex?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {url ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex min-w-0 items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-[#e8e4db]">
            <span aria-hidden>📄</span>
            <span className="max-w-[16rem] truncate">{name}</span>
          </span>
          <a href={url} target="_blank" rel="noreferrer" className={addBtn}>
            Open ↗
          </a>
          {canUpload && (
            <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={addBtn}>
              {busy ? "Uploading…" : "Replace"}
            </button>
          )}
          <button type="button" onClick={() => onChange("")} className={addBtn}>
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {canUpload ? (
            <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={addBtn}>
              {busy ? "Uploading…" : "Upload PDF"}
            </button>
          ) : (
            <span
              className="rounded-md border border-dashed border-white/10 px-3 py-1.5 text-xs text-[#5f5c57]"
              title="Connect Supabase storage to enable file uploads"
            >
              File upload off — paste a URL below
            </span>
          )}
        </div>
      )}
      <input
        className={`${inputBase} mt-2`}
        value={url}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder="https://… PDF URL"
      />
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onFile} />
      {err && <p className="mt-1 text-[0.72rem] text-red-300">{err}</p>}
      <Help>{help}</Help>
    </div>
  );
}

function StringListField({
  value,
  onChange,
  itemLabel,
  addLabel,
  help,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  itemLabel: string;
  addLabel?: string;
  help?: string;
}) {
  const list = Array.isArray(value) ? value : [];
  const set = (i: number, v: string) => onChange(list.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {list.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className={inputBase} value={v ?? ""} onChange={(ev) => set(i, ev.target.value)} />
          <RowControls
            onUp={() => move(i, -1)}
            onDown={() => move(i, 1)}
            onRemove={() => remove(i)}
            disableUp={i === 0}
            disableDown={i === list.length - 1}
          />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, ""])} className={addBtn}>
        + {addLabel ?? `Add ${itemLabel.toLowerCase()}`}
      </button>
      <Help>{help}</Help>
    </div>
  );
}

function TableField({
  value,
  onChange,
  help,
}: {
  value: { columns?: string[]; rows?: string[][] } | undefined;
  onChange: (v: { columns: string[]; rows: string[][] }) => void;
  help?: string;
}) {
  const columns = Array.isArray(value?.columns) ? (value!.columns as string[]) : [];
  const rows = Array.isArray(value?.rows) ? (value!.rows as string[][]) : [];

  const commit = (cols: string[], rws: string[][]) => onChange({ columns: cols, rows: rws });

  const setColumn = (ci: number, name: string) =>
    commit(columns.map((c, i) => (i === ci ? name : c)), rows);
  const addColumn = () =>
    commit([...columns, `Column ${columns.length + 1}`], rows.map((r) => [...r, ""]));
  const removeColumn = (ci: number) =>
    commit(columns.filter((_, i) => i !== ci), rows.map((r) => r.filter((_, i) => i !== ci)));

  const setCell = (ri: number, ci: number, val: string) =>
    commit(columns, rows.map((r, i) => (i === ri ? r.map((c, j) => (j === ci ? val : c)) : r)));
  const addRow = () => commit(columns, [...rows, columns.map(() => "")]);
  const removeRow = (ri: number) => commit(columns, rows.filter((_, i) => i !== ri));
  const moveRow = (ri: number, d: number) => {
    const j = ri + d;
    if (j < 0 || j >= rows.length) return;
    const next = rows.map((r) => [...r]);
    [next[ri], next[j]] = [next[j], next[ri]];
    commit(columns, next);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <span className="block text-[0.72rem] uppercase tracking-[0.16em] text-[#b89b78]">Columns</span>
        <div className="flex flex-wrap items-center gap-2">
          {columns.map((col, ci) => (
            <div key={ci} className="flex items-center gap-1">
              <input
                className={`${inputBase} w-32`}
                value={col ?? ""}
                onChange={(ev) => setColumn(ci, ev.target.value)}
              />
              <IconBtn onClick={() => removeColumn(ci)} title="Remove column" danger disabled={columns.length <= 1}>
                ✕
              </IconBtn>
            </div>
          ))}
          <button type="button" onClick={addColumn} className={addBtn}>
            + Column
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-[0.72rem] uppercase tracking-[0.16em] text-[#b89b78]">
          Rows <span className="text-[#5f5c57]">· {rows.length}</span>
        </span>
        {rows.map((row, ri) => (
          <div key={ri} className="flex items-start gap-2 rounded-md border border-white/10 bg-white/[0.02] p-2">
            <div
              className="grid flex-1 gap-2"
              style={{ gridTemplateColumns: `repeat(${Math.max(1, columns.length)}, minmax(0, 1fr))` }}
            >
              {columns.map((_, ci) => (
                <input
                  key={ci}
                  className={inputBase}
                  value={row[ci] ?? ""}
                  placeholder={columns[ci]}
                  onChange={(ev) => setCell(ri, ci, ev.target.value)}
                />
              ))}
            </div>
            <RowControls
              onUp={() => moveRow(ri, -1)}
              onDown={() => moveRow(ri, 1)}
              onRemove={() => removeRow(ri)}
              disableUp={ri === 0}
              disableDown={ri === rows.length - 1}
            />
          </div>
        ))}
        <button type="button" onClick={addRow} disabled={columns.length === 0} className={addBtn}>
          + Add row
        </button>
      </div>
      <Help>{help}</Help>
    </div>
  );
}

function singular(label: string) {
  return label.endsWith("s") ? label.slice(0, -1) : label;
}

function ListField({
  field,
  value,
  onChange,
  upload,
  canUpload,
}: {
  field: Extract<Field, { kind: "list" }>;
  value: any[];
  onChange: (v: any[]) => void;
  upload: UploadFn;
  canUpload: boolean;
}) {
  const list = Array.isArray(value) ? value : [];
  const setItem = (i: number, v: any) => onChange(list.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...list, blankValue(field.item)]);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[0.78rem] font-medium text-[#a39e94]">{field.label}</span>
        <span className="text-[0.72rem] text-[#5f5c57]">· {list.length}</span>
      </div>
      <Help>{field.help}</Help>
      <div className="mt-2 space-y-3">
        {list.map((item, i) => {
          const title =
            field.titleKey && item && typeof item === "object" && item[field.titleKey]
              ? String(item[field.titleKey])
              : `${singular(field.label)} ${i + 1}`;
          return (
            <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
                <span className="truncate text-xs font-medium text-[#cfcabf]">{title || `Item ${i + 1}`}</span>
                <RowControls
                  onUp={() => move(i, -1)}
                  onDown={() => move(i, 1)}
                  onRemove={() => remove(i)}
                  disableUp={i === 0}
                  disableDown={i === list.length - 1}
                />
              </div>
              <div className="p-3">
                <PanelFields
                  fields={field.item.fields}
                  value={item}
                  onChange={(v) => setItem(i, v)}
                  upload={upload}
                  canUpload={canUpload}
                />
              </div>
            </div>
          );
        })}
        <button type="button" onClick={add} className={addBtn}>
          + {field.addLabel ?? `Add ${singular(field.label).toLowerCase()}`}
        </button>
      </div>
    </div>
  );
}

function FieldRow({ field, children }: { field: Field; children: React.ReactNode }) {
  const ownsLabel = field.kind === "group" || field.kind === "list" || field.kind === "toggle";
  if (ownsLabel) return <div>{children}</div>;
  return (
    <div>
      <label className="mb-1 block text-[0.78rem] font-medium text-[#a39e94]">{field.label}</label>
      {children}
    </div>
  );
}

export function FieldView({
  field,
  value,
  onChange,
  upload,
  canUpload,
}: {
  field: Field;
  value: any;
  onChange: (v: any) => void;
  upload: UploadFn;
  canUpload: boolean;
}) {
  switch (field.kind) {
    case "text":
      return (
        <div>
          <input
            className={inputBase}
            value={value ?? ""}
            onChange={(ev) => onChange(ev.target.value)}
            placeholder={field.placeholder}
          />
          <Help>{field.help}</Help>
        </div>
      );
    case "textarea":
      return (
        <div>
          <textarea
            className={`${inputBase} leading-relaxed`}
            rows={field.rows ?? 3}
            value={value ?? ""}
            onChange={(ev) => onChange(ev.target.value)}
          />
          <Help>{field.help}</Help>
        </div>
      );
    case "color":
      return <ColorField value={value} onChange={onChange} help={field.help} />;
    case "image":
      return (
        <ImageField value={value} onChange={onChange} upload={upload} canUpload={canUpload} help={field.help} />
      );
    case "file":
      return (
        <FileField
          value={value}
          onChange={onChange}
          upload={upload}
          canUpload={canUpload}
          help={field.help}
          accept={field.accept}
        />
      );
    case "toggle":
      return (
        <div>
          <Toggle checked={!!value} onChange={onChange} label={field.label} />
          <Help>{field.help}</Help>
        </div>
      );
    case "stringList":
      return (
        <StringListField
          value={value ?? []}
          onChange={onChange}
          itemLabel={field.itemLabel ?? "item"}
          addLabel={field.addLabel}
          help={field.help}
        />
      );
    case "group":
      return (
        <div className="space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
          {field.label && (
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#b89b78]">{field.label}</p>
          )}
          {field.help && <Help>{field.help}</Help>}
          {field.fields.map(({ key, field: f }) => (
            <FieldRow key={key} field={f}>
              <FieldView
                field={f}
                value={value?.[key]}
                onChange={(v) => onChange({ ...(value ?? {}), [key]: v })}
                upload={upload}
                canUpload={canUpload}
              />
            </FieldRow>
          ))}
        </div>
      );
    case "list":
      return (
        <ListField field={field} value={value ?? []} onChange={onChange} upload={upload} canUpload={canUpload} />
      );
    case "table":
      return <TableField value={value} onChange={onChange} help={field.help} />;
  }
}

export function PanelFields({
  fields,
  value,
  onChange,
  upload,
  canUpload,
}: {
  fields: FieldEntry[];
  value: any;
  onChange: (v: any) => void;
  upload: UploadFn;
  canUpload: boolean;
}) {
  return (
    <div className="space-y-5">
      {fields.map(({ key, field }) => (
        <FieldRow key={key} field={field}>
          <FieldView
            field={field}
            value={value?.[key]}
            onChange={(v) => onChange({ ...(value ?? {}), [key]: v })}
            upload={upload}
            canUpload={canUpload}
          />
        </FieldRow>
      ))}
    </div>
  );
}
