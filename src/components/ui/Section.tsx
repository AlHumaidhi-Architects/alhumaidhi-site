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
};

export function Section({ domId, children, className = "", full = false, bg = "ink" }: SectionProps) {
  const stops = useStops();
  const index = stops.findIndex((s) => s.domId === domId);
  const bgClass = bg === "ink-2" ? "bg-ink-2" : bg === "ink-3" ? "bg-ink-3" : "bg-ink";
  return (
    <section
      id={domId}
      data-section
      data-section-index={index}
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
