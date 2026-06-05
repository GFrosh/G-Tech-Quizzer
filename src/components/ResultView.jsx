function getPerformanceMessage(percentage) {
  if (percentage === 100)
    return { title: "Excellent work!", body: "You answered every question correctly." };
  if (percentage >= 80)
    return { title: "Strong result!", body: "You are very close to a perfect score." };
  if (percentage >= 60)
    return {
      title: "Solid attempt.",
      body: "You have a good foundation. Review the missed questions.",
    };
  if (percentage >= 40)
    return {
      title: "Keep practicing.",
      body: "You are getting there. Another pass through the material will help.",
    };
  return {
    title: "More revision needed.",
    body: "Spend time with the course material, then come back and try again.",
  };
}

export default function ResultView({ score, total, onExit }) {
  const percentage = Math.round((score / total) * 100);
  const msg = getPerformanceMessage(percentage);

  return (
    <section id="quiz" aria-label="Active quiz">
      <div id="result" role="status" aria-live="polite">
        <h2>{msg.title}</h2>
        <p>{msg.body}</p>
        <p className="result-score">
          Score: {score} / {total} ({percentage}%)
        </p>
        <button type="button" id="nextBtn" onClick={onExit}>
          Back to Courses
        </button>
      </div>
    </section>
  );
}
