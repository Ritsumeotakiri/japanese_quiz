<script lang="ts">
  import { onMount } from 'svelte'
  import { calculateScore, questionsForLevel } from '$lib/quiz'
  import type { Credit, Level, Question, QuestionInput, QuestionType, Score } from '$lib/types'

  type Language = 'en' | 'ja'
  type Screen = 'home' | 'quiz' | 'result' | 'leaderboard' | 'credits' | 'question-bank' | 'add-question'

  let language = $state<Language>('en')
  let screen = $state<Screen>('home')
  let selectedLevel = $state<Level>('N4')
  let leaderboardLevel = $state<Level>('N4')
  let currentIndex = $state(0)
  let correctAnswers = $state(0)
  let selectedAnswer = $state('')
  let answerLocked = $state(false)
  let playerName = $state('')
  let submitted = $state(false)
  let scores = $state<Score[]>([])
  let loadingScores = $state(false)
  let savingScore = $state(false)
  let scoreError = $state('')
  let questions = $state<Question[]>([])
  let credits = $state<Credit[]>([])
  let newLevel = $state<Level>('N4')
  let newType = $state<QuestionType>('single')
  let newPrompt = $state('')
  let newTranslation = $state('')
  let newOptions = $state(['', '', '', ''])
  let newAnswer = $state('')
  let newExplanation = $state('')
  let savingQuestion = $state(false)
  let questionMessage = $state('')
  let questionError = $state('')

  const copy = {
    en: {
      eyebrow: 'ことば / KOTOBA CLUB',
      title: 'Japanese, one question at a time.',
      intro: 'A small, focused practice room for vocabulary, readings, and meaning.',
      choose: 'Choose your track',
      n4Title: 'N4 oriented',
      n4Description: 'Everyday words, basic kanji, and the building blocks of conversation.',
      n3Title: 'N3 oriented',
      n3Description: 'More nuance, abstract vocabulary, and reading confidence.',
      start: 'Start quiz',
      leaderboard: 'Scoreboard',
      credits: 'Credits',
      addQuestion: 'Add question',
      questionBank: 'Question bank',
      viewQuestions: 'View questions',
      noQuestions: 'No questions in this level yet.',
      questionPrompt: 'Question prompt',
      translationPrompt: 'English translation or reading hint',
      answerChoices: 'Answer choices',
      correctAnswer: 'Correct answer',
      questionExplanation: 'Explanation',
      addToBank: 'Add to question bank',
      questionAdded: 'Question added to the bank.',
      singleAnswer: 'Single answer',
      trueFalse: 'True / false',
      requiredFields: 'Complete the required fields first.',
      language: 'Language',
      question: 'Question',
      next: 'Next question',
      finish: 'Finish quiz',
      result: 'Your result',
      points: 'points',
      score: 'Score',
      namePrompt: 'Add your name to the scoreboard',
      namePlaceholder: 'Your name',
      save: 'Save score',
      saved: 'Saved to the scoreboard',
      viewBoard: 'View scoreboard',
      playAgain: 'Play again',
      loading: 'Loading scores...',
      noScores: 'No scores yet. Be the first on the board.',
      rank: 'Rank',
      player: 'Player',
      level: 'Level',
      date: 'Date',
      team: 'The people behind the quiz',
      back: 'Back to home',
      true: 'True',
      false: 'False',
      correct: 'Correct',
      incorrect: 'Not quite',
      explanation: 'Why',
      submitted: 'Your score is on the board.',
    },
    ja: {
      eyebrow: 'ことば / KOTOBA CLUB',
      title: '一問ずつ、日本語を学ぼう。',
      intro: '語彙、読み方、意味を集中して練習できる小さな学習室です。',
      choose: 'コースを選ぶ',
      n4Title: 'N4向け',
      n4Description: '日常の言葉、基本漢字、会話の土台を練習します。',
      n3Title: 'N3向け',
      n3Description: '細かなニュアンス、抽象語彙、読解力を鍛えます。',
      start: 'クイズを始める',
      leaderboard: 'ランキング',
      credits: 'クレジット',
      addQuestion: '問題を追加',
      questionBank: '問題バンク',
      viewQuestions: '問題を見る',
      noQuestions: 'このレベルにはまだ問題がありません。',
      questionPrompt: '問題文',
      translationPrompt: '英訳または読み方のヒント',
      answerChoices: '選択肢',
      correctAnswer: '正解',
      questionExplanation: '解説',
      addToBank: '問題バンクに追加',
      questionAdded: '問題を追加しました。',
      singleAnswer: '単一回答',
      trueFalse: '正誤問題',
      requiredFields: '必須項目を入力してください。',
      language: '言語',
      question: '問題',
      next: '次の問題',
      finish: 'クイズを終える',
      result: '結果',
      points: '点',
      score: 'スコア',
      namePrompt: 'ランキングに名前を登録',
      namePlaceholder: '名前',
      save: 'スコアを保存',
      saved: 'ランキングに保存しました',
      viewBoard: 'ランキングを見る',
      playAgain: 'もう一度遊ぶ',
      loading: '読み込み中...',
      noScores: 'まだスコアがありません。最初の一人になりましょう。',
      rank: '順位',
      player: 'プレイヤー',
      level: 'レベル',
      date: '日付',
      team: 'クイズを作ったチーム',
      back: 'ホームに戻る',
      true: '正しい',
      false: '間違い',
      correct: '正解',
      incorrect: '不正解',
      explanation: '解説',
      submitted: 'スコアを登録しました。',
    },
  }

  let text = $derived(copy[language])
  let quizQuestions = $derived(questionsForLevel(questions, selectedLevel))
  let questionBankQuestions = $derived(questionsForLevel(questions, leaderboardLevel))
  let currentQuestion = $derived<Question | undefined>(quizQuestions[currentIndex])
  let currentScore = $derived(calculateScore(correctAnswers, quizQuestions.length))
  let isCorrect = $derived(currentQuestion ? selectedAnswer === currentQuestion.answer : false)

  onMount(() => {
    loadScores()
    loadQuestions()
    loadCredits()
  })

  async function loadQuestions() {
    const response = await fetch('/api/questions')
    if (!response.ok) return
    const data = (await response.json()) as { questions: Question[] }
    questions = data.questions
  }

  async function loadCredits() {
    const response = await fetch('/api/credits')
    if (!response.ok) return
    const data = (await response.json()) as { credits: Credit[] }
    credits = data.credits
  }

  async function loadScores() {
    loadingScores = true
    try {
      const response = await fetch(`/api/scores?level=${leaderboardLevel}`)
      scores = response.ok ? ((await response.json()) as { scores: Score[] }).scores : []
    } finally {
      loadingScores = false
    }
  }

  function chooseLevel(level: Level) {
    selectedLevel = level
  }

  function startQuiz() {
    currentIndex = 0
    correctAnswers = 0
    selectedAnswer = ''
    answerLocked = false
    submitted = false
    screen = 'quiz'
  }

  function selectAnswer(answer: string) {
    if (!answerLocked) selectedAnswer = answer
  }

  function submitAnswer() {
    if (!selectedAnswer || answerLocked || !currentQuestion) return
    answerLocked = true
    if (isCorrect) correctAnswers += 1
  }

  function nextQuestion() {
    if (currentIndex < quizQuestions.length - 1) {
      currentIndex += 1
      selectedAnswer = ''
      answerLocked = false
    } else {
      screen = 'result'
    }
  }

  async function saveScore() {
    if (!playerName.trim() || savingScore) return
    savingScore = true
    scoreError = ''
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          level: selectedLevel,
          score: currentScore,
          total: quizQuestions.length,
        }),
      })
      if (!response.ok) throw new Error('Could not save score')
      submitted = true
      leaderboardLevel = selectedLevel
      await loadScores()
    } catch {
      scoreError = 'Could not save your score. Please try again.'
    } finally {
      savingScore = false
    }
  }

  function openLeaderboard() {
    screen = 'leaderboard'
    loadScores()
  }

  function openQuestionBank() {
    questionMessage = ''
    questionError = ''
    screen = 'add-question'
  }

  function openQuestionList() {
    screen = 'question-bank'
  }

  function resetQuestionForm() {
    newPrompt = ''
    newTranslation = ''
    newOptions = ['', '', '', '']
    newAnswer = ''
    newExplanation = ''
  }

  async function createQuestion() {
    const options = newType === 'single' ? newOptions.map((option) => option.trim()).filter(Boolean) : undefined
    if (
      !newPrompt.trim() ||
      !newTranslation.trim() ||
      !newAnswer.trim() ||
      !newExplanation.trim() ||
      (newType === 'single' && (!options || options.length < 2))
    ) {
      questionError = text.requiredFields
      questionMessage = ''
      return
    }
    savingQuestion = true
    questionError = ''
    questionMessage = ''
    const input: QuestionInput = {
      level: newLevel,
      type: newType,
      prompt: newPrompt,
      translation: newTranslation,
      options,
      answer: newAnswer,
      explanation: newExplanation,
    }
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) throw new Error('Could not save question')
      const data = (await response.json()) as { question: Question }
      questions = [data.question, ...questions]
      questionMessage = text.questionAdded
      resetQuestionForm()
    } catch {
      questionError = 'Could not save the question. Please try again.'
    } finally {
      savingQuestion = false
    }
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(language === 'ja' ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric' }).format(
      new Date(value),
    )
  }
