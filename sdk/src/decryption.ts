import type {
  AggregateReportHandles,
  DecryptedAggregateReport,
  DecryptedInvestorResult,
  InvestorResultHandles
} from "./types";

export async function decryptMyResult(
  decryptBool: (handle: string) => Promise<boolean>,
  decryptUint8: (handle: string) => Promise<bigint>,
  handles: InvestorResultHandles
): Promise<DecryptedInvestorResult> {
  return {
    approved: await decryptBool(handles.approvedHandle),
    reasonCode: await decryptUint8(handles.reasonCodeHandle)
  };
}

export async function decryptAggregateReport(
  decryptUint64: (handle: string) => Promise<bigint>,
  handles: AggregateReportHandles
): Promise<DecryptedAggregateReport> {
  return {
    acceptedExposure: await decryptUint64(handles.acceptedExposureHandle),
    acceptedCount: await decryptUint64(handles.acceptedCountHandle),
    rejectedCount: await decryptUint64(handles.rejectedCountHandle)
  };
}
