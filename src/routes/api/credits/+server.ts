import { json } from '@sveltejs/kit'
import { listCredits } from '$lib/server/credits'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ platform }) => {
  return json({ credits: await listCredits(platform?.env) })
}
