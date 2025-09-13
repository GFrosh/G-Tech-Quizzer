export const Quiz = async (sub) => {
    


    // FETCH QUESTIONS FROM JSON FILE
    const res = await fetch(sub);
    let quizData = await res.json();


    // INITIALIZE COUNT VARIABLES
    let index = 0;
    let score = 0;
    let answered = 1;



    // GET HTMLCollection (BUTTONS/DIVS...)
    const questionsContainer = document.getElementById('questionContainer');
    const questions = document.getElementById("questions");
    const progress = document.getElementById("progress");
    const optionsDiv = document.getElementById("options");
    const nextBtn = document.getElementById("nextBtn");
    const result = document.getElementById("result");

    const courseSection = document.getElementById('courses');
    const preQuizSection = document.getElementById('preQuiz');
    const quizSection = document.getElementById('quiz');



    // DISPLAY A QUESTION AND ITS OPTIONS
    function displayQuestion() {
        // CLEAR CACHE
        resetQuestion();


        // GET AND SHOW QUESTIONS ONE BY ONE
        // STARTING FROM INDEX 0
        let currentQuestion = quizData[index];
        questions.innerHTML = currentQuestion.question;


        // SHOW PROGRESS
        progress.textContent = `Question: ${answered} of ${quizData.length}`;
    

        // GET AND SHOW AVAILABLE OPTIONS
        currentQuestion.answers.forEach(answer => {
            let button = document.createElement("button");
            button.textContent = answer.text;
        
            optionsDiv.appendChild(button);
            button.addEventListener("click", () => selectOption(button, answer.correct));
        });
    }



    // PREPARE DIV FOR THE displayQuestion() func
    function resetQuestion() {
        optionsDiv.innerHTML = "";
        nextBtn.classList.add("hidden");
    }



    // MARK SELECTED OPTION AND DISPLAYS NEXT BUTTON
    function selectOption(button, correct) {
    
        nextBtn.classList.remove("hidden");
    
        if (correct) {
            button.classList.add("correct");
            score++;
        } else {
            button.classList.add("wrong");
        }


        Array.from(optionsDiv.children).forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === quizData[index].answers.find(a => a.correct).text) {
                btn.classList.add("correct");
            }
        });
    }



    // LOAD NEXT QUESTION SET
    nextBtn.onclick = () => {
            index++;
            answered++;
            if (index < quizData.length) {
                displayQuestion();
            } else if (index === quizData.length) {
                nextBtn.innerText = "Finish";
                showResult();
            }
        }


    // GRADING FUNCTIONALITY
    function grading(score, overall, report) {
        let percentage = (score / overall.length) * 100;
    
        
        if (percentage <= 25) {
            report.innerHTML = `<h2>Olodo Rapata!</h2>
            <h2>You can do better....or not</h2>
            <h2>Your Score: ${score} / ${overall.length}</h2>`;
        } else if (percentage > 25 && percentage <= 50) {
            report.innerHTML = `<h2>Nice Try! There's room for improvement</h2>
            <h2>Your Score: ${score} / ${overall.length}</h2>`;
        } else if (percentage > 50 && percentage <= 75) {
            report.innerHTML = `<h2>Better luck next time. Consistency is key.</h2>
            <h2>Your Score: ${score} / ${overall.length}</h2>`;
        }
        else if (percentage > 75 && percentage <= 99.9) {
            report.innerHTML = `<h2>Close Enough!</h2>
            <h2>Your Score: ${score} / ${overall.length}</h2>`;
        } else {
            report.innerHTML = `<h2>Perfection! Or so you'd think</h2>
            <h2>Your Score: ${score} / ${overall.length}</h2>`;
        }
    }





    // DISPLAY RESULT AFTER QUIZ COMPLETION
    function showResult() {
        questionsContainer.classList.add("hidden");
        result.classList.remove("hidden");

        grading(score, quizData, result);
        
        nextBtn.textContent = "End Quiz";
        nextBtn.onclick = () => {
            quizSection.classList.add("hidden");
            courseSection.classList.remove("hidden");
        };
        
    }



    // QUIZ RESET FUNCTUON
    function resetQuiz() {
        index = 0;
        score = 0;
        answered = 1;
    
        result.innerHTML = "";
        nextBtn.innerText = "Next";
        nextBtn.classList.add("hidden");
    
        // RESTORE INITIAL VISIBILITY STATUS
        questionsContainer.classList.remove("hidden");
        result.classList.add("hidden");
    }
    



    // CLEAN SLATE
    resetQuiz();


    // START QUIZ
    displayQuestion();
}