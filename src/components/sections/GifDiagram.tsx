"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useSections } from "@/lib/content-context";

export function GifDiagram() {
  const d = useSections().gifDiagram;

  return (
    <Section domId="gifDiagram" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="gifDiagram" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            Animated study
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-8 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-9">
            <AnimatedText
              as="h2"
              text={d.headline}
              by="word"
              stagger={0.06}
              className="display text-balance text-[clamp(2.6rem,8vw,7rem)] text-bone"
            />
          </div>
          <div className="self-end md:col-span-2 md:col-start-11">
            <Reveal delay={0.15}>
              <p className="copy text-balance text-[0.95rem] leading-[1.7]">{d.note}</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* the diagram itself — full-bleed, plays on loop (GIF or MP4) */}
      <figure className="mt-16 md:mt-24">
        <Media
          src={d.media.src}
          alt={d.media.alt}
          poster={d.media.poster}
          className="h-[64vh] w-full md:h-[92vh]"
          parallax={0}
          sizes="100vw"
        />
        <figcaption className="mx-auto mt-6 flex w-full max-w-[1500px] items-baseline justify-between px-6 md:mt-8 md:px-12 lg:px-20">
          <span className="eyebrow">{d.caption}</span>
          <span className="eyebrow hidden md:block" aria-hidden>
            ▷ loop
          </span>
        </figcaption>
      </figure>
    </Section>
  );
}
