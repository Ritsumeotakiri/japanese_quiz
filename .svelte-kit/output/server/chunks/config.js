//#region src/lib/config.ts
var appConfig = {
	app: {
		name: "Kotoba Club",
		year: 2026,
		defaultLanguage: "en",
		defaultLevel: "N4"
	},
	levels: ["N4", "N3"],
	questionTypes: [
		"true-false",
		"single",
		"reading",
		"listening"
	],
	quiz: { maxQuestions: 50 },
	questionBank: { pageSize: 5 },
	question: {
		maxPromptLength: 240,
		maxTranslationLength: 240,
		maxAudioUrlLength: 500,
		maxAnswerLength: 120,
		maxExplanationLength: 300,
		maxOptions: 4,
		minimumOptions: 2
	},
	score: {
		maxNameLength: 24,
		maxScore: 100,
		leaderboardLimit: 50
	}
};
//#endregion
export { appConfig as t };
