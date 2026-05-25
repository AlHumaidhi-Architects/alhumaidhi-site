"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Section, SectionTag } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Accent } from "@/components/ui/Accent";
import { SignaturePad, type SignaturePadHandle } from "@/components/ui/SignaturePad";
import { useLenis } from "lenis/react";
import { useInfo, useProject, useSections, useStudio, useYear } from "@/lib/content-context";
import type { ProjectApproval } from "@/lib/content";
import { EASE_OUT_EXPO } from "@/lib/motion";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format an ISO timestamp deterministically (UTC) so SSR and the client agree. */
function formatApprovalDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const primaryBtn =
  "inline-flex items-center justify-center gap-2.5 bg-bone px-9 py-4 font-sans text-[0.7rem] uppercase tracking-[0.26em] text-ink transition-colors duration-300 enabled:hover:bg-bone-dim disabled:opacity-50";
const secondaryBtn =
  "group inline-flex items-center justify-center gap-2.5 border border-line px-9 py-4 font-sans text-[0.7rem] uppercase tracking-[0.26em] text-bone transition-colors duration-300 hover:border-bone";

export function NextSteps() {
  const ns = useSections().nextSteps;
  const studio = useStudio();
  const info = useInfo();
  const project = useProject();
  const year = useYear();
  const lenis = useLenis();
  const router = useRouter();

  const [approval, setApproval] = useState<ProjectApproval | undefined>(project.approval);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sigEmpty, setSigEmpty] = useState(true);
  const sigRef = useRef<SignaturePadHandle>(null);

  // Pause the smooth scroll while the approval dialog is open.
  useEffect(() => {
    if (!modalOpen) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, lenis]);

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 2.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function emailComments() {
    const recipient = (info.commentsEmail || "").trim() || studio.email;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const projectUrl = `${origin}/p/${project.slug}`;
    const subject = `Project Comments — ${info.name}`;
    const body =
      `Project: ${info.name}\n` +
      `Client: ${info.client}\n` +
      `Project Link: ${projectUrl}\n\n` +
      `Comments:\n\n`;
    // Best-effort: flag the project as "With Comments" for the studio. Never
    // block opening the draft if this fails (e.g. backend not connected).
    fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "comments", id: project.id, slug: project.slug }),
    }).catch(() => {});
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  function openApproval() {
    setName(approval?.approvedBy ?? "");
    setError(null);
    setSigEmpty(true);
    setModalOpen(true);
  }

  function clearSignature() {
    sigRef.current?.clear();
    setSigEmpty(true);
  }

  async function submitApproval() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your full name to confirm.");
      return;
    }
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("Please add your signature to confirm.");
      return;
    }
    const signature = sigRef.current.toDataURL();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "approve", id: project.id, slug: project.slug, name: trimmed, signature }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't save your approval.");
      setApproval(data.approval as ProjectApproval);
      setModalOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your approval.");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = ns.steps ?? [];

  return (
    <Section domId="nextSteps" bg="ink" full className="flex flex-col">
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 pb-12 pt-32 md:px-12 md:pb-16 md:pt-40 lg:px-20">
        <div className="flex items-baseline justify-between">
          <SectionTag domId="nextSteps" />
          <Reveal as="span" className="hidden font-sans text-[0.62rem] tracking-[0.26em] text-bone-faint md:block">
            {info.codename}
          </Reveal>
        </div>

        {/* Title — large, top-left */}
        <Reveal
          as="h2"
          className="mt-10 max-w-4xl text-balance display text-[clamp(2.8rem,9vw,7rem)] leading-[0.98] text-bone md:mt-14"
        >
          {(ns.headline ?? []).map((line, i) => (
            <span key={i} className="block">
              <Accent text={line} />
            </span>
          ))}
        </Reveal>

        {ns.text && (
          <Reveal>
            <p className="copy mt-7 max-w-xl text-balance text-[1.05rem] leading-[1.8]">{ns.text}</p>
          </Reveal>
        )}

        {/* Horizontal steps with numbered circles + dotted arrow connectors */}
        {steps.length > 0 && (
          <div className="mt-16 flex flex-col gap-12 md:mt-24 md:flex-row md:items-start md:gap-4 lg:gap-8">
            {steps.map((step, i) => (
              <Fragment key={i}>
                <Reveal as="div" delay={0.08 * i} className="flex-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-bone/30 font-sans text-[0.82rem] tabular-nums tracking-[0.12em] text-bone md:h-16 md:w-16">
                    {step.n}
                  </div>
                  <h3 className="mt-6 font-sans text-[1.2rem] font-semibold leading-snug text-bone md:text-[1.4rem]">
                    <Accent text={step.title} />
                  </h3>
                  <p className="copy mt-3 max-w-xs text-[0.95rem] leading-[1.7]">{step.text}</p>
                </Reveal>

                {i < steps.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden shrink-0 self-start pt-7 md:flex md:w-10 md:items-center lg:w-24"
                  >
                    <span className="h-0 flex-1 border-t border-dotted border-bone/45" />
                    <span className="-ml-0.5 text-[0.95rem] leading-none text-bone/45">→</span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}

        {/* Final action area + contact */}
        <div className="mt-auto grid gap-10 pt-20 md:grid-cols-12 md:pt-28">
          <div className="md:col-span-7">
            {approval ? (
              <Reveal>
                <span className="eyebrow flex items-center gap-2">
                  <span aria-hidden>✓</span> Approved
                </span>
                <p className="display mt-4 text-[clamp(1.7rem,3.6vw,2.6rem)] leading-[1.05] text-bone">
                  {approval.approvedBy}
                </p>
                <p className="eyebrow mt-2.5">Approved on {formatApprovalDate(approval.approvedAt)}</p>
                {approval.signature && (
                  <figure className="mt-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={approval.signature}
                      alt={`Signature of ${approval.approvedBy}`}
                      className="h-24 w-auto max-w-full rounded-sm border border-line bg-white object-contain"
                    />
                    <figcaption className="eyebrow mt-2">Signature</figcaption>
                  </figure>
                )}
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={emailComments} className={secondaryBtn}>
                    Email Comments
                    <span className="text-bone-faint transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
                      ↗
                    </span>
                  </button>
                </div>
              </Reveal>
            ) : (
              <Reveal>
                <span className="eyebrow">Your decision</span>
                <p className="copy mt-3 max-w-md text-[0.98rem] leading-[1.7]">
                  Approve the proposal as presented, or send us your comments.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={openApproval} className={primaryBtn}>
                    Approved
                  </button>
                  <button type="button" onClick={emailComments} className={secondaryBtn}>
                    Email Comments
                    <span className="text-bone-faint transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
                      ↗
                    </span>
                  </button>
                </div>
              </Reveal>
            )}
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-4 md:col-start-9">
            <span className="eyebrow">Studio</span>
            <a href={`mailto:${studio.email}`} className="font-sans text-[0.95rem] text-bone transition-opacity hover:opacity-60">
              {studio.email}
            </a>
            <a
              href={`tel:${studio.phone.replace(/\s+/g, "")}`}
              className="font-sans text-[0.95rem] text-bone-dim transition-opacity hover:opacity-60"
            >
              {studio.phone}
            </a>
            <div className="mt-4 flex gap-6">
              {studio.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[0.66rem] uppercase tracking-[0.24em] text-bone-faint transition-colors hover:text-bone"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* footer — a single hairline, set quietly */}
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-6 py-7 text-[0.62rem] uppercase tracking-[0.18em] text-bone-faint md:flex-row md:items-center md:justify-between md:px-12 md:py-8 lg:px-20">
          <span>
            © {year} — {studio.name}
          </span>
          <span className="hidden md:block">{studio.tagline}</span>
          <button
            onClick={toTop}
            className="group flex items-center gap-2 self-start transition-colors hover:text-bone md:self-auto"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-y-0.5">
              ↑
            </span>
            Back to top
          </button>
        </div>
      </footer>

      {/* ── Approval dialog ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            onClick={() => !submitting && setModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm approval"
          >
            <motion.div
              data-lenis-prevent
              className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-ink p-7 shadow-2xl md:p-9"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.99 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="eyebrow">Confirm approval</span>
              <h3 className="display mt-3 text-[clamp(1.6rem,4vw,2.2rem)] leading-[1.05] text-bone">
                Approve {info.name}
              </h3>
              <p className="copy mt-3 text-[0.95rem] leading-[1.7]">
                By approving, you confirm you have reviewed this presentation. Your name, signature and
                today&rsquo;s date are recorded with the project.
              </p>

              <label className="mt-7 block">
                <span className="eyebrow">Your full name</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="mt-3 w-full border-b border-line bg-transparent pb-2.5 font-sans text-[1.05rem] text-bone outline-none transition-colors placeholder:text-bone-faint focus:border-bone"
                />
              </label>

              <div className="mt-6">
                <div className="flex items-baseline justify-between">
                  <span className="eyebrow">Your signature</span>
                  <button
                    type="button"
                    onClick={clearSignature}
                    disabled={sigEmpty}
                    className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-bone-faint transition-colors enabled:hover:text-bone disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
                <div className="relative mt-3 rounded-sm border border-line bg-white">
                  <SignaturePad ref={sigRef} onEmptyChange={setSigEmpty} className="h-44 rounded-sm" />
                  {sigEmpty && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-sans text-[0.72rem] uppercase tracking-[0.22em] text-bone-faint/70">
                      Sign here
                    </span>
                  )}
                </div>
                <p className="mt-2 font-sans text-[0.72rem] leading-relaxed text-bone-faint">
                  Draw your signature above using your mouse, trackpad or finger.
                </p>
              </div>

              <p className="mt-5 font-sans text-[0.72rem] text-bone-faint">
                Approval date: {formatApprovalDate(new Date().toISOString())} — recorded automatically.
              </p>

              {error && <p className="mt-3 font-sans text-[0.8rem] text-accent">{error}</p>}

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 font-sans text-[0.7rem] uppercase tracking-[0.22em] text-bone-faint transition-colors hover:text-bone disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitApproval}
                  disabled={submitting}
                  className={primaryBtn}
                >
                  {submitting ? "Saving…" : "Confirm approval"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
