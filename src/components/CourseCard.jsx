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
            aria-label={"Start quiz for " + course.title}
            onClick={() => onSelect(course)}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </article>
  );
}
