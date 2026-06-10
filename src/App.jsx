import { useState } from "react";
import CourseList from "./components/CourseList.jsx";
import PreQuizScreen from "./components/PreQuizScreen.jsx";
import QuizScreen from "./components/QuizScreen.jsx";

export default function App() {
	// "courses" | "preQuiz" | "quiz"
	const [view, setView] = useState("courses");
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [quizData, setQuizData] = useState(null);

	function handleSelectCourse(course) {
		setSelectedCourse(course);
		setView("preQuiz");
	}

	function handleStartQuiz(data) {
		setQuizData(data);
		setView("quiz");
	}

	function handleBackToCourses() {
		setSelectedCourse(null);
		setQuizData(null);
		setView("courses");
	}

	return (
		<>
		<header id="hero">
			<div className="hero-text">
			<h1>G-Tech Quizzer App</h1>
			<h2>Challenge your mind. Expand your knowledge</h2>
			<p>
				Welcome to our Quiz Application - an interactive platform built to
				test knowledge, encourage learning, and make quizzes more accessible
				than ever. With different courses, instant results, and a
				user-friendly design, our app is crafted for learners, students, and
				curious minds alike.
			</p>
			</div>
		</header>

		<main className="main">
			<noscript>
			<p className="status-banner status-error">
				JavaScript is required to use this application.
			</p>
			</noscript>

			{view === "courses" && (
			<CourseList onSelectCourse={handleSelectCourse} />
			)}

			{view === "preQuiz" && selectedCourse && (
			<PreQuizScreen
				course={selectedCourse}
				onStart={handleStartQuiz}
				onBack={handleBackToCourses}
			/>
			)}

			{view === "quiz" && selectedCourse && quizData && (
			<QuizScreen
				courseTitle={selectedCourse.title}
				quizData={quizData}
				onExit={handleBackToCourses}
			/>
			)}
		</main>

		<footer>
			<p>&copy; {new Date().getFullYear()} G-TECH | All Rights Reserved</p>
		</footer>
		</>
	);
}
