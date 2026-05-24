"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useSections } from "@/lib/content-context";

export function Specifications() {
  const s = useSections().specifications;

  return (
    <Section domId="specifications" bg="ink-2" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="specifications" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {s.groups.length} schedules
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-8 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-8">
            <AnimatedText
              as="h2"
              text={s.headline}
              by="word"
              stagger={0.06}
              className="display text-balance text-[clamp(2.6rem,8vw,7rem)] text-bone"
            />
          </div>
          <div className="self-end md:col-span-3 md:col-start-10">
            <Reveal delay={0.15}>
              <p className="copy text-balance">{s.note}</p>
            </Reveal>
          </div>
        </div>

        {/* grouped schedules — quiet ruled definition lists, no cards */}
        <div className="mt-16 grid gap-x-16 gap-y-16 md:mt-28 md:grid-cols-2 lg:grid-cols-3">
          {s.groups.map((group, i) => (
            <Reveal key={i} delay={i * 0.06} soft>
              <h3 className="font-sans text-[0.66rem] uppercase tracking-[0.28em] text-bone">{group.title}</h3>
              <dl className="mt-5 border-t border-line">
                {group.rows.map((row, k) => (
                  <div key={k} className="flex flex-col gap-1 border-b border-line py-4">
                    <dt className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-bone-faint">{row.k}</dt>
                    <dd className="font-sans text-[0.95rem] leading-snug text-bone-dim">{row.v}</dd>
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
