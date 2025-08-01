import { useState, useEffect } from "react";

export default function Scores() {
  const [scores, setScores] = useState(() => {
    try {
      const stored = localStorage.getItem("scores");
      const parsed = stored ? JSON.parse(stored) : [];
      console.log("Loaded from localStorage:", parsed);
      return parsed;
    } catch (e) {
      console.error("Failed to parse scores from localStorage:", e);
      return [];
    }
  });

  const [form, setForm] = useState({ date: "", section: "Math", score: "" });

  // Save scores to localStorage whenever they change
  useEffect(() => {
    console.log("Saving to localStorage:", scores);
    localStorage.setItem("scores", JSON.stringify(scores));
  }, [scores]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.section || !form.score) return;
    const newScore = {
      id: crypto.randomUUID(),
      ...form,
      score: parseInt(form.score),
    };
    setScores([newScore, ...scores]);
    setForm({ date: "", section: "Math", score: "" });
  };

  const handleDelete = (id) => {
    setScores(scores.filter((s) => s.id !== id));
  };

  return (
    <div className="page">
      <h2>Score Tracker</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Section:
          <select
            name="section"
            value={form.section}
            onChange={handleChange}
          >
            <option>Math</option>
            <option>Reading</option>
            <option>Writing</option>
            <option>Full Test</option>
          </select>
        </label>
        <label>
          Score:
          <input
            type="number"
            name="score"
            value={form.score}
            onChange={handleChange}
            required
          />
        </label>
        <button
          type="submit"
          className="btn-primary"
          style={{ marginLeft: "1rem" }}
        >
          Add Score
        </button>
      </form>

      {scores.length === 0 ? (
        <p>No scores logged yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Date</th>
              <th>Section</th>
              <th>Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {scores.map(({ id, date, section, score }) => (
              <tr key={id}>
                <td>{date}</td>
                <td>{section}</td>
                <td>{score}</td>
                <td>
                  <button
                    onClick={() => handleDelete(id)}
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
