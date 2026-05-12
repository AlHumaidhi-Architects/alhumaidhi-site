import type { Variants, Transition } from "motion/react";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_QUINT = [0.83, 0, 0.17, 1] as const;

export const transition = (overrides: Partial<Transition> = {}): Transition => ({
  duration: 1.4,
  ease: EASE_OUT_EXPO,
  ...overrides,
});

/** Container that staggers its children's reveal. */
export const stagger = (
  staggerChildren = 0.1,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

/** A line/word/element that rises and fades into place. */
export const rise: Variants = {
  hidden: { y: "120%" },
  visible: {
    y: "0%",
    transition: { duration: 1.35, ease: EASE_OUT_EXPO },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.3, ease: EASE_OUT_EXPO },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.6, ease: EASE_OUT_EXPO } },
};

/** Image clip-reveal — wrapper clips, inner scales back to 1. Slow, cinematic. */
export const clipWrap: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 1.7, ease: EASE_IN_OUT_QUINT },
  },
};

export const clipInner: Variants = {
  hidden: { scale: 1.24 },
  visible: { scale: 1, transition: { duration: 2.0, ease: EASE_IN_OUT_QUINT } },
};

/** Default viewport options for whileInView. */
export const inView = { once: true, amount: 0.3, margin: "0px 0px -12% 0px" } as const;
export const inViewSoft = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" } as const;
