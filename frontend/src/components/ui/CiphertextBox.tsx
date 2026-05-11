import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";

interface CiphertextBoxProps {
  value: string;
  label?: string;
  isAnimating?: boolean;
}

const HEX_CHARS = "0123456789abcdef";

function scrambleChar(char: string, seed: number): string {
  if (char === "0" && Math.random() < 0.3) return char;
  if (char === "x" || char === "X") return char;
  return HEX_CHARS[Math.floor((Math.random() * 16 + seed) % 16)];
}

export function CiphertextBox({ value, label, isAnimating }: CiphertextBoxProps) {
  const [displayed, setDisplayed] = useState(value);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!isAnimating || !value) {
      setDisplayed(value);
      return;
    }

    frameRef.current = 0;
    const SCRAMBLE_FRAMES = 16; // ~800ms at 50ms intervals

    intervalRef.current = setInterval(() => {
      frameRef.current += 1;
      if (frameRef.current >= SCRAMBLE_FRAMES) {
        setDisplayed(value);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      const progress = frameRef.current / SCRAMBLE_FRAMES;
      const settled = Math.floor(progress * value.length);
      const scrambled =
        value.slice(0, settled) +
        value
          .slice(settled)
          .split("")
          .map((c, i) => scrambleChar(c, i + frameRef.current))
          .join("");
      setDisplayed(scrambled);
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [value, isAnimating]);

  return (
    <div
      style={{
        backgroundColor: "#0A0A0B",
        border: "1px solid #27272A",
        padding: "12px 14px",
        borderRadius: 0,
      }}
    >
      {label && (
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#52525B",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Lock size={9} />
          {label}
        </div>
      )}
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          color: "#8C7D64",
          wordBreak: "break-all",
          lineHeight: 1.7,
        }}
      >
        [ {displayed || "0x0000...0000"} ]
      </div>
    </div>
  );
}
