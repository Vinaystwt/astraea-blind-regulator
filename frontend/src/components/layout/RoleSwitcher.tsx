import type { Role } from "@/types/astraea";
import { useAstraea } from "@/context/AstraeaContext";
import { showInternalGuides } from "@/config/contract";

interface RoleButtonProps {
  role: Role;
  label: string;
  description: string;
  accent?: string;
}

const ROLES: RoleButtonProps[] = [
  { role: "issuer", label: "Issuer", description: "Fund management & policy" },
  { role: "investor-a", label: "Investor A", description: "Private subscription" },
  { role: "investor-b", label: "Investor B", description: "Private subscription" },
  { role: "investor-c", label: "Investor C", description: "Private subscription" },
  { role: "public", label: "Public Observer", description: "No-leak receipt feed" },
  { role: "regulator", label: "Regulator", description: "Aggregate report" },
  { role: "demo", label: "Demo Script", description: "Recording guide" },
];

export function RoleSwitcher() {
  const { role, setRole } = useAstraea();
  const roles = showInternalGuides() ? ROLES : ROLES.filter((item) => item.role !== "demo");

  return (
    <div className="space-y-1">
      {roles.map((item) => {
        const active = role === item.role;
        return (
          <button
            key={item.role}
            onClick={() => setRole(item.role)}
            className="w-full text-left px-4 py-3 flex justify-between items-center transition-colors duration-100 border"
            style={{
              borderColor: active ? "#D4AF37" : "#27272A",
              backgroundColor: active ? "#1C1C1F" : "#141416",
            }}
          >
            <div>
              <div
                className="text-sm font-medium"
                style={{ color: active ? "#EDEDED" : "#A1A1AA", fontFamily: "Inter, sans-serif" }}
              >
                {item.label}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "#52525B", fontFamily: "JetBrains Mono, monospace" }}
              >
                {item.description}
              </div>
            </div>
            {active && (
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#D4AF37" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
