"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { useNav, usePresentation, useStudio, useVisibility } from "@/lib/content-context";
import { EASE_IN_OUT_QUINT, EASE_OUT_EXPO } from "@/lib/motion";

const menuVariants = {
  closed: { clipPath: "inset(0% 0% 100% 0%)" },
  open: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 1.1, ease: EASE_IN_OUT_QUINT, when: "beforeChildren", staggerChildren: 0.07, delayChildren: 0.22 },
  },
  exit: {
    clipPath: "inset(0% 0% 100% 0%)",
    transition: { duration: 0.85, ease: EASE_IN_OUT_QUINT, when: "afterChildren", staggerChildren: 0.035, staggerDirection: -1 },
  },
};

const itemVariants = {
  closed: { y: "110%" },
  open: { y: "0%", transition: { duration: 1.05, ease: EASE_OUT_EXPO } },
  exit: { y: "110%", transition: { duration: 0.45, ease: EASE_OUT_EXPO } },
};

const fadeChild = {
  closed: { opacity: 0, y: 14 },
  open: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

// Floating UI sits over both ivory sections and full-bleed photographs —
// mix-blend keeps it legible on either, in the spirit of an architectural plate.
const OVER = "mix-blend-difference text-[#f7f4ec]";

export function Navigation({ introDone }: { introDone: boolean }) {
  const nav = useNav();
  const studio = useStudio();
  const presentation = usePresentation();
  const visibility = useVisibility();
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (open) lenis?.stop();
    else if (introDone) lenis?.start();
  }, [open, introDone, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goTo = (id: string) => {
    setOpen(false);
    window.setTimeout(() => {
      if (lenis) lenis.scrollTo(`#${id}`, { offset: 0, duration: 2 });
      else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 640);
  };

  return (
    <>
      {/* ── Fixed header ── */}
      <AnimatePresence>
        {introDone && (
          <motion.header
            className="fixed inset-x-0 top-0 z-[92]"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: EASE_OUT_EXPO, delay: 0.6 }}
          >
            <div className={`flex items-center justify-between px-6 py-6 md:px-12 md:py-8 ${OVER}`}>
              <button
                onClick={() => goTo("cover")}
                className="group flex flex-col leading-none"
                aria-label={`${studio.name} — top`}
              >
                <span className="font-sans text-[0.78rem] tracking-[0.4em] transition-opacity group-hover:opacity-70 md:text-[0.84rem]">
                  {studio.wordmark}
                </span>
                <span className="mt-1.5 font-sans text-[0.52rem] tracking-[0.5em] opacity-60 md:text-[0.58rem]">
                  {studio.wordmarkSub}
                </span>
              </button>

              <span className="hidden font-sans text-[0.62rem] tracking-[0.28em] opacity-60 md:block">
                {presentation.project.phase.toUpperCase()}
              </span>

              <button
                onClick={() => setOpen((v) => !v)}
                className="group flex items-center gap-3.5"
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
              >
                <span className="font-sans text-[0.66rem] tracking-[0.34em] transition-opacity group-hover:opacity-70">
                  {open ? "CLOSE" : "INDEX"}
                </span>
                <span className="relative flex h-3 w-7 flex-col justify-between">
                  <span
                    className={`block h-px w-full bg-current transition-all duration-700 ${
                      open ? "translate-y-[5px] rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`block h-px w-full bg-current transition-all duration-700 ${
                      open ? "-translate-y-[6px] -rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Fullscreen index ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[88] flex flex-col bg-ink"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="exit"
          >
            {/* spacer for header */}
            <div className="h-[92px] shrink-0 md:h-[112px]" />

            <div className="flex flex-1 flex-col justify-center px-6 md:px-12 lg:px-20">
              <motion.span variants={fadeChild} className="eyebrow mb-10 md:mb-14">
                Index — {presentation.project.codename}
              </motion.span>

              <nav className="flex flex-col">
                {nav.filter((item) => visibility[item.id] !== false).map((item) => (
                  <div key={item.id} className="overflow-hidden border-t border-line last:border-b">
                    <motion.button
                      variants={itemVariants}
                      onClick={() => goTo(item.id)}
                      className="group flex w-full items-baseline gap-6 py-3.5 text-left md:gap-10 md:py-5"
                    >
                      <span className="font-sans text-[0.62rem] tabular-nums tracking-[0.3em] text-bone-faint transition-colors group-hover:text-bone md:text-[0.68rem]">
                        {item.index}
                      </span>
                      <span className="display text-[clamp(2.2rem,7.5vw,5.2rem)] text-bone-dim transition-all duration-700 group-hover:translate-x-3 group-hover:text-bone">
                        {item.label}
                      </span>
                      <span className="ml-auto hidden h-px w-0 self-center bg-bone transition-all duration-700 group-hover:w-16 md:block" />
                    </motion.button>
                  </div>
                ))}
              </nav>
            </div>

            <motion.div
              variants={fadeChild}
              className="flex flex-col gap-6 px-6 pb-10 md:flex-row md:items-end md:justify-between md:px-12 md:pb-12 lg:px-20"
            >
              <div className="flex flex-col gap-1.5">
                <span className="eyebrow">Studio</span>
                <a
                  href={`mailto:${studio.email}`}
                  className="font-sans text-sm text-bone transition-opacity hover:opacity-60"
                >
                  {studio.email}
                </a>
                <span className="font-sans text-sm text-bone-dim">{studio.phone}</span>
              </div>
              <div className="flex gap-8">
                {studio.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="font-sans text-[0.66rem] tracking-[0.24em] text-bone-faint transition-colors hover:text-bone"
                  >
                    {s.label.toUpperCase()}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
