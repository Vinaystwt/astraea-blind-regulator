import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { JsonRpcProvider, Wallet, type TransactionReceipt } from "ethers";

export const POLICY = {
  fundName: "Astraea APAC Growth Note I",
  policyVersion: "v1",
  maxInvestorSubscription: "500000",
  maxFundExposure: "700000",
  unitLabel: "USDC simplified units"
};

export type DeploymentFile = {
  network: "sepolia";
  chainId: number;
  AstraeaFund: string;
  deployer: string;
  issuer: string;
  regulator: string;
  deploymentTx?: string;
  deploymentBlockNumber?: number;
  openTx?: string;
  openBlockNumber?: number;
  seedTxs?: Array<{
    label: string;
    address: string;
    amount: string;
    submitTx: string;
    blockNumber?: number;
    expectedPrivateResult: string;
  }>;
  relayerUrl: string;
  deployedAt?: string;
  openedAt?: string;
  seededAt?: string;
  policy: typeof POLICY;
};

export function getIssuerPrivateKey(): string {
  const key = process.env.ISSUER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!key) throw new Error("ISSUER_PRIVATE_KEY is required (PRIVATE_KEY fallback is supported)");
  return key;
}

export function getIssuerWallet(): Wallet {
  return new Wallet(getIssuerPrivateKey(), getProvider());
}

export function getWalletFromEnv(envName: string): Wallet {
  const key = process.env[envName];
  if (!key) throw new Error(`${envName} is required`);
  return new Wallet(key, getProvider());
}

let provider: JsonRpcProvider | null = null;

export function getProvider(): JsonRpcProvider {
  if (!process.env.SEPOLIA_RPC_URL) throw new Error("SEPOLIA_RPC_URL is required");
  if (!provider) provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  return provider;
}

export function getRegulatorAddress(): string {
  if (process.env.REGULATOR_ADDRESS) return process.env.REGULATOR_ADDRESS;
  if (process.env.REGULATOR_PRIVATE_KEY) return new Wallet(process.env.REGULATOR_PRIVATE_KEY).address;
  throw new Error("REGULATOR_ADDRESS or REGULATOR_PRIVATE_KEY is required");
}

export function getRelayerUrl(): string {
  return process.env.ZAMA_RELAYER_URL || process.env.RELAYER_URL || "https://relayer.testnet.zama.org";
}

export function deploymentsDir(): string {
  const dir = resolve(__dirname, "../deployments");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function deploymentPath(): string {
  return resolve(deploymentsDir(), "sepolia.json");
}

export function readDeployment(): DeploymentFile | null {
  const path = deploymentPath();
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeDeployment(deployment: DeploymentFile): void {
  const normalized = {
    ...deployment,
    policy: POLICY
  };
  writeFileSync(deploymentPath(), `${JSON.stringify(normalized, null, 2)}\n`);

  const handoffDir = resolve(__dirname, "../../frontend-handoff");
  mkdirSync(handoffDir, { recursive: true });
  writeFileSync(resolve(handoffDir, "deployed-addresses.json"), `${JSON.stringify(normalized, null, 2)}\n`);
  writeFileSync(resolve(handoffDir, "deployed-addresses.sepolia.json"), `${JSON.stringify(normalized, null, 2)}\n`);
}

export function updateEnvValue(filePath: string, key: string, value: string): void {
  const existing = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
  const lines = existing.split(/\r?\n/).filter((line) => line.length > 0);
  let replaced = false;
  const next = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      replaced = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!replaced) next.push(`${key}=${value}`);
  writeFileSync(filePath, `${next.join("\n")}\n`, { mode: 0o600 });
}

export async function receiptBlock(receipt: TransactionReceipt | null): Promise<number | undefined> {
  return receipt?.blockNumber;
}
