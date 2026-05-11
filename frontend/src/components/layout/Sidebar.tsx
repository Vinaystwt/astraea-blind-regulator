import type { Role } from "@/types/astraea";
import { useAstraea } from "@/context/AstraeaContext";
import { showInternalGuides } from "@/config/contract";

interface NavItem {
  role: Role;
  label: string;
  sublabel: string;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { role: "home", label: "Overview", sublabel: "Astraea", group: "nav" },
  { role: "issuer", label: "Issuer", sublabel: "Fund management", group: "roles" },
  { role: "investor-a", label: "Investor A", sublabel: "Private subscription", group: "roles" },
  { role: "investor-b", label: "Investor B", sublabel: "Private subscription", group: "roles" },
  { role: "investor-c", label: "Investor C", sublabel: "Private subscription", group: "roles" },
  { role: "public", label: "Public Observer", sublabel: "No-leak feed", group: "roles" },
  { role: "regulator", label: "Regulator", sublabel: "Aggregate report", group: "roles" },
  { role: "demo", label: "Demo Script", sublabel: "Recording guide", group: "tools" },
];

export function Sidebar() {
  const { role, setRole } = useAstraea();
  const navItems = showInternalGuides() ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.role !== "demo");

  const groups = [
    { key: "nav", label: null },
    { key: "roles", label: "ROLES" },
    { key: "tools", label: "TOOLS" },
  ];

  return (
    <aside
      className="w-56 min-h-screen flex flex-col border-r border-border-obsidian bg-bg-surface"
      style={{ borderColor: "#27272A", backgroundColor: "#141416" }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 border-b border-border-obsidian" style={{ borderColor: "#27272A" }}>
        <div
          className="font-display text-xl tracking-wide"
          style={{ color: "#D4AF37", fontFamily: "Cormorant Garamond, Georgia, serif", fontWeight: 400 }}
        >
          Astraea
        </div>
        <div className="text-xs mt-0.5" style={{ color: "#52525B", fontFamily: "JetBrains Mono, monospace" }}>
          The Blind Regulator
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-4">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group.key);
          if (items.length === 0) return null;
          return (
            <div key={group.key} className="mb-1">
              {group.label && (
                <div
                  className="px-5 py-2 text-xs tracking-widest"
                  style={{ color: "#52525B", fontFamily: "JetBrains Mono, monospace" }}
                >
                  {group.label}
                </div>
              )}
              {items.map((item) => {
                const active = role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => setRole(item.role)}
                    className="w-full text-left px-5 py-3 flex flex-col transition-colors duration-100"
                    style={{
                      backgroundColor: active ? "#1C1C1F" : "transparent",
                      borderLeft: active ? "2px solid #D4AF37" : "2px solid transparent",
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: active ? "#EDEDED" : "#A1A1AA",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-xs mt-0.5"
                      style={{
                        color: active ? "#A1A1AA" : "#52525B",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {item.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border-obsidian" style={{ borderColor: "#27272A" }}>
        <div className="text-xs" style={{ color: "#52525B", fontFamily: "JetBrains Mono, monospace" }}>
          Zama FHEVM
        </div>
        <div className="text-xs mt-0.5" style={{ color: "#52525B", fontFamily: "JetBrains Mono, monospace" }}>
          Sepolia testnet
        </div>
      </div>
    </aside>
  );
}
