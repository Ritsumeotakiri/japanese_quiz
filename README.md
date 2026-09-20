# Kotoba Club

A bilingual Japanese quiz for JLPT N4 and N3 practice, built with SvelteKit, TypeScript, and Cloudflare D1.

# Kotoba Club

A bilingual Japanese quiz for JLPT N4 and N3 practice. It uses SvelteKit, TypeScript, Cloudflare Workers, and Cloudflare D1.

## Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer
- A Cloudflare account for remote D1 and deployment
- Git is recommended for source control

Check the installed tools:

```powershell
node --version
pnpm --version
```

If pnpm is not installed, enable it through Corepack:

```powershell
corepack enable
corepack prepare pnpm@latest --activate
```

## Install

From the project root:

```powershell
pnpm install
```

## Run Locally

For normal Vite development:

```powershell
pnpm dev:local
```

Open the local URL shown by Vite. This is useful for fast UI work, but API calls need a Worker environment with the D1 binding.

For the Cloudflare Worker runtime and D1 binding:

```powershell
pnpm dev
```

This builds the SvelteKit Cloudflare output and starts Wrangler against `.svelte-kit/cloudflare/_worker.js`.

## Validate Manually

Run the checks individually:

```powershell
pnpm check
pnpm lint
pnpm format:check
pnpm spellcheck
pnpm test
```

Run the browser end-to-end test:

```powershell
pnpm exec playwright install chromium
pnpm test:e2e
```

Build the production Worker without deploying:

```powershell
pnpm build
```

## Database Setup

The database is Cloudflare D1. Its binding is named `DB` in [`wrangler.toml`](wrangler.toml).

Apply migrations to the remote database:

```powershell
pnpm wrangler login
pnpm wrangler d1 migrations apply japanese-quiz --remote
```

The migration files run in order:

1. `0001_scores.sql` creates scores, credits, and questions tables.
2. `0002_credits_say_sakphearith.sql` updates the credits record.
3. `0003_seed_questions.sql` seeds the first N4/N3 questions.
4. `0004_more_questions.sql` adds more N4/N3 questions.
5. `0005_listening_questions.sql` adds the `audio_url` column for listening questions.

Inspect remote data manually:

```powershell
pnpm wrangler d1 execute japanese-quiz --remote --command "SELECT level, COUNT(*) AS total FROM questions GROUP BY level;"
pnpm wrangler d1 execute japanese-quiz --remote --command "SELECT id, level, type, prompt FROM questions ORDER BY created_at;"
```

Do not edit an already-applied migration. Add a new numbered migration for future schema changes.

## Deploy

The project is configured for Cloudflare Workers in [`wrangler.toml`](wrangler.toml). It uses:

- `main = ".svelte-kit/cloudflare/_worker.js"` for the generated Worker.
- `assets.directory = ".svelte-kit/cloudflare"` for browser assets.
- `assets.binding = "ASSETS"` for SvelteKit static asset access.
- `DB` for the remote D1 database.

Deploy the current code:

```powershell
pnpm check
pnpm test
pnpm build
pnpm wrangler d1 migrations apply japanese-quiz --remote
pnpm wrangler deploy
```

After deployment, Wrangler prints the Worker URL. The current deployment URL is:

https://japanese-quiz.hhuy28953.workers.dev/

Verify the deployment:

```powershell
curl.exe -I https://japanese-quiz.hhuy28953.workers.dev/
curl.exe -I https://japanese-quiz.hhuy28953.workers.dev/api/questions
```

Both should return a successful HTTP status.

## Configuration

Edit [`src/lib/config.ts`](src/lib/config.ts) for application behavior:

```ts
app.name // Browser document title
app.year // Displayed year
app.defaultLanguage // 'en' or 'ja'
app.defaultLevel // 'N4' or 'N3'
levels // Supported JLPT levels
questionTypes // Supported question types
quiz.maxQuestions // Random questions per game
questionBank.pageSize // Questions shown per bank page
question.maxPromptLength // Maximum prompt length
question.maxTranslationLength // Maximum translation length
question.maxAudioUrlLength // Maximum listening audio URL length
question.maxAnswerLength // Maximum answer length
question.maxExplanationLength // Maximum explanation length
question.maxOptions // Maximum answer choices
question.minimumOptions // Minimum choices for choice questions
score.maxNameLength // Maximum scoreboard name length
score.maxScore // Score ceiling
score.leaderboardLimit // Scores returned per level
```

