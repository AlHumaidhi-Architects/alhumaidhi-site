"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useLenis } from "lenis/react";
import { useInfo, useSections, useStudio, useYear } from "@/lib/content-context";

export function NextSteps() {
  const ns = useSections().nextSteps;
  const studio = useStudio();
  const info = useInfo();
  const year = useYear();
  const lenis = useLenis();

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 2.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Section domId="nextSteps" bg="ink-2" full className="flex flex-col">
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 pb-12 pt-32 md:px-12 md:pb-16 md:pt-44 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="nextSteps" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {info.codename}
          </Reveal>
        </div>

        <div className="mt-16 flex flex-1 flex-col justify-center md:mt-0">
          <AnimatedText
            as="h2"
            text={ns.headline}
            by="line"
            stagger={0.14}
            className="display text-[clamp(3rem,12vw,11rem)] leading-[0.96] text-bone"
          />

          <div className="mt-14 grid gap-x-16 gap-y-14 md:mt-20 md:grid-cols-12">
            {/* the steps */}
            <div className="md:col-span-7 md:col-start-1">
              <Reveal>
                <p className="copy max-w-xl text-balance text-[1.05rem] leading-[1.8]">{ns.text}</p>
              </Reveal>
              {ns.steps.length > 0 && (
                <dl className="mt-12 border-t border-line">
                  {ns.steps.map((step, i) => (
                    <Reveal as="div" key={i} delay={0.05 * i} className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-line py-6 md:gap-x-10">
                      <dt className="font-sans text-[0.66rem] tabular-nums tracking-[0.28em] text-bone-faint">{step.n}</dt>
                      <dd>
                        <h3 className="display text-[clamp(1.4rem,2.6vw,2rem)] text-bone">{step.title}</h3>
                        <p className="copy mt-2 max-w-md text-[0.95rem] leading-[1.7]">{step.text}</p>
                      </dd>
                    </Reveal>
                  ))}
                </dl>
              )}
            </div>

            {/* contact */}
            <div className="md:col-span-4 md:col-start-9">
              <Reveal delay={0.1}>
                <a
                  href={`mailto:${studio.email}`}
                  className="group inline-flex items-baseline gap-4 border-b border-line pb-3 transition-colors hover:border-bone"
                >
                  <span className="display text-[clamp(1.5rem,3.4vw,2.4rem)] text-bone">{ns.ctaLabel}</span>
                  <span className="text-bone-faint transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
                    ↗
                  </span>
                </a>
              </Reveal>
              <Reveal delay={0.18} className="mt-8 flex flex-col gap-1.5">
                <span className="eyebrow">Studio</span>
                <a href={`mailto:${studio.email}`} className="font-sans text-[0.95rem] text-bone transition-opacity hover:opacity-60">
                  {studio.email}
                </a>
                <a
                  href={`tel:${studio.phone.replace(/\s+/g, "")}`}
                  className="font-sans text-[0.95rem] text-bone-dim transition-opacity hover:opacity-60"
                >
                  {studio.phone}
                </a>
              </Reveal>
              <Reveal delay={0.24} className="mt-8">
                <span className="eyebrow">Connect</span>
                <div className="mt-3 flex gap-6">
                  {studio.socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      className="font-sans text-[0.66rem] uppercase tracking-[0.24em] text-bone-faint transition-colors hover:text-bone"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* footer — a single hairline, set quietly */}
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-6 py-7 text-[0.62rem] uppercase tracking-[0.18em] text-bone-faint md:flex-row md:items-center md:justify-between md:px-12 md:py-8 lg:px-20">
          <span>
            © {year} — {studio.name}
          </span>
          <span className="hidden md:block">{studio.tagline}</span>
          <button
            onClick={toTop}
            className="group flex items-center gap-2 self-start transition-colors hover:text-bone md:self-auto"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-y-0.5">
              ↑
            </span>
            Back to top
          </button>
        </div>
      </footer>
    </Section>
  );
}
