"use client";

import { createContext, useContext } from "react";
import { defaultContent, type SiteContent } from "./content";

const ContentContext = createContext<SiteContent>(defaultContent);

export function ContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useContent(): SiteContent {
  return useContext(ContentContext);
}
export function useStudio() {
  return useContent().studio;
}
export function useNav() {
  return useContent().nav;
}
export function usePresentation() {
  return useContent().presentation;
}
export function useVisibility() {
  return useContent().visibility;
}
export function useTheme() {
  return useContent().theme;
}
