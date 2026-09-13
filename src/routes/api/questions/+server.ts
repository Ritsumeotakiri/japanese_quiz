import { json } from '@sveltejs/kit'
import { listQuestions, saveQuestion } from '$lib/server/questions'
import type { Level, QuestionInput, QuestionType } from '$lib/types'
import type { RequestHandler } from './$types'

const levels: Level[] = ['N4', 'N3']
const questionTypes: QuestionType[] = ['true-false', 'single']

export const GET: RequestHandler = async ({ url, platform }) => {
  const level = url.searchParams.get('level') as Level | null
  if (level && !levels.includes(level)) return json({ error: 'Invalid level' }, { status: 400 })
  return json({ questions: await listQuestions(level ?? undefined, platform?.env) })
}

export const POST: RequestHandler = async ({ request, platform }) => {
  const body = (await request.json().catch(() => null)) as Partial<QuestionInput> | null
  if (
    !body ||
    !levels.includes(body.level as Level) ||
    !questionTypes.includes(body.type as QuestionType) ||
    typeof body.prompt !== 'string' ||
    typeof body.translation !== 'string' ||
    typeof body.answer !== 'string' ||
    typeof body.explanation !== 'string'
  ) {
    return json({ error: 'Level, type, prompt, answer, and explanation are required' }, { status: 400 })
  }

  const options =
    body.type === 'single' && Array.isArray(body.options)
      ? body.options.map(String).filter(Boolean).slice(0, 4)
      : undefined
  if (body.type === 'single' && (!options || options.length < 2 || !options.includes(body.answer))) {
    return json({ error: 'Single-answer questions need at least two options including the answer' }, { status: 400 })
  }

  const level = body.level as Level
  const type = body.type as QuestionType
  const question = await saveQuestion(
    {
      level,
      type,
      prompt: body.prompt.trim().slice(0, 240),
      translation: body.translation.trim().slice(0, 240),
      options,
      answer: body.answer.trim().slice(0, 120),
      explanation: body.explanation.trim().slice(0, 300),
    },
    platform?.env,
  )
  return json({ question }, { status: 201 })
}
