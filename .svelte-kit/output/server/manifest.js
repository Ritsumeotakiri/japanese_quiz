export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.B9gRKXQs.js",app:"_app/immutable/entry/app.C_8k8j9T.js",imports:["_app/immutable/entry/start.B9gRKXQs.js","_app/immutable/chunks/BT_1BwG8.js","_app/immutable/chunks/CDfyJK-t.js","_app/immutable/entry/app.C_8k8j9T.js","_app/immutable/chunks/CDfyJK-t.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/credits",
				pattern: /^\/api\/credits\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/credits/_server.ts.js'))
			},
			{
				id: "/api/questions",
				pattern: /^\/api\/questions\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/questions/_server.ts.js'))
			},
			{
				id: "/api/scores",
				pattern: /^\/api\/scores\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/scores/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
