import { Quiz } from "./quiz.js";

const quizVariants = ["A", "B", "C", "D", "E"];

const state = {
    courses: [],
    selectedCourse: null,
    selectedQuiz: null
};

const el = {
    intro: document.getElementById("course-intro"),
    courseSection: document.getElementById("courses"),
    preQuizSection: document.getElementById("preQuiz"),
    quizSection: document.getElementById("quiz"),
    preTitle: document.getElementById("preTitle"),
    preDesc: document.getElementById("preDesc"),
    preMeta: document.getElementById("preMeta"),
    quizTitle: document.getElementById("title"),
    startButton: document.getElementById("startBtn"),
    backButton: document.getElementById("backToCourses"),
    nextButton: document.getElementById("nextBtn"),
    result: document.getElementById("result"),
    statusMessage: document.getElementById("statusMessage")
};

function pickRandomVariant() {
    return quizVariants[Math.floor(Math.random() * quizVariants.length)];
}

function setStatus(message, type) {
    if (!message) {
        el.statusMessage.textContent = "";
        el.statusMessage.className = "status-banner hidden";
        return;
    }
    el.statusMessage.textContent = message;
    el.statusMessage.className = "status-banner status-" + (type || "info");
}

function showView(view) {
    el.intro.classList.toggle("hidden", view !== "courses");
    el.courseSection.classList.toggle("hidden", view !== "courses");
    el.preQuizSection.classList.toggle("hidden", view !== "preQuiz");
    el.quizSection.classList.toggle("hidden", view !== "quiz");
}

function resetSelection() {
    state.selectedCourse = null;
    state.selectedQuiz = null;
    el.preTitle.textContent = "Course Title";
    el.preDesc.textContent = "Course Description";
    el.preMeta.textContent = "Loading quiz details...";
    el.quizTitle.textContent = "Course Title";
    el.startButton.disabled = true;
    el.startButton.textContent = "Begin Quiz";
    el.nextButton.classList.add("hidden");
    el.result.classList.add("hidden");
    el.result.replaceChildren();
}

function showCoursesView() {
    resetSelection();
    showView("courses");
    setStatus("");
}

async function fetchJson(path, contextMessage) {
    let response;
    try {
        response = await fetch(path);
    } catch {
        throw new Error(contextMessage + ". The request could not reach the file.");
    }
    if (!response.ok) {
        throw new Error(contextMessage + ". Received " + response.status + " " + response.statusText + ".");
    }
    try {
        return await response.json();
    } catch {
        throw new Error(contextMessage + ". The JSON file is malformed.");
    }
}

function validateCourse(course) {
    return Boolean(course && course.id && course.title && course.description);
}

function validateQuizData(quizData, courseTitle) {
    if (!Array.isArray(quizData) || quizData.length === 0) {
        throw new Error(courseTitle + " has no quiz questions available.");
    }
    quizData.forEach(function(q, i) {
        if (!q || typeof q.question !== "string" || !Array.isArray(q.answers) || q.answers.length < 2) {
            throw new Error(courseTitle + " question " + (i + 1) + " is malformed.");
        }
        var correct = q.answers.filter(function(a) { return a.correct === true; });
        if (correct.length !== 1) {
            throw new Error(courseTitle + " question " + (i + 1) + " must have exactly one correct answer.");
        }
    });
}

function buildCourseCard(course, index) {
    var card = document.createElement("article");
    card.className = "course-box";
    card.style.setProperty("--stagger-index", index + 1);

    var inner = document.createElement("div");
    inner.className = "card-inner";

    var front = document.createElement("div");
    front.className = "card-front";

    var titleEl = document.createElement("h3");
    titleEl.textContent = course.title;

    var descEl = document.createElement("p");
    descEl.textContent = course.description;

    var back = document.createElement("div");
    back.className = "card-back";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card-btn";
    btn.textContent = "Start Quiz";
    btn.setAttribute("aria-label", "Start quiz for " + course.title);
    btn.addEventListener("click", function() { prepareQuiz(course); });

    front.append(titleEl, descEl);
    back.appendChild(btn);
    inner.append(front, back);
    card.appendChild(inner);
    return card;
}

function renderCourses(courses) {
    el.courseSection.replaceChildren();
    if (courses.length === 0) {
        var empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No courses are currently available.";
        el.courseSection.appendChild(empty);
        return;
    }
    var fragment = document.createDocumentFragment();
    courses.forEach(function(course, i) {
        fragment.appendChild(buildCourseCard(course, i));
    });
    el.courseSection.appendChild(fragment);
}

async function loadCourses() {
    el.courseSection.setAttribute("aria-busy", "true");
    setStatus("Loading courses...", "info");
    try {
        var courses = await fetchJson("courses.json", "Unable to load the course catalogue");
        var valid = courses.filter(validateCourse);
        state.courses = valid;
        renderCourses(valid);
        setStatus("Loaded " + valid.length + " course" + (valid.length === 1 ? "" : "s") + ". Select one to start.", "success");
    } catch (err) {
        renderCourses([]);
        setStatus(err.message, "error");
    } finally {
        el.courseSection.removeAttribute("aria-busy");
    }
}

async function prepareQuiz(course) {
    var variant = pickRandomVariant();
    var path = "./courses/" + course.id + "/questions_" + course.id + "_" + variant + ".json";

    state.selectedCourse = course;
    state.selectedQuiz = null;

    el.preTitle.textContent = course.title;
    el.preDesc.textContent = course.description;
    el.preMeta.textContent = "Loading variant " + variant + "...";
    el.quizTitle.textContent = course.title;
    el.startButton.disabled = true;
    el.startButton.textContent = "Loading...";

    showView("preQuiz");
    setStatus("Preparing " + course.title + ".", "info");

    try {
        var quizData = await fetchJson(path, "Unable to load " + course.title);
        validateQuizData(quizData, course.title);

        state.selectedQuiz = { variant: variant, quizData: quizData };

        el.preMeta.textContent = "Variant " + variant + "  " + quizData.length + " questions.";
        el.startButton.disabled = false;
        el.startButton.textContent = "Begin Quiz";
        setStatus(course.title + " is ready. Click Begin Quiz to start.", "success");
    } catch (err) {
        el.preMeta.textContent = "This quiz could not be prepared. Try another course.";
        el.startButton.disabled = true;
        el.startButton.textContent = "Unavailable";
        setStatus(err.message, "error");
    }
}

function startSelectedQuiz() {
    if (!state.selectedCourse || !state.selectedQuiz) {
        setStatus("Wait for the quiz to finish loading.", "error");
        return;
    }
    showView("quiz");
    Quiz({
        courseTitle: state.selectedCourse.title,
        quizData: state.selectedQuiz.quizData,
        onExit: showCoursesView,
        setStatus: setStatus
    });
}

el.startButton.addEventListener("click", startSelectedQuiz);
el.backButton.addEventListener("click", showCoursesView);

resetSelection();
showView("courses");
loadCourses();