import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toast } from "@/components/ui/Toast";
import { DemoChecklist } from "@/components/ui/DemoChecklist";
import { useAstraea } from "@/context/AstraeaContext";
import { showInternalGuides } from "@/config/contract";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { toasts, dismissToast } = useAstraea();

  return (
    <div className="flex min-h-[100dvh] overflow-hidden" style={{ backgroundColor: "#0A0A0B" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "#0A0A0B" }}>
          <div className="max-w-5xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Floating demo checklist */}
      {showInternalGuides() && <DemoChecklist />}
    </div>
  );
}
