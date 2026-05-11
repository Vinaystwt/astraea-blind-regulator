import { ExternalLink } from "lucide-react";
import { formatTxUrl } from "@/config/networks";
import { truncateHash } from "@/lib/format";

interface TxHashLinkProps {
  hash: string;
  chainId: number;
}

export function TxHashLink({ hash, chainId }: TxHashLinkProps) {
  const url = formatTxUrl(chainId, hash);

  const display = truncateHash(hash, 6);

  if (!url) {
    return (
      <span
        style={{
          fontSize: "11px",
          fontFamily: "JetBrains Mono, monospace",
          color: "#8C7D64",
        }}
      >
        {display}
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontSize: "11px",
        fontFamily: "JetBrains Mono, monospace",
        color: "#8C7D64",
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#D4AF37")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#8C7D64")}
    >
      {display}
      <ExternalLink size={9} />
    </a>
  );
}
