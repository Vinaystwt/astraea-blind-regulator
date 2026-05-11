import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: "#1C1C1F",
    color: "#EDEDED",
    borderColor: "#27272A",
  },
  secondary: {
    backgroundColor: "transparent",
    color: "#A1A1AA",
    borderColor: "#27272A",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "#A1A1AA",
    borderColor: "transparent",
  },
  danger: {
    backgroundColor: "#3B1C1C",
    color: "#FDA4AF",
    borderColor: "#FDA4AF30",
  },
  gold: {
    backgroundColor: "#D4AF3715",
    color: "#D4AF37",
    borderColor: "#D4AF3740",
  },
};

const HOVER: Record<Variant, React.CSSProperties> = {
  primary: { borderColor: "#8C7D64", color: "#EDEDED" },
  secondary: { borderColor: "#8C7D64", color: "#EDEDED" },
  ghost: { color: "#EDEDED" },
  danger: { backgroundColor: "#4B2525" },
  gold: { backgroundColor: "#D4AF3725", borderColor: "#D4AF3770" },
};

export function Button({ variant = "primary", loading, icon, children, disabled, style, ...props }: ButtonProps) {
  const base = STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        ...base,
        border: "1px solid",
        padding: "7px 16px",
        fontSize: "13px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.1s",
        borderRadius: 0,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          Object.assign((e.currentTarget as HTMLButtonElement).style, HOVER[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          Object.assign((e.currentTarget as HTMLButtonElement).style, base);
          (e.currentTarget as HTMLButtonElement).style.border = "1px solid";
        }
      }}
    >
      {loading ? <LoadingDots /> : icon}
      {children}
    </button>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full"
          style={{
            backgroundColor: "currentColor",
            animation: `pulse 1s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
    </span>
  );
}
