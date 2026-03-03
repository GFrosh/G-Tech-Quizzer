# G-Tech Quizzer Growth Roadmap

This roadmap turns the current static JSON-driven quiz app into a resilient, scalable learning platform in staged, low-risk increments.

## Baseline (Current State)

- Dynamic course card rendering from `courses.json`.
- Quiz content loaded from per-course JSON files.
- Randomized variant selection (`A` to `E`) at runtime.
- Immediate scoring and completion feedback.

---

## v1.1 — Reliability & Content Quality (1–2 weeks)

**Goal:** Make current architecture dependable before adding new features.

### Engineering tasks

1. Add automated JSON validation script for all `courses/*/questions_*.json` files.
2. Add schema checks:
   - Each question has `question` (string)
   - Each question has `answers` (array, min 2)
   - Exactly one answer has `correct: true`
3. Add consistency check:
   - Every `courses.json` course ID must map to a `courses/<ID>/` directory.
   - Every course directory should have at least one valid question file.
4. Add graceful UI error handling for failed fetch/parse:
   - Show user-friendly “Quiz unavailable” state.
   - Prevent blank quiz screens.
5. Add lightweight lint/format check for JavaScript files.

### Expected impact

- Fewer runtime crashes from malformed JSON.
- Faster onboarding of contributors adding questions.
- Better trust in production deploys.

### Success metrics

- 100% question files pass validation in CI.
- 0 uncaught fetch/JSON parse errors in browser console for supported courses.

---

## v1.5 — UX & Learning Effectiveness (2–4 weeks)

**Goal:** Improve user retention and study outcomes.

### Engineering tasks

1. Add quiz settings screen:
   - Number of questions
   - Difficulty filter (if tagged)
   - Timed/untimed mode
2. Add session-level progress analytics in browser storage:
   - Last score per course
   - Best score per course
   - Attempt count
3. Add explanations to answer options (`explanation` field in JSON).
4. Add review mode after completion:
   - Show selected answer vs correct answer
   - Show explanation
5. Improve accessibility:
   - Keyboard navigation for options
   - ARIA labels and focus states

### Expected impact

- Higher repeat usage due to visible progress.
- Better learning retention through explanation and review loops.

### Success metrics

- Increase average attempts per user/session.
- Reduced immediate drop-off after first quiz completion.

---

## v2.0 — Platform Scale (4–8+ weeks)

**Goal:** Move from static quiz app to scalable platform.

### Engineering tasks

1. Introduce backend API (Node/Express, Fastify, or serverless):
   - Serve courses/questions from database
   - Versioned endpoints
2. Add authentication:
   - Email/password or social login
   - User-specific history and progress
3. Add admin/content tooling:
   - Question authoring dashboard
   - Draft/review/publish workflow
4. Add telemetry/observability:
   - Event tracking (start quiz, finish quiz, question misses)
   - Error monitoring and alerting
5. Add adaptive quiz logic:
   - Difficulty adjustment based on recent performance
   - Personalized recommendations

### Expected impact

- Supports large content libraries and many concurrent users.
- Enables instructor workflows and data-driven improvements.

### Success metrics

- API p95 latency target under agreed threshold.
- >99.9% successful quiz start events.
- Increased monthly active learners and completion rates.

---

## Suggested Prioritization

1. **Do v1.1 first** (stability before features).
2. **Then v1.5** (retention and pedagogy improvements).
3. **Then v2.0** (backend/platform expansion once usage justifies complexity).

---

## Implementation Notes

- Keep the current JSON format backward-compatible while introducing validation.
- Add migration scripts only when moving from static files to API/database.
- Keep each release independently deployable to reduce rollback risk.
