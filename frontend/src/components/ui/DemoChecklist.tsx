import { useState } from "react";
import { ChevronRight, ChevronDown, Video } from "lucide-react";
import { DEMO_CHECKLIST } from "@/config/demo";
import { useAstraea } from "@/context/AstraeaContext";

export function DemoChecklist() {
  const { demoChecklistOpen, setDemoChecklistOpen } = useAstraea();
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (step: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 40,
        minWidth: demoChecklistOpen ? "280px" : "auto",
      }}
    >
      {!demoChecklistOpen ? (
        <button
          onClick={() => setDemoChecklistOpen(true)}
          style={{
            backgroundColor: "#D4AF3715",
            border: "1px solid #D4AF3740",
            color: "#D4AF37",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontFamily: "JetBrains Mono, monospace",
            cursor: "pointer",
            borderRadius: 0,
          }}
        >
          <Video size={11} />
          Recording Guide
          <ChevronRight size={11} />
        </button>
      ) : (
        <div
          style={{
            backgroundColor: "#141416",
            border: "1px solid #27272A",
            borderRadius: 0,
          }}
        >
          <button
            onClick={() => setDemoChecklistOpen(false)}
            style={{
              width: "100%",
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#1C1C1F",
              border: "none",
              borderBottom: "1px solid #27272A",
              cursor: "pointer",
              color: "#D4AF37",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Video size={11} />
              RECORDING GUIDE
            </div>
            <ChevronDown size={11} />
          </button>
          <div style={{ padding: "8px 0", maxHeight: "400px", overflowY: "auto" }}>
            {DEMO_CHECKLIST.map((item) => {
              const done = checked.has(item.step);
              return (
                <div
                  key={item.step}
                  onClick={() => toggle(item.step)}
                  style={{
                    padding: "8px 14px",
                    display: "flex",
                    gap: "10px",
                    cursor: "pointer",
                    opacity: done ? 0.5 : 1,
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      border: `1px solid ${done ? "#D4AF37" : "#27272A"}`,
                      backgroundColor: done ? "#D4AF3715" : "transparent",
                      flexShrink: 0,
                      marginTop: "1px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {done && (
                      <span style={{ fontSize: "8px", color: "#D4AF37" }}>✓</span>
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#A1A1AA",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        textDecoration: done ? "line-through" : "none",
                      }}
                    >
                      {item.step}. {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#52525B",
                        fontFamily: "JetBrains Mono, monospace",
                        marginTop: "2px",
                      }}
                    >
                      {item.cue}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
