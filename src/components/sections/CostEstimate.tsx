"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useSections } from "@/lib/content-context";

export function CostEstimate() {
  const c = useSections().costEstimate;
  const columns = c.table?.columns ?? [];
  const rows = c.table?.rows ?? [];

  // The "total" row is styled red with a divider above it. It is the row the
  // editor flags (totalRowIndex) or, failing that, any row whose first cell
  // begins with "total".
  const totalIdx =
    typeof c.totalRowIndex === "number" && c.totalRowIndex >= 0 && c.totalRowIndex < rows.length
      ? c.totalRowIndex
      : rows.findIndex((r) => String(r?.[0] ?? "").trim().toLowerCase().startsWith("total"));

  return (
    <Section domId="costEstimate" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="costEstimate" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            All figures in {c.currency}
          </Reveal>
        </div>

        {/* Title — large, top-left */}
        <div className="mt-12 grid gap-x-16 gap-y-8 md:mt-20 md:grid-cols-12">
          <div className="md:col-span-8">
            <AnimatedText
              as="h2"
              text={c.headline}
              by="word"
              stagger={0.06}
              className="display text-balance text-[clamp(2.6rem,8vw,7rem)] leading-[0.98] text-bone"
            />
          </div>
          <div className="self-end md:col-span-3 md:col-start-10">
            <Reveal delay={0.15}>
              <p className="copy text-balance">{c.note}</p>
            </Reveal>
          </div>
        </div>

        {/* The estimate, as a clean wide table */}
        <Reveal soft className="mt-14 md:mt-20">
          <div data-lenis-prevent className="overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-bone/25">
                  {columns.map((col, ci) => (
                    <th
                      key={ci}
                      className={`whitespace-nowrap pb-5 align-bottom font-sans text-[0.6rem] uppercase tracking-[0.22em] text-bone-faint ${
                        ci === 0 ? "pr-8" : "px-4 text-right"
                      } ${ci === columns.length - 1 ? "pr-0" : ""}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => {
                  const isTotal = ri === totalIdx;
                  return (
                    <tr
                      key={ri}
                      className={
                        isTotal
                          ? "border-t border-bone/40"
                          : "border-b border-line transition-colors hover:bg-bone/[0.025]"
                      }
                    >
                      {columns.map((_, ci) => {
                        const value = row[ci] ?? "";
                        const base = ci === 0 ? "pr-8" : "px-4 text-right tabular-nums";
                        const edge = ci === columns.length - 1 ? "pr-0" : "";
                        const tone = isTotal
                          ? "text-accent"
                          : ci === 0
                            ? "text-bone"
                            : "text-bone-dim";
                        const weight = (ci === 0 || isTotal) ? "font-medium" : "font-normal";
                        return (
                          <td
                            key={ci}
                            className={`align-baseline font-sans leading-snug ${
                              isTotal ? "pt-6 pb-1 text-[1.05rem] md:text-[1.15rem]" : "py-5 text-[0.95rem]"
                            } ${base} ${edge} ${tone} ${weight}`}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>

        {c.footnote && (
          <Reveal delay={0.1} className="mt-8 max-w-2xl">
            <p className="font-sans text-[0.78rem] leading-relaxed text-bone-faint">{c.footnote}</p>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
