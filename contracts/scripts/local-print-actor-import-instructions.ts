import fs from "node:fs";
import path from "node:path";
import { Wallet } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const actorsPath = path.join(__dirname, "..", "sepolia-actors.local.json");
const showPrivateKeys = process.argv.includes("--unsafe-show-private-keys");

const labels = [
  ["Investor A", "INVESTOR_A_PRIVATE_KEY"],
  ["Investor B", "INVESTOR_B_PRIVATE_KEY"],
  ["Investor C", "INVESTOR_C_PRIVATE_KEY"],
  ["Regulator", "REGULATOR_PRIVATE_KEY"],
] as const;

type ActorFile = Partial<Record<(typeof labels)[number][1], string>>;

function loadActorFile(): ActorFile {
  if (!fs.existsSync(actorsPath)) return {};
  return JSON.parse(fs.readFileSync(actorsPath, "utf8")) as ActorFile;
}

const actorFile = loadActorFile();

console.log("Astraea Sepolia actor wallet import instructions");
console.log("=================================================");
console.log("Import Investor A/B/C and Regulator into MetaMask or Brave locally.");
console.log("Never paste private keys into chat, docs, commits, screenshots, or issue trackers.");
console.log(`Local actor file: ${actorsPath}`);
console.log("contracts/.env may also contain actor private keys.");
console.log("");

for (const [label, envName] of labels) {
  const key = process.env[envName] ?? actorFile[envName];
  if (!key) {
    console.log(`${label}: key not found in local env/actor file`);
    continue;
  }
  const wallet = new Wallet(key);
  console.log(`${label}: ${wallet.address}`);
  if (showPrivateKeys) {
    console.log(`  private key: ${key}`);
  } else {
    console.log("  private key: hidden; rerun with --unsafe-show-private-keys only on your own machine if needed");
  }
}
