"use client";

import { motion } from "motion/react";
import { EASE_OUT_EXPO, inView, inViewSoft } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** distance travelled in px */
  y?: number;
  duration?: number;
  once?: boolean;
  soft?: boolean;
  as?:
    | "div"
    | "li"
    | "span"
    | "section"
    | "header"
    | "footer"
    | "article"
    | "figcaption"
    | "ul"
    | "ol"
    | "dl"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "p";
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 22,
  duration = 1.3,
  once = true,
  soft = false,
  as = "div",
}: RevealProps) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: EASE_OUT_EXPO, delay }}
      viewport={{ ...(soft ? inViewSoft : inView), once }}
    >
      {children}
    </Tag>
  );
}

/** Staggered list — children get a cascading reveal. */
export function RevealGroup({
  children,
  className = "",
  stagger = 0.11,
  delay = 0,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...inViewSoft, once }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const revealChild = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.3, ease: EASE_OUT_EXPO } },
};
