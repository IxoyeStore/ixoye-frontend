export type AnsweredQuestion = {
  id: number;
  documentId?: string;
  questionText?: string;
  answerText?: string;
  answeredAt?: string;
  product?: { productName?: string; slug?: string };
};

/** Returns answered questions whose answeredAt is strictly after baseTimestamp (ms). */
export function detectNewAnswers(questions: AnsweredQuestion[], baseTimestamp: number): AnsweredQuestion[] {
  return questions.filter((q) => q.answeredAt && new Date(q.answeredAt).getTime() > baseTimestamp);
}

/** Returns the latest answeredAt timestamp (ms) across a list of questions, or 0. */
export function getLatestAnsweredTimestamp(questions: AnsweredQuestion[]): number {
  if (questions.length === 0) return 0;
  return Math.max(...questions.map((q) => (q.answeredAt ? new Date(q.answeredAt).getTime() : 0)));
}
