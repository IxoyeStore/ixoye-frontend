"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const initialized = useRef(false);
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
      const storedTs = parseInt(localStorage.getItem(lsKey) || "0", 10);

      if (!initialized.current) {
        initialized.current = true;
        if (!storedTs) localStorage.setItem(lsKey, String(latestTs));
        return;
      }

      const baseTs = storedTs || latestTs;
      const fresh = detectNewAnswers(questions, baseTs);
      if (fresh.length === 0) return;

      localStorage.setItem(lsKey, String(latestTs));
      setNewAnswers((prev) => [...fresh, ...prev]);
    } catch {
      // silently ignore network errors
    }
  }, [lsKey]);

  useEffect(() => {
    initialized.current = false;
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
