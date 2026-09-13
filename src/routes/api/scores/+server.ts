import { json } from '@sveltejs/kit'
import { listScores, saveScore } from '$lib/server/scores'
import type { Level } from '$lib/types'
import type { RequestHandler } from './$types'

const levels: Level[] = ['N4', 'N3']

export const GET: RequestHandler = async ({ url, platform }) => {
  const level = url.searchParams.get('level') as Level
  if (!levels.includes(level)) return json({ error: 'Invalid level' }, { status: 400 })
  return json({ scores: await listScores(level, platform?.env) })
}

export const POST: RequestHandler = async ({ request, platform }) => {
  const body = await request.json().catch(() => null)
  if (!body || typeof body.name !== 'string' || !levels.includes(body.level) || typeof body.score !== 'number') {
    return json({ error: 'Name, level, and score are required' }, { status: 400 })
  }

  const name = body.name.trim().slice(0, 24)
  if (!name) return json({ error: 'Name cannot be empty' }, { status: 400 })

  const score = await saveScore(
    { name, level: body.level, score: Math.max(0, Math.min(100, body.score)), total: Number(body.total) || 0 },
    platform?.env,
  )
  return json({ score }, { status: 201 })
}
