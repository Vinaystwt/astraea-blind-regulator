import { AstraeaProvider, useAstraea } from "@/context/AstraeaContext";
import { AppShell } from "@/components/layout/AppShell";
import { HomeView } from "@/views/HomeView";
import { IssuerView } from "@/views/IssuerView";
import { InvestorView } from "@/views/InvestorView";
import { PublicObserverView } from "@/views/PublicObserverView";
import { RegulatorView } from "@/views/RegulatorView";
import { DemoScriptView } from "@/views/DemoScriptView";
import { showInternalGuides } from "@/config/contract";

function ViewRouter() {
  const { role } = useAstraea();

  switch (role) {
    case "home":
      return <HomeView />;
    case "issuer":
      return <IssuerView />;
    case "investor-a":
      return <InvestorView investorKey="A" />;
    case "investor-b":
      return <InvestorView investorKey="B" />;
    case "investor-c":
      return <InvestorView investorKey="C" />;
    case "public":
      return <PublicObserverView />;
    case "regulator":
      return <RegulatorView />;
    case "demo":
      return showInternalGuides() ? <DemoScriptView /> : <HomeView />;
    default:
      return <HomeView />;
  }
}

export default function App() {
  return (
    <AstraeaProvider>
      <AppShell>
        <ViewRouter />
      </AppShell>
    </AstraeaProvider>
  );
}
