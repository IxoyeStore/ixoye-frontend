"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CLAMP_LINES = 3;
const LINE_HEIGHT_PX = 23; // approx for text-sm leading-relaxed

export default function ProductSeries({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOverflows(el.scrollHeight > CLAMP_LINES * LINE_HEIGHT_PX + 4);
  }, [text]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Serie / Modelo</span>
      <p
        ref={ref}
        style={!expanded && overflows ? { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: CLAMP_LINES, overflow: "hidden" } : undefined}
        className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line break-words"
      >
        {text}
      </p>

      {overflows && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0055a4] dark:text-sky-400 hover:text-[#003d7a] dark:hover:text-sky-300 transition-colors self-start"
        >
          {expanded ? (
            <><ChevronUp size={12} strokeWidth={3} /> Ver menos</>
          ) : (
            <><ChevronDown size={12} strokeWidth={3} /> Ver todo</>
          )}
        </button>
      )}
    </div>
  );
}
