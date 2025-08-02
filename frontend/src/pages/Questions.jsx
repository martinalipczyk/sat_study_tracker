// ✅ Revamped Questions.jsx with collapsible filter section
import { useEffect, useState } from "react";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [onlyUnreviewed, setOnlyUnreviewed] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wrongQuestions") || "[]");
    setQuestions(stored);
    const tags = new Set();
    stored.forEach(q => q.tags?.forEach(tag => tags.add(tag)));
    setAvailableTags([...tags]);
  }, []);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleReviewed = (id) => {
    const updated = questions.map(q =>
      q.id === id ? { ...q, reviewed: !q.reviewed } : q
    );
    setQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));
  };

  const handleTagEdit = (id, newTags) => {
    const updated = questions.map(q =>
      q.id === id ? { ...q, tags: newTags.split(",").map(t => t.trim()).filter(Boolean) } : q
    );
    setQuestions(updated);
    localStorage.setItem("wrongQuestions", JSON.stringify(updated));
    setEditingTagId(null);
  };

  const filtered = questions.filter(q => {
    const matchesReview = onlyUnreviewed ? !q.reviewed : true;
    const matchesTag = selectedTag ? q.tags?.includes(selectedTag) : true;
    const matchesTest = selectedTest ? q.testName === selectedTest : true;
    const matchesSection = selectedSection ? q.section === selectedSection : true;
    return matchesReview && matchesTag && matchesTest && matchesSection;
  });

  const allTests = [...new Set(questions.map(q => q.testName))];
  const allSections = [...new Set(questions.map(q => q.section))];

  return (
    <div className="page" style={{ maxWidth: "900px", margin: "auto", padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem", fontSize: "2rem" }}>📚 Review Questions</h2>

      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          cursor: "pointer"
        }}
      >
        {showFilters ? "▲ Hide Filters" : "▼ Show Filters"}
      </button>

      {showFilters && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem 2rem",
            alignItems: "center",
            marginBottom: "2rem",
            border: "1px solid #eee",
            padding: "1rem",
            borderRadius: "10px",
            background: "#fdfdfd"
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={onlyUnreviewed}
              onChange={() => setOnlyUnreviewed(!onlyUnreviewed)}
            />
            Show only unreviewed
          </label>

          <label>
            Filter by tag:
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
            >
              <option value="">All</option>
              {availableTags.map((tag, i) => (
                <option key={i} value={tag}>{tag}</option>
              ))}
            </select>
          </label>

          <label>
            Filter by test:
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
            >
              <option value="">All</option>
              {allTests.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>
            Filter by section:
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
            >
              <option value="">All</option>
              {allSections.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {filtered.length === 0 ? (
        <p style={{ fontStyle: "italic" }}>No questions to show.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map((q) => (
            <li
              key={q.id}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                background: q.reviewed ? "#f9f9f9" : "#fff"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><strong>{q.section}</strong>: {q.question}</div>
                <button onClick={() => toggleExpand(q.id)} style={{ fontSize: "1.2rem", background: "none", border: "none", cursor: "pointer" }}>
                  {expanded[q.id] ? "▲" : "▼"}
                </button>
              </div>

              {q.tags?.length > 0 && (
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {q.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: "#e3f2fd",
                        color: "#0d47a1",
                        borderRadius: "999px",
                        padding: "4px 10px",
                        fontSize: "0.75rem"
                      }}
                    >{tag}</span>
                  ))}
                </div>
              )}

              {expanded[q.id] && (
                <div style={{ marginTop: "0.75rem", lineHeight: "1.5" }}>
                  <p><strong>Your Answer:</strong> {q.userAnswer}</p>
                  <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                </div>
              )}

              {editingTagId === q.id ? (
                <input
                  autoFocus
                  defaultValue={q.tags?.join(", ") || ""}
                  onBlur={(e) => handleTagEdit(q.id, e.target.value)}
                  placeholder="Edit tags..."
                  style={{ marginTop: "0.5rem", padding: "0.25rem 0.5rem", width: "100%", border: "1px solid #ccc", borderRadius: "6px" }}
                />
              ) : (
                <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
                  <button onClick={() => setEditingTagId(q.id)} style={{ fontSize: "0.85rem", color: "#1976d2", background: "none", border: "none", cursor: "pointer" }}>✏️ Edit Tags</button>
                </div>
              )}

              <button
                onClick={() => toggleReviewed(q.id)}
                style={{
                  marginTop: "0.75rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: q.reviewed ? "#ffe0b2" : "#c8e6c9",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                {q.reviewed ? "✅ Mark as Unreviewed" : "📌 Mark as Reviewed"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
