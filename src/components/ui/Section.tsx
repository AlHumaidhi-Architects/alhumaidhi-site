"use client";

import { useStops } from "@/lib/content-context";

type SectionProps = {
  /** DOM id / scroll anchor — must match a stop's domId */
  domId: string;
  children: React.ReactNode;
  className?: string;
  /** full viewport height min */
  full?: boolean;
  bg?: "ink" | "ink-2" | "ink-3";
  /**
   * Tone of the section behind the fixed header band (its top edge). Drives the
   * adaptive header colour: "dark" → white logo/menu, "light" → dark. Defaults
   * to "light" since the editorial sections are warm ivory at the top.
   */
  tone?: "dark" | "light";
};

export function Section({ domId, children, className = "", full = false, bg = "ink", tone = "light" }: SectionProps) {
  const stops = useStops();
  const index = stops.findIndex((s) => s.domId === domId);
  const bgClass = bg === "ink-2" ? "bg-ink-2" : bg === "ink-3" ? "bg-ink-3" : "bg-ink";
  return (
    <section
      id={domId}
      data-section
      data-section-index={index}
      data-nav-tone={tone}
      className={`relative ${bgClass} ${full ? "min-h-screen" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

/** A label shown at the top of editorial sections: "02 — Site Plot" */
export function SectionTag({ domId, className = "" }: { domId: string; className?: string }) {
  const stops = useStops();
  const stop = stops.find((s) => s.domId === domId);
  if (!stop) return null;
  return (
    <span className={`eyebrow ${className}`}>
      {stop.index} — {stop.label}
    </span>
  );
}
