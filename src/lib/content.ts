/**
 * ──────────────────────────────────────────────────────────────────────────
 *  ALHUMAIDHI ARCHITECTS — Presentation content model.
 *
 *  This file is the single source of truth for the cinematic presentation.
 *  Duplicate this object, swap the copy + imagery, and you have a brand-new
 *  project deck with identical motion, layout and rhythm.
 * ──────────────────────────────────────────────────────────────────────────
 */

export type Media = {
  src: string;
  alt: string;
  /** optional aspect ratio hint, "w / h" */
  ratio?: string;
};

export type SectionId =
  | "cover"
  | "overview"
  | "concept"
  | "moodboard"
  | "plans"
  | "renders"
  | "materials"
  | "team"
  | "contact";

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
};

export const nav: { id: SectionId; index: string; label: string }[] = [
  { id: "cover", index: "01", label: "Cover" },
  { id: "overview", index: "02", label: "Project Overview" },
  { id: "concept", index: "03", label: "Concept" },
  { id: "moodboard", index: "04", label: "Moodboard" },
  { id: "plans", index: "05", label: "Plans" },
  { id: "renders", index: "06", label: "Renders" },
  { id: "materials", index: "07", label: "Materials" },
  { id: "team", index: "08", label: "Team" },
  { id: "contact", index: "09", label: "Contact" },
];

/* Curated architectural imagery (Unsplash, served at runtime). */
const img = (id: string, w = 1920) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const presentation = {
  project: {
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
  },

  cover: {
    media: {
      src: img("1487958449943-2429e8be8625"),
      alt: "White concrete architectural facade in raking light",
    } as Media,
    eyebrow: "Concept Presentation — Vol. 01",
    titleLines: ["Majlis", "House"],
    summary:
      "A residence shaped by the desert's two gestures — the courtyard that holds shade, and the dune that yields to it.",
    meta: [
      { k: "Location", v: "Sabah Al Salem, Kuwait" },
      { k: "Typology", v: "Private Residence" },
      { k: "Year", v: "2024 — 2026" },
      { k: "Status", v: "In Design Development" },
    ],
  },

  overview: {
    eyebrow: "01 — Project Overview",
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
    media: {
      src: img("1600585154340-be6161a56a0c"),
      alt: "Minimal interior with diffused daylight",
    } as Media,
    secondaryMedia: {
      src: img("1600566753086-00f18fb6b3ea"),
      alt: "Concrete stair detail",
    } as Media,
  },

  concept: {
    eyebrow: "02 — Concept",
    keyword: "Threshold",
    headline: ["Between", "courtyard", "and dune"],
    paragraphs: [
      "Desert architecture has always negotiated two needs at once: to enclose, and to breathe. Majlis House treats that negotiation as its plan. A heavy outer shell registers the harshness of the site; a soft inner court registers the life within.",
      "The move is a single carved void. We pulled a courtyard through the centre of the volume and let it lean — wider at the sky, narrower at the ground — so that morning light rakes down one wall and evening light the other, while the noon sun never reaches the floor.",
    ],
    principles: [
      {
        n: "01",
        title: "Mass before glass",
        text: "Thermal mass does the first work of cooling; openings are earned, not assumed.",
      },
      {
        n: "02",
        title: "One room, folded",
        text: "Living, dining and majlis are a single volume bent around the water court.",
      },
      {
        n: "03",
        title: "Borrowed light",
        text: "Every habitable room takes daylight from the shaded centre, never the bare horizon.",
      },
      {
        n: "04",
        title: "The long approach",
        text: "Arrival is choreographed along a blind wall — anticipation, then release.",
      },
    ],
    media: {
      src: img("1517581177682-a085bb7ffb15"),
      alt: "Raw concrete wall with directional shadow",
    } as Media,
  },

  moodboard: {
    eyebrow: "03 — Moodboard",
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
    ] as Media[],
  },

  plans: {
    eyebrow: "04 — Plans",
    headline: "The plan, level by level",
    note: "Drawn at 1:200. The courtyard is the constant; everything else negotiates its edge.",
    levels: [
      {
        code: "L0",
        title: "Ground — Living & Majlis",
        area: "640 m²",
        notes: "Entry sequence, majlis, kitchen and living folded around the water court; service spine to the north.",
        media: { src: img("1503387762-592deb58ef4e", 1600), alt: "Architectural ground floor plan drawing" } as Media,
      },
      {
        code: "L1",
        title: "First — Private Quarters",
        area: "420 m²",
        notes: "Four bedrooms and the principal suite, each with a shaded loggia overlooking the court.",
        media: { src: img("1582719478250-c89cae4dc85b", 1600), alt: "First floor architectural plan" } as Media,
      },
      {
        code: "RF",
        title: "Roof — Terrace & Mechanical",
        area: "180 m²",
        notes: "Evening terrace, pergola, photovoltaic array and concealed plant screened by a perforated parapet.",
        media: { src: img("1487014679447-9f8336841d58", 1600), alt: "Roof plan and site diagram" } as Media,
      },
      {
        code: "ST",
        title: "Site — Approach & Landscape",
        area: "2,050 m²",
        notes: "The long blind wall, the gravel forecourt, native planting and the transition from street grid to dune.",
        media: { src: img("1473773508845-188df298d2d1", 1600), alt: "Site plan with landscape" } as Media,
      },
    ],
  },

  renders: {
    eyebrow: "05 — Renders",
    headline: "The house, imagined in light",
    note: "Working visualisations — materials and planting are indicative of intent.",
    shots: [
      {
        title: "Approach — the blind wall",
        time: "07:40 · winter morning",
        text: "Board-formed concrete catches the low sun; the entrance reads only as a shadow until you are upon it.",
        media: { src: img("1511818966892-d7d671e672a2"), alt: "Concrete residence exterior at sunrise" } as Media,
      },
      {
        title: "The water court",
        time: "12:10 · midday",
        text: "The leaning courtyard keeps the floor in shade while the sky burns above the reflecting pool.",
        media: { src: img("1600607687939-ce8a6c25118c"), alt: "Interior courtyard with reflecting pool" } as Media,
      },
      {
        title: "Majlis at dusk",
        time: "18:55 · golden hour",
        text: "The folded living room opens fully to the court; warm interior light begins to read against the cooling concrete.",
        media: { src: img("1600566753086-00f18fb6b3ea"), alt: "Warm minimal living room at dusk" } as Media,
      },
      {
        title: "Roof terrace",
        time: "20:30 · blue hour",
        text: "Above the mass, the city edge and the dune line meet; the parapet frames sky, not street.",
        media: { src: img("1600585154340-be6161a56a0c"), alt: "Rooftop terrace at blue hour" } as Media,
      },
    ],
  },

  materials: {
    eyebrow: "06 — Materials",
    headline: "A palette of weight and warmth",
    note: "Four materials, used honestly. Nothing applied that could be structural; nothing structural that could be hidden.",
    palette: [
      {
        n: "M01",
        name: "Board-formed concrete",
        use: "Outer shell · approach wall",
        text: "Cast against rough-sawn timber so the wall carries the grain of its making. Left raw, sealed only against dust.",
        media: { src: img("1565538810643-b5bdb714032a", 1000), alt: "Board-formed concrete texture" } as Media,
      },
      {
        n: "M02",
        name: "Roman travertine",
        use: "Courtyard floors · majlis",
        text: "Vein-cut and honed. A pale, warm ground that reads almost as compacted sand under the courtyard light.",
        media: { src: img("1524758631624-e2822e304c36", 1000), alt: "Honed travertine stone surface" } as Media,
      },
      {
        n: "M03",
        name: "Oxidised brass",
        use: "Door pulls · screens · trim",
        text: "Allowed to patina. The single warm metal in the house — a glint at the threshold and along the courtyard screens.",
        media: { src: img("1605792657660-596af9009e82", 1000), alt: "Aged brass metal surface" } as Media,
      },
      {
        n: "M04",
        name: "Smoked oak",
        use: "Joinery · ceilings · doors",
        text: "Fumed to a deep umber. Lines the soffits of the loggias so the underside of the house feels lined, not poured.",
        media: { src: img("1620641788421-7a1c342ea42e", 1000), alt: "Dark smoked oak wood grain" } as Media,
      },
    ],
  },

  team: {
    eyebrow: "07 — Team",
    headline: "The studio behind the house",
    statement:
      "Alhumaidhi Architects is a small practice in Kuwait City working at the scale of the room and the region at once. Majlis House is led by a core team of four, with structural and environmental engineering brought in early.",
    members: [
      { name: "Yousef Alhumaidhi", role: "Founder · Design Director", since: "Principal in charge" },
      { name: "Dana Al-Rashid", role: "Project Architect", since: "Plan, section, site" },
      { name: "Omar Khalil", role: "Associate · Detailing", since: "Materials & construction" },
      { name: "Layla Mansour", role: "Designer · Visualisation", since: "Renders & light studies" },
    ],
    consultants: [
      { k: "Structure", v: "Werner & Sobek (associate)" },
      { k: "Environment", v: "Atelier Ten" },
      { k: "Landscape", v: "Desert Studio, Kuwait" },
      { k: "Lighting", v: "Light Bureau" },
    ],
    media: {
      src: img("1497366754035-f200968a6e72"),
      alt: "Architecture studio workspace with models",
    } as Media,
  },

  contact: {
    eyebrow: "08 — Contact",
    headline: ["Let us build", "something", "that lasts"],
    text: "For the full design package, fee proposal or a studio visit, reach the team directly. We respond within two working days.",
  },
};

