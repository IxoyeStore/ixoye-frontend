"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { detectNewQuestions, getLatestTimestamp, type NotificationQuestion } from "@/lib/question-notifications-utils";

const POLL_MS = 30_000;
const LS_KEY = "ixoye_admin_last_question_ts";

export function useQuestionNotifications() {
  const [newQuestions, setNewQuestions] = useState<NotificationQuestion[]>([]);
  const initialized = useRef(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/questions?status=pending&pageSize=20");
      if (!res.ok) return;
      const data = await res.json();
      const questions: NotificationQuestion[] = data.data || [];
      if (questions.length === 0) return;

      const latestTs = getLatestTimestamp(questions);
      const storedTs = parseInt(localStorage.getItem(LS_KEY) || "0", 10);

      if (!initialized.current) {
        initialized.current = true;
        if (!storedTs) localStorage.setItem(LS_KEY, String(latestTs));
        return;
      }

      const baseTs = storedTs || latestTs;
      const fresh = detectNewQuestions(questions, baseTs);
      if (fresh.length === 0) return;

      localStorage.setItem(LS_KEY, String(latestTs));
      setNewQuestions((prev) => [...fresh, ...prev]);

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const title = fresh.length === 1 ? "Nueva pregunta recibida" : `${fresh.length} nuevas preguntas`;
        const body =
          fresh.length === 1
            ? `${fresh[0].product?.productName || "Producto"}: ${fresh[0].questionText || ""}`
            : `${fresh.length} nuevas preguntas en Ixoye`;
        new Notification(title, { body, icon: "/favicon.ico" });
      }
    } catch {
      // silently ignore network errors
    }
  }, []);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  const clearNotifications = useCallback(() => setNewQuestions([]), []);

  const removeQuestion = useCallback(
    (id: number) => setNewQuestions((prev) => prev.filter((q) => q.id !== id)),
    []
  );

  return { newQuestions, newQuestionCount: newQuestions.length, clearNotifications, removeQuestion };
}
