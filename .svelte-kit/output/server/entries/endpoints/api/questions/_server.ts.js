import { json } from "@sveltejs/kit";
//#region src/lib/server/questions.ts
async function listQuestions(level, env) {
	if (env?.DB) try {
		const query = level ? "SELECT id, level, type, prompt, translation, options_json as optionsJson, answer, explanation FROM questions WHERE level = ? ORDER BY created_at DESC" : "SELECT id, level, type, prompt, translation, options_json as optionsJson, answer, explanation FROM questions ORDER BY created_at DESC";
		return (level ? await env.DB.prepare(query).bind(level).all() : await env.DB.prepare(query).bind().all()).results.map(({ optionsJson, ...question }) => ({
			...question,
			options: optionsJson ? JSON.parse(optionsJson) : void 0
		}));
	} catch (error) {
		throw new Error(`D1 questions query failed: ${String(error)}`);
	}
	throw new Error("D1 database binding is unavailable");
}
async function saveQuestion(input, env) {
	const question = {
		...input,
		id: `question-${crypto.randomUUID()}`
	};
	if (env?.DB) try {
		await env.DB.prepare("INSERT INTO questions (id, level, type, prompt, translation, options_json, answer, explanation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(question.id, question.level, question.type, question.prompt, question.translation, question.options ? JSON.stringify(question.options) : null, question.answer, question.explanation, (/* @__PURE__ */ new Date()).toISOString()).run();
		return question;
	} catch (error) {
		throw new Error(`D1 question insert failed: ${String(error)}`);
	}
	throw new Error("D1 database binding is unavailable");
}
//#endregion
//#region src/routes/api/questions/+server.ts
var levels = ["N4", "N3"];
var questionTypes = ["true-false", "single"];
var GET = async ({ url, platform }) => {
	const level = url.searchParams.get("level");
	if (level && !levels.includes(level)) return json({ error: "Invalid level" }, { status: 400 });
	return json({ questions: await listQuestions(level ?? void 0, platform?.env) });
};
var POST = async ({ request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body || !levels.includes(body.level) || !questionTypes.includes(body.type) || typeof body.prompt !== "string" || typeof body.translation !== "string" || typeof body.answer !== "string" || typeof body.explanation !== "string") return json({ error: "Level, type, prompt, answer, and explanation are required" }, { status: 400 });
	const options = body.type === "single" && Array.isArray(body.options) ? body.options.map(String).filter(Boolean).slice(0, 4) : void 0;
	if (body.type === "single" && (!options || options.length < 2 || !options.includes(body.answer))) return json({ error: "Single-answer questions need at least two options including the answer" }, { status: 400 });
	const level = body.level;
	const type = body.type;
	const question = await saveQuestion({
		level,
		type,
		prompt: body.prompt.trim().slice(0, 240),
		translation: body.translation.trim().slice(0, 240),
		options,
		answer: body.answer.trim().slice(0, 120),
		explanation: body.explanation.trim().slice(0, 300)
	}, platform?.env);
	return json({ question }, { status: 201 });
};
//#endregion
export { GET, POST };
