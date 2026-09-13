export type Level = 'N4' | 'N3'
export type QuestionType = 'true-false' | 'single'

export interface Question {
  id: string
  level: Level
  type: QuestionType
  prompt: string
  translation: string
  options?: string[]
  answer: string
  explanation: string
}

export type QuestionInput = Omit<Question, 'id'>

export interface Credit {
  id: string
  name: string
  contribution: string
  sortOrder: number
}

export interface Score {
  id: number | string
  name: string
  level: Level
  score: number
  total: number
  createdAt: string
}
