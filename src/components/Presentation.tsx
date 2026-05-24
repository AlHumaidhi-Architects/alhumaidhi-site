"use client";

import { PresentationProvider } from "@/lib/content-context";
import { AppShell } from "./AppShell";
import { SectionRenderer } from "./SectionRenderer";
import type { Project, Studio, ThemeColors } from "@/lib/content";

/** A complete presentation deck for one project — provider + shell + sections. */
export function Presentation({
  studio,
  theme,
  project,
  year,
}: {
  studio: Studio;
  theme: ThemeColors;
  project: Project;
  year: number;
}) {
  return (
    <PresentationProvider studio={studio} theme={theme} project={project} year={year}>
      <div className="grain">
        <AppShell>
          <SectionRenderer />
        </AppShell>
      </div>
    </PresentationProvider>
  );
}
