"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { usePresentation, useStudio } from "@/lib/content-context";

export function Team() {
  const presentation = usePresentation();
  const studio = useStudio();
  const t = presentation.team;

  return (
    <Section id="team" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag id="team" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {studio.city} · {studio.established}
          </Reveal>
        </div>

        <div className="mt-14 md:mt-24">
          <AnimatedText
            as="h2"
            text={t.headline}
            by="word"
            stagger={0.06}
            className="display text-balance text-[clamp(2.6rem,8vw,7rem)] text-bone"
          />
        </div>

        <div className="mt-16 grid gap-x-16 gap-y-14 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-6 md:col-start-1">
            <AnimatedText
              as="p"
              text={t.statement}
              by="word"
              stagger={0.012}
              className="display text-balance text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.24] text-bone-dim"
            />
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <Media
              src={t.media.src}
              alt={t.media.alt}
              className="aspect-[4/3] w-full"
              parallax={50}
              sizes="(max-width: 768px) 100vw, 42vw"
            />
            <Reveal delay={0.1} className="mt-4">
              <span className="eyebrow">Fig. 04 — {t.media.alt}</span>
            </Reveal>
          </div>
        </div>

        {/* core team — a ruled list, named large */}
        <div className="mt-24 md:mt-36">
          <Reveal>
            <span className="eyebrow">Core team</span>
          </Reveal>
          <ul className="mt-8 border-t border-line">
            {t.members.map((m, i) => (
              <Reveal as="li" key={m.name} delay={i * 0.05} soft className="group block border-b border-line">
                <div className="grid items-baseline gap-x-10 gap-y-2 py-8 md:grid-cols-12 md:py-10">
                  <span className="font-sans text-[0.62rem] tabular-nums tracking-[0.3em] text-bone-faint md:col-span-1">
                    0{i + 1}
                  </span>
                  <h3 className="display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] text-bone transition-transform duration-700 group-hover:translate-x-2 md:col-span-6">
                    {m.name}
                  </h3>
                  <span className="font-sans text-[0.95rem] text-bone-dim md:col-span-3 md:col-start-8">{m.role}</span>
                  <span className="font-sans text-[0.78rem] text-bone-faint md:col-span-2 md:col-start-11 md:text-right">{m.since}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* consultants — a simple definition list */}
        <div className="mt-20 md:mt-28">
          <Reveal>
            <span className="eyebrow">Consultant team</span>
          </Reveal>
          <dl className="mt-8 grid border-t border-line md:grid-cols-2 md:gap-x-16">
            {t.consultants.map((c) => (
              <Reveal as="div" key={c.k} className="flex items-baseline justify-between gap-6 border-b border-line py-6">
                <dt className="font-sans text-[0.6rem] uppercase tracking-[0.26em] text-bone-faint">{c.k}</dt>
                <dd className="font-sans text-[0.95rem] text-bone">{c.v}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
