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
  /** poster frame for videos */
  poster?: string;
  children?: React.ReactNode;
};

/** Distinguish stills from animated GIFs and MP4/WebM video by extension. */
function mediaKind(src: string): "video" | "gif" | "image" {
  const s = (src || "").split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|m4v|ogv)$/.test(s)) return "video";
  if (/\.gif$/.test(s)) return "gif";
  return "image";
}

/** Best-effort MIME hint for a <source>, so browsers don't have to sniff. */
export function videoMime(src: string): string | undefined {
  const s = (src || "").split("?")[0].toLowerCase();
  if (s.endsWith(".webm")) return "video/webm";
  if (s.endsWith(".ogv")) return "video/ogg";
  if (s.endsWith(".mov") || s.endsWith(".m4v")) return "video/quicktime";
  if (s.endsWith(".mp4")) return "video/mp4";
  return undefined; // unknown extension (e.g. a CDN URL) — let the browser sniff
}

/** Supabase Storage public URL — serve these raw (the optimizer can blank them). */
export function isSupabasePublicUrl(src: string): boolean {
  return /\/storage\/v1\/object\/public\//.test(src || "");
}

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
  const kind = mediaKind(src);
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
              poster={poster}
            >
              <source src={src} type={videoMime(src)} />
            </video>
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes={sizes}
              unoptimized={kind === "gif" || isSupabasePublicUrl(src)}
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
