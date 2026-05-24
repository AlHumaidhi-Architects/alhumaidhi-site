"use client";

import { Section, SectionTag } from "@/components/ui/Section";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useSections } from "@/lib/content-context";
import { mediaKind } from "@/lib/media-url";

export function GifDiagram() {
  const d = useSections().gifDiagram;

  // Flexible concept media: first item is featured, the rest are supporting.
  // Fall back to the legacy single slot for any not-yet-migrated content.
  const gallery = (
    Array.isArray(d.gallery) && d.gallery.length > 0
      ? d.gallery
      : [d.media].filter((m): m is NonNullable<typeof m> => !!m?.src)
  ).filter((m) => m?.src);
  const [featured, ...supporting] = gallery;
  const body = Array.isArray(d.body) ? d.body : [];
  const featuredAnimated = featured ? mediaKind(featured.src) !== "image" : false;

  return (
    <Section domId="gifDiagram" className="overflow-hidden py-28 md:py-44">
      <div className="mx-auto w-full max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="gifDiagram" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {gallery.length > 1 ? `${gallery.length} studies` : "Concept study"}
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-16 gap-y-8 md:mt-24 md:grid-cols-12">
          <div className="md:col-span-9">
            <AnimatedText
              as="h2"
              text={d.headline}
              by="word"
              stagger={0.06}
              className="display text-balance text-[clamp(2.6rem,8vw,7rem)] text-bone"
            />
          </div>
          <div className="self-end md:col-span-2 md:col-start-11">
            <Reveal delay={0.15}>
              <p className="copy text-balance text-[0.95rem] leading-[1.7]">{d.note}</p>
            </Reveal>
          </div>
        </div>

        {/* concept explanation / design narrative */}
        {body.length > 0 && (
          <div className="mt-12 grid gap-x-16 md:mt-16 md:grid-cols-12">
            <div className="space-y-6 md:col-span-7 md:col-start-1">
              {body.map((para, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className="copy text-balance">{para}</p>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* featured concept media — full-bleed (GIF / MP4 / image) */}
      {featured && (
        <figure className="mt-16 md:mt-24">
          <Media
            src={featured.src}
            alt={featured.alt}
            poster={featured.poster}
            className="h-[60vh] w-full md:h-[92vh]"
            parallax={0}
            sizes="100vw"
          />
          <figcaption className="mx-auto mt-6 flex w-full max-w-[1500px] items-baseline justify-between px-6 md:mt-8 md:px-12 lg:px-20">
            <span className="eyebrow">{d.caption || featured.alt}</span>
            {featuredAnimated && (
              <span className="eyebrow hidden md:block" aria-hidden>
                ▷ loop
              </span>
            )}
          </figcaption>
        </figure>
      )}

      {/* supporting photos / plans / diagrams — responsive grid */}
      {supporting.length > 0 && (
        <div className="mx-auto mt-14 w-full max-w-[1500px] px-6 md:mt-24 md:px-12 lg:px-20">
          <Reveal className="mb-7">
            <span className="eyebrow">Supporting studies</span>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10">
            {supporting.map((item, i) => (
              <figure key={i} className="break-inside-avoid">
                <Media
                  src={item.src}
                  alt={item.alt}
                  poster={item.poster}
                  className="w-full"
                  style={{ aspectRatio: item.ratio ?? "4 / 3" }}
                  parallax={0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <figcaption className="mt-3 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-bone-faint">
                  {String(i + 2).padStart(2, "0")} &nbsp;—&nbsp; {item.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
