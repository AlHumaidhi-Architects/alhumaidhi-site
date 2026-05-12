"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useLenis } from "lenis/react";
import { usePresentation, useStudio } from "@/lib/content-context";

export function Contact() {
  const presentation = usePresentation();
  const studio = useStudio();
  const ct = presentation.contact;
  const lenis = useLenis();

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 2.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Section id="contact" bg="ink-2" full className="flex flex-col">
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 pb-12 pt-32 md:px-12 md:pb-16 md:pt-44 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag id="contact" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {presentation.project.codename}
          </Reveal>
        </div>

        <div className="mt-16 flex flex-1 flex-col justify-center md:mt-0">
          <AnimatedText
            as="h2"
            text={ct.headline}
            by="line"
            stagger={0.14}
            className="display text-[clamp(3rem,12vw,11rem)] leading-[0.96] text-bone"
          />

          <div className="mt-16 grid gap-x-16 gap-y-12 md:mt-24 md:grid-cols-12">
            <div className="md:col-span-6 md:col-start-1">
              <Reveal>
                <p className="copy max-w-xl text-balance text-[1.05rem] leading-[1.8]">{ct.text}</p>
              </Reveal>
              <Reveal delay={0.12} className="mt-10">
                <a
                  href={`mailto:${studio.email}`}
                  className="group inline-flex items-baseline gap-5 border-b border-line pb-3 transition-colors hover:border-bone"
                >
                  <span className="display text-[clamp(1.6rem,4.5vw,3rem)] text-bone">{studio.email}</span>
                  <span className="text-bone-faint transition-transform duration-500 group-hover:translate-x-1" aria-hidden>↗</span>
                </a>
              </Reveal>
              <Reveal delay={0.2} className="mt-7">
                <a
                  href={`tel:${studio.phone.replace(/\s+/g, "")}`}
                  className="font-sans text-base text-bone-dim transition-opacity hover:opacity-60"
                >
                  {studio.phone}
                </a>
              </Reveal>
            </div>

            <div className="flex flex-col gap-10 md:col-span-3 md:col-start-8">
              <Reveal delay={0.15}>
                <span className="eyebrow">Studio</span>
                <address className="mt-4 not-italic">
                  {studio.address.map((line) => (
                    <span key={line} className="block font-sans text-[0.95rem] leading-relaxed text-bone-dim">{line}</span>
                  ))}
                </address>
              </Reveal>
            </div>
            <div className="flex flex-col gap-10 md:col-span-2 md:col-start-11">
              <Reveal delay={0.25}>
                <span className="eyebrow">Connect</span>
                <div className="mt-4 flex flex-col gap-2">
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
          <span>© {new Date().getFullYear()} — {studio.name}</span>
          <span className="hidden md:block">{studio.tagline}</span>
          <button onClick={toTop} className="group flex items-center gap-2 self-start transition-colors hover:text-bone md:self-auto">
            <span aria-hidden className="transition-transform group-hover:-translate-y-0.5">↑</span>
            Back to top
          </button>
        </div>
      </footer>
    </Section>
  );
}
