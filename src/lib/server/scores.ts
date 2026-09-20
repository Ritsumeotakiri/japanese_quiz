import type { Level, Score } from '$lib/types'
import { app_config } from '$lib/config'

type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      all: <T>() => Promise<{ results: T[] }>
      run: () => Promise<unknown>
    }
    run: () => Promise<unknown>
  }
}

type ScoreEnv = { DB?: D1DatabaseLike }

export async function listScores(level: Level, env?: ScoreEnv): Promise<Score[]> {
  if (env?.DB) {
    try {
      const result = await env.DB.prepare(
        `SELECT id, name, level, score, total, created_at as createdAt FROM scores WHERE level = ? ORDER BY score DESC, created_at ASC LIMIT ${app_config.score.leaderboardLimit}`,
      )
        .bind(level)
        .all<Score>()
      return result.results
    } catch (error) {
      throw new Error(`D1 scores query failed: ${String(error)}`)
    }
  }

  throw new Error('D1 database binding is unavailable')
}

export async function saveScore(input: Omit<Score, 'id' | 'createdAt'>, env?: ScoreEnv): Promise<Score> {
  const created_at = new Date().toISOString()
  if (env?.DB) {
    try {
      const id = crypto.randomUUID()
      await env.DB.prepare('INSERT INTO scores (id, name, level, score, total, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(id, input.name, input.level, input.score, input.total, created_at)
        .run()
      return { ...input, id, createdAt: created_at }
    } catch (error) {
      throw new Error(`D1 score insert failed: ${String(error)}`)
    }
  }

  throw new Error('D1 database binding is unavailable')
}
