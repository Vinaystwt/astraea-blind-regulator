type Status = "approved" | "rejected" | "neutral" | "pending";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  privateOnly?: boolean;
}

const STYLES: Record<Status, { bg: string; color: string; border: string }> = {
  approved: { bg: "#1A2E22", color: "#6EE7B7", border: "#6EE7B730" },
  rejected: { bg: "#3B1C1C", color: "#FDA4AF", border: "#FDA4AF30" },
  neutral: { bg: "#1C1C1F", color: "#A1A1AA", border: "#27272A" },
  pending: { bg: "#1C1C1F", color: "#8C7D64", border: "#8C7D6440" },
};

const DEFAULT_LABELS: Record<Status, string> = {
  approved: "APPROVED",
  rejected: "REJECTED",
  neutral: "—",
  pending: "PENDING",
};

export function StatusBadge({ status, label, privateOnly }: StatusBadgeProps) {
  const s = STYLES[status];
  const text = label ?? DEFAULT_LABELS[status];

  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: "2px 8px",
        fontSize: "10px",
        letterSpacing: "0.08em",
        fontFamily: "JetBrains Mono, monospace",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        borderRadius: 0,
      }}
    >
      {privateOnly && (
        <span style={{ fontSize: "8px", opacity: 0.7 }}>&#128274;</span>
      )}
      {text}
    </span>
  );
}
