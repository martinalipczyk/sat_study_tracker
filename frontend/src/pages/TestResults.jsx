import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TestResults() {
  const [testName, setTestName] = useState("");
  const [section, setSection] = useState("");
  const [score, setScore] = useState("");
  const [mathScore, setMathScore] = useState("");
  const [englishScore, setEnglishScore] = useState("");
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    section: "",
    type: "mc",
    question: "",
    choices: ["", "", "", ""],
    userAnswer: "",
    correctAnswer: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const session = sessionStorage.getItem("currentTest");
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.testName) setTestName(parsed.testName);
      if (parsed.section) setSection(parsed.section);
    }
  }, []);

  const handleAddQuestion = () => {
    const question = {
      id: crypto.randomUUID(),
      testName,
      ...newQuestion
    };
    setWrongQuestions([...wrongQuestions, question]);

    // Reset form
    setNewQuestion({
      section: "",
      type: "mc",
      question: "",
      choices: ["", "", "", ""],
      userAnswer: "",
      correctAnswer: ""
    });
  };

  const handleSubmit = () => {
    // Save score
    const scoreData = JSON.parse(localStorage.getItem("scores") || "[]");
    const newScore = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      testName,
      section,
      score,
      mathScore,
      englishScore
    };
    localStorage.setItem("scores", JSON.stringify([...scoreData, newScore]));

    // Save wrong questions
    const qData = JSON.parse(localStorage.getItem("wrongQuestions") || "[]");
    localStorage.setItem("wrongQuestions", JSON.stringify([...qData, ...wrongQuestions]));

    alert("Test results saved!");
  };

  return (
    <div className="page" style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>Submit Test Results</h2>

      <p><strong>Test Name:</strong> {testName}</p>
      <p><strong>Section:</strong> {section}</p>

      {section === "Full Test" ? (
        <>
          <label>Total Score:
            <input type="number" value={score} onChange={(e) => setScore(e.target.value)} />
          </label>
          <label>Math Score:
            <input type="number" value={mathScore} onChange={(e) => setMathScore(e.target.value)} />
          </label>
          <label>English Score:
            <input type="number" value={englishScore} onChange={(e) => setEnglishScore(e.target.value)} />
          </label>
        </>
      ) : (
        <label>Score:
          <input type="number" value={score} onChange={(e) => setScore(e.target.value)} />
        </label>
      )}

      <hr />

      <h3>Wrong Questions</h3>

      <label>Section:
        <select value={newQuestion.section} onChange={(e) => setNewQuestion({ ...newQuestion, section: e.target.value })}>
          <option value="">Select</option>
          <option value="Math">Math</option>
          <option value="English">English</option>
        </select>
      </label>

      {newQuestion.section === "Math" && (
        <>
          <label>Question Type:
            <select value={newQuestion.type} onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}>
              <option value="mc">Multiple Choice</option>
              <option value="fill">Fill-in-the-Blank</option>
            </select>
          </label>
        </>
      )}

      <label>Question:
        <textarea value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} />
      </label>

      {newQuestion.type === "mc" && (
        <>
          {newQuestion.choices.map((choice, index) => (
            <label key={index}>
              Choice {String.fromCharCode(65 + index)}:
              <input
                type="text"
                value={choice}
                onChange={(e) => {
                  const updatedChoices = [...newQuestion.choices];
                  updatedChoices[index] = e.target.value;
                  setNewQuestion({ ...newQuestion, choices: updatedChoices });
                }}
              />
            </label>
          ))}
        </>
      )}

      <label>Your Answer:
        <input value={newQuestion.userAnswer} onChange={(e) => setNewQuestion({ ...newQuestion, userAnswer: e.target.value })} />
      </label>
      <label>Correct Answer:
        <input value={newQuestion.correctAnswer} onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })} />
      </label>

      <button className="btn-primary" onClick={handleAddQuestion}>Add Question</button>

      <br /><br />
      <button className="btn-secondary" onClick={handleSubmit}>Submit All Results</button>
    </div>
  );
}
