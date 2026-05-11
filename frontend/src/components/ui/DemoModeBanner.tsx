import { Info } from "lucide-react";

interface DemoModeBannerProps {
  message?: string;
}

export function DemoModeBanner({ message }: DemoModeBannerProps) {
  const text =
    message ??
    "Demo Assist Mode: expected values are displayed for recording guidance. Contract-derived values are shown separately.";

  return (
    <div
      style={{
        backgroundColor: "#8C7D6410",
        border: "1px solid #8C7D6430",
        padding: "10px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        borderRadius: 0,
      }}
    >
      <Info size={13} style={{ color: "#8C7D64", flexShrink: 0, marginTop: "1px" }} />
      <span
        style={{
          fontSize: "11px",
          color: "#8C7D64",
          fontFamily: "JetBrains Mono, monospace",
          lineHeight: 1.6,
        }}
      >
        {text}
      </span>
    </div>
  );
}
