// IMPORT STATEMENTS
import { Quiz } from "./quiz.js"



// SECTIONS
const intro = document.getElementById('course-intro');
const courseSection = document.getElementById('courses');
const preQuizSection = document.getElementById('preQuiz');
const quizSection = document.getElementById('quiz');

// DATA STORES
const questionContainer = document.getElementById('questionContainer');
const preTitle = document.getElementById('preTitle');
const preDesc = document.getElementById('preDesc');
const quizTitle = document.getElementById('title');

const type = () => {
  const types = ["A", "B", "C", "D", "E"];
  return types[Math.floor(Math.random() * types.length)];
}

// LOAD COURSES FUNCTION
async function loadCourses() {
    const res = await fetch('courses.json');
    const courses = await res.json();

    courseSection.innerHTML = "";

    courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-box";
        card.innerHTML = `
        <div class="card-inner">
        <div class="card-front">
        <h1>${course.title}</h1>
        <h3>${course.description}</h3>
        </div>
        <div class="card-back">
        <button data-id="${course.id}" data-title="${course.title}" data-description="${course.description}" class="card-btn">Start Quiz</button>
        </div>
        </div>
        `;
        courseSection.appendChild(card);
    });

    attachCourseListeners();
}


function attachCourseListeners() {
    document.querySelectorAll('.card-btn').forEach(button => button.addEventListener('click', (e) => {
    
        intro.classList.add("hidden");
        courseSection.classList.add("hidden");
        preQuizSection.classList.remove("hidden");
    
    
        const title = e.target.dataset.title;
        const description = e.target.dataset.description;
        const id = e.target.dataset.id;


        preTitle.innerText = title;
        preDesc.innerText = description;
        quizTitle.innerText = title;
        preQuizSection.dataset.courseId = id;
    }));
}




// Start Quiz Buttyon
document.getElementById('startBtn').addEventListener('click', () => {
    preQuizSection.classList.add("hidden");
    quizSection.classList.remove("hidden");

    const courseId = preQuizSection.dataset.courseId;
    loadQuestions(courseId);
})



document.getElementById('backToCourses').addEventListener('click', () => {
    quizSection.classList.add("hidden");
    intro.classList.remove("hidden");
    courseSection.classList.remove("hidden");
    
    
    
    // CLEAN PREQUIZ SLATE...
    preQuizSection.dataset.courseId = "";
    preTitle.innerText = "";
    preDesc.innerText = "";
    quizTitle.innerText = "";
});


// LOSD QUESTIONS
async function loadQuestions(courseId) {
    const path = `./courses/${courseId}/questions_${courseId}_${type()}.json`;
    console.log(path);
    Quiz(path);
}




loadCourses();