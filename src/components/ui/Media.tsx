"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { clipInner, clipWrap, inViewSoft } from "@/lib/motion";

type MediaProps = {
  src: string;
  alt: string;
  /** wrapper classes — control aspect ratio / sizing here */
  className?: string;
  /** inline styles on the wrapper (e.g. aspectRatio) */
  style?: React.CSSProperties;
  imgClassName?: string;
  priority?: boolean;
  /** vertical parallax travel in px (0 = none) */
  parallax?: number;
  /** clip-reveal when scrolled into view */
  reveal?: boolean;
  sizes?: string;
  grayscale?: boolean;
  /** overlay tint strength 0–1 — a soft wash of the page ground over the image */
  tint?: number;
  children?: React.ReactNode;
};

export function Media({
  src,
  alt,
  className = "",
  style,
  imgClassName = "",
  priority = false,
  parallax = 0,
  reveal = true,
  sizes = "100vw",
  grayscale = false,
  tint = 0,
  children,
}: MediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);

  return (
    <motion.div
      ref={ref}
      style={style}
      className={`relative overflow-hidden bg-ink-3 ${className}`}
      variants={reveal ? clipWrap : undefined}
      initial={reveal ? "hidden" : false}
      whileInView={reveal ? "visible" : undefined}
      viewport={inViewSoft}
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        variants={reveal ? clipInner : undefined}
      >
        <motion.div
          className={parallax ? "absolute inset-x-0 -inset-y-[24%]" : "absolute inset-0"}
          style={parallax ? { y } : undefined}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className={`object-cover ${grayscale ? "grayscale" : ""} ${imgClassName}`}
          />
        </motion.div>
      </motion.div>
      {tint > 0 && (
        <div
          className="pointer-events-none absolute inset-0 bg-ink"
          style={{ opacity: tint }}
        />
      )}
      {children}
    </motion.div>
  );
}
