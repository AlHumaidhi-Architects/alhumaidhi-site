import type { SectionId } from "./content";

/* ──────────────────────────────────────────────────────────────────────────
 *  A tiny declarative schema describing every editable field in the site.
 *  The /admin dashboard renders forms from this, so adding a field here is
 *  all it takes to make it editable.
 * ────────────────────────────────────────────────────────────────────────── */

export type Field =
  | { kind: "text"; label: string; help?: string; placeholder?: string }
  | { kind: "textarea"; label: string; help?: string; rows?: number }
  | { kind: "color"; label: string; help?: string }
  | { kind: "image"; label: string; help?: string }
  | { kind: "toggle"; label: string; help?: string }
  | { kind: "stringList"; label: string; help?: string; itemLabel?: string; addLabel?: string }
  | { kind: "group"; label?: string; help?: string; fields: FieldEntry[] }
  | { kind: "list"; label: string; help?: string; addLabel?: string; titleKey?: string; item: GroupField };

export type GroupField = { kind: "group"; label?: string; help?: string; fields: FieldEntry[] };
export type FieldEntry = { key: string; field: Field };

/* compact builders */
const t = (label: string, help?: string): Field => ({ kind: "text", label, help });
const ta = (label: string, help?: string, rows = 3): Field => ({ kind: "textarea", label, help, rows });
const img = (label = "Image", help = "Upload a file or paste an image URL"): Field => ({ kind: "image", label, help });
const sl = (label: string, help?: string, itemLabel = "Line"): Field => ({ kind: "stringList", label, help, itemLabel });
const e = (key: string, field: Field): FieldEntry => ({ key, field });
const grp = (label: string | undefined, fields: FieldEntry[], help?: string): GroupField => ({ kind: "group", label, fields, help });
const list = (
  label: string,
  fields: FieldEntry[],
  opts: { titleKey?: string; addLabel?: string; help?: string } = {},
): Field => ({ kind: "list", label, help: opts.help, addLabel: opts.addLabel, titleKey: opts.titleKey, item: grp(undefined, fields) });

const altField = e("alt", t("Description (alt text)", "A short description of the image — used by screen readers and as a caption"));
const mediaGroup = (label: string, withRatio = false): Field =>
  grp(label, [
    e("src", img()),
    altField,
    ...(withRatio ? [e("ratio", t("Aspect ratio", 'e.g. "3 / 4" or "16 / 10" — controls the shape of the image'))] : []),
  ]);

/* ── Per-section schemas (keyed by SectionId) ── */
export const sectionSchemas: Record<SectionId, GroupField> = {
  cover: grp(undefined, [
    e("eyebrow", t("Eyebrow", "Small label shown above the title")),
    e("titleLines", sl("Title", 'Each entry is stacked on its own line — e.g. "Majlis" then "House"', "Title line")),
    e("summary", ta("Summary", "The short paragraph under the title")),
    e("media", mediaGroup("Background image")),
    e("meta", list("Detail items", [e("k", t("Label", "e.g. Location")), e("v", t("Value", "e.g. Sabah Al Salem, Kuwait"))], { titleKey: "k", addLabel: "Add detail" })),
  ]),
  overview: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("statement", ta("Lead statement", "The large opening sentence", 4)),
    e("body", sl("Body paragraphs", "Each entry is its own paragraph", "Paragraph")),
    e("facts", list('"At a glance" facts', [e("k", t("Label")), e("v", t("Value"))], { titleKey: "k", addLabel: "Add fact" })),
    e("media", mediaGroup("Main image")),
    e("secondaryMedia", mediaGroup("Secondary image")),
  ]),
  concept: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("keyword", t("Keyword", "The single accent word shown large")),
    e("headline", sl("Headline", "Each entry is stacked on its own line", "Headline line")),
    e("paragraphs", sl("Paragraphs", "Each entry is its own paragraph", "Paragraph")),
    e("media", mediaGroup("Image")),
    e("principles", list("Operating principles", [e("n", t("Number", "e.g. 01")), e("title", t("Title")), e("text", ta("Description"))], { titleKey: "title", addLabel: "Add principle" })),
  ]),
  moodboard: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("note", ta("Note", "The short paragraph next to the headline")),
    e("images", list("Reference images", [e("src", img()), altField, e("ratio", t("Aspect ratio", 'e.g. "3 / 4"'))], { titleKey: "alt", addLabel: "Add image" })),
  ]),
  plans: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("note", ta("Note")),
    e("levels", list("Levels / drawings", [e("code", t("Code", "e.g. L0, L1, RF")), e("title", t("Title")), e("area", t("Area", "e.g. 640 m²")), e("notes", ta("Notes")), e("media", mediaGroup("Drawing"))], { titleKey: "title", addLabel: "Add level" })),
  ]),
  renders: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("note", ta("Note")),
    e("shots", list("Render shots", [e("title", t("Title")), e("time", t("Caption line", "e.g. 07:40 · winter morning")), e("text", ta("Description")), e("media", mediaGroup("Render image"))], { titleKey: "title", addLabel: "Add render" })),
  ]),
  materials: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("note", ta("Note")),
    e("palette", list("Materials", [e("n", t("Code", "e.g. M01")), e("name", t("Name")), e("use", t("Used for", "e.g. Outer shell · approach wall")), e("text", ta("Description")), e("media", mediaGroup("Material image"))], { titleKey: "name", addLabel: "Add material" })),
  ]),
  team: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("statement", ta("Studio statement", undefined, 4)),
    e("media", mediaGroup("Studio image")),
    e("members", list("Core team", [e("name", t("Name")), e("role", t("Role")), e("since", t("Note", "e.g. Principal in charge"))], { titleKey: "name", addLabel: "Add team member" })),
    e("consultants", list("Consultants", [e("k", t("Discipline", "e.g. Structure")), e("v", t("Firm"))], { titleKey: "k", addLabel: "Add consultant" })),
  ]),
  contact: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", sl("Headline", "Each entry is stacked on its own line", "Headline line")),
    e("text", ta("Intro text")),
  ]),
};

