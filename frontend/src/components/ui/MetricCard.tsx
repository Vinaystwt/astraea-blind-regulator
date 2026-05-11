interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  highlight?: boolean;
  mono?: boolean;
}

export function MetricCard({ label, value, sublabel, highlight, mono }: MetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#1C1C1F",
        border: `1px solid ${highlight ? "#8C7D6440" : "#27272A"}`,
        padding: "16px 20px",
        borderRadius: 0,
      }}
    >
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#52525B",
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: mono ? "18px" : "22px",
          fontFamily: mono ? "JetBrains Mono, monospace" : "Cormorant Garamond, Georgia, serif",
          fontWeight: 400,
          color: highlight ? "#D4AF37" : "#EDEDED",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div
          style={{
            fontSize: "11px",
            color: "#52525B",
            fontFamily: "JetBrains Mono, monospace",
            marginTop: "4px",
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}
