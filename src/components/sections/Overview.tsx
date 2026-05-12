"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { usePresentation } from "@/lib/content-context";

export function Overview() {
  const presentation = usePresentation();
  const o = presentation.overview;
  const p = presentation.project;

  return (
    <Section id="overview" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag id="overview" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {p.codename}
          </Reveal>
        </div>

        {/* the project, named large */}
        <div className="mt-12 md:mt-20">
          <AnimatedText
            as="h2"
            text={p.name}
            by="line"
            stagger={0.12}
            className="display text-[clamp(3rem,12vw,10rem)] text-bone"
          />
        </div>

        <div className="mt-12 grid gap-x-16 gap-y-10 border-t border-line pt-10 md:mt-16 md:grid-cols-12 md:pt-12">
          <div className="md:col-span-7 md:col-start-1">
            <AnimatedText
              as="p"
              text={o.statement}
              by="word"
              stagger={0.012}
              className="display text-balance text-[clamp(1.7rem,3.4vw,3rem)] leading-[1.22] text-bone-dim"
            />
          </div>
          <div className="flex flex-col gap-7 md:col-span-3 md:col-start-10">
            {[
              { k: "Location", v: p.location },
              { k: "Typology", v: p.typology },
              { k: "Year", v: p.year },
              { k: "Status", v: p.status },
            ].map((row, i) => (
              <Reveal key={row.k} delay={0.05 * i} className="flex flex-col gap-1.5">
                <span className="font-sans text-[0.58rem] uppercase tracking-[0.26em] text-bone-faint">{row.k}</span>
                <span className="font-sans text-[0.95rem] text-bone">{row.v}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* full-bleed image */}
      <figure className="mt-20 md:mt-32">
        <Media
          src={o.media.src}
          alt={o.media.alt}
          className="h-[78vh] w-full md:h-screen"
          parallax={80}
          sizes="100vw"
        />
        <Reveal as="figcaption" delay={0.1} className="mx-auto mt-4 flex w-full max-w-[1500px] items-baseline justify-between px-6 md:px-12 lg:px-20">
          <span className="eyebrow">Fig. 01 — {o.media.alt}</span>
          <span className="eyebrow hidden md:block">{p.location}</span>
        </Reveal>
      </figure>

      {/* body — a single, generously set column */}
      <div className="mx-auto mt-20 w-full max-w-[1500px] px-6 md:mt-32 md:px-12 lg:px-20">
        <div className="grid gap-x-16 gap-y-16 md:grid-cols-12">
          <div className="md:col-span-6 md:col-start-1">
            <div className="space-y-8">
              {o.body.map((para, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p className="copy text-balance">{para}</p>
                </Reveal>
              ))}
            </div>
          </div>

          {/* at a glance — a quiet, ruled definition list (no cards) */}
          <div className="md:col-span-4 md:col-start-9">
            <Reveal>
              <span className="eyebrow">At a glance</span>
            </Reveal>
            <dl className="mt-7 border-t border-line">
              {o.facts.map((f, i) => (
                <Reveal as="div" key={f.k} delay={0.04 * i} className="flex flex-col gap-1.5 border-b border-line py-5">
                  <dt className="font-sans text-[0.58rem] uppercase tracking-[0.26em] text-bone-faint">{f.k}</dt>
                  <dd className="font-sans text-[0.95rem] leading-snug text-bone">{f.v}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>

        {/* secondary image, set in from the margin */}
        <div className="mt-20 md:mt-28 md:pl-[33%]">
          <Media
            src={o.secondaryMedia.src}
            alt={o.secondaryMedia.alt}
            className="aspect-[4/5] w-full"
            parallax={50}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <Reveal delay={0.1} className="mt-4">
            <span className="eyebrow">Fig. 02 — {o.secondaryMedia.alt}</span>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
