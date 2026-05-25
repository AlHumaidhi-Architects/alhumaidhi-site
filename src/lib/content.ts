/**
 * ──────────────────────────────────────────────────────────────────────────
 *  ALHUMAIDHI ARCHITECTS — Presentation template engine (content model).
 *
 *  This file is the single source of truth for the platform. The shape is a
 *  small CMS:
 *
 *    SiteContent
 *      ├─ studio       global brand (wordmark, contact, socials)
 *      ├─ theme        global colour palette
 *      ├─ projects[]   each a complete, duplicatable presentation
 *      └─ publishedId  which project the root URL (/) shows
 *
 *  Every project follows the same fixed 9-step sequence — Cover, Intro, Site
 *  Plot, GIF Diagram, Mood Images, Floors, Specifications, Cost Estimate, Next
 *  Steps — so a project can be cloned in the /admin panel, its copy + imagery
 *  swapped, and you have a brand-new deck with identical motion and rhythm.
 * ──────────────────────────────────────────────────────────────────────────
 */

export const SCHEMA_VERSION = 2;

/* ── Shared media ───────────────────────────────────────────────────────── */

export type Media = {
  src: string;
  alt: string;
  /** optional aspect ratio hint, "w / h" */
  ratio?: string;
  /** poster frame shown for videos before playback */
  poster?: string;
};

/* ── The fixed section sequence ─────────────────────────────────────────── */

export type SectionId =
  | "cover"
  | "intro"
  | "sitePlot"
  | "gifDiagram"
  | "moodImages"
  | "floors"
  | "specifications"
  | "costEstimate"
  | "nextSteps";

/** Canonical order of the sequence. Projects may hide or reorder via `sequence`. */
export const SECTION_ORDER: SectionId[] = [
  "cover",
  "intro",
  "sitePlot",
  "gifDiagram",
  "moodImages",
  "floors",
  "specifications",
  "costEstimate",
  "nextSteps",
];

export const SECTION_LABELS: Record<SectionId, string> = {
  cover: "Cover",
  intro: "Intro",
  sitePlot: "Site Plot",
  gifDiagram: "Diagram",
  moodImages: "Mood Images",
  floors: "Floors",
  specifications: "Specifications",
  costEstimate: "Cost Estimate",
  nextSteps: "Next Steps",
};

/** One entry in a project's editable running order. */
export type SequenceItem = { id: SectionId; label: string; visible: boolean };

/* ── Per-section data shapes ────────────────────────────────────────────── */

export type KV = { k: string; v: string };

export type CoverData = {
  eyebrow: string;
  titleLines: string[];
  summary: string;
  media: Media;
  meta: KV[];
};

export type IntroData = {
  eyebrow: string;
  statement: string;
  body: string[];
  facts: KV[];
  /** Flexible image/video gallery: the first item renders full-bleed, the rest
   *  flow as inset figures. Add / remove / reorder freely in /admin. */
  gallery: Media[];
  /** @deprecated legacy single slots — migrated into `gallery` at read time. */
  media?: Media;
  /** @deprecated legacy single slots — migrated into `gallery` at read time. */
  secondaryMedia?: Media;
};

export type SitePlotData = {
  eyebrow: string;
  headline: string;
  note: string;
  photo: Media;
  body: string[];
  plans: { title: string; caption: string; media: Media }[];
};

export type GifDiagramData = {
  eyebrow: string;
  headline: string;
  note: string;
  /** concept explanation / design narrative — one paragraph per entry */
  body: string[];
  /** caption beneath the featured (first) item */
  caption: string;
  /** flexible concept media — first item is featured full-bleed, the rest flow
   *  as supporting photos / plans / diagrams. Add / remove / reorder in /admin. */
  gallery: Media[];
  /** @deprecated legacy single slot — migrated into `gallery` at read time */
  media?: Media;
};

export type MoodImagesData = {
  eyebrow: string;
  headline: string;
  note: string;
  images: Media[];
};

export type Floor = {
  code: string;
  title: string;
  area: string;
  /** the design intent / written explanation, one paragraph per entry */
  intent: string[];
  plan: Media;
  /** related mood / reference imagery for this floor */
  moods: Media[];
};

export type FloorsData = {
  eyebrow: string;
  headline: string;
  note: string;
  floors: Floor[];
};

export type SpecGroup = { title: string; rows: KV[] };

export type SpecificationsData = {
  eyebrow: string;
  headline: string;
  note: string;
  groups: SpecGroup[];
};

