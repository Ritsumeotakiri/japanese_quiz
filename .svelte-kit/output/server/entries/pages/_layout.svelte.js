import { a as slot, r as head } from "../../chunks/server.js";
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	head("12qhfyh", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Kotoba Club | Japanese Quiz</title>`);
		});
		$$renderer.push(`<meta name="description" content="A focused Japanese vocabulary quiz for JLPT N4 and N3 learners."/>`);
	});
	$$renderer.push(`<!--[-->`);
	slot($$renderer, $$props, "default", {}, null);
	$$renderer.push(`<!--]-->`);
}
//#endregion
export { _layout as default };
