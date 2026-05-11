import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  accent?: boolean;
  noPad?: boolean;
}

export function Panel({ title, subtitle, children, accent, noPad }: PanelProps) {
  return (
    <div
      style={{
        backgroundColor: "#141416",
        border: `1px solid ${accent ? "#8C7D6440" : "#27272A"}`,
        borderRadius: 0,
      }}
    >
      {(title || subtitle) && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #27272A",
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
          }}
        >
          {title && (
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#52525B",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {title}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: "12px", color: "#A1A1AA", fontFamily: "Inter, sans-serif" }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
      <div style={noPad ? {} : { padding: "20px" }}>{children}</div>
    </div>
  );
}
