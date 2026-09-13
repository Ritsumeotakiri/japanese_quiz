import { json } from "@sveltejs/kit";
//#region src/lib/server/credits.ts
async function listCredits(env) {
	if (!env?.DB) throw new Error("D1 database binding is unavailable");
	try {
		return (await env.DB.prepare("SELECT id, name, contribution, sort_order as sortOrder FROM credits ORDER BY sort_order ASC").bind().all()).results;
	} catch (error) {
		throw new Error(`D1 credits query failed: ${String(error)}`);
	}
}
//#endregion
//#region src/routes/api/credits/+server.ts
var GET = async ({ platform }) => {
	return json({ credits: await listCredits(platform?.env) });
};
//#endregion
export { GET };
