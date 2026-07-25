"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircleQuestion, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

type Question = {
  id: number;
  questionText: string;
  answerText: string;
  createdAt: string;
  answeredAt: string | null;
};

type Props = {
  productDocumentId: string;
};

export default function ProductQuestions({ productDocumentId }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/questions?product=${encodeURIComponent(productDocumentId)}`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.data || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [productDocumentId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length < 5) {
      toast.error("Escribe una pregunta un poco más detallada");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText: trimmed, product: productDocumentId, website }),
      });
      if (res.ok) {
        setText("");
        toast.success("¡Pregunta enviada! La responderemos pronto.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error?.message || data.error || "No se pudo enviar la pregunta");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full bg-slate-50 dark:bg-slate-900 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircleQuestion size={16} className="text-[#0055a4] dark:text-sky-400" strokeWidth={2.5} />
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Preguntas
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-400 dark:text-slate-500" />
        ) : (
          <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
        )}
      </button>

      {!expanded ? (
        <div className="p-5">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0055a4] hover:bg-[#003d7a] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            <Send size={14} />
            Preguntar
          </button>
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Ask form */}
          {!authLoading && (
            user ? (
              <form onSubmit={onSubmit} className="space-y-2">
                {/* Honeypot — hidden from real users, bots tend to fill every field */}
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Escribe tu pregunta aquí..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0055a4] hover:bg-[#003d7a] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {submitting ? "Enviando..." : "Preguntar"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-3">
                <Link href="/login" className="font-bold text-[#0055a4] dark:text-sky-400 hover:underline">
                  Inicia sesión
                </Link>{" "}
                para hacer una pregunta sobre este producto.
              </p>
            )
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
              Todavía no hay preguntas sobre este producto. ¡Sé el primero en preguntar!
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id} className="border-t border-slate-100 dark:border-slate-700 pt-4 first:border-t-0 first:pt-0">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    <span className="text-[#0055a4] dark:text-sky-400">P:</span> {q.questionText}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">R:</span> {q.answerText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
