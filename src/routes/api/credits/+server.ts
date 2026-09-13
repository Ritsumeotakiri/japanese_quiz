import { json } from '@sveltejs/kit'
import type { Credit } from '$lib/types'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ platform }) => {
  if (!platform?.env?.DB) return json({ error: 'D1 database binding is unavailable' }, { status: 503 })

  const result = await platform.env.DB.prepare(
    'SELECT id, name, contribution, sort_order as sortOrder FROM credits ORDER BY sort_order ASC',
  )
    .bind()
    .all<Credit>()

  return json({ credits: result.results })
}
