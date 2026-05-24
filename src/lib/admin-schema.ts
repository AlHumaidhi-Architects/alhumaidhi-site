import { SECTION_LABELS, SECTION_ORDER, type SectionId } from "./content";

export { SECTION_LABELS, SECTION_ORDER };
export type { SectionId };

/* ──────────────────────────────────────────────────────────────────────────
 *  A tiny declarative schema describing every editable field in a project.
 *  The /admin dashboard renders forms from this, so adding a field here is all
 *  it takes to make it editable.
 * ────────────────────────────────────────────────────────────────────────── */

export type Field =
  | { kind: "text"; label: string; help?: string; placeholder?: string }
  | { kind: "textarea"; label: string; help?: string; rows?: number }
  | { kind: "color"; label: string; help?: string }
  | { kind: "image"; label: string; help?: string }
  | { kind: "toggle"; label: string; help?: string }
  | { kind: "stringList"; label: string; help?: string; itemLabel?: string; addLabel?: string }
  | { kind: "table"; label: string; help?: string }
  | { kind: "group"; label?: string; help?: string; fields: FieldEntry[] }
  | { kind: "list"; label: string; help?: string; addLabel?: string; titleKey?: string; item: GroupField };

export type GroupField = { kind: "group"; label?: string; help?: string; fields: FieldEntry[] };
export type FieldEntry = { key: string; field: Field };

/* compact builders */
const t = (label: string, help?: string): Field => ({ kind: "text", label, help });
const ta = (label: string, help?: string, rows = 3): Field => ({ kind: "textarea", label, help, rows });
const img = (label = "Image / video", help = "Upload a file or paste a URL — JPG, PNG, GIF or MP4"): Field => ({ kind: "image", label, help });
const sl = (label: string, help?: string, itemLabel = "Line"): Field => ({ kind: "stringList", label, help, itemLabel });
const e = (key: string, field: Field): FieldEntry => ({ key, field });
const grp = (label: string | undefined, fields: FieldEntry[], help?: string): GroupField => ({ kind: "group", label, fields, help });
const list = (
  label: string,
  fields: FieldEntry[],
  opts: { titleKey?: string; addLabel?: string; help?: string } = {},
): Field => ({ kind: "list", label, help: opts.help, addLabel: opts.addLabel, titleKey: opts.titleKey, item: grp(undefined, fields) });

const altField = e("alt", t("Description (alt text)", "A short description — used by screen readers and as a caption"));

const mediaGroup = (label: string, opts: { ratio?: boolean; poster?: boolean } = {}): Field =>
  grp(label, [
    e("src", img()),
    altField,
    ...(opts.ratio ? [e("ratio", t("Aspect ratio", 'e.g. "3 / 4" or "16 / 10" — controls the shape of the image'))] : []),
    ...(opts.poster ? [e("poster", img("Poster frame", "Shown before a video plays — optional"))] : []),
  ]);

