import { t as appConfig } from "../../../../chunks/config.js";
import { json } from "@sveltejs/kit";
//#region src/lib/server/scores.ts
async function listScores(level, env) {
	if (env?.DB) try {
		return (await env.DB.prepare(`SELECT id, name, level, score, total, created_at as createdAt FROM scores WHERE level = ? ORDER BY score DESC, created_at ASC LIMIT ${appConfig.score.leaderboardLimit}`).bind(level).all()).results;
	} catch (error) {
		throw new Error(`D1 scores query failed: ${String(error)}`);
	}
	throw new Error("D1 database binding is unavailable");
}
async function saveScore(input, env) {
	const createdAt = (/* @__PURE__ */ new Date()).toISOString();
	if (env?.DB) try {
		const id = crypto.randomUUID();
		await env.DB.prepare("INSERT INTO scores (id, name, level, score, total, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, input.name, input.level, input.score, input.total, createdAt).run();
		return {
			...input,
			id,
			createdAt
		};
	} catch (error) {
		throw new Error(`D1 score insert failed: ${String(error)}`);
	}
	throw new Error("D1 database binding is unavailable");
}
//#endregion
//#region src/routes/api/scores/+server.ts
var levels = [...appConfig.levels];
var GET = async ({ url, platform }) => {
	const level = url.searchParams.get("level");
	if (!levels.includes(level)) return json({ error: "Invalid level" }, { status: 400 });
	return json({ scores: await listScores(level, platform?.env) });
};
var POST = async ({ request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.name !== "string" || !levels.includes(body.level) || typeof body.score !== "number") return json({ error: "Name, level, and score are required" }, { status: 400 });
	const name = body.name.trim().slice(0, appConfig.score.maxNameLength);
	if (!name) return json({ error: "Name cannot be empty" }, { status: 400 });
	const score = await saveScore({
		name,
		level: body.level,
		score: Math.max(0, Math.min(appConfig.score.maxScore, body.score)),
		total: Number(body.total) || 0
	}, platform?.env);
	return json({ score }, { status: 201 });
};
//#endregion
export { GET, POST };
