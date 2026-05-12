"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { usePresentation } from "@/lib/content-context";

export function Concept() {
  const presentation = usePresentation();
  const c = presentation.concept;

  return (
    <Section id="concept" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag id="concept" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            Design intent
          </Reveal>
        </div>

        {/* keyword as a quiet overline, then the headline, very large */}
        <div className="mt-14 md:mt-24">
          <Reveal>
            <span className="display-italic block text-[clamp(1.8rem,5vw,3.8rem)] text-bone-faint">
              {c.keyword.toLowerCase()}
            </span>
          </Reveal>
          <AnimatedText
            as="h2"
            text={c.headline}
            by="line"
            stagger={0.12}
            className="display mt-2 text-[clamp(2.8rem,9.5vw,8.5rem)] text-bone"
          />
        </div>

        <div className="mt-20 grid gap-x-16 gap-y-14 md:mt-28 md:grid-cols-12">
          {/* the argument, set generously */}
          <div className="md:col-span-6 md:col-start-1">
            <div className="space-y-8">
              {c.paragraphs.map((para, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p className="copy text-balance">{para}</p>
                </Reveal>
              ))}
            </div>
          </div>
          {/* a tall image, sticky on desktop */}
          <div className="md:col-span-5 md:col-start-8">
            <div className="md:sticky md:top-28">
              <Media
                src={c.media.src}
                alt={c.media.alt}
                className="aspect-[3/4] w-full"
                parallax={60}
                sizes="(max-width: 768px) 100vw, 42vw"
              />
              <Reveal delay={0.1} className="mt-4">
                <span className="eyebrow">Fig. 03 — {c.media.alt}</span>
              </Reveal>
            </div>
          </div>
        </div>

        {/* operating principles — a ruled list, one per line, no grid of cards */}
        <div className="mt-24 md:mt-36">
          <Reveal>
            <span className="eyebrow">Operating principles</span>
          </Reveal>
          <ol className="mt-8 border-t border-line">
            {c.principles.map((pr, i) => (
              <Reveal as="li" key={pr.n} delay={i * 0.06} soft className="group block border-b border-line">
                <div className="grid items-baseline gap-x-10 gap-y-3 py-9 md:grid-cols-12 md:py-12">
                  <span className="font-sans text-[0.66rem] tabular-nums tracking-[0.3em] text-bone-faint md:col-span-1">
                    {pr.n}
                  </span>
                  <h3 className="display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] text-bone md:col-span-5">
                    {pr.title}
                  </h3>
                  <p className="copy text-balance md:col-span-5 md:col-start-8">{pr.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
