import { json } from '@sveltejs/kit'
import { app_config } from '$lib/config'
import { deleteQuestion, listQuestions, saveQuestion, updateQuestion } from '$lib/server/questions'
import type { Level, QuestionInput, QuestionType } from '$lib/types'
import type { RequestHandler } from './$types'

const levels: Level[] = [...app_config.levels]
const question_types: QuestionType[] = [...app_config.questionTypes]

export const GET: RequestHandler = async ({ url, platform }) => {
  const level = url.searchParams.get('level') as Level | null
  if (level && !levels.includes(level)) return json({ error: 'Invalid level' }, { status: 400 })
  return json({ questions: await listQuestions(level ?? undefined, platform?.env) })
}

export const POST: RequestHandler = async ({ request, platform }) => {
  const body = (await request.json().catch(() => null)) as Partial<QuestionInput> | null
  const input = body && parseQuestionInput(body)
  if (!input) return json({ error: 'Invalid question data' }, { status: 400 })
  const question = await saveQuestion(input, platform?.env)
  return json({ question }, { status: 201 })
}

function parseQuestionInput(body: Partial<QuestionInput>): QuestionInput | null {
  if (
    !body ||
    !levels.includes(body.level as Level) ||
    !question_types.includes(body.type as QuestionType) ||
    typeof body.prompt !== 'string' ||
    typeof body.translation !== 'string' ||
    (body.type === 'listening' && typeof body.audioUrl !== 'string') ||
    typeof body.answer !== 'string' ||
    typeof body.explanation !== 'string'
  ) {
    return null
  }

  const options =
    ['single', 'reading', 'listening'].includes(body.type as string) && Array.isArray(body.options)
      ? body.options.map(String).filter(Boolean).slice(0, app_config.question.maxOptions)
      : undefined
  if (
    ['single', 'reading', 'listening'].includes(body.type as string) &&
    (!options || options.length < app_config.question.minimumOptions || !options.includes(body.answer))
  ) {
    return null
  }

  return {
    level: body.level as Level,
    type: body.type as QuestionType,
    prompt: body.prompt.trim().slice(0, app_config.question.maxPromptLength),
    translation: body.translation.trim().slice(0, app_config.question.maxTranslationLength),
    audioUrl:
      body.type === 'listening' ? body.audioUrl?.trim().slice(0, app_config.question.maxAudioUrlLength) : undefined,
    options,
    answer: body.answer.trim().slice(0, app_config.question.maxAnswerLength),
    explanation: body.explanation.trim().slice(0, app_config.question.maxExplanationLength),
  }
}

export const PATCH: RequestHandler = async ({ request, platform }) => {
  const body = (await request.json().catch(() => null)) as (Partial<QuestionInput> & { id?: string }) | null
  if (!body?.id) return json({ error: 'Question id is required' }, { status: 400 })
  const input = parseQuestionInput(body)
  if (!input) return json({ error: 'Invalid question data' }, { status: 400 })
  const question = await updateQuestion(body.id, input, platform?.env)
  return json({ question })
}

export const DELETE: RequestHandler = async ({ url, platform }) => {
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Question id is required' }, { status: 400 })
  await deleteQuestion(id, platform?.env)
  return new Response(null, { status: 204 })
}
