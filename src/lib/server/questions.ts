import type { Level, Question, QuestionInput } from '$lib/types'

type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      all: <T>() => Promise<{ results: T[] }>
      run: () => Promise<unknown>
    }
  }
}

type QuestionEnv = { DB?: D1DatabaseLike }

export async function listQuestions(level?: Level, env?: QuestionEnv): Promise<Question[]> {
  if (env?.DB) {
    try {
      const query = level
        ? 'SELECT id, level, type, prompt, translation, options_json as optionsJson, answer, explanation FROM questions WHERE level = ? ORDER BY created_at ASC'
        : 'SELECT id, level, type, prompt, translation, options_json as optionsJson, answer, explanation FROM questions ORDER BY created_at ASC'
      const result = level
        ? await env.DB.prepare(query).bind(level).all<Question & { optionsJson?: string }>()
        : await env.DB.prepare(query).bind().all<Question & { optionsJson?: string }>()
      return result.results.map(({ optionsJson, ...question }) => ({
        ...question,
        options: optionsJson ? (JSON.parse(optionsJson) as string[]) : undefined,
      }))
    } catch (error) {
      throw new Error(`D1 questions query failed: ${String(error)}`)
    }
  }

  throw new Error('D1 database binding is unavailable')
}

export async function saveQuestion(input: QuestionInput, env?: QuestionEnv): Promise<Question> {
  const question = { ...input, id: `question-${crypto.randomUUID()}` }
  if (env?.DB) {
    try {
      await env.DB.prepare(
        'INSERT INTO questions (id, level, type, prompt, translation, options_json, answer, explanation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
        .bind(
          question.id,
          question.level,
          question.type,
          question.prompt,
          question.translation,
          question.options ? JSON.stringify(question.options) : null,
          question.answer,
          question.explanation,
          new Date().toISOString(),
        )
        .run()
      return question
    } catch (error) {
      throw new Error(`D1 question insert failed: ${String(error)}`)
    }
  }

  throw new Error('D1 database binding is unavailable')
}
