"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useSections } from "@/lib/content-context";

export function CostEstimate() {
  const c = useSections().costEstimate;
  const columns = c.table?.columns ?? [];
  const rows = c.table?.rows ?? [];
  const lastCol = columns.length - 1;

  return (
    <Section domId="costEstimate" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="costEstimate" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            All figures in {c.currency}
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-8 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-8">
            <AnimatedText
              as="h2"
              text={c.headline}
              by="word"
              stagger={0.06}
              className="display text-balance text-[clamp(2.6rem,8vw,7rem)] text-bone"
            />
          </div>
          <div className="self-end md:col-span-3 md:col-start-10">
            <Reveal delay={0.15}>
              <p className="copy text-balance">{c.note}</p>
            </Reveal>
          </div>
        </div>

        {/* the estimate, as a clear table */}
        <Reveal soft className="mt-16 md:mt-24">
          <div data-lenis-prevent className="overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-bone/30">
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className={`whitespace-nowrap py-4 pr-6 font-sans text-[0.58rem] uppercase tracking-[0.24em] text-bone-faint ${
                        i === lastCol ? "pr-0 text-right" : ""
                      } ${i === 0 ? "w-12" : ""}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-line transition-colors hover:bg-bone/[0.03]">
                    {columns.map((_, ci) => (
                      <td
                        key={ci}
                        className={`py-5 pr-6 align-top font-sans text-[0.95rem] leading-snug ${
                          ci === lastCol
                            ? "pr-0 text-right tabular-nums text-bone"
                            : ci === 0
                              ? "tabular-nums text-bone-faint"
                              : "text-bone-dim"
                        }`}
                      >
                        {row[ci] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={Math.max(1, columns.length - 1)}
                    className="pt-7 font-sans text-[0.62rem] uppercase tracking-[0.26em] text-bone"
                  >
                    {c.total.k}
                  </td>
                  <td className="pt-7 text-right">
                    <span className="display text-[clamp(1.6rem,3vw,2.6rem)] text-bone">
                      <span className="mr-2 align-baseline text-[0.5em] tracking-widest text-bone-faint">{c.currency}</span>
                      {c.total.v}
                    </span>
                  </td>
                </tr>
              </tfoot>
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
