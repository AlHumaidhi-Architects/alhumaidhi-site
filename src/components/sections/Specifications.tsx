"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useSections } from "@/lib/content-context";

export function Specifications() {
  const s = useSections().specifications;
  const groups = s.groups ?? [];

  return (
    <Section domId="specifications" bg="ink-2" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="specifications" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            Built-up areas
          </Reveal>
        </div>

        {/* Large floor title */}
        <div className="mt-12 md:mt-20">
          <AnimatedText
            as="h2"
            text={s.headline}
            by="word"
            stagger={0.06}
            className="display text-balance text-[clamp(2.6rem,8vw,7rem)] leading-[0.98] text-bone"
          />
          {/* Floor area / subtitle row */}
          {s.note && (
            <Reveal>
              <p className="copy mt-5 max-w-2xl text-[1.05rem] leading-[1.7]">{s.note}</p>
            </Reveal>
          )}
        </div>

        {/* Thin horizontal divider */}
        <div className="mt-10 border-t border-bone/25 md:mt-14" />

        {/* Three category columns: room names + areas */}
        <div className="mt-12 grid gap-x-14 gap-y-14 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, i) => (
            <Reveal key={i} delay={i * 0.06} soft>
              <h3 className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-bone-faint">{group.title}</h3>
              <dl className="mt-5">
                {(group.rows ?? []).map((row, k) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-3"
                  >
                    <dt className="font-sans text-[0.95rem] font-medium leading-snug text-bone">{row.k}</dt>
                    {row.v && (
                      <dd className="shrink-0 font-sans text-[0.95rem] font-medium tabular-nums leading-snug text-bone">
                        {row.v}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
