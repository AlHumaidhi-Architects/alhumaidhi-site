"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useSections } from "@/lib/content-context";

const PARALLAX = [44, 22, 50, 16, 38, 28, 46, 20];

export function MoodImages() {
  const m = useSections().moodImages;

  return (
    <Section domId="moodImages" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="moodImages" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {m.images.length} plates
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-8 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-8">
            <AnimatedText
              as="h2"
              text={m.headline}
              by="word"
              stagger={0.06}
              className="display text-balance text-[clamp(2.6rem,8vw,7rem)] text-bone"
            />
          </div>
          <div className="self-end md:col-span-3 md:col-start-10">
            <Reveal delay={0.15}>
              <p className="copy text-balance">{m.note}</p>
            </Reveal>
          </div>
        </div>

        {/* an unhurried editorial collage — two-column grid (reliable height for
            absolutely-filled media, unlike CSS multi-column), generous air */}
        <div className="mt-16 grid grid-cols-1 items-start gap-x-8 gap-y-10 md:mt-28 md:grid-cols-2 md:gap-x-16 md:gap-y-16">
          {m.images.map((image, i) => (
            <figure key={i}>
              <Media
                src={image.src}
                alt={image.alt}
                className="w-full"
                style={{ aspectRatio: (image.ratio || "").trim() || "4 / 3" }}
                parallax={PARALLAX[i % PARALLAX.length]}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <figcaption className="mt-4 font-sans text-[0.6rem] uppercase tracking-[0.22em] text-bone-faint">
                {String(i + 1).padStart(2, "0")} &nbsp;—&nbsp; {image.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
