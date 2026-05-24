"use client";

import type { SectionId } from "@/lib/content";
import { useProject } from "@/lib/content-context";
import { Cover } from "@/components/sections/Cover";
import { Intro } from "@/components/sections/Intro";
import { SitePlot } from "@/components/sections/SitePlot";
import { GifDiagram } from "@/components/sections/GifDiagram";
import { MoodImages } from "@/components/sections/MoodImages";
import { Floors } from "@/components/sections/Floors";
import { Specifications } from "@/components/sections/Specifications";
import { CostEstimate } from "@/components/sections/CostEstimate";
import { NextSteps } from "@/components/sections/NextSteps";

const COMPONENTS: Record<SectionId, () => React.JSX.Element> = {
  cover: Cover,
  intro: Intro,
  sitePlot: SitePlot,
  gifDiagram: GifDiagram,
  moodImages: MoodImages,
  floors: Floors,
  specifications: Specifications,
  costEstimate: CostEstimate,
  nextSteps: NextSteps,
};

/** Renders a project's sections in its editable sequence order (Floors expands
 *  internally into one section per floor). */
export function SectionRenderer() {
  const project = useProject();
  return (
    <>
      {project.sequence
        .filter((item) => item.visible)
        .map((item) => {
          const Component = COMPONENTS[item.id];
          return Component ? <Component key={item.id} /> : null;
        })}
    </>
  );
}
