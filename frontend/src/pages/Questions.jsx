import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [filterTest, setFilterTest] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialFilter = params.get("testName") || "All";
    setFilterTest(initialFilter);
  }, [location]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("wrongQuestions") || "[]");
    setQuestions(data);
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchTest = filterTest === "All" || q.testName === filterTest;
    const matchSection = filterSection === "All" || q.section === filterSection;
    const matchSearch =
      !searchTerm ||
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.choices && q.choices.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchTest && matchSection && matchSearch;
  });

  const uniqueTestNames = [...new Set(questions.map((q) => q.testName).filter(Boolean))];

  return (
    <div className="page" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2>Wrong Question Bank</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <label>
          Filter by Test:
          <select value={filterTest} onChange={(e) => setFilterTest(e.target.value)}>
            <option>All</option>
            {uniqueTestNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <label>
          Filter by Section:
          <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
            <option>All</option>
            <option>Math</option>
            <option>English</option>
          </select>
        </label>

        <label style={{ flex: 1 }}>
          Search Questions:
          <input
            type="text"
            placeholder="Enter keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </label>
      </div>

      {filteredQuestions.map((q) => (
        <div key={q.id} className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
          <h3>{q.question}</h3>
          <p>
            <strong>Test:</strong> {q.testName || "Unspecified"} |{" "}
            <strong>Section:</strong> {q.section}
          </p>

          {q.type === "mc" && (
            <ul style={{ paddingLeft: "1.2rem" }}>
              {q.choices.map((choice, i) => (
                <li key={i}>
                  <strong>{String.fromCharCode(65 + i)}.</strong> {choice}
                </li>
              ))}
            </ul>
          )}

          <details>
            <summary style={{ cursor: "pointer" }}>View Answer</summary>
            <p>
              <strong>Your Answer:</strong> {q.userAnswer}
              <br />
              <strong>Correct Answer:</strong> {q.correctAnswer}
            </p>
          </details>
        </div>
      ))}
    </div>
  );
}
