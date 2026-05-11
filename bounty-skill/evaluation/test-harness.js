#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const target = process.argv[2];
if (!target) {
  console.error("Usage: node test-harness.js /path/to/candidate");
  process.exit(1);
}

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "artifacts") walk(p);
    if (entry.isFile() && /\.(sol|ts|js|md)$/.test(entry.name)) files.push(p);
  }
}
walk(target);

const text = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const checks = [
  ["uses FHE library", /@fhevm\/solidity\/lib\/FHE\.sol|fromExternal/],
  ["uses encrypted input proof", /externalEuint|inputProof/],
  ["uses FHE comparison", /FHE\.(le|lt|ge|gt|eq)\(/],
  ["uses FHE.select", /FHE\.select\(/],
  ["re-grants allowThis", /allowThis\(/],
  ["tests unauthorized decrypt", /unauthorized|cannot decrypt|rejected|isolation/i],
  ["avoids public approval event", !/event\s+(Approved|Rejected)\b/.test(text)],
  ["documents receipts", /receipt/i]
];

let failed = 0;
for (const [name, check] of checks) {
  const ok = check instanceof RegExp ? check.test(text) : Boolean(check);
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
}

process.exitCode = failed ? 1 : 0;
