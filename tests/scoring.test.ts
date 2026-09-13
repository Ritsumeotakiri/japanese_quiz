import { describe, expect, it } from 'vitest'
import { calculateScore, questionsForLevel } from '../src/lib/quiz'
import type { Question } from '../src/lib/types'

const questionFixtures: Question[] = [
  { id: 'n4-fixture', level: 'N4', type: 'true-false', prompt: '', translation: '', answer: 'true', explanation: '' },
  { id: 'n3-fixture', level: 'N3', type: 'true-false', prompt: '', translation: '', answer: 'false', explanation: '' },
]

describe('quiz scoring', () => {
  it('calculates a percentage score', () => {
    expect(calculateScore(2, 3)).toBe(67)
    expect(calculateScore(0, 0)).toBe(0)
  })

  it('keeps question sets separated by JLPT level', () => {
    expect(questionsForLevel(questionFixtures, 'N4')).toHaveLength(1)
    expect(questionsForLevel(questionFixtures, 'N3')).toHaveLength(1)
    expect(questionsForLevel(questionFixtures, 'N4').every((question) => question.level === 'N4')).toBe(true)
  })
})
