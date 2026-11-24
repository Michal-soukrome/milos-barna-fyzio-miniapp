import type { BlockStyleProps } from "sanity";

export function BlockQuoteStyle({ children }: BlockStyleProps) {
  return (
    <blockquote
      style={{
        margin: 0,
        paddingLeft: "0.75rem",
        borderLeft: "3px solid var(--card-border-color)",
      }}
    >
      {children}
    </blockquote>
  );
}
