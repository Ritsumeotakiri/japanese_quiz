import "../../chunks/index-server.js";
import { _ as attr, n as derived, r as head, t as attr_class, v as escape_html } from "../../chunks/server.js";
import { t as appConfig } from "../../chunks/config.js";
//#region src/lib/quiz.ts
function questionsForLevel(questions, level) {
	return questions.filter((question) => question.level === level);
}
function calculateScore(correct, total) {
	return total === 0 ? 0 : Math.round(correct / total * 100);
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let language = appConfig.app.defaultLanguage;
		let selectedLevel = appConfig.app.defaultLevel;
		let leaderboardLevel = appConfig.app.defaultLevel;
		let currentIndex = 0;
		let correctAnswers = 0;
		let selectedAnswer = "";
		let questions = [];
		appConfig.app.defaultLevel;
		const copy = {
			en: {
				eyebrow: "ことば / KOTOBA CLUB",
				title: "Japanese, one question at a time.",
				intro: "A small, focused practice room for vocabulary, readings, and meaning.",
				choose: "Choose your track",
				n4Title: "N4 oriented",
				n4Description: "Everyday words, basic kanji, and the building blocks of conversation.",
				n3Title: "N3 oriented",
				n3Description: "More nuance, abstract vocabulary, and reading confidence.",
				start: "Start quiz",
				leaderboard: "Scoreboard",
				credits: "Credits",
				addQuestion: "Add question",
				editQuestion: "Edit question",
				updateQuestion: "Update question",
				deleteQuestion: "Delete",
				deleteTitle: "Delete question?",
				deleteDescription: "This question will be permanently removed from the question bank.",
				cancel: "Cancel",
				confirmDelete: "Delete question",
				deleteConfirm: "Delete this question?",
				questionUpdated: "Question updated.",
				questionDeleted: "Question deleted.",
				questionBank: "Question bank",
				viewQuestions: "View questions",
				noQuestions: "No questions in this level yet.",
				previous: "Previous",
				nextPage: "Next",
				questionPrompt: "Question prompt",
				translationPrompt: "English translation or reading hint",
				answerChoices: "Answer choices",
				correctAnswer: "Correct answer",
				questionExplanation: "Explanation",
				addToBank: "Add to question bank",
				questionAdded: "Question added to the bank.",
				singleAnswer: "Single answer",
				trueFalse: "True / false",
				reading: "Reading",
				listening: "Listening",
				audioUrl: "Audio URL",
				audioUnavailable: "Audio is unavailable for this question.",
				requiredFields: "Complete the required fields first.",
				language: "Language",
				question: "Question",
				next: "Next question",
				finish: "Finish quiz",
				result: "Your result",
				points: "points",
				score: "Score",
				namePrompt: "Add your name to the scoreboard",
				namePlaceholder: "Your name",
				save: "Save score",
				saved: "Saved to the scoreboard",
				viewBoard: "View scoreboard",
				playAgain: "Play again",
				loading: "Loading scores...",
				noScores: "No scores yet. Be the first on the board.",
				rank: "Rank",
				player: "Player",
				level: "Level",
				date: "Date",
				team: "The people behind the quiz",
				back: "Back to home",
				true: "True",
				false: "False",
				correct: "Correct",
				incorrect: "Not quite",
				explanation: "Why",
				submitted: "Your score is on the board."
			},
			ja: {
				eyebrow: "ことば / KOTOBA CLUB",
				title: "一問ずつ、日本語を学ぼう。",
				intro: "語彙、読み方、意味を集中して練習できる小さな学習室です。",
				choose: "コースを選ぶ",
				n4Title: "N4向け",
				n4Description: "日常の言葉、基本漢字、会話の土台を練習します。",
				n3Title: "N3向け",
				n3Description: "細かなニュアンス、抽象語彙、読解力を鍛えます。",
				start: "クイズを始める",
				leaderboard: "ランキング",
				credits: "クレジット",
				addQuestion: "問題を追加",
				editQuestion: "問題を編集",
				updateQuestion: "問題を更新",
				deleteQuestion: "削除",
				deleteTitle: "問題を削除しますか？",
				deleteDescription: "この問題は問題バンクから完全に削除されます。",
				cancel: "キャンセル",
				confirmDelete: "問題を削除",
				deleteConfirm: "この問題を削除しますか？",
				questionUpdated: "問題を更新しました。",
				questionDeleted: "問題を削除しました。",
				questionBank: "問題バンク",
				viewQuestions: "問題を見る",
				noQuestions: "このレベルにはまだ問題がありません。",
				previous: "前へ",
				nextPage: "次へ",
				questionPrompt: "問題文",
				translationPrompt: "英訳または読み方のヒント",
				answerChoices: "選択肢",
				correctAnswer: "正解",
				questionExplanation: "解説",
				addToBank: "問題バンクに追加",
				questionAdded: "問題を追加しました。",
				singleAnswer: "単一回答",
				trueFalse: "正誤問題",
				reading: "読解",
				listening: "聴解",
				audioUrl: "音声URL",
				audioUnavailable: "この問題の音声は利用できません。",
				requiredFields: "必須項目を入力してください。",
				language: "言語",
				question: "問題",
				next: "次の問題",
				finish: "クイズを終える",
				result: "結果",
				points: "点",
				score: "スコア",
				namePrompt: "ランキングに名前を登録",
				namePlaceholder: "名前",
				save: "スコアを保存",
				saved: "ランキングに保存しました",
				viewBoard: "ランキングを見る",
				playAgain: "もう一度遊ぶ",
				loading: "読み込み中...",
				noScores: "まだスコアがありません。最初の一人になりましょう。",
				rank: "順位",
				player: "プレイヤー",
				level: "レベル",
				date: "日付",
				team: "クイズを作ったチーム",
				back: "ホームに戻る",
				true: "正しい",
				false: "間違い",
				correct: "正解",
				incorrect: "不正解",
				explanation: "解説",
				submitted: "スコアを登録しました。"
			}
		};
		let text = derived(() => copy[language]);
		let quizQuestions = [];
		let questionBankQuestions = derived(() => questionsForLevel(questions, leaderboardLevel));
		const questionPageSize = appConfig.questionBank.pageSize;
		let questionBankPage = 1;
		derived(() => Math.max(1, Math.ceil(questionBankQuestions().length / questionPageSize)));
		derived(() => questionBankQuestions().slice(0 * questionPageSize, questionBankPage * questionPageSize));
		let currentQuestion = derived(() => quizQuestions[currentIndex]);
		derived(() => calculateScore(correctAnswers, quizQuestions.length));
		derived(() => currentQuestion() ? selectedAnswer === currentQuestion().answer : false);
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(text().eyebrow)} | Japanese Quiz</title>`);
			});
		});
		$$renderer.push(`<div class="app-shell"><header class="topbar"><button class="brand" type="button"${attr("aria-label", text().back)}><span class="brand-mark">言</span> <span>${escape_html(text().eyebrow)}</span></button> <nav aria-label="Main navigation"><button type="button"${attr_class("", void 0, { "active": false })}>${escape_html(text().leaderboard)}</button> <button type="button"${attr_class("", void 0, { "active": false })}>${escape_html(text().credits)}</button> <button type="button"${attr_class("", void 0, { "active": false })}>${escape_html(text().addQuestion)}</button> <button type="button"${attr_class("", void 0, { "active": false })}>${escape_html(text().viewQuestions)}</button> <div class="language-switch"${attr("aria-label", text().language)}><button type="button"${attr_class("", void 0, { "active": language === "en" })}>EN</button> <button type="button"${attr_class("", void 0, { "active": language === "ja" })}>JP</button></div></nav></header> `);
		$$renderer.push(`<!--[0--><main class="home-page"><section class="hero-block"><div class="hero-kicker"><span class="dot"></span>${escape_html(text().eyebrow)}<span class="line"></span><span>${escape_html(appConfig.app.year)}</span></div> <h1>${escape_html(text().title)}</h1> <p>${escape_html(text().intro)}</p></section> <section class="track-section" aria-labelledby="track-heading"><div class="section-heading"><div><span class="section-index">01 /</span> <h2 id="track-heading">${escape_html(text().choose)}</h2></div> <span class="annotation">JLPT · ${escape_html(language === "ja" ? "学習トラック" : "LEARNING TRACKS")}</span></div> <div class="track-grid"><button${attr_class("track-card n4", void 0, { "chosen": selectedLevel === "N4" })} type="button"><span class="track-number">01</span><span class="level-label">JLPT</span><strong>N4</strong> <span class="track-title">${escape_html(text().n4Title)}</span> <p>${escape_html(text().n4Description)}</p> <span class="select-indicator">${escape_html(selectedLevel === "N4" ? "●" : "○")}</span></button> <button${attr_class("track-card n3", void 0, { "chosen": selectedLevel === "N3" })} type="button"><span class="track-number">02</span><span class="level-label">JLPT</span><strong>N3</strong> <span class="track-title">${escape_html(text().n3Title)}</span> <p>${escape_html(text().n3Description)}</p> <span class="select-indicator">${escape_html(selectedLevel === "N3" ? "●" : "○")}</span></button></div> <button class="primary-action" type="button">${escape_html(text().start)}<span>↗</span></button></section> <section class="home-footer"><span>WORDS HAVE WEIGHT.</span><span>言葉には重みがある。</span><span>EST. ${escape_html(appConfig.app.year)}</span></section></main>`);
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