/** An editable grid — column headers plus rows whose cells align to columns. */
export type CostTable = {
  columns: string[];
  rows: string[][];
};

export type CostEstimateData = {
  eyebrow: string;
  headline: string;
  note: string;
  currency: string;
  table: CostTable;
  /** Optional index of the row to style as the red "total" row (also auto-detected
   *  when a row's first cell starts with "total"). */
  totalRowIndex?: number;
  /** Legacy single total — still rendered as the red total row for older saved
   *  content whose table has no in-table "Total" row. */
  total?: KV;
  footnote: string;
};

export type NextStep = { n: string; title: string; text: string };

export type NextStepsData = {
  eyebrow: string;
  headline: string[];
  text: string;
  steps: NextStep[];
  /** @deprecated the closing CTA is now the Approved / Email Comments actions */
  ctaLabel?: string;
};

export type SectionData = {
  cover: CoverData;
  intro: IntroData;
  sitePlot: SitePlotData;
  gifDiagram: GifDiagramData;
  moodImages: MoodImagesData;
  floors: FloorsData;
  specifications: SpecificationsData;
  costEstimate: CostEstimateData;
  nextSteps: NextStepsData;
};

/* ── Project ────────────────────────────────────────────────────────────── */

export type ProjectInfo = {
  codename: string;
  name: string;
  subtitle: string;
  client: string;
  location: string;
  typology: string;
  area: string;
  year: string;
  status: string;
  phase: string;
  description: string;
  /** optional PDF (Supabase upload or pasted URL) — shows a "Download Plans"
   *  button in the Intro when set */
  plansPdf?: string;
  /** where the "Email Comments" button addresses its draft. Falls back to the
   *  studio email when empty. Carried through when a project is duplicated. */
  commentsEmail?: string;
};

/** Client sign-off recorded from the public deck's "Approved" button. */
export type ProjectApproval = {
  /** the client's typed name / signature */
  approvedBy: string;
  /** ISO timestamp recorded on the server when approval was confirmed */
  approvedAt: string;
};

export type Project = {
  id: string;
  slug: string;
  /** internal title shown in the admin project list */
  title: string;
  published: boolean;
  /** epoch ms of the last edit — used to cache-bust this deck's uploaded media */
  updatedAt?: number;
  info: ProjectInfo;
  sequence: SequenceItem[];
  sections: SectionData;
  /** present once the client has approved this presentation */
  approval?: ProjectApproval;
};

/* ── Global brand + theme ───────────────────────────────────────────────── */

export const studio = {
  name: "Alhumaidhi Architects",
  shortName: "Alhumaidhi",
  wordmark: "ALHUMAIDHI",
  wordmarkSub: "ARCHITECTS",
  tagline: "Architecture of light, weight and quiet",
  established: "EST. 2009",
  city: "Kuwait City",
  email: "studio@alhumaidhi.archi",
  phone: "+965 2200 0000",
  address: ["Tower 12, Floor 21", "Al Soor Street, Sharq", "Kuwait City, Kuwait"],
  socials: [
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Behance", href: "#" },
  ],
  /**
   * Brand artwork. Both are optional — when empty the deck falls back to the
   * text wordmark above.
   *   header — the logo shown top-left across the presentation. Use a light /
   *            white transparent PNG or SVG so it reads on both the ivory
   *            sections and full-bleed photographs.
   *   intro  — the animated logo shown on the loading screen. GIF, MP4, WEBM
   *            or a still image.
   */
  logo: {
    header: "",
    intro: "",
  },
};

export type Studio = typeof studio;

export type ThemeColors = {
  ink: string;
  ink2: string;
  ink3: string;
  bone: string;
  boneDim: string;
  boneFaint: string;
  clay: string;
  clayDim: string;
  /** highlight red — used for emphasised words and the cost total row */
  accent: string;
};

/** Editorial architecture: warm ivory ground, ink type, colour only in photos. */
export const theme: ThemeColors = {
  ink: "#f4f0e7",
  ink2: "#ece6d8",
  ink3: "#e3dccb",
  bone: "#1a1711",
  boneDim: "#4c473b",
  boneFaint: "#8b8472",
  clay: "#9d8d72",
  clayDim: "#786c57",
  accent: "#c0392b",
};

/* ── Imagery helper ─────────────────────────────────────────────────────── */

