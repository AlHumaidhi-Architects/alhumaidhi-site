"use client";

import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useStops } from "@/lib/content-context";
import { EASE_OUT_EXPO } from "@/lib/motion";

// Floating indices sit over ivory and over full-bleed photographs alike.
const OVER = "mix-blend-difference text-[#f7f4ec]";

export function ScrollProgress({ introDone }: { introDone: boolean }) {
  const stops = useStops();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 40, mass: 0.5 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-section-index") ?? 0);
            setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [stops.length]);

  const current = stops[active] ?? stops[0];
  if (!current) return null;

  return (
    <>
      {/* top progress hairline */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-px bg-transparent">
        <motion.div className={`h-px origin-left bg-current ${OVER}`} style={{ scaleX }} />
      </div>

      {/* bottom-left section indicator */}
      <AnimatePresence>
        {introDone && (
          <motion.div
            className={`pointer-events-none fixed bottom-6 left-6 z-[80] hidden items-center gap-3.5 md:flex md:bottom-8 md:left-12 ${OVER}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.7 }}
          >
            <span className="font-sans text-[0.66rem] tabular-nums tracking-[0.2em]">{current.index}</span>
            <span className="h-px w-10 bg-current opacity-50" />
            <AnimatePresence mode="wait">
              <motion.span
                key={current.domId}
                className="font-sans text-[0.62rem] uppercase tracking-[0.26em]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              >
                {current.label}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* right-side section ticks */}
      <AnimatePresence>
        {introDone && (
          <motion.nav
            aria-hidden
            className={`fixed right-7 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-end gap-3.5 lg:flex ${OVER}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.8 }}
          >
            {stops.map((stop, i) => (
              <a key={stop.domId} href={`#${stop.domId}`} className="group pointer-events-auto flex items-center gap-3">
                <span
                  className={`text-[0.6rem] tabular-nums tracking-[0.2em] transition-opacity duration-500 ${
                    i === active ? "opacity-100" : "opacity-35 group-hover:opacity-70"
                  }`}
                >
                  {stop.index}
                </span>
                <span
                  className={`block h-px bg-current transition-all duration-500 ${
                    i === active ? "w-8 opacity-100" : "w-4 opacity-35 group-hover:w-6 group-hover:opacity-70"
                  }`}
                />
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
