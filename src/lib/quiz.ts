import type { Level, Question } from './types'

export function questionsForLevel(questions: Question[], level: Level): Question[] {
  return questions.filter((question) => question.level === level)
}

export function calculateScore(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}
