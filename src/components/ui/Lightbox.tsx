"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { mediaKind, videoMime } from "@/lib/media-url";
import { EASE_OUT_EXPO } from "@/lib/motion";

export type LightboxItem = { src: string; alt: string; poster?: string };

type LightboxCtx = { open: (item: LightboxItem) => void };

const Ctx = createContext<LightboxCtx>({ open: () => {} });

/** Opens any presentation image / GIF / video in a full-screen zoom view. */
export function useLightbox() {
  return useContext(Ctx);
}

/**
 * Renders a single shared overlay and exposes `open()` to every `<Media>` on the
 * page. Mounted once inside the Lenis root so it can pause smooth-scroll while
 * the zoom is open. Closes on the ✕ button, a backdrop click, or the Esc key.
 */
export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<LightboxItem | null>(null);
  const lenis = useLenis();

  const open = useCallback((it: LightboxItem) => setItem(it), []);
  const close = useCallback(() => setItem(null), []);

  useEffect(() => {
    if (!item) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [item, lenis, close]);

  const kind = item ? mediaKind(item.src) : "image";

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {item && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={item.alt || "Enlarged image"}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-white/70 hover:text-white md:right-6 md:top-6"
            >
              <span className="text-2xl leading-none" aria-hidden>
                ×
              </span>
            </button>

            <motion.div
              className="relative flex max-h-full flex-col items-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              onClick={(e) => e.stopPropagation()}
            >
              {kind === "video" ? (
                <video
                  controls
                  autoPlay
                  loop
                  playsInline
                  poster={item.poster}
                  className="max-h-[86vh] max-w-[94vw] object-contain"
                >
                  <source src={item.src} type={videoMime(item.src)} />
                </video>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.src}
                  alt={item.alt}
                  className="max-h-[86vh] max-w-[94vw] object-contain"
                  draggable={false}
                />
              )}
              {item.alt && (
                <span className="mt-4 max-w-[80ch] px-4 text-center font-sans text-[0.62rem] uppercase tracking-[0.22em] text-white/55">
                  {item.alt}
                </span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
