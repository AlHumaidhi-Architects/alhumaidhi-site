"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { clipInner, clipWrap, inViewSoft } from "@/lib/motion";
import { bustCache, isSupabasePublicUrl, mediaKind, videoMime } from "@/lib/media-url";
import { useMediaVersion } from "@/lib/content-context";

export { isSupabasePublicUrl, videoMime } from "@/lib/media-url";

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
  /** poster frame for videos */
  poster?: string;
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
  poster,
  children,
}: MediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);
  // Cache-bust uploaded media so a re-saved project always serves a fresh copy.
  const version = useMediaVersion();
  const url = bustCache(src, version);
  const posterUrl = poster ? bustCache(poster, version) : undefined;
  const kind = mediaKind(url);
  const fitClass = `object-cover ${grayscale ? "grayscale" : ""} ${imgClassName}`;

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
      <motion.div className="absolute inset-0 will-change-transform" variants={reveal ? clipInner : undefined}>
        <motion.div
          className={parallax ? "absolute inset-x-0 -inset-y-[24%]" : "absolute inset-0"}
          style={parallax ? { y } : undefined}
        >
          {kind === "video" ? (
            <video
              className={`absolute inset-0 h-full w-full ${fitClass}`}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={posterUrl}
            >
              <source src={url} type={videoMime(url)} />
            </video>
          ) : (
            <Image
              src={url}
              alt={alt}
              fill
              priority={priority}
              sizes={sizes}
              unoptimized={kind === "gif" || isSupabasePublicUrl(url)}
              className={fitClass}
            />
          )}
        </motion.div>
      </motion.div>
      {tint > 0 && <div className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: tint }} />}
      {children}
    </motion.div>
  );
}