</script>

<svelte:head>
  <title>{text.eyebrow} | Japanese Quiz</title>
</svelte:head>

<div class="app-shell">
  <header class="topbar">
    <button class="brand" type="button" onclick={() => (screen = 'home')} aria-label={text.back}>
      <span class="brand-mark">言</span>
      <span>{text.eyebrow}</span>
    </button>
    <nav aria-label="Main navigation">
      <button class:active={screen === 'leaderboard'} type="button" onclick={openLeaderboard}>{text.leaderboard}</button
      >
      <button class:active={screen === 'credits'} type="button" onclick={() => (screen = 'credits')}
        >{text.credits}</button
      >
      <button class:active={screen === 'add-question'} type="button" onclick={openQuestionBank}
        >{text.addQuestion}</button
      >
      <button class:active={screen === 'question-bank'} type="button" onclick={openQuestionList}
        >{text.viewQuestions}</button
      >
      <div class="language-switch" aria-label={text.language}>
        <button class:active={language === 'en'} type="button" onclick={() => (language = 'en')}>EN</button>
        <button class:active={language === 'ja'} type="button" onclick={() => (language = 'ja')}>JP</button>
      </div>
    </nav>
  </header>

  {#if screen === 'home'}
    <main class="home-page">
      <section class="hero-block">
        <div class="hero-kicker">
          <span class="dot"></span>{text.eyebrow}<span class="line"></span><span>2026</span>
        </div>
        <h1>{text.title}</h1>
        <p>{text.intro}</p>
      </section>

      <section class="track-section" aria-labelledby="track-heading">
        <div class="section-heading">
          <div>
            <span class="section-index">01 /</span>
            <h2 id="track-heading">{text.choose}</h2>
          </div>
          <span class="annotation">JLPT · {language === 'ja' ? '学習トラック' : 'LEARNING TRACKS'}</span>
        </div>
        <div class="track-grid">
          <button
            class:chosen={selectedLevel === 'N4'}
            class="track-card n4"
            type="button"
            onclick={() => chooseLevel('N4')}
          >
            <span class="track-number">01</span><span class="level-label">JLPT</span><strong>N4</strong>
            <span class="track-title">{text.n4Title}</span>
            <p>{text.n4Description}</p>
            <span class="select-indicator">{selectedLevel === 'N4' ? '●' : '○'}</span>
          </button>
          <button
            class:chosen={selectedLevel === 'N3'}
            class="track-card n3"
            type="button"
            onclick={() => chooseLevel('N3')}
          >
            <span class="track-number">02</span><span class="level-label">JLPT</span><strong>N3</strong>
            <span class="track-title">{text.n3Title}</span>
            <p>{text.n3Description}</p>
            <span class="select-indicator">{selectedLevel === 'N3' ? '●' : '○'}</span>
          </button>
        </div>
        <button class="primary-action" type="button" onclick={startQuiz}>{text.start}<span>↗</span></button>
      </section>

      <section class="home-footer">
        <span>WORDS HAVE WEIGHT.</span><span>言葉には重みがある。</span><span>EST. 2026</span>
      </section>
    </main>
  {:else if screen === 'quiz' && currentQuestion}
    <main class="quiz-page">
      <div class="quiz-header">
        <button class="back-link" type="button" onclick={() => (screen = 'home')}>← {text.back}</button><span
          >{selectedLevel} · {text.question} {currentIndex + 1}/{quizQuestions.length}</span
        >
      </div>
      <div class="progress-track">
        <span style={`width: ${((currentIndex + (answerLocked ? 1 : 0)) / quizQuestions.length) * 100}%`}></span>
      </div>
      <section class="question-panel">
        <div class="question-meta">
          <span>{currentQuestion.type === 'true-false' ? 'TRUE / FALSE' : 'SINGLE ANSWER'}</span><span
            >{selectedLevel}</span
          >
        </div>
        <h1>{currentQuestion.prompt}</h1>
        <p class="translation">{currentQuestion.translation}</p>
        {#if currentQuestion.type === 'true-false'}
          <div class="answer-grid two">
            <button
              class:selected={selectedAnswer === 'true'}
              class:correct={answerLocked && currentQuestion.answer === 'true'}
              class:wrong={answerLocked && selectedAnswer === 'true' && !isCorrect}
              type="button"
              onclick={() => selectAnswer('true')}>{text.true}</button
            >
            <button
              class:selected={selectedAnswer === 'false'}
              class:correct={answerLocked && currentQuestion.answer === 'false'}
              class:wrong={answerLocked && selectedAnswer === 'false' && !isCorrect}
              type="button"
              onclick={() => selectAnswer('false')}>{text.false}</button
            >
          </div>
        {:else if currentQuestion.options}
          <div class="answer-grid">
            {#each currentQuestion.options as option, index}
              <button
                class:selected={selectedAnswer === option}
                class:correct={answerLocked && currentQuestion.answer === option}
                class:wrong={answerLocked && selectedAnswer === option && !isCorrect}
                type="button"
                onclick={() => selectAnswer(option)}><span>{String.fromCharCode(65 + index)}</span>{option}</button
              >
            {/each}
          </div>
        {/if}
        {#if answerLocked}
          <div class:success={isCorrect} class="feedback">
            <strong>{isCorrect ? text.correct : text.incorrect}</strong><span
              >{text.explanation}: {currentQuestion.explanation}</span
            >
          </div>
        {/if}
        <button
          class="primary-action wide"
          type="button"
          onclick={answerLocked ? nextQuestion : submitAnswer}
          disabled={!selectedAnswer}
          >{answerLocked ? (currentIndex === quizQuestions.length - 1 ? text.finish : text.next) : text.next}<span
            >↗</span
          ></button
        >
      </section>
    </main>
  {:else if screen === 'result'}
    <main class="result-page">
      <div class="result-stamp">{selectedLevel} · COMPLETE</div>
      <span class="section-index">02 / {text.result}</span>
      <h1>{currentScore}<small>/ 100</small></h1>
      <p>{correctAnswers} / {quizQuestions.length} {text.points}</p>
      {#if submitted}<div class="saved-note">✓ {text.submitted}</div>{/if}
      {#if !submitted}
        <form
          class="score-form"
          onsubmit={(event) => {
            event.preventDefault()
            saveScore()
          }}
        >
          <label for="player-name">{text.namePrompt}</label><input
            id="player-name"
            bind:value={playerName}
            maxlength="24"
            placeholder={text.namePlaceholder}
            autocomplete="name"
          /><button class="primary-action wide" type="submit" disabled={!playerName.trim() || savingScore}
            >{savingScore ? '...' : text.save}<span>↗</span></button
          >
          {#if scoreError}<p class="form-error">{scoreError}</p>{/if}
        </form>
      {/if}
      <div class="result-actions">
        <button class="text-action" type="button" onclick={openLeaderboard}>{text.viewBoard} →</button><button
          class="text-action"
          type="button"
          onclick={startQuiz}>{text.playAgain} ↻</button
        >
      </div>
    </main>
  {:else if screen === 'question-bank'}
    <main class="content-page question-bank-page">
      <div class="page-heading">
        <span class="section-index">03 / {text.questionBank}</span>
        <h1>{text.viewQuestions}</h1>
        <p>
          {language === 'ja'
            ? 'D1データベースに保存されている問題です。'
            : 'Questions currently stored in the D1 database.'}
        </p>
      </div>
      <div class="bank-toolbar">
        <div class="filter-tabs">
          <button class:active={leaderboardLevel === 'N4'} type="button" onclick={() => (leaderboardLevel = 'N4')}
            >N4</button
          >
          <button class:active={leaderboardLevel === 'N3'} type="button" onclick={() => (leaderboardLevel = 'N3')}
            >N3</button
          >
        </div>
        <button class="text-action" type="button" onclick={openQuestionBank}>{text.addQuestion} +</button>
      </div>
      {#if questionBankQuestions.length === 0}
        <p class="empty-state">{text.noQuestions}</p>
      {:else}
        <div class="question-list">
          {#each questionBankQuestions as question, index}
            <article class="question-list-item">
              <div class="question-list-number">{String(index + 1).padStart(2, '0')}</div>
              <div class="question-list-content">
                <div class="question-list-meta">
                  <span>{question.type === 'single' ? text.singleAnswer : text.trueFalse}</span><span
                    >{question.level}</span
                  >
                </div>
                <h2>{question.prompt}</h2>
                <p>{question.translation}</p>
                <div class="question-answer"><strong>{text.correctAnswer}</strong><span>{question.answer}</span></div>
                <div class="question-explanation">
                  <strong>{text.explanation}</strong><span>{question.explanation}</span>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {/if}
      <button class="back-link bottom-link" type="button" onclick={() => (screen = 'home')}>← {text.back}</button>
    </main>
  {:else if screen === 'add-question'}
    <main class="content-page question-editor-page">
      <div class="page-heading">
        <span class="section-index">03 / {text.questionBank}</span>
        <h1>{text.addQuestion}</h1>
        <p>
          {language === 'ja'
            ? '新しい学習問題を作成します。'
            : 'Create a new question for the N4 or N3 learning track.'}
        </p>
      </div>
      <form
        class="question-form"
        onsubmit={(event) => {
          event.preventDefault()
          createQuestion()
        }}
      >
        <div class="form-row two-fields">
          <label
            >Level<select bind:value={newLevel}><option value="N4">N4</option><option value="N3">N3</option></select
            ></label
          >
          <label
            >Type<select bind:value={newType}
              ><option value="single">{text.singleAnswer}</option><option value="true-false">{text.trueFalse}</option
              ></select
            ></label
          >
        </div>
        <label
          >{text.questionPrompt}<textarea
            bind:value={newPrompt}
            rows="3"
            placeholder="例: Choose the reading for 食べる."></textarea></label
        >
        <label>{text.translationPrompt}<input bind:value={newTranslation} placeholder="たべる means to eat." /></label>
        {#if newType === 'single'}
          <fieldset>
            <legend>{text.answerChoices}</legend>
            <div class="choice-fields">
              {#each newOptions as option, index}
                <label
                  ><span>{String.fromCharCode(65 + index)}</span><input
                    bind:value={newOptions[index]}
                    placeholder={`${text.answerChoices} ${index + 1}`}
                  /></label
                >
              {/each}
            </div>
          </fieldset>
        {/if}
        <label
          >{text.correctAnswer}
          {#if newType === 'true-false'}
            <select bind:value={newAnswer}>
              <option value="" disabled>Select the correct answer</option>
              <option value="true">{text.true}</option>
              <option value="false">{text.false}</option>
            </select>
          {:else}
            <input bind:value={newAnswer} placeholder="たべる" />
          {/if}
        </label>
        <label
          >{text.questionExplanation}<textarea
            bind:value={newExplanation}
            rows="3"
            placeholder="Explain the answer briefly."></textarea></label
        >
        {#if questionError}<p class="form-error">{questionError}</p>{/if}
        {#if questionMessage}<p class="saved-note">✓ {questionMessage}</p>{/if}
        <button class="primary-action wide" type="submit" disabled={savingQuestion}
          >{savingQuestion ? '...' : text.addToBank}<span>↗</span></button
        >
      </form>
      <button class="back-link bottom-link" type="button" onclick={() => (screen = 'home')}>← {text.back}</button>
    </main>
  {:else if screen === 'leaderboard'}
    <main class="content-page">
      <div class="page-heading">
        <span class="section-index">03 / {text.leaderboard}</span>
        <h1>{text.leaderboard}</h1>
        <p>{language === 'ja' ? 'レベル別のトップスコア' : 'Top scores, separated by learning track.'}</p>
      </div>
      <div class="filter-tabs">
        <button
          class:active={leaderboardLevel === 'N4'}
          type="button"
          onclick={() => {
            leaderboardLevel = 'N4'
            loadScores()
          }}>N4</button
        ><button
          class:active={leaderboardLevel === 'N3'}
          type="button"
          onclick={() => {
            leaderboardLevel = 'N3'
            loadScores()
          }}>N3</button
        >
      </div>
      {#if loadingScores}<p class="empty-state">{text.loading}</p>{:else if scores.length === 0}<p class="empty-state">
          {text.noScores}
        </p>{:else}<div class="score-table">
          <div class="table-row table-head">
            <span>{text.rank}</span><span>{text.player}</span><span>{text.score}</span><span>{text.date}</span>
          </div>
          {#each scores as entry, index}<div class="table-row">
              <span class="rank">{String(index + 1).padStart(2, '0')}</span><strong>{entry.name}</strong><span
                >{entry.score}<small>/100</small></span
              ><span>{formatDate(entry.createdAt)}</span>
            </div>{/each}
        </div>{/if}<button class="back-link bottom-link" type="button" onclick={() => (screen = 'home')}
        >← {text.back}</button
      >
    </main>
  {:else}
    <main class="content-page credits-page">
      <div class="page-heading">
        <span class="section-index">04 / {text.credits}</span>
        <h1>{text.team}</h1>
        <p>{language === 'ja' ? 'この学習体験を支える役割' : 'The roles that shaped this learning experience.'}</p>
      </div>
      <div class="credits-list">
        {#each credits as credit, index}
          <article>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2>{credit.name}</h2>
              <p>{credit.contribution}</p>
            </div>
            <strong
              >{credit.name
                .split(' ')
                .map((part) => part[0])
                .join('')}</strong
            >
          </article>
        {/each}
      </div>
      <button class="back-link bottom-link" type="button" onclick={() => (screen = 'home')}>← {text.back}</button>
    </main>
  {/if}
</div>
