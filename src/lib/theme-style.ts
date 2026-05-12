import type { CSSProperties } from "react";
import type { ThemeColors } from "./content";

/**
 * Turns the editable colour palette into the CSS custom properties that
 * Tailwind's theme tokens (`bg-ink`, `text-bone`, …) resolve against.
 * Applied on <html> so the whole site re-skins from the dashboard.
 */
export function themeStyle(t: ThemeColors): CSSProperties {
  return {
    "--color-ink": t.ink,
    "--color-ink-2": t.ink2,
    "--color-ink-3": t.ink3,
    "--color-bone": t.bone,
    "--color-bone-dim": t.boneDim,
    "--color-bone-faint": t.boneFaint,
    "--color-clay": t.clay,
    "--color-clay-dim": t.clayDim,
  } as CSSProperties;
}
