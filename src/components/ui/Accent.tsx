import { Fragment } from "react";

/**
 * Renders text with inline red highlights. Wrap any words in *asterisks* to
 * colour them with the theme accent — e.g. "Design *development*". Everything
 * stays editable as plain text in the admin.
 */
export function Accent({ text, className = "" }: { text: string; className?: string }) {
  const parts = (text ?? "").split(/(\*[^*]+\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className="text-accent">
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
