# Migrating G-Tech Quizzer to React

This guide walks you through converting the vanilla JS version of G-Tech Quizzer into a React application step by step. No prior React experience is assumed, but basic JavaScript knowledge is expected.

---

## Table of Contents

1. [Why React for this app](#why-react)
2. [Prerequisites](#prerequisites)
3. [Create the React project](#create-the-react-project)
4. [Copy quiz data across](#copy-quiz-data-across)
5. [Component architecture](#component-architecture)
6. [Phase 1 — Static scaffold](#phase-1--static-scaffold)
7. [Phase 2 — Course loading](#phase-2--course-loading)
8. [Phase 3 — Pre-quiz screen](#phase-3--pre-quiz-screen)
9. [Phase 4 — The quiz engine](#phase-4--the-quiz-engine)
10. [Phase 5 — Result screen](#phase-5--result-screen)
11. [Phase 6 — Migrate the CSS](#phase-6--migrate-the-css)
12. [Phase 7 — Routing (optional)](#phase-7--routing-optional)
13. [Deployment to GitHub Pages](#deployment-to-github-pages)
14. [Mapping current code to React equivalents](#mapping-current-code-to-react-equivalents)

---

## Why React

The vanilla version already works well. React becomes worth the investment when:

- You want URL-based navigation so users can bookmark a specific quiz.
- You want to add features like a score history, a user account, or drill-down practice on missed questions.
- You are more comfortable thinking in components than in direct DOM manipulation.

The data layer (`courses.json` and the quiz JSON files) does **not** change. React only replaces the rendering and state management.

---

## Prerequisites

```bash
node --version   # 18 or later recommended
npm --version    # 9 or later
```

If you do not have Node.js, download it from [nodejs.org](https://nodejs.org).

---

## Create the React project

Use Vite — it is faster and simpler than Create React App for a project this size.

```bash
# Run this in the same parent folder that contains G-Tech-Quizzer/
npm create vite@latest G-Tech-Quizzer-React -- --template react
cd G-Tech-Quizzer-React
npm install
npm run dev
```

Open `http://localhost:5173` to confirm the starter app loads.

**Directory layout you will end up with:**

```
G-Tech-Quizzer-React/
├── public/
│   ├── courses.json          ← copy from original project
│   └── courses/              ← copy from original project
│       └── <COURSE_ID>/
│           └── questions_*.json
├── src/
│   ├── components/           ← you will create this
│   ├── App.jsx
│   ├── App.css               ← adapted from style.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## Copy quiz data across

```bash
# From inside G-Tech-Quizzer-React/
cp ../G-Tech-Quizzer/courses.json public/courses.json
cp -r ../G-Tech-Quizzer/courses public/courses
```

Vite serves everything in `public/` at the root URL, so `fetch("courses.json")` and
`fetch("./courses/COS202/questions_COS202_A.json")` will resolve exactly as before.

---

## Component architecture

```
App
├── HeroHeader
├── StatusBanner
├── CourseList               (view: "courses")
│   └── CourseCard × N
├── PreQuizScreen            (view: "preQuiz")
└── QuizScreen               (view: "quiz")
    ├── QuestionView
    │   └── AnswerButton × N
    └── ResultView
```

`App` owns the top-level `view` state and passes down callbacks as props.

---

## Phase 1 — Static scaffold

Delete everything inside `src/` and start fresh.

**`src/main.jsx`**

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**`src/App.jsx`**

```jsx
import { useState } from "react";

export default function App() {
  // "courses" | "preQuiz" | "quiz"
  const [view, setView] = useState("courses");

  return (
    <>
      <header id="hero">
        <div className="hero-text">
          <h1>G-Tech Quizzer App</h1>
          <h2>Challenge your mind. Expand your knowledge</h2>
        </div>
      </header>

      <main className="main">
        {view === "courses" && <p>Course list will go here</p>}
        {view === "preQuiz" && <p>Pre-quiz screen will go here</p>}
        {view === "quiz"    && <p>Quiz screen will go here</p>}
      </main>

      <footer>
        <p>&copy; 2026 G-TECH | All Rights Reserved</p>
      </footer>
    </>
  );
}
```

Run `npm run dev` and confirm the page renders without errors.

---

## Phase 2 — Course loading

**`src/components/CourseList.jsx`**

```jsx
import { useState, useEffect } from "react";
import CourseCard from "./CourseCard.jsx";

export default function CourseList({ onSelectCourse }) {
  const [courses, setCourses]   = useState([]);
  const [status,  setStatus]    = useState({ message: "Loading courses...", type: "info" });

  useEffect(() => {
    fetch("courses.json")
      .then((res) => {
        if (!res.ok) throw new Error("Received " + res.status);
        return res.json();
      })
      .then((data) => {
        setCourses(data);
        setStatus({ message: `Loaded ${data.length} courses.`, type: "success" });
      })
      .catch((err) => {
        setStatus({ message: "Could not load courses: " + err.message, type: "error" });
      });
  }, []);

  return (
    <>
      <p className={"status-banner status-" + status.type}>{status.message}</p>
      <div id="courses">
        {courses.map((course, i) => (
          <CourseCard key={course.id} course={course} index={i} onSelect={onSelectCourse} />
        ))}
      </div>
    </>
  );
}
```

**`src/components/CourseCard.jsx`**

```jsx
export default function CourseCard({ course, index, onSelect }) {
  return (
    <article
      className="course-box"
      style={{ "--stagger-index": index + 1 }}
    >
      <div className="card-inner">
        <div className="card-front">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>
        <div className="card-back">
          <button
            type="button"
            className="card-btn"
            aria-label={`Start quiz for ${course.title}`}
            onClick={() => onSelect(course)}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </article>
  );
}
```

Update `App.jsx` to wire up the state:

```jsx
// Inside App():
const [selectedCourse, setSelectedCourse] = useState(null);

function handleSelectCourse(course) {
  setSelectedCourse(course);
  setView("preQuiz");
}

// Replace the courses branch:
{view === "courses" && (
  <CourseList onSelectCourse={handleSelectCourse} />
)}
```

---

## Phase 3 — Pre-quiz screen

**`src/components/PreQuizScreen.jsx`**

```jsx
import { useState, useEffect } from "react";

const VARIANTS = ["A", "B", "C", "D", "E"];

export default function PreQuizScreen({ course, onStart, onBack }) {
  const [quizData, setQuizData] = useState(null);
  const [variant,  setVariant]  = useState(null);
  const [status,   setStatus]   = useState({ message: "Loading...", type: "info" });

  useEffect(() => {
    const v    = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    const path = `./courses/${course.id}/questions_${course.id}_${v}.json`;

    setVariant(v);
    setStatus({ message: "Preparing variant " + v + "...", type: "info" });

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error("Received " + res.status);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Quiz file is empty or malformed.");
        }
        setQuizData(data);
        setStatus({ message: `Variant ${v} — ${data.length} questions ready.`, type: "success" });
      })
      .catch((err) => {
        setStatus({ message: "Could not load quiz: " + err.message, type: "error" });
      });
  }, [course]);

  return (
    <section id="preQuiz">
      <h1>{course.title}</h1>
      <h2>{course.description}</h2>
      <p className={"status-banner status-" + status.type}>{status.message}</p>
      <button type="button" onClick={onBack}>Back to Courses</button>
      <button
        type="button"
        disabled={!quizData}
        onClick={() => quizData && onStart(quizData)}
      >
        {quizData ? "Begin Quiz" : "Loading..."}
      </button>
    </section>
  );
}
```

---

## Phase 4 — The quiz engine

**`src/components/QuizScreen.jsx`**

```jsx
import { useState } from "react";
import ResultView from "./ResultView.jsx";

export default function QuizScreen({ courseTitle, quizData, onExit }) {
  const [index,    setIndex]    = useState(0);
  const [score,    setScore]    = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [done,     setDone]     = useState(false);

  const question = quizData[index];
  const isLast   = index === quizData.length - 1;

  function handleAnswer(answer) {
    if (answered) return;
    setAnswered(true);
    setSelected(answer);
    if (answer.correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (isLast) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setAnswered(false);
      setSelected(null);
    }
  }

  if (done) {
    return <ResultView score={score} total={quizData.length} onExit={onExit} />;
  }

  return (
    <section id="quiz">
      <h1>{courseTitle}</h1>
      <div id="questionContainer">
        <h2 id="questions">{question.question}</h2>
        <p id="progress">Question {index + 1} of {quizData.length}</p>
        <div id="options" role="group" aria-label="Available answers">
          {question.answers.map((answer, i) => {
            let cls = "";
            if (answered) {
              if (answer.correct)                 cls = "correct";
              else if (answer === selected)        cls = "wrong";
            }
            return (
              <button
                key={i}
                type="button"
                className={cls}
                disabled={answered}
                onClick={() => handleAnswer(answer)}
              >
                {answer.text}
              </button>
            );
          })}
        </div>
      </div>
      {answered && (
        <button type="button" id="nextBtn" onClick={handleNext}>
          {isLast ? "Finish Quiz" : "Next Question"}
        </button>
      )}
    </section>
  );
}
```

---

## Phase 5 — Result screen

**`src/components/ResultView.jsx`**

```jsx
function getMsg(pct) {
  if (pct === 100) return { title: "Excellent work!",       body: "You answered every question correctly." };
  if (pct >= 80)   return { title: "Strong result!",        body: "Very close to a perfect score." };
  if (pct >= 60)   return { title: "Solid attempt.",        body: "Good foundation — review the missed questions." };
  if (pct >= 40)   return { title: "Keep practicing.",      body: "Another pass through the material will help." };
  return           { title: "More revision needed.",         body: "Revisit the course content and try again." };
}

export default function ResultView({ score, total, onExit }) {
  const pct = Math.round((score / total) * 100);
  const msg = getMsg(pct);

  return (
    <div id="result" role="status" aria-live="polite">
      <h2>{msg.title}</h2>
      <p>{msg.body}</p>
      <p className="result-score">Score: {score} / {total} ({pct}%)</p>
      <button type="button" onClick={onExit}>Back to Courses</button>
    </div>
  );
}
```

---

## Phase 6 — Migrate the CSS

Copy `style.css` from the original project into `src/App.css`. The only changes needed:

1. In `index.html`, remove the `<link rel="stylesheet">` tag — Vite injects the CSS from the import in `main.jsx`.
2. All class names (e.g. `.course-box`, `.card-inner`) are the same, so no renaming is required.
3. The `prefers-color-scheme` section works unchanged.
4. The `--stagger-index` CSS custom property is set inline in `CourseCard.jsx` — no further changes.

---

## Phase 7 — Routing (optional)

If you want each view to have its own URL (e.g. `/quiz/COS202`), install React Router:

```bash
npm install react-router-dom
```

Replace the `view` state in `App.jsx` with `<Routes>`:

```jsx
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

// Wrap everything in <BrowserRouter> in main.jsx, then in App.jsx:
<Routes>
  <Route path="/"              element={<CourseList ... />} />
  <Route path="/course/:id"    element={<PreQuizScreen ... />} />
  <Route path="/quiz/:id"      element={<QuizScreen ... />} />
</Routes>
```

Use `useNavigate()` instead of calling `setView(...)`.

---

## Deployment to GitHub Pages

Vite builds into a `dist/` folder. For GitHub Pages you need to set the `base` path.

1. In `vite.config.js`, set the base to your repo name:

```js
export default {
  base: "/G-Tech-Quizzer-React/",
};
```

2. Install the gh-pages helper:

```bash
npm install --save-dev gh-pages
```

3. Add scripts to `package.json`:

```json
"scripts": {
  "build": "vite build",
  "deploy": "npm run build && gh-pages -d dist"
}
```

4. Run:

```bash
npm run deploy
```

The app will be live at `https://<your-username>.github.io/G-Tech-Quizzer-React/`.

---

## Mapping current code to React equivalents

| Vanilla JS concept | React equivalent |
|--------------------|-----------------|
| `let view = "courses"` + `classList.toggle("hidden", ...)` | `const [view, setView] = useState("courses")` + conditional JSX rendering |
| `document.getElementById(...)` | Props passed to child components; no direct DOM access needed |
| `element.textContent = ...` | JSX expression `{variable}` |
| `element.replaceChildren(...)` | React re-renders the correct children automatically when state changes |
| `element.addEventListener(...)` | `onClick={handler}` directly in JSX |
| `fetch` inside `loadCourses()` | `fetch` inside `useEffect(() => { ... }, [])` in `CourseList` |
| `Quiz({ quizData, onExit })` function | `<QuizScreen quizData={...} onExit={...} />` component |
| `async function prepareQuiz(course)` | `useEffect` in `PreQuizScreen` triggered when `course` prop changes |
| Global `state` object | State values spread across component `useState` hooks |
| `setStatus(message, type)` | Pass a `setStatus` prop, or lift it into a shared context |
| CSS `:nth-child` stagger delays | `style={{ "--stagger-index": index + 1 }}` on each card |
| `validate-quizzes.cjs` | Can be kept as-is and run before every `npm run deploy` |
