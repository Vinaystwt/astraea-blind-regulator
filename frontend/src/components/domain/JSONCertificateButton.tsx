import { Download } from "lucide-react";
import { useAstraea } from "@/context/AstraeaContext";
import { buildCertificate, downloadCertificate } from "@/lib/certificate";
import { Button } from "@/components/ui/Button";
import { DEMO_REGULATOR_AGGREGATE } from "@/config/demo";
import { DEMO_TX_HASHES } from "@/config/deployment";
import { isDemoAssistEnabled } from "@/config/contract";

export function JSONCertificateButton() {
  const { aggregateReport, aggregateIsReal, txHashes, pushToast } = useAstraea();
  const demoAssist = isDemoAssistEnabled();

  const handleExport = () => {
    if (!aggregateReport && !demoAssist) {
      pushToast("error", "Decrypt the regulator aggregate before exporting a certificate.");
      return;
    }
    if (aggregateReport && !aggregateIsReal && !demoAssist) {
      pushToast("error", "Product mode exports require a real wallet-authorized aggregate decrypt.");
      return;
    }
    const report = aggregateReport ?? {
      acceptedExposure: BigInt(DEMO_REGULATOR_AGGREGATE.acceptedExposure),
      acceptedCount: BigInt(DEMO_REGULATOR_AGGREGATE.acceptedCount),
      rejectedCount: BigInt(DEMO_REGULATOR_AGGREGATE.rejectedCount),
    };
    const isReal = aggregateReport !== null && aggregateIsReal;

    const payload = buildCertificate(report, txHashes.length > 0 ? txHashes : [...DEMO_TX_HASHES], isReal);
    downloadCertificate(payload);
    pushToast("success", "Certificate exported as JSON");
  };

  return (
    <Button variant="gold" onClick={handleExport} icon={<Download size={12} />} disabled={!aggregateReport && !demoAssist}>
      Export JSON Compliance Certificate
    </Button>
  );
}
