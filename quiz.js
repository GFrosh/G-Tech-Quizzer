function getPerformanceMessage(percentage) {
    if (percentage === 100) {
        return { title: "Excellent work!", body: "You answered every question correctly." };
    }
    if (percentage >= 80) {
        return { title: "Strong result!", body: "You are very close to a perfect score." };
    }
    if (percentage >= 60) {
        return { title: "Solid attempt.", body: "You have a good foundation. Review the missed questions." };
    }
    if (percentage >= 40) {
        return { title: "Keep practicing.", body: "You are getting there. Another pass through the material will help." };
    }
    return { title: "More revision needed.", body: "Spend time with the course material, then come back and try again." };
}

function buildResultView(resultEl, score, total) {
    var percentage = Math.round((score / total) * 100);
    var msg = getPerformanceMessage(percentage);

    var titleEl = document.createElement("h2");
    titleEl.textContent = msg.title;

    var bodyEl = document.createElement("p");
    bodyEl.textContent = msg.body;

    var scoreEl = document.createElement("p");
    scoreEl.className = "result-score";
    scoreEl.textContent = "Score: " + score + " / " + total + " (" + percentage + "%)";

    resultEl.replaceChildren(titleEl, bodyEl, scoreEl);
}

export function Quiz(options) {
    var quizData = options.quizData;
    var courseTitle = options.courseTitle;
    var onExit = options.onExit;
    var setStatus = options.setStatus;

    var index = 0;
    var score = 0;

    var questionsContainer = document.getElementById("questionContainer");
    var questionsEl = document.getElementById("questions");
    var progressEl = document.getElementById("progress");
    var optionsDiv = document.getElementById("options");
    var nextBtn = document.getElementById("nextBtn");
    var resultEl = document.getElementById("result");

    function resetQuestion() {
        optionsDiv.replaceChildren();
        nextBtn.classList.add("hidden");
        nextBtn.textContent = index === quizData.length - 1 ? "Finish Quiz" : "Next Question";
    }

    function disableOptions(correctText) {
        Array.from(optionsDiv.children).forEach(function(btn) {
            btn.disabled = true;
            if (btn.textContent === correctText) {
                btn.classList.add("correct");
            }
        });
    }

    function selectOption(button, correct) {
        nextBtn.classList.remove("hidden");
        if (correct) {
            button.classList.add("correct");
            score += 1;
        } else {
            button.classList.add("wrong");
        }
        var correctAnswer = quizData[index].answers.find(function(a) { return a.correct; });
        disableOptions(correctAnswer.text);
        nextBtn.focus();
    }

    function displayQuestion() {
        var q = quizData[index];
        resetQuestion();
        questionsEl.textContent = q.question;
        progressEl.textContent = "Question " + (index + 1) + " of " + quizData.length;
        q.answers.forEach(function(answer) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = answer.text;
            btn.addEventListener("click", function() { selectOption(btn, answer.correct); });
            optionsDiv.appendChild(btn);
        });
    }

    function showResult() {
        questionsContainer.classList.add("hidden");
        resultEl.classList.remove("hidden");
        buildResultView(resultEl, score, quizData.length);

        nextBtn.classList.remove("hidden");
        nextBtn.textContent = "Back to Courses";
        nextBtn.onclick = function() {
            if (typeof onExit === "function") { onExit(); }
        };
        nextBtn.focus();

        if (typeof setStatus === "function") {
            setStatus(courseTitle + " completed. Score: " + score + " / " + quizData.length + ".", "success");
        }
    }

    function handleNext() {
        if (index < quizData.length - 1) {
            index += 1;
            displayQuestion();
        } else {
            showResult();
        }
    }

    // Initialise
    questionsContainer.classList.remove("hidden");
    resultEl.classList.add("hidden");
    resultEl.replaceChildren();
    nextBtn.classList.add("hidden");
    nextBtn.onclick = handleNext;

    displayQuestion();

    if (typeof setStatus === "function") {
        setStatus(courseTitle + " started  " + quizData.length + " questions. Good luck!", "info");
    }
}