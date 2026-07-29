"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import {
  detectNewAnswers,
  getLatestAnsweredTimestamp,
  type AnsweredQuestion,
} from "@/lib/customer-question-notifications-utils";

const POLL_MS = 30_000;
const LS_KEY_PREFIX = "ixoye_customer_last_answer_ts_";

export function useCustomerQuestionNotifications() {
  const { user } = useAuth();
  const [newAnswers, setNewAnswers] = useState<AnsweredQuestion[]>([]);
  const lsKey = user ? `${LS_KEY_PREFIX}${user.id}` : null;

  const poll = useCallback(async () => {
    if (!lsKey) return;
    try {
      const res = await fetch("/api/questions/mine");
      if (!res.ok) return;
      const data = await res.json();
      const questions: AnsweredQuestion[] = data.data || [];
      if (questions.length === 0) return;

      const latestTs = getLatestAnsweredTimestamp(questions);
      // "Ya vimos preguntas de este usuario en este navegador antes?" se
      // basa en si hay algo guardado en localStorage, NO en un ref del
      // hook: un ref se reinicia en cada montaje (incluida cualquier
      // recarga completa de la pagina), lo que causaba que se saltara la
      // deteccion justo despues de refrescar el navegador.
      const storedRaw = localStorage.getItem(lsKey);

      if (!storedRaw) {
        localStorage.setItem(lsKey, String(latestTs));
        return;
      }

      const storedTs = parseInt(storedRaw, 10);
      const fresh = detectNewAnswers(questions, storedTs);
      localStorage.setItem(lsKey, String(latestTs));
      if (fresh.length === 0) return;

      setNewAnswers((prev) => [...fresh, ...prev]);
    } catch {
      // silently ignore network errors
    }
  }, [lsKey]);

  useEffect(() => {
    setNewAnswers([]);
    if (!lsKey) return;
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, [lsKey, poll]);

  const clearNotifications = useCallback(() => setNewAnswers([]), []);

  const removeAnswer = useCallback(
    (id: number) => setNewAnswers((prev) => prev.filter((q) => q.id !== id)),
    []
  );

  return { newAnswers, newCount: newAnswers.length, clearNotifications, removeAnswer };
}
