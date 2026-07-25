"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Filter, MessageCircleQuestion, Send, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/timeAgo";

const STATUS_OPTIONS = [
  { value: "pending",  label: "Pendientes" },
  { value: "answered", label: "Respondidas" },
  { value: "all",      label: "Todas" },
];

function QuestionCard({ q, onAnswered, onDeleted }: { q: any; onAnswered: () => void; onDeleted: () => void }) {
  const [answer, setAnswer] = useState(q.answerText || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isAnswered = !!q.answerText;
  const exactDate = q.createdAt
    ? new Date(q.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";
  const relativeDate = q.createdAt ? timeAgo(q.createdAt) : "";

  const submitAnswer = async () => {
    const text = answer.trim();
    if (!text) { toast.error("Escribe una respuesta"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/questions/${q.documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerText: text }),
      });
      if (res.ok) {
        toast.success("Respuesta publicada");
        onAnswered();
      } else {
        toast.error("Error al responder");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions/${q.documentId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Pregunta eliminada");
        onDeleted();
      } else {
        toast.error("Error al eliminar");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {q.product ? (
            <Link
              href={`/admin/products/${q.product.documentId}`}
              className="text-[11px] font-black text-sky-600 dark:text-sky-400 hover:underline uppercase tracking-widest"
            >
              {q.product.productName} · {q.product.code}
            </Link>
          ) : (
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Producto eliminado</span>
          )}
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
            {q.user?.username || "Usuario"} ·{" "}
            <span title={exactDate}>{relativeDate}</span>
          </p>
        </div>
        <button
          onClick={deleteQuestion}
          disabled={deleting}
          className="shrink-0 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40"
          title="Eliminar pregunta"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>

      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
        <span className="text-[#0055a4] dark:text-sky-400">P:</span> {q.questionText}
      </p>

      {isAnswered ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">R:</span> {q.answerText}
        </p>
      ) : (
        <div className="flex gap-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Escribe la respuesta..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-sky-400 transition-colors resize-none"
          />
          <button
            onClick={submitAnswer}
            disabled={saving}
            className="flex items-center gap-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shrink-0"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Responder
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), status });
    const res = await fetch(`/api/admin/questions?${params}`);
    const data = await res.json();
    setQuestions(data.data || []);
    setTotal(data.meta?.pagination?.total || 0);
    setLoading(false);
  }, [page, status]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full md:w-[85%] mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white italic">Preguntas</h1>
        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest">{total} pregunta{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={14} className="text-slate-400 shrink-0" />
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatus(value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              status === value
                ? "bg-sky-600 text-white shadow-md"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-sky-300 dark:hover:border-sky-600 hover:text-sky-600 dark:hover:text-sky-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <MessageCircleQuestion size={32} className="text-slate-200 dark:text-slate-600" />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Sin preguntas {status === "pending" ? "pendientes" : status === "answered" ? "respondidas" : ""}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} q={q} onAnswered={fetchQuestions} onDeleted={fetchQuestions} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                page === i + 1
                  ? "bg-sky-600 text-white"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
