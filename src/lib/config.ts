export const app_config = {
  app: {
    name: 'Kotoba Club',
    year: 2026,
    defaultLanguage: 'en',
    defaultLevel: 'N4',
  },
  levels: ['N4', 'N3'] as const,
  questionTypes: ['true-false', 'single', 'reading', 'listening'] as const,
  quiz: {
    maxQuestions: 50,
  },
  questionBank: {
    pageSize: 5,
  },
  question: {
    maxPromptLength: 240,
    maxTranslationLength: 240,
    maxAudioUrlLength: 500,
    maxAnswerLength: 120,
    maxExplanationLength: 300,
    maxOptions: 4,
    minimumOptions: 2,
  },
  score: {
    maxNameLength: 24,
    maxScore: 100,
    leaderboardLimit: 50,
  },
} as const
