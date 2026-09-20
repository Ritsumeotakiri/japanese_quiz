import { t as appConfig } from "../../../../chunks/config.js";
import { json } from "@sveltejs/kit";
//#region src/lib/server/questions.ts
async function listQuestions(level, env) {
	if (env?.DB) try {
		const query = level ? "SELECT id, level, type, prompt, translation, audio_url as audioUrl, options_json as optionsJson, answer, explanation FROM questions WHERE level = ? ORDER BY created_at ASC" : "SELECT id, level, type, prompt, translation, audio_url as audioUrl, options_json as optionsJson, answer, explanation FROM questions ORDER BY created_at ASC";
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
		await env.DB.prepare("INSERT INTO questions (id, level, type, prompt, translation, audio_url, options_json, answer, explanation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(question.id, question.level, question.type, question.prompt, question.translation, question.audioUrl ?? null, question.options ? JSON.stringify(question.options) : null, question.answer, question.explanation, (/* @__PURE__ */ new Date()).toISOString()).run();
		return question;
	} catch (error) {
		throw new Error(`D1 question insert failed: ${String(error)}`);
	}
	throw new Error("D1 database binding is unavailable");
}
async function updateQuestion(id, input, env) {
	if (env?.DB) try {
		await env.DB.prepare("UPDATE questions SET level = ?, type = ?, prompt = ?, translation = ?, audio_url = ?, options_json = ?, answer = ?, explanation = ? WHERE id = ?").bind(input.level, input.type, input.prompt, input.translation, input.audioUrl ?? null, input.options ? JSON.stringify(input.options) : null, input.answer, input.explanation, id).run();
		return {
			...input,
			id
		};
	} catch (error) {
		throw new Error(`D1 question update failed: ${String(error)}`);
	}
	throw new Error("D1 database binding is unavailable");
}
async function deleteQuestion(id, env) {
	if (env?.DB) try {
		await env.DB.prepare("DELETE FROM questions WHERE id = ?").bind(id).run();
		return;
	} catch (error) {
		throw new Error(`D1 question delete failed: ${String(error)}`);
	}
	throw new Error("D1 database binding is unavailable");
}
//#endregion
//#region src/routes/api/questions/+server.ts
var levels = [...appConfig.levels];
var questionTypes = [...appConfig.questionTypes];
var GET = async ({ url, platform }) => {
	const level = url.searchParams.get("level");
	if (level && !levels.includes(level)) return json({ error: "Invalid level" }, { status: 400 });
	return json({ questions: await listQuestions(level ?? void 0, platform?.env) });
};
var POST = async ({ request, platform }) => {
	const body = await request.json().catch(() => null);
	const input = body && parseQuestionInput(body);
	if (!input) return json({ error: "Invalid question data" }, { status: 400 });
	const question = await saveQuestion(input, platform?.env);
	return json({ question }, { status: 201 });
};
function parseQuestionInput(body) {
	if (!body || !levels.includes(body.level) || !questionTypes.includes(body.type) || typeof body.prompt !== "string" || typeof body.translation !== "string" || body.type === "listening" && typeof body.audioUrl !== "string" || typeof body.answer !== "string" || typeof body.explanation !== "string") return null;
	const options = [
		"single",
		"reading",
		"listening"
	].includes(body.type) && Array.isArray(body.options) ? body.options.map(String).filter(Boolean).slice(0, appConfig.question.maxOptions) : void 0;
	if ([
		"single",
		"reading",
		"listening"
	].includes(body.type) && (!options || options.length < appConfig.question.minimumOptions || !options.includes(body.answer))) return null;
	return {
		level: body.level,
		type: body.type,
		prompt: body.prompt.trim().slice(0, appConfig.question.maxPromptLength),
		translation: body.translation.trim().slice(0, appConfig.question.maxTranslationLength),
		audioUrl: body.type === "listening" ? body.audioUrl?.trim().slice(0, appConfig.question.maxAudioUrlLength) : void 0,
		options,
		answer: body.answer.trim().slice(0, appConfig.question.maxAnswerLength),
		explanation: body.explanation.trim().slice(0, appConfig.question.maxExplanationLength)
	};
}
var PATCH = async ({ request, platform }) => {
	const body = await request.json().catch(() => null);
	if (!body?.id) return json({ error: "Question id is required" }, { status: 400 });
	const input = parseQuestionInput(body);
	if (!input) return json({ error: "Invalid question data" }, { status: 400 });
	const question = await updateQuestion(body.id, input, platform?.env);
	return json({ question });
};
var DELETE = async ({ url, platform }) => {
	const id = url.searchParams.get("id");
	if (!id) return json({ error: "Question id is required" }, { status: 400 });
	await deleteQuestion(id, platform?.env);
	return new Response(null, { status: 204 });
};
//#endregion
export { DELETE, GET, PATCH, POST };
