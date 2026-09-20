import { json } from "@sveltejs/kit";
//#region src/routes/api/credits/+server.ts
var GET = async ({ platform }) => {
	if (!platform?.env?.DB) return json({ error: "D1 database binding is unavailable" }, { status: 503 });
	const result = await platform.env.DB.prepare("SELECT id, name, contribution, sort_order as sortOrder FROM credits ORDER BY sort_order ASC").bind().all();
	return json({ credits: result.results });
};
//#endregion
export { GET };
