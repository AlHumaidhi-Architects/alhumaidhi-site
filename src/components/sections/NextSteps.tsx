"use client";

import { Fragment } from "react";
import { Section, SectionTag } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Accent } from "@/components/ui/Accent";
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

  const steps = ns.steps ?? [];

  return (
    <Section domId="nextSteps" bg="ink" full className="flex flex-col">
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 pb-12 pt-32 md:px-12 md:pb-16 md:pt-40 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="nextSteps" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {info.codename}
          </Reveal>
        </div>

        {/* Title — large, top-left */}
        <Reveal
          as="h2"
          className="mt-10 max-w-4xl text-balance display text-[clamp(2.8rem,9vw,7rem)] leading-[0.98] text-bone md:mt-14"
        >
          {(ns.headline ?? []).map((line, i) => (
            <span key={i} className="block">
              <Accent text={line} />
            </span>
          ))}
        </Reveal>

        {ns.text && (
          <Reveal>
            <p className="copy mt-7 max-w-xl text-balance text-[1.05rem] leading-[1.8]">{ns.text}</p>
          </Reveal>
        )}

        {/* Horizontal steps with numbered circles + dotted arrow connectors */}
        {steps.length > 0 && (
          <div className="mt-16 flex flex-col gap-12 md:mt-24 md:flex-row md:items-start md:gap-4 lg:gap-8">
            {steps.map((step, i) => (
              <Fragment key={i}>
                <Reveal as="div" delay={0.08 * i} className="flex-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-bone/30 font-sans text-[0.82rem] tabular-nums tracking-[0.12em] text-bone md:h-16 md:w-16">
                    {step.n}
                  </div>
                  <h3 className="mt-6 font-sans text-[1.2rem] font-semibold leading-snug text-bone md:text-[1.4rem]">
                    <Accent text={step.title} />
                  </h3>
                  <p className="copy mt-3 max-w-xs text-[0.95rem] leading-[1.7]">{step.text}</p>
                </Reveal>

                {i < steps.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden shrink-0 self-start pt-7 md:flex md:w-10 md:items-center lg:w-24"
                  >
                    <span className="h-0 flex-1 border-t border-dotted border-bone/45" />
                    <span className="-ml-0.5 text-[0.95rem] leading-none text-bone/45">→</span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}

        {/* CTA + contact */}
        <div className="mt-auto grid gap-10 pt-20 md:grid-cols-12 md:pt-28">
          <div className="md:col-span-7">
            <Reveal>
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
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-4 md:col-start-9">
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
            <div className="mt-4 flex gap-6">
              {studio.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[0.66rem] uppercase tracking-[0.24em] text-bone-faint transition-colors hover:text-bone"
                >
                  {s.label}
                </a>
              ))}
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
