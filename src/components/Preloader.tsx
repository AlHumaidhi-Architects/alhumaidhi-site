"use client";

import { AnimatePresence, motion, useMotionValue, animate, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { useStudio } from "@/lib/content-context";
import { EASE_IN_OUT_QUINT, EASE_OUT_EXPO } from "@/lib/motion";

/** Distinguish an MP4/WebM logo from a GIF/PNG/SVG/Lottie-image logo. */
function introKind(src: string): "video" | "image" {
  const s = (src || "").split("?")[0].toLowerCase();
  return /\.(mp4|webm|mov|m4v|ogv)$/.test(s) ? "video" : "image";
}

export function Preloader({ onDone }: { onDone: () => void }) {
  const studio = useStudio();
  const [visible, setVisible] = useState(true);
  const lenis = useLenis();
  const progress = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const barScale = useTransform(progress, [0, 100], [0, 1]);

  const introLogo = studio.logo?.intro ?? "";
  const hasIntroLogo = Boolean(introLogo);

  // lock scroll while the curtain is up
  useEffect(() => {
    if (visible) lenis?.stop();
  }, [lenis, visible]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);

    const unsub = progress.on("change", (v) => setDisplay(Math.round(v)));
    const controls = animate(progress, 100, { duration: 2.6, ease: [0.72, 0, 0.18, 1] });
    controls.then(() => {
      window.setTimeout(() => {
        onDone();
        window.setTimeout(() => setVisible(false), 140);
      }, 460);
    });

    return () => {
      unsub();
      controls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence onExitComplete={() => lenis?.start()}>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col bg-ink"
          initial={{ opacity: 1 }}
          exit={{ y: "-101%", transition: { duration: 1.35, ease: EASE_IN_OUT_QUINT } }}
        >
          <div className="flex items-start justify-between px-6 pt-8 md:px-12 md:pt-12">
            <motion.span
              className="eyebrow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.2 }}
            >
              {studio.established}
            </motion.span>
            <motion.span
              className="eyebrow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.3 }}
            >
              {studio.city}
            </motion.span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
            {hasIntroLogo ? (
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.1 }}
              >
                {introKind(introLogo) === "video" ? (
                  <video
                    className="max-h-[42vh] w-auto max-w-[78vw] object-contain md:max-w-[460px]"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  >
                    <source src={introLogo} />
                  </video>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={introLogo}
                    alt={studio.name}
                    className="max-h-[42vh] w-auto max-w-[78vw] select-none object-contain md:max-w-[460px]"
                    draggable={false}
                  />
                )}
              </motion.div>
            ) : (
              <>
                <div className="overflow-hidden">
                  <motion.span
                    className="display block text-center text-[clamp(2.8rem,10vw,8rem)] text-bone"
                    initial={{ y: "115%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.5, ease: EASE_OUT_EXPO, delay: 0.15 }}
                  >
                    {studio.wordmark}
                  </motion.span>
                </div>
                <motion.span
                  className="font-sans text-[0.6rem] tracking-[0.62em] text-bone-faint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.4, delay: 0.7 }}
                >
                  {studio.wordmarkSub}
                </motion.span>
              </>
            )}
          </div>

          <div className="px-6 pb-9 md:px-12 md:pb-12">
            <div className="flex items-end justify-between">
              <motion.span
                className="eyebrow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
              >
                {studio.tagline}
              </motion.span>
              <span className="font-sans text-[0.7rem] tabular-nums tracking-[0.2em] text-bone-faint">
                {String(display).padStart(3, "0")} / 100
              </span>
            </div>
            <div className="mt-5 h-px w-full bg-line-soft">
              <motion.div className="h-px w-full origin-left bg-bone" style={{ scaleX: barScale }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
