"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { usePresentation } from "@/lib/content-context";

export function Renders() {
  const presentation = usePresentation();
  const r = presentation.renders;

  return (
    <Section id="renders" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag id="renders" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            Working visualisations
          </Reveal>
        </div>
        <div className="mt-14 grid gap-x-16 gap-y-8 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-9">
            <AnimatedText
              as="h2"
              text={r.headline}
              by="word"
              stagger={0.06}
              className="display text-balance text-[clamp(2.6rem,8vw,7rem)] text-bone"
            />
          </div>
          <div className="self-end md:col-span-2 md:col-start-11">
            <Reveal delay={0.15}>
              <p className="copy text-balance text-[0.95rem] leading-[1.7]">{r.note}</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* a sequence of full-bleed plates; the title sits beneath each, in the margin */}
      <div className="mt-20 flex flex-col gap-24 md:mt-32 md:gap-40">
        {r.shots.map((shot, i) => (
          <figure key={shot.title}>
            <Media
              src={shot.media.src}
              alt={shot.media.alt}
              className="h-[72vh] w-full md:h-screen"
              parallax={100}
              sizes="100vw"
              priority={i === 0}
            />
            <figcaption className="mx-auto mt-7 w-full max-w-[1500px] px-6 md:mt-10 md:px-12 lg:px-20">
              <div className="grid gap-x-16 gap-y-4 md:grid-cols-12">
                <span className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-bone-faint md:col-span-2 md:pt-3">
                  {`Plate 06.${i + 1}`}
                </span>
                <div className="md:col-span-7">
                  <AnimatedText
                    as="h3"
                    text={shot.title}
                    by="word"
                    stagger={0.05}
                    className="display text-[clamp(2rem,5vw,4.4rem)] text-bone"
                  />
                  <Reveal delay={0.12} className="mt-5">
                    <p className="copy text-balance">{shot.text}</p>
                  </Reveal>
                </div>
                <span className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-bone-faint md:col-span-2 md:col-start-11 md:pt-3 md:text-right">
                  {shot.time}
                </span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
