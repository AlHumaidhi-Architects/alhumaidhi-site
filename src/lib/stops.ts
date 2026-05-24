import { SECTION_LABELS, type Project, type SectionId } from "./content";

/**
 * A "stop" is one navigable destination in a presentation — what the menu, the
 * scroll index and the side ticks point at. Most sections are a single stop;
 * the Floors section expands into one stop per floor, so each floor reads as its
 * own section/slide with its own entry in the index.
 */
export type Stop = {
  /** the DOM element id to scroll to */
  domId: string;
  /** which section type this stop belongs to */
  sectionId: SectionId;
  /** zero-padded running index, e.g. "03" */
  index: string;
  /** menu / index label */
  label: string;
};

export function buildStops(project: Project): Stop[] {
  const raw: Omit<Stop, "index">[] = [];

  for (const item of project.sequence) {
    if (!item.visible) continue;

    if (item.id === "floors") {
      const floors = project.sections.floors?.floors ?? [];
      floors.forEach((floor, i) => {
        raw.push({
          domId: `floor-${i}`,
          sectionId: "floors",
          label: floor.title || `Floor ${i + 1}`,
        });
      });
      continue;
    }

    raw.push({
      domId: item.id,
      sectionId: item.id,
      label: item.label || SECTION_LABELS[item.id],
    });
  }

  return raw.map((s, i) => ({ ...s, index: String(i + 1).padStart(2, "0") }));
}
