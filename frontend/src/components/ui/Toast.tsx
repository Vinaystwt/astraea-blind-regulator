import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import type { ToastMessage } from "@/types/astraea";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: "#1A2E22", border: "#6EE7B730", color: "#6EE7B7" },
  error: { bg: "#3B1C1C", border: "#FDA4AF30", color: "#FDA4AF" },
  warning: { bg: "#2A1F0E", border: "#D4AF3730", color: "#D4AF37" },
  info: { bg: "#1C1C1F", border: "#27272A", color: "#A1A1AA" },
};

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = ICONS[toast.type];
  const c = COLORS[toast.type];

  return (
    <div
      className="fade-slide-in"
      style={{
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: "280px",
        maxWidth: "380px",
        borderRadius: 0,
      }}
    >
      <Icon size={13} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: "12px", fontFamily: "Inter, sans-serif", flex: 1 }}>
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "0 2px" }}
      >
        <X size={11} />
      </button>
    </div>
  );
}