/* Curated architectural imagery (Unsplash, served at runtime). */
const img = (id: string, w = 1920) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ──────────────────────────────────────────────────────────────────────────
 *  Default demo project — "Majlis House".
 *  This is the master template: clone it in /admin to start a new deck.
 * ────────────────────────────────────────────────────────────────────────── */

function defaultSequence(): SequenceItem[] {
  return SECTION_ORDER.map((id) => ({ id, label: SECTION_LABELS[id], visible: true }));
}

const majlis: Project = {
  id: "majlis-house",
  slug: "majlis-house",
  title: "Majlis House",
  published: true,
  info: {
    codename: "MAJLIS — DESERT THRESHOLD",
    name: "Majlis House",
    subtitle: "A desert residence between courtyard and dune",
    client: "Private Commission",
    location: "Sabah Al Salem, Kuwait",
    typology: "Private Residence",
    area: "1,240 m²",
    year: "2024 — 2026",
    status: "In Design Development",
    phase: "Concept Presentation · Vol. 01",
    description:
      "A residence shaped by the desert's two gestures — the courtyard that holds shade, and the dune that yields to it.",
  },
  sequence: defaultSequence(),
  sections: {
    cover: {
      eyebrow: "Concept Presentation — Vol. 01",
      titleLines: ["Majlis", "House"],
      summary:
        "A residence shaped by the desert's two gestures — the courtyard that holds shade, and the dune that yields to it.",
      media: {
        src: img("1487958449943-2429e8be8625"),
        alt: "White concrete architectural facade in raking light",
      },
      meta: [
        { k: "Location", v: "Sabah Al Salem, Kuwait" },
        { k: "Typology", v: "Private Residence" },
        { k: "Year", v: "2024 — 2026" },
        { k: "Status", v: "In Design Development" },
      ],
    },

    intro: {
      eyebrow: "01 — Intro",
      statement:
        "The brief asked for a house that disappears by day and glows by night. We answered with mass: a single travertine volume carved by a courtyard, so that every room borrows light from a shaded centre rather than the punishing horizon.",
      body: [
        "Majlis House sits on a corner plot where the city grid loosens into low dunes. Rather than turn its back on the street, the house presents a long, near-blind wall of board-formed concrete — a threshold, not a barrier — drawing visitors along its length to a single deep-set entrance.",
        "Inside, the plan inverts: rooms open inward to a planted courtyard and a shallow reflecting pool. The result is a microclimate — three to four degrees cooler than the street — and a sequence of spaces that read as one continuous room folded around water.",
      ],
      facts: [
        { k: "Client", v: "Private Commission" },
        { k: "Site Area", v: "2,050 m²" },
        { k: "Built Area", v: "1,240 m²" },
        { k: "Programme", v: "5 bed · majlis · pool house" },
        { k: "Sustainability", v: "Passive cooling · greywater reuse" },
        { k: "Status", v: "Design Development — 2026" },
      ],
      gallery: [
        { src: img("1600585154340-be6161a56a0c"), alt: "Minimal interior with diffused daylight" },
        { src: img("1600566753086-00f18fb6b3ea"), alt: "Concrete stair detail", ratio: "4 / 5" },
      ],
    },

    sitePlot: {
      eyebrow: "02 — Site Plot",
      headline: "The plot, and the line we drew across it",
      note: "The long blind wall, the gravel forecourt and the transition from street grid to open dune.",
      photo: {
        src: img("1473773508845-188df298d2d1"),
        alt: "Aerial view of a desert site at dusk",
      },
      body: [
        "The plot is a corner condition: two streets to the north and east, low dunes opening to the south-west. We anchored the mass to the streets and let the landscape spill from the protected inner court toward the open horizon.",
        "A single gesture organises the site — a 38-metre wall that registers the harshness of the approach and choreographs arrival along its length to one deep-set threshold.",
      ],
      plans: [
        {
          title: "Site plan — 1:500",
          caption: "Approach, forecourt and the line of the blind wall",
          media: { src: img("1503387762-592deb58ef4e", 1600), alt: "Architectural site plan drawing" },
        },
        {
          title: "Landscape strategy",
          caption: "Native planting, gravel forecourt and the dune edge",
          media: { src: img("1487014679447-9f8336841d58", 1600), alt: "Landscape and roof plan diagram" },
        },
      ],
    },

    gifDiagram: {
      eyebrow: "03 — Diagram",
      headline: "How the volume is carved",
      note: "A single move: a courtyard pulled through the centre and leaned toward the sky.",
      body: [
        "The concept is one gesture, read three ways. A solid travertine block is hollowed by a single courtyard, which is then leaned toward the southern sky so that low light rakes its inner walls through the day.",
        "The studies below trace that move — from massing diagram to plan logic to the texture studies that fix the material temperature of the inner court.",
      ],
      caption: "Massing study — solid to void, dawn to dusk",
      gallery: [
        {
          src: img("1517581177682-a085bb7ffb15"),
          alt: "Animated massing diagram of the carved courtyard volume",
        },
        { src: img("1503387762-592deb58ef4e", 1400), alt: "Concept plan — the courtyard pulled through the centre", ratio: "4 / 3" },
        { src: img("1524758631624-e2822e304c36", 1200), alt: "Texture study — travertine in raking light", ratio: "4 / 3" },
      ],
    },

    moodImages: {
      eyebrow: "04 — Mood Images",
      headline: "Atmospheres we are chasing",
      note: "References, not answers — texture, temperature and the quality of shadow we want the house to hold.",
      images: [
        { src: img("1531973576160-7125cd663d86", 1200), alt: "Sunlight across a plaster wall", ratio: "3 / 4" },
        { src: img("1545324418-cc1a3fa10c00", 1200), alt: "Minimal arched corridor", ratio: "3 / 4" },
        { src: img("1493809842364-78817add7ffb", 1400), alt: "Quiet interior with a single chair", ratio: "4 / 3" },
        { src: img("1600210492493-0946911123ea", 1200), alt: "Stone bath in soft light", ratio: "3 / 4" },
        { src: img("1604014237800-1c9102c219da", 1400), alt: "Desert horizon at dusk", ratio: "16 / 10" },
        { src: img("1502005229762-cf1b2da7c5d6", 1200), alt: "Modern villa courtyard", ratio: "4 / 5" },
        { src: img("1524758631624-e2822e304c36", 1400), alt: "Travertine surface close up", ratio: "4 / 3" },
        { src: img("1505691938895-1758d7feb511", 1200), alt: "Light study on a curved wall", ratio: "3 / 4" },
      ],
    },

    floors: {
      eyebrow: "05 — Floors",
      headline: "The house, level by level",
      note: "Each level negotiates the courtyard's edge differently. The court is the constant.",
      floors: [
        {
          code: "L0",
          title: "Ground — Living & Majlis",
          area: "640 m²",
          intent: [
            "The ground floor is a single volume folded around the water court: entry sequence, majlis, kitchen and living read as one continuous room, with the service spine held quietly to the north.",
            "Every habitable space borrows light from the shaded centre, so the floor stays cool and even while the courtyard sky burns above.",
          ],
          plan: { src: img("1503387762-592deb58ef4e", 1600), alt: "Ground floor architectural plan" },
          moods: [
            { src: img("1600607687939-ce8a6c25118c", 1200), alt: "Interior courtyard with reflecting pool", ratio: "4 / 3" },
            { src: img("1600566753086-00f18fb6b3ea", 1000), alt: "Warm minimal living room", ratio: "3 / 4" },
          ],
        },
        {
          code: "L1",
          title: "First — Private Quarters",
          area: "420 m²",
          intent: [
            "Four bedrooms and the principal suite ring the upper court, each opening to a shaded loggia that overlooks the water below.",
            "Deep reveals and a perforated parapet filter the low sun, turning each window into a quiet, framed view rather than a wall of glare.",
          ],
          plan: { src: img("1582719478250-c89cae4dc85b", 1600), alt: "First floor architectural plan" },
          moods: [
            { src: img("1600210492493-0946911123ea", 1200), alt: "Stone bath in soft light", ratio: "3 / 4" },
            { src: img("1505691938895-1758d7feb511", 1000), alt: "Light study on a curved wall", ratio: "3 / 4" },
          ],
        },
        {
          code: "RF",
          title: "Roof — Terrace & Mechanical",
          area: "180 m²",
          intent: [
            "An evening terrace and pergola crown the mass; the photovoltaic array and concealed plant sit behind a perforated parapet that frames sky, not street.",
            "Above the house, the city edge and the dune line finally meet.",
          ],
          plan: { src: img("1487014679447-9f8336841d58", 1600), alt: "Roof plan and site diagram" },
          moods: [
            { src: img("1604014237800-1c9102c219da", 1400), alt: "Rooftop terrace at blue hour", ratio: "16 / 10" },
          ],
        },
      ],
    },

    specifications: {
      eyebrow: "06 — Area Schedule",
      headline: "Area Schedule",
      note: "Built-up areas by program — the family, formal and service domains across the house.",
      groups: [
        {
          title: "Family Spaces",
          rows: [
            { k: "Family Living", v: "66 m²" },
            { k: "Family Kitchen", v: "31 m²" },
            { k: "Bedrooms (×4)", v: "180 m²" },
            { k: "Principal Suite", v: "74 m²" },
          ],
        },
        {
          title: "Formal Spaces",
          rows: [
            { k: "Majlis", v: "58 m²" },
            { k: "Formal Dining", v: "42 m²" },
            { k: "Entrance Gallery", v: "26 m²" },
            { k: "Courtyard", v: "120 m²" },
          ],
        },
        {
          title: "Service Spaces",
          rows: [
            { k: "Service Kitchen", v: "24 m²" },
            { k: "Staff Quarters", v: "38 m²" },
            { k: "Plant & Storage", v: "30 m²" },
            { k: "Garage", v: "54 m²" },
          ],
        },
      ],
    },

    costEstimate: {
      eyebrow: "07 — Cost Estimate",
      headline: "Cost Estimation",
      note: "Indicative construction cost by floor, shown across three build-quality rates. Refined with the QS at design development.",
      currency: "KWD",
      table: {
        columns: [
          "Floor",
          "Indoor Area (sqm)",
          "Total Cost (500KD/sqm)",
          "Total Cost (600KD/sqm)",
          "Total Cost (700KD/sqm)",
        ],
        rows: [
          ["Ground — Living & Majlis", "640", "320,000", "384,000", "448,000"],
          ["First — Private Quarters", "420", "210,000", "252,000", "294,000"],
          ["Roof — Terrace & Mechanical", "180", "90,000", "108,000", "126,000"],
          ["Total", "1,240", "620,000", "744,000", "868,000"],
        ],
      },
      footnote: "Excludes land, professional fees, FF&E and statutory charges. ±15% at concept stage.",
    },

    nextSteps: {
      eyebrow: "08 — Next Steps",
      headline: ["Next Steps"],
      text: "With the concept agreed, we move into design development — resolving the plan, the details and the budget in parallel. For the full design package, fee proposal or a studio visit, reach the team directly.",
      steps: [
        { n: "01", title: "Concept *sign-off*", text: "Confirm the massing, the sequence and the material direction set out in this volume." },
        { n: "02", title: "Design *development*", text: "Resolve plans, sections and key details to 1:50, with structure and environment engaged." },
        { n: "03", title: "Cost & *programme*", text: "A measured estimate with the quantity surveyor, and a construction programme to completion." },
      ],
    },
  },
};

