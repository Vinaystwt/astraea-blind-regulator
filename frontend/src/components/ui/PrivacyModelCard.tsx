import { Shield } from "lucide-react";

interface PrivacyModelCardProps {
  note?: string;
}

export function PrivacyModelCard({ note }: PrivacyModelCardProps) {
  const text =
    note ??
    "Public receipts prove process. Authorized decryption reveals only the permitted view. Individual investor facts remain mathematically sealed.";

  return (
    <div
      style={{
        backgroundColor: "#0A0A0B",
        border: "1px solid #27272A",
        padding: "12px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        borderRadius: 0,
      }}
    >
      <Shield size={13} style={{ color: "#52525B", flexShrink: 0, marginTop: "1px" }} />
      <p
        style={{
          fontSize: "11px",
          color: "#52525B",
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}
