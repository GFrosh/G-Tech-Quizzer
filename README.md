# G-Tech Quizzer

A fast, zero-dependency quiz application built with vanilla HTML, CSS, and JavaScript. Students select a course, answer 20 multiple-choice questions from a randomly chosen question bank, and receive instant feedback and a final score.

**Live preview:** [gfrosh.github.io/G-Tech-Quizzer](https://gfrosh.github.io/G-Tech-Quizzer/)

---

## Features

- Dynamically loaded course catalogue from `courses.json`
- Pre-quiz preparation screen showing course details and quiz variant
- 20 multiple-choice questions per quiz, each with three options
- Instant per-question feedback — correct answer is always revealed
- Percentage-based scoring with a contextual performance message
- Accessible status banner with live region announcements
- Keyboard-navigable (focus moves to the Next button after answering)
- System dark mode support via `prefers-color-scheme`
- Responsive layout that works on desktop, tablet, and phone
- Client-side error handling for missing or malformed quiz files
- Validation script to verify all quiz data before publishing

---

## Project Structure

```
G-Tech-Quizzer/
├── index.html              Main page
├── script.js               App bootstrap, course loading, navigation
├── quiz.js                 Quiz engine (accepts pre-loaded data)
├── style.css               Styles, themes, responsive overrides
├── courses.json            Course catalogue
├── validate-quizzes.cjs    Data validation script (Node.js)
└── courses/
    └── <COURSE_ID>/
        ├── questions_<ID>_A.json
        ├── questions_<ID>_B.json
        ├── questions_<ID>_C.json
        ├── questions_<ID>_D.json
        └── questions_<ID>_E.json
```

---

## Available Courses

| Course ID | Description |
|-----------|-------------|
| INS204    | System Analysis and Design |
| COS202    | Java Programming I |
| SOE202    | Requirements Engineering and Modelling |
| SOE206    | Embedded Systems Development |
| MTH202    | Ordinary Differential Equations |
| BCH314    | Medical Biochemistry II |
| IFT212    | Computer Architecture |
| GST212    | Logic and Philosophy |
| STA112    | Probability and Statistics |
| PHS306    | Systemic Pharmacology |
| ILS212    | Information Literacy Skills |
| GET204    | Workshop Practices |

---

## Running Locally

The app uses ES modules and `fetch`, so it must be served over HTTP (not opened as a `file://` URL).

**Option A — VS Code Live Server**

Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, then right-click `index.html` and choose *Open with Live Server*.

**Option B — Python**

```bash
python -m http.server 8080
# then open http://localhost:8080
```

**Option C — Node.js (npx)**

```bash
npx serve .
```

---

## Quiz Data Format

Each quiz file is a JSON array of exactly 20 question objects:

```json
[
  {
    "question": "Which keyword is used to define a class in Java?",
    "answers": [
      { "text": "class",  "correct": true  },
      { "text": "define", "correct": false },
      { "text": "struct", "correct": false }
    ]
  }
]
```

Rules:
- The root must be a JSON array.
- Each question needs a non-empty `"question"` string.
- Each question needs at least 2 answers.
- Each answer needs a non-empty `"text"` string and a boolean `"correct"`.
- **Exactly one** answer per question may have `"correct": true`.

---

## Adding a New Course

1. Add an entry to `courses.json`:

```json
{ "id": "XYZ101", "title": "XYZ 101", "description": "Subject name here" }
```

2. Create the folder `courses/XYZ101/`.

3. Add five question bank files:
   `questions_XYZ101_A.json` through `questions_XYZ101_E.json`

4. Run the validator to catch any issues:

```bash
node validate-quizzes.cjs
```

5. Open the app — the new card will appear automatically.

---

## Validating Quiz Data

```bash
node validate-quizzes.cjs
```

The script checks:
- Every catalog entry in `courses.json` has a matching folder.
- Every folder in `courses/` appears in the catalogue.
- Every JSON file parses without errors.
- Every question has a non-empty text and at least 2 answers.
- Every question has exactly one correct answer.
- Every question bank contains exactly 20 questions (warns otherwise).

Exit code is `0` on success, `1` on errors.

---

## Tech Stack

| Layer   | Technology |
|---------|------------|
| Markup  | HTML5 with semantic elements and ARIA attributes |
| Style   | CSS3 with custom properties and `prefers-color-scheme` |
| Logic   | Vanilla JavaScript ES modules (no build step required) |
| Data    | JSON files |
| Hosting | GitHub Pages (static) |

---

## License

MIT — see [LICENSE](LICENSE).
