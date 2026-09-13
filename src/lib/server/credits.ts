import type { Credit } from '$lib/types'

export async function listCredits(env?: App.Platform['env']): Promise<Credit[]> {
  if (!env?.DB) throw new Error('D1 database binding is unavailable')
  try {
    const result = await env.DB.prepare(
      'SELECT id, name, contribution, sort_order as sortOrder FROM credits ORDER BY sort_order ASC',
    )
      .bind()
      .all<Credit>()
    return result.results
  } catch (error) {
    throw new Error(`D1 credits query failed: ${String(error)}`)
  }
}