/* ──────────────────────────────────────────────────────────────────────────
 *  Editable site model — what the /admin dashboard reads and writes.
 *  `defaultContent` is the built-in fallback shown before anything is saved.
 * ────────────────────────────────────────────────────────────────────────── */

export type SiteContent = {
  schemaVersion: number;
  studio: Studio;
  theme: ThemeColors;
  projects: Project[];
  publishedId: string;
};

export const defaultContent: SiteContent = {
  schemaVersion: SCHEMA_VERSION,
  studio,
  theme,
  projects: [majlis],
  publishedId: majlis.id,
};

/* ── Helpers shared by server + client ──────────────────────────────────── */

export function slugify(input: string): string {
  // NFKD decomposes accented letters; we then keep only [a-z0-9] and collapse
  // everything else (including combining marks) into single dashes.
  const lower = input.toLowerCase().normalize("NFKD");
  let out = "";
  let prevDash = false;
  for (const ch of lower) {
    const code = ch.charCodeAt(0);
    if (code >= 0x300 && code <= 0x36f) continue; // combining diacritical marks
    if ((ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9")) {
      out += ch;
      prevDash = false;
    } else if (!prevDash) {
      out += "-";
      prevDash = true;
    }
  }
  return out.replace(/^-+|-+$/g, "").slice(0, 60) || "project";
}

/** The project the public site shows at `/`, with sensible fallbacks. */
export function getPublished(content: SiteContent): Project | undefined {
  return (
    content.projects.find((p) => p.id === content.publishedId && p.published) ||
    content.projects.find((p) => p.published) ||
    content.projects[0]
  );
}

export function getBySlug(content: SiteContent, slug: string): Project | undefined {
  return content.projects.find((p) => p.slug === slug);
}
