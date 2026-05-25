"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type SignaturePadHandle = {
  /** true while nothing has been drawn yet */
  isEmpty: () => boolean;
  /** PNG data URL of the current signature (white background + ink stroke) */
  toDataURL: () => string;
  /** wipe the pad back to a blank white surface */
  clear: () => void;
};

type Props = {
  /** stroke colour */
  penColor?: string;
  /** surface colour, baked into the exported image so it always reads */
  background?: string;
  className?: string;
  /** notified whenever the empty/non-empty state changes */
  onEmptyChange?: (empty: boolean) => void;
};

/**
 * A dependency-free signature pad. Uses Pointer Events so a single code path
 * covers mouse, trackpad, touch and stylus; `touch-action: none` stops the page
 * from scrolling while signing. The backing store is scaled for the device
 * pixel ratio so strokes stay crisp, and the surface is painted with a solid
 * background so the exported PNG is visible on light and dark UIs alike.
 */
export const SignaturePad = forwardRef<SignaturePadHandle, Props>(function SignaturePad(
  { penColor = "#1a1711", background = "#ffffff", className = "", onEmptyChange },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const hasDrawn = useRef(false);
  const [empty, setEmpty] = useState(true);

  const ctx = () => canvasRef.current?.getContext("2d") ?? null;

  const paintBackground = useCallback(() => {
    const canvas = canvasRef.current;
    const c = ctx();
    if (!canvas || !c) return;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = background;
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.restore();
  }, [background]);

  // Size the backing store to the element's LAYOUT box × DPR, then configure the
  // pen. offsetWidth/Height ignore CSS transforms (the modal's entrance scale),
  // so strokes map 1:1 to the pointer once the dialog has settled.
  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const c = ctx();
    if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.lineWidth = 2.2;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = penColor;
    paintBackground();
  }, [penColor, paintBackground]);

  const setEmptyState = useCallback(
    (v: boolean) => {
      hasDrawn.current = !v;
      setEmpty(v);
      onEmptyChange?.(v);
    },
    [onEmptyChange],
  );

  useEffect(() => {
    setup();
    const onResize = () => {
      setup();
      setEmptyState(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* some pointer types can't be captured — drawing still works */
    }
    drawing.current = true;
    last.current = pos(e);
    if (empty) setEmptyState(false);
    // a dot, so a tap registers
    const c = ctx();
    const p = last.current;
    if (c && p) {
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x + 0.01, p.y + 0.01);
      c.stroke();
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const c = ctx();
    const p = pos(e);
    const l = last.current;
    if (c && l) {
      c.beginPath();
      c.moveTo(l.x, l.y);
      c.lineTo(p.x, p.y);
      c.stroke();
    }
    last.current = p;
  };

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer may already be released */
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      isEmpty: () => !hasDrawn.current,
      toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
      clear: () => {
        paintBackground();
        setEmptyState(true);
      },
    }),
    [paintBackground, setEmptyState],
  );

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full touch-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endStroke}
      onPointerLeave={endStroke}
      onPointerCancel={endStroke}
    />
  );
});