Keep values in this file compatible with the database constraints. For example, adding a new level or question type also requires a database migration because the D1 table uses `CHECK` constraints.

## Application Routes

The application is a single Svelte page. Its screens are client-side states rather than separate URL routes:

- `/` shows the home screen and JLPT level selection.
- `quiz` shows a randomized quiz for the selected level. It mixes the stored question types and caps each game using `quiz.maxQuestions`.
- `result` shows the score and saves a player score to D1.
- `leaderboard` shows scores filtered by N4 or N3.
- `question-bank` lists questions with filtering, pagination, editing, and deletion.
- `add-question` creates or edits a question, including listening audio URLs.
- `credits` displays credit records loaded from D1.

## API Routes

### `GET /api/questions`

Returns all questions from D1. Optional filter:

```text
GET /api/questions?level=N4
```

### `POST /api/questions`

Creates a question. Required fields are `level`, `type`, `prompt`, `translation`, `answer`, and `explanation`. Choice types also require at least two `options` containing the correct `answer`. Listening questions require `audioUrl`.

Supported types are `true-false`, `single`, `reading`, and `listening`.

### `PATCH /api/questions`

Updates a question. Send the same fields as `POST` plus the existing question `id`.

### `DELETE /api/questions?id=QUESTION_ID`

Deletes one question from D1.

### `GET /api/scores?level=N4`

Returns the leaderboard for one valid level. Results are ordered by score and limited by `score.leaderboardLimit`.

### `POST /api/scores`

Saves a score with `name`, `level`, `score`, and `total`. The API trims the name and clamps the score using the central configuration.

### `GET /api/credits`

Returns the credits rows from D1.

## How the System Works

1. The browser loads `/` and the Svelte page fetches questions, credits, and scores from the API.
2. The player selects N4 or N3 and starts a quiz.
3. `randomQuestionsForLevel` filters questions by level, shuffles them with Fisher-Yates, and returns at most `quiz.maxQuestions` questions.
4. The player answers true/false, single-choice, reading, or listening questions. Listening questions render the saved audio URL in an HTML audio player.
5. The client calculates the percentage score locally.
6. The player submits a name. The scores API validates and stores the result in D1.
7. The Question Bank uses the questions API for listing, creating, editing, and deleting questions. Pagination is client-side and controlled by `questionBank.pageSize`.
8. SvelteKit builds the page and server endpoints into a Cloudflare Worker. Wrangler serves browser assets through the `ASSETS` binding and gives server handlers access to D1 through `DB`.

## Project Structure

```text
src/lib/config.ts                 Central runtime settings
src/lib/quiz.ts                   Quiz filtering, shuffle, and scoring
src/lib/types.ts                  Shared TypeScript types
src/lib/server/questions.ts       D1 question queries and mutations
src/lib/server/scores.ts          D1 score queries and mutations
src/routes/+page.svelte           Main UI and client-side screens
src/routes/api/questions/+server.ts Question API
src/routes/api/scores/+server.ts    Score API
src/routes/api/credits/+server.ts   Credits API
migrations/                       Ordered D1 schema/data migrations
wrangler.toml                     Cloudflare Worker and D1 configuration
tests/                            Unit and Playwright tests
```

## Useful Commands

```powershell
pnpm dev             # Build and run the Cloudflare Worker locally
pnpm dev:local       # Run Vite's fast local development server
pnpm check           # Svelte and TypeScript diagnostics
pnpm lint            # ESLint
pnpm test            # Vitest unit tests
pnpm test:e2e        # Playwright browser tests
pnpm build           # Production Cloudflare build
pnpm wrangler deploy # Deploy the Worker
```
