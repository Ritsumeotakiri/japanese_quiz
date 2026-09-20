<script lang="ts">
  import { onMount } from 'svelte'
  import { app_config } from '$lib/config'
  import { calculateScore, questionsForLevel, randomQuestionsForLevel } from '$lib/quiz'
  import type { Credit, Level, Question, QuestionInput, QuestionType, Score } from '$lib/types'

  type Language = 'en' | 'ja'
  type Screen = 'home' | 'quiz' | 'result' | 'leaderboard' | 'credits' | 'question-bank' | 'add-question'

  let language = $state<Language>(app_config.app.defaultLanguage)
  let screen = $state<Screen>('home')
  let selectedLevel = $state<Level>(app_config.app.defaultLevel)
  let leaderboardLevel = $state<Level>(app_config.app.defaultLevel)
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
  let newLevel = $state<Level>(app_config.app.defaultLevel)
  let newType = $state<QuestionType>('single')
  let newPrompt = $state('')
  let newTranslation = $state('')
  let newAudioUrl = $state('')
  let newOptions = $state(['', '', '', ''])
  let newAnswer = $state('')
  let newExplanation = $state('')
  let editingQuestionId = $state<string | null>(null)
  let pendingDeleteQuestion = $state<Question | null>(null)
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
      editQuestion: 'Edit question',
      updateQuestion: 'Update question',
      deleteQuestion: 'Delete',
      deleteTitle: 'Delete question?',
      deleteDescription: 'This question will be permanently removed from the question bank.',
      cancel: 'Cancel',
      confirmDelete: 'Delete question',
      deleteConfirm: 'Delete this question?',
      questionUpdated: 'Question updated.',
      questionDeleted: 'Question deleted.',
      questionBank: 'Question bank',
      viewQuestions: 'View questions',
      noQuestions: 'No questions in this level yet.',
      previous: 'Previous',
      nextPage: 'Next',
      questionPrompt: 'Question prompt',
      translationPrompt: 'English translation or reading hint',
      answerChoices: 'Answer choices',
      correctAnswer: 'Correct answer',
      questionExplanation: 'Explanation',
      addToBank: 'Add to question bank',
      questionAdded: 'Question added to the bank.',
      singleAnswer: 'Single answer',
      trueFalse: 'True / false',
      reading: 'Reading',
      listening: 'Listening',
      audioUrl: 'Audio URL',
      audioUnavailable: 'Audio is unavailable for this question.',
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
      editQuestion: '問題を編集',
      updateQuestion: '問題を更新',
      deleteQuestion: '削除',
      deleteTitle: '問題を削除しますか？',
      deleteDescription: 'この問題は問題バンクから完全に削除されます。',
      cancel: 'キャンセル',
      confirmDelete: '問題を削除',
      deleteConfirm: 'この問題を削除しますか？',
      questionUpdated: '問題を更新しました。',
      questionDeleted: '問題を削除しました。',
      questionBank: '問題バンク',
      viewQuestions: '問題を見る',
      noQuestions: 'このレベルにはまだ問題がありません。',
      previous: '前へ',
      nextPage: '次へ',
      questionPrompt: '問題文',
      translationPrompt: '英訳または読み方のヒント',
      answerChoices: '選択肢',
      correctAnswer: '正解',
      questionExplanation: '解説',
      addToBank: '問題バンクに追加',
      questionAdded: '問題を追加しました。',
      singleAnswer: '単一回答',
      trueFalse: '正誤問題',
      reading: '読解',
      listening: '聴解',
      audioUrl: '音声URL',
      audioUnavailable: 'この問題の音声は利用できません。',
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
  let quizQuestions = $state<Question[]>([])
  let questionBankQuestions = $derived(questionsForLevel(questions, leaderboardLevel))
  const questionPageSize = app_config.questionBank.pageSize
  let questionBankPage = $state(1)
  let questionBankPageCount = $derived(Math.max(1, Math.ceil(questionBankQuestions.length / questionPageSize)))
  let visibleQuestionBankQuestions = $derived(
    questionBankQuestions.slice((questionBankPage - 1) * questionPageSize, questionBankPage * questionPageSize),
  )
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
    quizQuestions = randomQuestionsForLevel(questions, selectedLevel)
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
    editingQuestionId = null
    resetQuestionForm()
    questionMessage = ''
    questionError = ''
    screen = 'add-question'
  }

  function openQuestionList() {
    questionBankPage = 1
    screen = 'question-bank'
  }

  function selectQuestionLevel(level: Level) {
    leaderboardLevel = level
    questionBankPage = 1
  }

  function resetQuestionForm() {
    newLevel = app_config.app.defaultLevel
    newType = 'single'
    newPrompt = ''
    newTranslation = ''
    newAudioUrl = ''
    newOptions = ['', '', '', '']
    newAnswer = ''
    newExplanation = ''
  }

  function editQuestion(question: Question) {
    editingQuestionId = question.id
    newLevel = question.level
    newType = question.type
    newPrompt = question.prompt
    newTranslation = question.translation
    newAudioUrl = question.audioUrl ?? ''
    newOptions = [
      question.options?.[0] ?? '',
      question.options?.[1] ?? '',
      question.options?.[2] ?? '',
      question.options?.[3] ?? '',
    ]
    newAnswer = question.answer
    newExplanation = question.explanation
    questionMessage = ''
    questionError = ''
    screen = 'add-question'
  }

  function removeQuestion(question: Question) {
    pendingDeleteQuestion = question
  }

  async function confirmDeleteQuestion() {
    if (!pendingDeleteQuestion) return
    const question = pendingDeleteQuestion
    pendingDeleteQuestion = null
    const response = await fetch(`/api/questions?id=${encodeURIComponent(question.id)}`, { method: 'DELETE' })
    if (!response.ok) {
      questionError = 'Could not delete the question.'
      return
    }
    questions = questions.filter((item) => item.id !== question.id)
    questionBankPage = 1
    questionMessage = text.questionDeleted
  }

  async function saveQuestion() {
    const choiceQuestion = ['single', 'reading', 'listening'].includes(newType)
    const options = choiceQuestion ? newOptions.map((option) => option.trim()).filter(Boolean) : undefined
    if (
      !newPrompt.trim() ||
      !newTranslation.trim() ||
      !newAnswer.trim() ||
      !newExplanation.trim() ||
      (choiceQuestion && (!options || options.length < 2)) ||
      (newType === 'listening' && !newAudioUrl.trim())
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
      audioUrl: newType === 'listening' ? newAudioUrl : undefined,
      options,
      answer: newAnswer,
      explanation: newExplanation,
    }
    try {
      const response = await fetch('/api/questions', {
        method: editingQuestionId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(editingQuestionId ? { ...input, id: editingQuestionId } : input),
      })
      if (!response.ok) throw new Error('Could not save question')
      const data = (await response.json()) as { question: Question }
      questions = editingQuestionId
        ? questions.map((question) => (question.id === data.question.id ? data.question : question))
        : [data.question, ...questions]
      questionMessage = editingQuestionId ? text.questionUpdated : text.questionAdded
      editingQuestionId = null
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
  <title>{app_config.app.name} | Japanese Quiz</title>
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
          <span class="dot"></span>{text.eyebrow}<span class="line"></span><span>{app_config.app.year}</span>
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
        <span>WORDS HAVE WEIGHT.</span><span>言葉には重みがある。</span><span>EST. {app_config.app.year}</span>
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
          <span>{currentQuestion.type === 'true-false' ? 'TRUE / FALSE' : currentQuestion.type.toUpperCase()}</span
          ><span>{selectedLevel}</span>
        </div>
        <h1>{currentQuestion.prompt}</h1>
        <p class="translation">{currentQuestion.translation}</p>
        {#if currentQuestion.type === 'listening'}
          {#if currentQuestion.audioUrl}
            <audio class="question-audio" controls preload="metadata" src={currentQuestion.audioUrl}>
              {text.audioUnavailable}
            </audio>
          {:else}
            <p class="form-error">{text.audioUnavailable}</p>
          {/if}
        {/if}
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
      <h1>{currentScore}<small>/ {app_config.score.maxScore}</small></h1>
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
            maxlength={app_config.score.maxNameLength}
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
      </div>
      <div class="bank-toolbar">
        <div class="filter-tabs">
          <button class:active={leaderboardLevel === 'N4'} type="button" onclick={() => selectQuestionLevel('N4')}
            >N4</button
          >
          <button class:active={leaderboardLevel === 'N3'} type="button" onclick={() => selectQuestionLevel('N3')}
            >N3</button
          >
        </div>
        <button class="text-action" type="button" onclick={openQuestionBank}>{text.addQuestion} +</button>
      </div>
      {#if questionBankQuestions.length === 0}
        <p class="empty-state">{text.noQuestions}</p>
      {:else}
        <div class="question-list">
          {#each visibleQuestionBankQuestions as question, index}
            <article class="question-list-item">
              <div class="question-list-number">
                {String((questionBankPage - 1) * questionPageSize + index + 1).padStart(2, '0')}
              </div>
              <div class="question-list-content">
                <div class="question-list-meta">
                  <span
                    >{question.type === 'single'
                      ? text.singleAnswer
                      : question.type === 'true-false'
                        ? text.trueFalse
                        : question.type === 'reading'
                          ? text.reading
                          : text.listening}</span
                  ><span>{question.level}</span>
                </div>
                <h2>{question.prompt}</h2>
                <p>{question.translation}</p>
                <div class="question-answer"><strong>{text.correctAnswer}</strong><span>{question.answer}</span></div>
                <div class="question-explanation">
                  <strong>{text.explanation}</strong><span>{question.explanation}</span>
                </div>
                <div class="question-list-actions">
                  <button class="text-action" type="button" onclick={() => editQuestion(question)}
                    >{text.editQuestion}</button
                  >
                  <button class="text-action danger-action" type="button" onclick={() => removeQuestion(question)}
                    >{text.deleteQuestion}</button
                  >
                </div>
              </div>
            </article>
          {/each}
        </div>
        {#if questionBankPageCount > 1}
          <nav class="pagination" aria-label="Question pages">
            <button
              class="pagination-button"
              type="button"
              disabled={questionBankPage === 1}
              onclick={() => (questionBankPage -= 1)}>{text.previous}</button
            >
            <span>{questionBankPage} / {questionBankPageCount}</span>
            <button
              class="pagination-button"
              type="button"
              disabled={questionBankPage === questionBankPageCount}
              onclick={() => (questionBankPage += 1)}>{text.nextPage}</button
            >
          </nav>
        {/if}
      {/if}
      <button class="back-link bottom-link" type="button" onclick={() => (screen = 'home')}>← {text.back}</button>
    </main>
  {:else if screen === 'add-question'}
    <main class="content-page question-editor-page">
      <div class="page-heading">
        <span class="section-index">03 / {text.questionBank}</span>
        <h1>{editingQuestionId ? text.editQuestion : text.addQuestion}</h1>
      </div>
      <form
        class="question-form"
        onsubmit={(event) => {
          event.preventDefault()
          saveQuestion()
        }}
      >
        <div class="form-row two-fields">
          <label
            >Level<select bind:value={newLevel}><option value="N4">N4</option><option value="N3">N3</option></select
            ></label
          >
          <label
            >Type<select bind:value={newType}
              ><option value="single">{text.singleAnswer}</option><option value="reading">{text.reading}</option><option
                value="listening">{text.listening}</option
              ><option value="true-false">{text.trueFalse}</option></select
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
        {#if newType === 'listening'}
          <label
            >{text.audioUrl}<input
              bind:value={newAudioUrl}
              type="url"
              placeholder="https://example.com/audio.mp3"
            /></label
          >
        {/if}
        {#if ['single', 'reading', 'listening'].includes(newType)}
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
          >{savingQuestion ? '...' : editingQuestionId ? text.updateQuestion : text.addToBank}<span>↗</span></button
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
                >{entry.score}<small>/{app_config.score.maxScore}</small></span
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
  {#if pendingDeleteQuestion}
    <div class="dialog-backdrop">
      <dialog class="confirm-dialog" open aria-labelledby="delete-dialog-title">
        <div class="confirm-dialog-mark">!</div>
        <div>
          <span class="section-index">{text.deleteQuestion}</span>
          <h2 id="delete-dialog-title">{text.deleteTitle}</h2>
          <p>{text.deleteDescription}</p>
          <strong>{pendingDeleteQuestion.prompt}</strong>
        </div>
        <div class="confirm-dialog-actions">
          <button class="text-action" type="button" onclick={() => (pendingDeleteQuestion = null)}>{text.cancel}</button
          >
          <button class="dialog-delete-action" type="button" onclick={confirmDeleteQuestion}
            >{text.confirmDelete}</button
          >
        </div>
      </dialog>
    </div>
  {/if}
</div>
