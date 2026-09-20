import { describe, expect, it } from 'vitest'
import { calculateScore, questionsForLevel, randomQuestionsForLevel } from '../src/lib/quiz'
import type { Question } from '../src/lib/types'

const question_fixtures: Question[] = [
  { id: 'n4-fixture', level: 'N4', type: 'true-false', prompt: '', translation: '', answer: 'true', explanation: '' },
  { id: 'n3-fixture', level: 'N3', type: 'true-false', prompt: '', translation: '', answer: 'false', explanation: '' },
]

describe('quiz scoring', () => {
  it('calculates a percentage score', () => {
    expect(calculateScore(2, 3)).toBe(67)
    expect(calculateScore(0, 0)).toBe(0)
  })

  it('keeps question sets separated by JLPT level', () => {
    expect(questionsForLevel(question_fixtures, 'N4')).toHaveLength(1)
    expect(questionsForLevel(question_fixtures, 'N3')).toHaveLength(1)
    expect(questionsForLevel(question_fixtures, 'N4').every((question) => question.level === 'N4')).toBe(true)
  })

  it('shuffles and caps game questions at 50', () => {
    const many_questions = Array.from({ length: 60 }, (_, index) => ({
      id: `n4-${index}`,
      level: 'N4' as const,
      type: index % 2 === 0 ? ('single' as const) : ('reading' as const),
      prompt: '',
      translation: '',
      answer: 'answer',
      explanation: '',
    }))
    const game_questions = randomQuestionsForLevel(many_questions, 'N4')
    expect(game_questions).toHaveLength(50)
    expect(new Set(game_questions.map((question) => question.type))).toEqual(new Set(['single', 'reading']))
  })
})
