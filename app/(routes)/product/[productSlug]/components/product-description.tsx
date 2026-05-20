"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CLAMP_LINES = 5;
const LINE_HEIGHT_PX = 28; // approx for text-base/text-lg with leading-relaxed

export default function ProductDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOverflows(el.scrollHeight > CLAMP_LINES * LINE_HEIGHT_PX + 4);
  }, [text]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
          Descripción
        </h2>
      </div>
      <div className="p-6 sm:p-8">
        <p
          ref={ref}
          style={!expanded && overflows ? { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: CLAMP_LINES, overflow: "hidden" } : undefined}
          className="text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-line"
        >
          {text}
        </p>

        {overflows && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#0055a4] hover:text-[#003d7a] transition-colors"
          >
            {expanded ? (
              <><ChevronUp size={14} strokeWidth={3} /> Cerrar descripción</>
            ) : (
              <><ChevronDown size={14} strokeWidth={3} /> Ver descripción completa</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
