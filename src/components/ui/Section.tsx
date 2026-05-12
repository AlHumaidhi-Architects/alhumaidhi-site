"use client";

import type { SectionId } from "@/lib/content";
import { useNav } from "@/lib/content-context";

type SectionProps = {
  id: SectionId;
  children: React.ReactNode;
  className?: string;
  /** full viewport height min */
  full?: boolean;
  bg?: "ink" | "ink-2" | "ink-3";
};

export function Section({ id, children, className = "", full = false, bg = "ink" }: SectionProps) {
  const nav = useNav();
  const index = nav.findIndex((n) => n.id === id);
  const bgClass = bg === "ink-2" ? "bg-ink-2" : bg === "ink-3" ? "bg-ink-3" : "bg-ink";
  return (
    <section
      id={id}
      data-section
      data-section-index={index}
      className={`relative ${bgClass} ${full ? "min-h-screen" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

/** A label shown at the top of editorial sections: "02 — Concept" */
export function SectionTag({ id, className = "" }: { id: SectionId; className?: string }) {
  const nav = useNav();
  const item = nav.find((n) => n.id === id);
  if (!item) return null;
  return (
    <span className={`eyebrow ${className}`}>
      {item.index} — {item.label}
    </span>
  );
}
