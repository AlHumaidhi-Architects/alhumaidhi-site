"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { usePresentation } from "@/lib/content-context";

export function Materials() {
  const presentation = usePresentation();
  const mt = presentation.materials;

  return (
    <Section id="materials" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag id="materials" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {mt.palette.length} materials
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-8 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-8">
            <AnimatedText
              as="h2"
              text={mt.headline}
              by="word"
              stagger={0.06}
              className="display text-balance text-[clamp(2.6rem,8vw,7rem)] text-bone"
            />
          </div>
          <div className="self-end md:col-span-3 md:col-start-10">
            <Reveal delay={0.15}>
              <p className="copy text-balance">{mt.note}</p>
            </Reveal>
          </div>
        </div>

        <div className="mt-20 border-t border-line md:mt-28">
          {mt.palette.map((mat, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={mat.n}
                className="grid items-center gap-x-16 gap-y-8 border-b border-line py-16 md:grid-cols-12 md:py-24"
              >
                <div className={`md:col-span-6 ${flip ? "md:order-2 md:col-start-7" : "md:col-start-1"}`}>
                  <Media
                    src={mat.media.src}
                    alt={mat.media.alt}
                    className="aspect-[4/3] w-full"
                    parallax={40}
                    sizes="(max-width: 768px) 100vw, 48vw"
                  />
                </div>
                <div className={`flex flex-col gap-6 md:col-span-5 ${flip ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                  <div className="flex items-baseline gap-4">
                    <span className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-bone-faint">{mat.n}</span>
                    <span className="h-px flex-1 bg-line" aria-hidden />
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.22em] text-bone-faint">{mat.use}</span>
                  </div>
                  <Reveal>
                    <h3 className="display text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.04] text-bone">{mat.name}</h3>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <p className="copy max-w-md text-balance">{mat.text}</p>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
