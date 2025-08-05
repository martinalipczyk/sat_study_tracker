// ✅ Revamped Questions.jsx with export to CSV and PDF
import { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js";



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

    const pdfRef = useRef(null);

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

  const exportToCSV = () => {
    const headers = ["Test Name", "Section", "Question", "User Answer", "Correct Answer", "Reviewed", "Tags"];
    const rows = filtered.map(q => [
      q.testName,
      q.section,
      q.question,
      q.userAnswer,
      q.correctAnswer,
      q.reviewed ? "Yes" : "No",
      q.tags?.join(";") || ""
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(x => `"${x}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "filtered_questions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!pdfRef.current) return;
    html2pdf().from(pdfRef.current).set({ margin: 0.5, filename: 'filtered_questions.pdf', html2canvas: { scale: 2 } }).save();
  };


  return (
    <div className="page" style={{ maxWidth: "900px", margin: "auto", padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem", fontSize: "2rem" }}>📚 Review Questions</h2>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ backgroundColor: "#f0f0f0", border: "1px solid #ccc", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" }}
        >
          {showFilters ? "▲ Hide Filters" : "▼ Show Filters"}
        </button>

        <button
          onClick={exportToCSV}
          style={{ backgroundColor: "#c5e1a5", border: "1px solid #aed581", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          📤 Export to CSV
        </button>

        <button
          onClick={exportToPDF}
          style={{ backgroundColor: "#b3e5fc", border: "1px solid #81d4fa", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          🧾 Export to PDF
        </button>
      </div>
      <div ref={pdfRef} style={{ marginTop: "1rem" }}></div>

      {showFilters && (
        <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
          <label>📘 Test:
            <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)}>
              <option value="">All</option>
              {allTests.map(test => <option key={test} value={test}>{test}</option>)}
            </select>
          </label>
          <label>📘 Section:
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
              <option value="">All</option>
              {allSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </label>
          <label>🏷️ Tag:
            <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
              <option value="">All</option>
              {availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={onlyUnreviewed}
              onChange={() => setOnlyUnreviewed(prev => !prev)}
            /> Show only unreviewed
          </label>
        </div>
      )}

      {filtered.map(q => (
        <div key={q.id} style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", backgroundColor: q.reviewed ? "#f9f9f9" : "#fff4f4" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{q.question}</strong>
            <button onClick={() => toggleExpand(q.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {expanded[q.id] ? "▲" : "▼"}
            </button>
          </div>

          {expanded[q.id] && (
            <div style={{ marginTop: "0.5rem" }}>
              <p><strong>Your Answer:</strong> {q.userAnswer}</p>
              <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
            </div>
          )}

          <button onClick={() => toggleReviewed(q.id)} style={{ marginTop: "0.5rem" }}>
            {q.reviewed ? "✅ Marked Reviewed" : "🔍 Mark as Reviewed"}
          </button>

          <div style={{ marginTop: "0.5rem" }}>
            <p><strong>Tags:</strong> {q.tags?.join(", ") || "None"}</p>
            {editingTagId === q.id ? (
              <div>
                <input
                  type="text"
                  defaultValue={q.tags?.join(", ") || ""}
                  onBlur={(e) => handleTagEdit(q.id, e.target.value)}
                  autoFocus
                />
              </div>
            ) : (
              <button onClick={() => setEditingTagId(q.id)} style={{ float: "right" }}>✏️ Edit Tags</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
