import { useState, useEffect } from "react";
import StatusBanner from "./StatusBanner.jsx";

const VARIANTS = ["A", "B", "C", "D", "E"];

export default function PreQuizScreen({ course, onStart, onBack }) {
	const [quizData, setQuizData] = useState(null);
	const [variant, setVariant] = useState(null);
	const [status, setStatus] = useState({ message: "Loading...", type: "info" });

	useEffect(() => {
		const v =
		VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
		const path =
		"./courses/" +
		course.id +
		"/questions_" +
		course.id +
		"_" +
		v +
		".json";

		setVariant(v);
		setQuizData(null);
		setStatus({ message: "Loading variant " + v + "...", type: "info" });

		fetch(path)
		.then((res) => {
			if (!res.ok)
			throw new Error("Received " + res.status + " " + res.statusText);
			return res.json();
		})
		.then((data) => {
			if (!Array.isArray(data) || data.length === 0) {
			throw new Error("Quiz file is empty or malformed.");
			}
			data.forEach(function (q, i) {
			if (
				!q ||
				typeof q.question !== "string" ||
				!Array.isArray(q.answers) ||
				q.answers.length < 2
			) {
				throw new Error(
				course.title + " question " + (i + 1) + " is malformed."
				);
			}
			const correct = q.answers.filter((a) => a.correct === true);
			if (correct.length !== 1) {
				throw new Error(
				course.title +
					" question " +
					(i + 1) +
					" must have exactly one correct answer."
				);
			}
			});
			setQuizData(data);
			setStatus({
				message:
					"Variant " + v + " \u2014 " + data.length + " questions ready.",
				type: "success"
			});
		})
		.catch((err) => {
			setStatus({
				message: "Could not load quiz: " + err.message,
				type: "error"
			});
		});
	}, [course]);

	return (
		<section id="preQuiz" aria-label="Quiz preparation">
		<h1>{course.title}</h1>
		<h2>{course.description}</h2>
		<p>
			{
			quizData
				? "Variant " + variant + "  " + quizData.length + " questions."
				: status.type === "error"
					? "This quiz could not be prepared. Try another course."
					: "Loading quiz details..."
			}
		</p>
		<StatusBanner message={status.message} type={status.type} />
		<button type="button" onClick={onBack}>
			Back to Courses
		</button>
		<button
			type="button"
			disabled={!quizData}
			onClick={() => quizData && onStart(quizData)}
		>
			{quizData ? "Begin Quiz" : status.type === "error" ? "Unavailable" : "Loading..."}
		</button>
		</section>
	);
}