export const projectSchema: GroupField = grp(undefined, [
  e("codename", t("Codename", "Shown in small labels around the deck")),
  e("name", t("Project name")),
  e("subtitle", t("Subtitle")),
  e("client", t("Client")),
  e("location", t("Location")),
  e("typology", t("Typology")),
  e("area", t("Area")),
  e("year", t("Year")),
  e("status", t("Status")),
  e("phase", t("Phase", "e.g. Concept Presentation · Vol. 01")),
]);

export const studioSchema: GroupField = grp(undefined, [
  e("name", t("Studio name")),
  e("shortName", t("Short name")),
  e("wordmark", t("Logo — line 1", "The large word in the logo / preloader")),
  e("wordmarkSub", t("Logo — line 2", "The small word under it")),
  e("tagline", t("Tagline")),
  e("established", t("Established", "e.g. EST. 2009")),
  e("city", t("City")),
  e("email", t("Email")),
  e("phone", t("Phone")),
  e("address", sl("Address", "Each entry is one line of the address", "Address line")),
  e("socials", list("Social links", [e("label", t("Label", "e.g. Instagram")), e("href", t("URL"))], { titleKey: "label", addLabel: "Add link" })),
]);

export const themeSchema: GroupField = grp(
  undefined,
  [
    e("ink", { kind: "color", label: "Page background", help: "The main background colour" }),
    e("ink2", { kind: "color", label: "Alternate section background", help: "Used on every other section to create rhythm" }),
    e("ink3", { kind: "color", label: "Image / card background", help: "Shows behind images while they load" }),
    e("bone", { kind: "color", label: "Primary text" }),
    e("boneDim", { kind: "color", label: "Secondary text" }),
    e("boneFaint", { kind: "color", label: "Faint text & labels" }),
    e("clay", { kind: "color", label: "Accent colour", help: "Highlights, the keyword, hover states" }),
    e("clayDim", { kind: "color", label: "Accent — dim" }),
  ],
  "These colours are designed for a dark presentation. Keep the page background dark and the text light, or the site can become hard to read.",
);

export const SECTION_ORDER: SectionId[] = [
  "cover",
  "overview",
  "concept",
  "moodboard",
  "plans",
  "renders",
  "materials",
  "team",
  "contact",
];

export const SECTION_LABELS: Record<SectionId, string> = {
  cover: "Cover",
  overview: "Overview",
  concept: "Concept",
  moodboard: "Moodboard",
  plans: "Plans",
  renders: "Renders",
  materials: "Materials",
  team: "Team",
  contact: "Contact",
};

/** Builds a blank value matching a field's shape (used by "+ Add"). */
export function blankValue(field: Field): unknown {
  switch (field.kind) {
    case "text":
    case "textarea":
    case "image":
      return "";
    case "color":
      return "#888888";
    case "toggle":
      return true;
    case "stringList":
    case "list":
      return [];
    case "group": {
      const out: Record<string, unknown> = {};
      for (const { key, field: f } of field.fields) out[key] = blankValue(f);
      return out;
    }
  }
}
