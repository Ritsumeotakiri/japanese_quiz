import type { Level, Question } from './types'
import { app_config } from './config'

export function questionsForLevel(questions: Question[], level: Level): Question[] {
  return questions.filter((question) => question.level === level)
}

export function randomQuestionsForLevel(
  questions: Question[],
  level: Level,
  limit = app_config.quiz.maxQuestions,
): Question[] {
  const selected = questionsForLevel(questions, level).slice()
  for (let index = selected.length - 1; index > 0; index -= 1) {
    const random_index = Math.floor(Math.random() * (index + 1))
    ;[selected[index], selected[random_index]] = [selected[random_index], selected[index]]
  }
  return selected.slice(0, limit)
}

export function calculateScore(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}
