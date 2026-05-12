"use client";

import { motion } from "motion/react";
import { EASE_OUT_EXPO, inView } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

type AnimatedTextProps = {
  /** plain string, or array of lines (each line breaks) */
  text: string | string[];
  as?: Tag;
  className?: string;
  /** stagger between words */
  stagger?: number;
  delay?: number;
  /** animate word-by-word (default) or line-by-line */
  by?: "word" | "line";
  once?: boolean;
};

export function AnimatedText({
  text,
  as = "span",
  className = "",
  stagger = 0.05,
  delay = 0,
  by = "word",
  once = true,
}: AnimatedTextProps) {
  const lines = Array.isArray(text) ? text : [text];
  const Wrapper = motion[as] as typeof motion.span;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const child = {
    hidden: { y: "115%" },
    visible: { y: "0%", transition: { duration: 1.3, ease: EASE_OUT_EXPO } },
  };

  return (
    <Wrapper
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...inView, once }}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {by === "line" ? (
            <span className="inline-block overflow-hidden align-bottom">
              <motion.span variants={child} className="inline-block">
                {line}
              </motion.span>
            </span>
          ) : (
            line.split(" ").map((word, wi) => (
              <span
                key={wi}
                className="inline-block overflow-hidden align-bottom"
                style={{ marginRight: "0.22em" }}
              >
                <motion.span variants={child} className="inline-block">
                  {word}
                </motion.span>
              </span>
            ))
          )}
        </span>
      ))}
    </Wrapper>
  );
}
