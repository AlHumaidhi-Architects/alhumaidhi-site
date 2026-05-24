"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useSections } from "@/lib/content-context";

export function SitePlot() {
  const s = useSections().sitePlot;

  return (
    <Section domId="sitePlot" bg="ink-2" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="sitePlot" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            The plot
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
      </div>

      {/* the site, photographed */}
      <figure className="mt-16 md:mt-24">
        <Media src={s.photo.src} alt={s.photo.alt} className="h-[68vh] w-full md:h-[88vh]" parallax={80} sizes="100vw" />
        <Reveal as="figcaption" delay={0.1} className="mx-auto mt-4 w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
          <span className="eyebrow">Site — {s.photo.alt}</span>
        </Reveal>
      </figure>

      {/* the design intent for the site */}
      <div className="mx-auto mt-20 w-full max-w-[1500px] px-6 md:mt-28 md:px-12 lg:px-20">
        <div className="grid gap-x-16 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-1">
            <div className="space-y-8">
              {s.body.map((para, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p className="copy text-balance">{para}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* the plans */}
        {s.plans.length > 0 && (
          <div className="mt-20 grid gap-x-12 gap-y-14 md:mt-28 md:grid-cols-2 md:gap-x-16">
            {s.plans.map((plan, i) => (
              <Reveal key={i} delay={i * 0.06} soft>
                <Media src={plan.media.src} alt={plan.media.alt} className="aspect-[4/3] w-full bg-ink-3" parallax={0} sizes="(max-width: 768px) 100vw, 48vw" />
                <div className="mt-5 flex items-baseline gap-4">
                  <span className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-bone-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-line" aria-hidden />
                </div>
                <h3 className="display mt-4 text-[clamp(1.5rem,2.6vw,2.2rem)] text-bone">{plan.title}</h3>
                <p className="copy mt-2 max-w-md text-[0.95rem] leading-[1.7]">{plan.caption}</p>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
