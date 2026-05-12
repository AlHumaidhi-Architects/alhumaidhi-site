"use client";

import type { SectionId } from "@/lib/content";
import { useVisibility } from "@/lib/content-context";
import { Cover } from "@/components/sections/Cover";
import { Overview } from "@/components/sections/Overview";
import { Concept } from "@/components/sections/Concept";
import { Moodboard } from "@/components/sections/Moodboard";
import { Plans } from "@/components/sections/Plans";
import { Renders } from "@/components/sections/Renders";
import { Materials } from "@/components/sections/Materials";
import { Team } from "@/components/sections/Team";
import { Contact } from "@/components/sections/Contact";

const SECTIONS: { id: SectionId; Component: () => React.JSX.Element }[] = [
  { id: "cover", Component: Cover },
  { id: "overview", Component: Overview },
  { id: "concept", Component: Concept },
  { id: "moodboard", Component: Moodboard },
  { id: "plans", Component: Plans },
  { id: "renders", Component: Renders },
  { id: "materials", Component: Materials },
  { id: "team", Component: Team },
  { id: "contact", Component: Contact },
];

export function SectionList() {
  const visibility = useVisibility();
  return (
    <>
      {SECTIONS.filter(({ id }) => visibility[id] !== false).map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </>
  );
}
