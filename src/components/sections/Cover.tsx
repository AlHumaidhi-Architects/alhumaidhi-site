"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Section } from "@/components/ui/Section";
import { useInfo, useSections } from "@/lib/content-context";
import { useIntro } from "@/lib/intro";
import { EASE_OUT_EXPO } from "@/lib/motion";

const isVideo = (src: string) => /\.(mp4|webm|mov|m4v)$/.test((src || "").split("?")[0].toLowerCase());

export function Cover() {
  const c = useSections().cover;
  const p = useInfo();
  const { introDone } = useIntro();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // slow, restrained cinematic drift — no washes, no gradients on the image itself
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const fgY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const fgOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 18 } as const,
    animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 1.5, ease: EASE_OUT_EXPO, delay },
  });

  return (
    <Section domId="cover" full className="overflow-hidden">
      <div ref={ref} className="relative h-screen w-full">
        {/* ── Full-bleed media ── */}
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <motion.div className="absolute -inset-[8%]" style={{ scale: imgScale }}>
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.18 }}
              animate={introDone ? { scale: 1 } : { scale: 1.18 }}
              transition={{ duration: 3.2, ease: EASE_OUT_EXPO }}
            >
              {isVideo(c.media.src) ? (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={c.media.poster}
                >
                  <source src={c.media.src} />
                </video>
              ) : (
                <Image src={c.media.src} alt={c.media.alt} fill priority sizes="100vw" className="object-cover" />
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* the only tonal adjustment: one faint scrim so the foot-of-page type reads */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* ── Foreground ── */}
        <motion.div
          className="relative z-10 flex h-full flex-col justify-end px-6 pb-9 text-[#f7f4ec] md:px-12 md:pb-12"
          style={{ y: fgY, opacity: fgOpacity }}
        >
          <motion.span {...fade(0.2)} className="font-sans text-[0.62rem] uppercase tracking-[0.42em] opacity-80">
            {c.eyebrow}
          </motion.span>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
            <h1 className="display max-w-[14ch] text-[clamp(3rem,11vw,9.5rem)] leading-[0.95]">
              <motion.span {...fade(0.35)} className="block">
                {c.titleLines[0]}
              </motion.span>
              {c.titleLines[1] && (
                <motion.span {...fade(0.48)} className="display-italic block opacity-90">
                  {c.titleLines[1]}
                </motion.span>
              )}
            </h1>

            <motion.dl {...fade(0.7)} className="grid grid-cols-2 gap-x-10 gap-y-4 text-[0.74rem] md:flex md:gap-x-14">
              {c.meta.map((m) => (
                <div key={m.k} className="flex flex-col gap-1.5">
                  <dt className="font-sans text-[0.58rem] uppercase tracking-[0.26em] opacity-60">{m.k}</dt>
                  <dd className="font-sans tracking-wide opacity-95">{m.v}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          {...fade(0.95)}
          className="pointer-events-none absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[#f7f4ec] md:flex md:bottom-12"
        >
          <span className="font-sans text-[0.56rem] uppercase tracking-[0.42em] opacity-70">{p.phase}</span>
          <span className="relative block h-12 w-px overflow-hidden bg-white/25">
            <motion.span
              className="absolute inset-x-0 top-0 block h-5 w-px bg-white"
              animate={{ y: ["-100%", "300%"] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
            />
          </span>
        </motion.div>
      </div>
    </Section>
  );
}
