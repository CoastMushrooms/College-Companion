import { useState } from "react";

export default function QuizQuestionItem({ question }) {
  const [selected, setSelected] = useState("");
  const [revealed, setRevealed] = useState(false);
  const options = question.options ? JSON.parse(question.options) : null;
  const isCorrect = selected.trim().toLowerCase() === question.answer.trim().toLowerCase();

  return (
    <div className="card">
      <div className="card-title">{question.question}</div>
      <div style={{ marginTop: 8 }}>
        {options ? (
          options.map((opt, i) => (
            <label key={i} className="option-row">
              <input type="radio" name={`q-${question.id}`} checked={selected === opt} onChange={() => setSelected(opt)} />
              {opt}
            </label>
          ))
        ) : (
          <input placeholder="Your answer" value={selected} onChange={(e) => setSelected(e.target.value)} style={{ width: "100%" }} />
        )}
      </div>
      <button className="secondary" style={{ marginTop: 8 }} onClick={() => setRevealed(true)}>Check Answer</button>
      {revealed && (
        <p style={{ color: isCorrect ? "var(--success)" : "var(--danger)", marginTop: 8 }}>
          Correct answer: {question.answer}
        </p>
      )}
    </div>
  );
}