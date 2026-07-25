export type NotificationQuestion = {
  id: number;
  documentId?: string;
  createdAt?: string;
  questionText?: string;
  product?: { productName?: string };
};

/** Returns questions whose createdAt is strictly after baseTimestamp (ms). */
export function detectNewQuestions(questions: NotificationQuestion[], baseTimestamp: number): NotificationQuestion[] {
  return questions.filter((q) => q.createdAt && new Date(q.createdAt).getTime() > baseTimestamp);
}

/** Returns the latest createdAt timestamp (ms) across a list of questions, or 0. */
export function getLatestTimestamp(questions: NotificationQuestion[]): number {
  if (questions.length === 0) return 0;
  return Math.max(...questions.map((q) => (q.createdAt ? new Date(q.createdAt).getTime() : 0)));
}
