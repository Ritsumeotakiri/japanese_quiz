# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quiz.spec.ts >> player can select a level and complete a quiz
- Location: tests\e2e\quiz.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'A influence' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - button "Back to home" [ref=e5] [cursor=pointer]:
      - generic [ref=e6]: 言
      - generic [ref=e7]: ことば / KOTOBA CLUB
    - navigation "Main navigation" [ref=e8]:
      - button "Scoreboard" [ref=e9] [cursor=pointer]
      - button "Credits" [ref=e10] [cursor=pointer]
      - button "Add question" [ref=e11] [cursor=pointer]
      - generic "Language" [ref=e12]:
        - button "EN" [ref=e13] [cursor=pointer]
        - button "JP" [ref=e14] [cursor=pointer]
  - main [ref=e15]:
    - generic [ref=e16]:
      - button "← Back to home" [ref=e17] [cursor=pointer]
      - generic [ref=e18]: N3 · Question 1/3
    - generic [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e22]: SINGLE ANSWER
        - generic [ref=e23]: N3
      - heading "Choose the reading for 経験." [level=1] [ref=e24]
      - paragraph [ref=e25]: 経験（けいけん） means experience.
      - generic [ref=e26]:
        - button "A けいけん" [ref=e27] [cursor=pointer]:
          - generic [ref=e28]: A
          - text: けいけん
        - button "B けんこう" [ref=e29] [cursor=pointer]:
          - generic [ref=e30]: B
          - text: けんこう
        - button "C けいかく" [ref=e31] [cursor=pointer]:
          - generic [ref=e32]: C
          - text: けいかく
        - button "D けんきゅう" [ref=e33] [cursor=pointer]:
          - generic [ref=e34]: D
          - text: けんきゅう
      - button "Next question ↗" [disabled] [ref=e35]:
        - text: Next question
        - generic [ref=e36]: ↗
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | 
  3  | test('player can select a level and complete a quiz', async ({ page }) => {
  4  |   await page.goto('/')
  5  |   await expect(page.getByRole('heading', { name: /Japanese, one question/i })).toBeVisible()
  6  |   await page.getByRole('button', { name: /N3 oriented/i }).click()
  7  |   await page.getByRole('button', { name: /Start quiz/i }).click()
  8  |   await expect(page.getByText('SINGLE ANSWER')).toBeVisible()
> 9  |   await page.getByRole('button', { name: 'A influence' }).click()
     |                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  10 |   await page.getByRole('button', { name: /Next question/i }).click()
  11 | })
  12 | 
```