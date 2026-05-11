export function truncateAddress(addr: string, chars = 6): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-4)}`;
}

export function truncateHash(hash: string, chars = 8): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-4)}`;
}

export function formatAmount(amount: bigint | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return n.toLocaleString("en-US");
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function formatFundState(state: bigint | number): string {
  const n = typeof state === "bigint" ? Number(state) : state;
  return ["Created", "Open", "Closed"][n] ?? "Unknown";
}

export function formatBytes32(hex: string): string {
  if (!hex || hex === "0x" + "0".repeat(64)) return "0x0000...0000";
  return hex.slice(0, 10) + "..." + hex.slice(-8);
}

export function generateFakeCiphertext(seed: string): string {
  const chars = "0123456789abcdef";
  let out = "0x";
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  for (let i = 0; i < 62; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    out += chars[h % 16];
  }
  return out;
}
