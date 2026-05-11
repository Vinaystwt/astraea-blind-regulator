#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skillPath = path.join(root, "SKILL.md");
const readmePath = path.join(root, "README.md");

const requiredFiles = [
  "SKILL.md",
  "README.md",
  "examples/MinimalPolicyEngine.sol",
  "examples/EncryptedCounter.sol",
  "examples/ConditionalAccumulator.sol",
  "evaluation/test-harness.js",
  "evaluation/acl-validation.prompt.md",
];

const requiredPhrases = [
  "Astraea Confidential Finance Patterns",
  "Encrypted Input",
  "FHE.select",
  "ACL",
  "Public Receipt",
  "Frontend Pattern",
  "Event Privacy Pattern",
  "Astraea Reference Implementation",
  "0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9",
  "Sepolia testnet",
  "No real assets",
  "not a licensed compliance product",
];

const forbiddenCredentialPatterns = [
  new RegExp("PRIVATE" + "_KEY=", "i"),
  new RegExp("mne" + "monic", "i"),
  new RegExp("SEPOLIA" + "_RPC_URL=.*(" + "alchemy|infura|quicknode" + ")", "i"),
  new RegExp("api[_-]?" + "key\\s*=", "i"),
  new RegExp("sec" + "ret\\s*=", "i"),
];

let failed = 0;
function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed += 1;
}

for (const file of requiredFiles) {
  check(`file exists: ${file}`, fs.existsSync(path.join(root, file)));
}

const skill = fs.existsSync(skillPath) ? fs.readFileSync(skillPath, "utf8") : "";
const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";
const combined = `${skill}\n${readme}`;

for (const phrase of requiredPhrases) {
  check(`contains: ${phrase}`, combined.includes(phrase));
}

for (const pattern of forbiddenCredentialPatterns) {
  check(`no sensitive pattern: ${pattern}`, !pattern.test(combined));
}

const localLinks = [...combined.matchAll(/\]\(([^)]+)\)/g)]
  .map((match) => match[1])
  .filter((link) => !link.startsWith("http") && !link.startsWith("#"));

for (const link of localLinks) {
  check(`local link exists: ${link}`, fs.existsSync(path.join(root, link)));
}

process.exitCode = failed ? 1 : 0;
