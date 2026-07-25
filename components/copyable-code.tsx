"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyableCode({ code, className = "" }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleCopy}
        title="Clic para copiar"
        className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
      >
        {code}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        title="Copiar código"
        className="shrink-0 p-0.5 rounded text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
      >
        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      </button>
    </span>
  );
}
