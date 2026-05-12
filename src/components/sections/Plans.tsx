"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { usePresentation } from "@/lib/content-context";

export function Plans() {
  const presentation = usePresentation();
  const pl = presentation.plans;

  return (
    <Section id="plans" bg="ink-2" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag id="plans" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            Scale 1:200
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-8 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-8">
            <AnimatedText
              as="h2"
              text={pl.headline}
              by="word"
              stagger={0.06}
              className="display text-balance text-[clamp(2.6rem,8vw,7rem)] text-bone"
            />
          </div>
          <div className="self-end md:col-span-3 md:col-start-10">
            <Reveal delay={0.15}>
              <p className="copy text-balance">{pl.note}</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* drawings, read across — a horizontal plate set */}
      <div className="mt-16 md:mt-24">
        <div className="mx-auto flex w-full max-w-[1500px] items-baseline justify-between px-6 md:px-12 lg:px-20">
          <span className="eyebrow">{pl.levels.length} levels</span>
          <span className="eyebrow flex items-center gap-3">
            Drag
            <span className="block h-px w-12 bg-line" aria-hidden />
            <span aria-hidden>→</span>
          </span>
        </div>

        <div
          data-lenis-prevent
          className="mt-7 flex snap-x snap-mandatory gap-8 overflow-x-auto px-6 pb-8 md:gap-16 md:px-12 lg:px-20 [scrollbar-width:none]"
        >
          {pl.levels.map((level, i) => (
            <Reveal
              key={level.code}
              delay={i * 0.05}
              soft
              className="w-[84vw] shrink-0 snap-center sm:w-[60vw] md:w-[48vw] lg:w-[38vw]"
            >
              <Media
                src={level.media.src}
                alt={level.media.alt}
                className="aspect-[4/3] w-full bg-ink-3"
                parallax={0}
              />
              <div className="mt-5 flex items-baseline gap-4">
                <span className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-bone-faint">{level.code}</span>
                <span className="h-px flex-1 bg-line" aria-hidden />
                <span className="font-sans text-[0.62rem] uppercase tracking-[0.24em] text-bone-faint">{level.area}</span>
              </div>
              <h3 className="display mt-4 text-[clamp(1.6rem,2.6vw,2.4rem)] text-bone">{level.title}</h3>
              <p className="copy mt-3 max-w-md text-[0.95rem] leading-[1.7]">{level.notes}</p>
            </Reveal>
          ))}
          <div className="w-2 shrink-0 md:w-12" aria-hidden />
        </div>
      </div>
    </Section>
  );
}
