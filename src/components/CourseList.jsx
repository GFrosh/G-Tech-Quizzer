import { useState, useEffect } from "react";
import CourseCard from "./CourseCard.jsx";
import StatusBanner from "./StatusBanner.jsx";

export default function CourseList({ onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState({ message: "Loading courses...", type: "info" });

  useEffect(() => {
    fetch("courses.json")
      .then((res) => {
        if (!res.ok) throw new Error("Received " + res.status + " " + res.statusText);
        return res.json();
      })
      .then((data) => {
        const valid = data.filter(
          (c) => c && c.id && c.title && c.description
        );
        setCourses(valid);
        setStatus({
          message:
            "Loaded " +
            valid.length +
            " course" +
            (valid.length === 1 ? "" : "s") +
            ". Select one to start.",
          type: "success",
        });
      })
      .catch((err) => {
        setStatus({
          message: "Unable to load the course catalogue. " + err.message,
          type: "error",
        });
      });
  }, []);

  return (
    <>
      <section id="course-intro">
        <h1>Our Available Courses</h1>
        <h4>Select a course to begin the quiz!</h4>
      </section>

      <StatusBanner message={status.message} type={status.type} />

      <section id="courses" aria-label="Available courses">
        {courses.length === 0 && status.type === "success" ? (
          <p className="empty-state">No courses are currently available.</p>
        ) : (
          courses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              onSelect={onSelectCourse}
            />
          ))
        )}
      </section>
    </>
  );
}
