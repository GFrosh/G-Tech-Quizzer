export default function StatusBanner({ message, type }) {
  if (!message) return null;
  return (
    <section
      className={"status-banner status-" + type}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </section>
  );
}