export type Presentation = typeof presentation;

/* ──────────────────────────────────────────────────────────────────────────
 *  Editable site model — what the /admin dashboard reads and writes.
 *  `defaultContent` is the built-in fallback shown before anything is saved.
 * ────────────────────────────────────────────────────────────────────────── */

export type NavItem = { id: SectionId; index: string; label: string };

export type ThemeColors = {
  ink: string;
  ink2: string;
  ink3: string;
  bone: string;
  boneDim: string;
  boneFaint: string;
  clay: string;
  clayDim: string;
};

export type Visibility = Record<SectionId, boolean>;

/** Editable colour palette — overrides the CSS theme tokens at runtime.
 *  Editorial architecture: warm ivory ground, ink type, colour only in photos. */
export const theme: ThemeColors = {
  ink: "#f4f0e7",
  ink2: "#ece6d8",
  ink3: "#e3dccb",
  bone: "#1a1711",
  boneDim: "#4c473b",
  boneFaint: "#8b8472",
  clay: "#9d8d72",
  clayDim: "#786c57",
};

/** Which sections appear on the public site. */
export const visibility: Visibility = {
  cover: true,
  overview: true,
  concept: true,
  moodboard: true,
  plans: true,
  renders: true,
  materials: true,
  team: true,
  contact: true,
};

export type SiteContent = {
  studio: typeof studio;
  nav: NavItem[];
  presentation: Presentation;
  theme: ThemeColors;
  visibility: Visibility;
};

export const defaultContent: SiteContent = {
  studio,
  nav,
  presentation,
  theme,
  visibility,
};
