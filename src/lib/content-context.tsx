"use client";

import { createContext, useContext, useMemo } from "react";
import {
  defaultContent,
  getPublished,
  type Project,
  type Studio,
  type ThemeColors,
} from "./content";
import { buildStops, type Stop } from "./stops";

type PresentationCtx = {
  studio: Studio;
  theme: ThemeColors;
  project: Project;
  stops: Stop[];
  /** current year, computed on the server and passed down (hydration-safe) */
  year: number;
};

const fallbackProject = getPublished(defaultContent) as Project;

const PresentationContext = createContext<PresentationCtx>({
  studio: defaultContent.studio,
  theme: defaultContent.theme,
  project: fallbackProject,
  stops: buildStops(fallbackProject),
  year: 2025,
});

export function PresentationProvider({
  studio,
  theme,
  project,
  year,
  children,
}: {
  studio: Studio;
  theme: ThemeColors;
  project: Project;
  year: number;
  children: React.ReactNode;
}) {
  const value = useMemo<PresentationCtx>(
    () => ({ studio, theme, project, stops: buildStops(project), year }),
    [studio, theme, project, year],
  );
  return <PresentationContext.Provider value={value}>{children}</PresentationContext.Provider>;
}

export function usePresentation() {
  return useContext(PresentationContext);
}
export function useStudio() {
  return usePresentation().studio;
}
export function useTheme() {
  return usePresentation().theme;
}
export function useProject() {
  return usePresentation().project;
}
export function useInfo() {
  return usePresentation().project.info;
}
export function useSections() {
  return usePresentation().project.sections;
}
export function useStops() {
  return usePresentation().stops;
}
export function useYear() {
  return usePresentation().year;
}
/** Cache-bust token for this deck's uploaded media — changes when the project is edited. */
export function useMediaVersion(): string {
  const { updatedAt } = usePresentation().project;
  return updatedAt != null ? String(updatedAt) : "0";
}