/* ── Per-section schemas (keyed by SectionId) ── */
export const sectionSchemas: Record<SectionId, GroupField> = {
  cover: grp(undefined, [
    e("eyebrow", t("Eyebrow", "Small label shown above the title")),
    e("titleLines", sl("Title", 'Each entry is stacked on its own line — e.g. "Majlis" then "House"', "Title line")),
    e("summary", ta("Summary", "The short paragraph under the title")),
    e("media", mediaGroup("Background image / video", { poster: true })),
    e("meta", list("Detail items", [e("k", t("Label", "e.g. Location")), e("v", t("Value", "e.g. Sabah Al Salem, Kuwait"))], { titleKey: "k", addLabel: "Add detail" })),
  ]),
  intro: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("statement", ta("Lead statement", "The large opening sentence", 4)),
    e("body", sl("Body paragraphs", "Each entry is its own paragraph", "Paragraph")),
    e("facts", list('"At a glance" facts', [e("k", t("Label")), e("v", t("Value"))], { titleKey: "k", addLabel: "Add fact" })),
    e("media", mediaGroup("Main image")),
    e("secondaryMedia", mediaGroup("Secondary image")),
  ]),
  sitePlot: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("note", ta("Note", "The short paragraph next to the headline")),
    e("photo", mediaGroup("Site photograph")),
    e("body", sl("Site text", "Design intent for the site — one paragraph per entry", "Paragraph")),
    e("plans", list("Site plans", [e("title", t("Title", "e.g. Site plan — 1:500")), e("caption", t("Caption")), e("media", mediaGroup("Drawing"))], { titleKey: "title", addLabel: "Add plan" })),
  ]),
  gifDiagram: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("note", ta("Note")),
    e("caption", t("Caption", "Shown beneath the diagram")),
    e("media", mediaGroup("Diagram (GIF or MP4)", { poster: true })),
  ]),
  moodImages: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("note", ta("Note")),
    e("images", list("Reference images", [e("src", img()), altField, e("ratio", t("Aspect ratio", 'e.g. "3 / 4"'))], { titleKey: "alt", addLabel: "Add image" })),
  ]),
  floors: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline", "Chapter title shown above the first floor")),
    e("note", ta("Note")),
    e(
      "floors",
      list(
        "Floors",
        [
          e("code", t("Code", "e.g. L0, L1, RF")),
          e("title", t("Title", "e.g. Ground — Living & Majlis")),
          e("area", t("Area", "e.g. 640 m²")),
          e("intent", sl("Design intent", "The written explanation — one paragraph per entry", "Paragraph")),
          e("plan", mediaGroup("Floor plan")),
          e("moods", list("Reference images", [e("src", img()), altField, e("ratio", t("Aspect ratio", 'e.g. "3 / 4"'))], { titleKey: "alt", addLabel: "Add image" })),
        ],
        { titleKey: "title", addLabel: "Add floor" },
      ),
    ),
  ]),
  specifications: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("note", ta("Note")),
    e(
      "groups",
      list(
        "Schedules",
        [
          e("title", t("Schedule title", "e.g. Structure & envelope")),
          e("rows", list("Rows", [e("k", t("Label")), e("v", t("Value"))], { titleKey: "k", addLabel: "Add row" })),
        ],
        { titleKey: "title", addLabel: "Add schedule" },
      ),
    ),
  ]),
  costEstimate: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", t("Headline")),
    e("note", ta("Note")),
    e("currency", t("Currency", "e.g. KWD, USD, €")),
    e("table", { kind: "table", label: "Cost table", help: "Add or rename columns, then fill in each row. The last column is right-aligned as the figure." }),
    e("total", grp("Total", [e("k", t("Total label", "e.g. Estimated construction cost")), e("v", t("Total value", "e.g. 1,785,100"))])),
    e("footnote", ta("Footnote", "Small print under the table — exclusions, accuracy, etc.")),
  ]),
  nextSteps: grp(undefined, [
    e("eyebrow", t("Eyebrow")),
    e("headline", sl("Headline", "Each entry is stacked on its own line", "Headline line")),
    e("text", ta("Intro text", undefined, 4)),
    e("steps", list("Steps", [e("n", t("Number", "e.g. 01")), e("title", t("Title")), e("text", ta("Description"))], { titleKey: "title", addLabel: "Add step" })),
    e("ctaLabel", t("Call-to-action label", "e.g. Start the conversation")),
  ]),
};

export const projectInfoSchema: GroupField = grp(undefined, [
  e("name", t("Project name")),
  e("codename", t("Codename", "Shown in small labels around the deck")),
  e("subtitle", t("Subtitle")),
  e("description", ta("Short description", "Used for link previews / SEO")),
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
    e("ink2", { kind: "color", label: "Alternate section background", help: "Used on some sections to create rhythm" }),
    e("ink3", { kind: "color", label: "Image / card background", help: "Shows behind images while they load" }),
    e("bone", { kind: "color", label: "Primary text" }),
    e("boneDim", { kind: "color", label: "Secondary text" }),
    e("boneFaint", { kind: "color", label: "Faint text & labels" }),
    e("clay", { kind: "color", label: "Accent colour", help: "Highlights, hover states" }),
    e("clayDim", { kind: "color", label: "Accent — dim" }),
  ],
  "This palette is shared across every project. It is tuned for a warm ivory ground with ink type — keep strong contrast or the site can become hard to read.",
);

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
    case "table":
      return { columns: ["Item", "Value"], rows: [] };
    case "group": {
      const out: Record<string, unknown> = {};
      for (const { key, field: f } of field.fields) out[key] = blankValue(f);
      return out;
    }
  }
}
