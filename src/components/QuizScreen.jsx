import { useState } from "react";
import ResultView from "./ResultView.jsx";

export default function QuizScreen({ courseTitle, quizData, onExit }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);

  const question = quizData[index];
  const isLast = index === quizData.length - 1;

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
    return (
      <ResultView score={score} total={quizData.length} onExit={onExit} />
    );
  }

  return (
    <section id="quiz" aria-label="Active quiz">
      <h1>{courseTitle}</h1>
      <div id="questionContainer">
        <h2 id="questions">{question.question}</h2>
        <p id="progress">
          Question {index + 1} of {quizData.length}
        </p>
        <div id="options" role="group" aria-label="Available answers">
          {question.answers.map((answer, i) => {
            let cls = "";
            if (answered) {
              if (answer.correct) cls = "correct";
              else if (answer === selected) cls = "wrong";
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
