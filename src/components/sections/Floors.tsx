"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useSections } from "@/lib/content-context";
import type { Floor } from "@/lib/content";

function FloorSection({ floor, i, chapter }: { floor: Floor; i: number; chapter?: { headline: string; note: string } }) {
  const bg = i % 2 === 1 ? "ink-2" : "ink";
  return (
    <Section domId={`floor-${i}`} bg={bg} className="overflow-hidden py-24 md:py-36">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        {/* chapter opener — only above the first floor */}
        {chapter && (
          <div className="mb-16 grid gap-x-16 gap-y-6 border-b border-line pb-14 md:mb-24 md:grid-cols-12 md:pb-20">
            <div className="md:col-span-8">
              <AnimatedText
                as="h2"
                text={chapter.headline}
                by="word"
                stagger={0.06}
                className="display text-balance text-[clamp(2.4rem,7vw,6rem)] text-bone"
              />
            </div>
            <div className="self-end md:col-span-3 md:col-start-10">
              <Reveal delay={0.15}>
                <p className="copy text-balance">{chapter.note}</p>
              </Reveal>
            </div>
          </div>
        )}

        <div className="flex items-baseline justify-between">
          <SectionTag domId={`floor-${i}`} />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {floor.area}
          </Reveal>
        </div>

        <div className="mt-6 flex items-baseline gap-4 md:mt-10">
          <span className="font-sans text-[0.66rem] uppercase tracking-[0.3em] text-bone-faint">{floor.code}</span>
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <div className="mt-5">
          <AnimatedText
            as="h3"
            text={floor.title}
            by="line"
            stagger={0.1}
            className="display text-[clamp(2rem,5.5vw,4.6rem)] leading-[1.02] text-bone"
          />
        </div>

        {/* the plan, set large, with the design intent alongside */}
        <div className="mt-12 grid gap-x-16 gap-y-12 md:mt-16 md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-1">
            <Media
              src={floor.plan.src}
              alt={floor.plan.alt}
              className="aspect-[4/3] w-full bg-ink-3"
              parallax={0}
              sizes="(max-width: 768px) 100vw, 58vw"
            />
            <Reveal delay={0.1} className="mt-4">
              <span className="eyebrow">Floor plan — {floor.title}</span>
            </Reveal>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <Reveal>
              <span className="eyebrow">Design intent</span>
            </Reveal>
            <div className="mt-6 space-y-6">
              {floor.intent.map((para, k) => (
                <Reveal key={k} delay={0.05 * k}>
                  <p className="copy text-balance">{para}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* related mood / reference imagery for this floor */}
        {floor.moods.length > 0 && (
          <div className="mt-16 md:mt-24">
            <Reveal className="mb-7">
              <span className="eyebrow">References — {floor.title}</span>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
              {floor.moods.map((mood, k) => (
                <figure key={k} className="break-inside-avoid">
                  <Media
                    src={mood.src}
                    alt={mood.alt}
                    className="w-full"
                    style={{ aspectRatio: mood.ratio ?? "3 / 4" }}
                    parallax={k % 2 === 0 ? 30 : 16}
                    sizes="(max-width: 768px) 50vw, 30vw"
                  />
                  <figcaption className="mt-3 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-bone-faint">
                    {mood.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

export function Floors() {
  const f = useSections().floors;
  return (
    <>
      {f.floors.map((floor, i) => (
        <FloorSection
          key={i}
          floor={floor}
          i={i}
          chapter={i === 0 ? { headline: f.headline, note: f.note } : undefined}
        />
      ))}
    </>
  );
}
