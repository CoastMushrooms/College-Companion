import { useEffect, useState } from "react";
import { api } from "../api";

export default function Study() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAllFlashcards().then(setCards).catch((e) => setError(e.message));
  }, []);

  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  };

  const prev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  if (error) return <p className="error">{error}</p>;
  if (cards.length === 0) return <p>No flashcards yet. Generate some from a note first.</p>;

  const card = cards[index];

  return (
    <div>
      <h1>Study</h1>
      <p>{index + 1} / {cards.length}</p>
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "40px",
          minHeight: "120px",
          background: "white",
          cursor: "pointer",
          textAlign: "center",
          fontSize: "18px",
        }}
      >
        {flipped ? card.answer : card.question}
      </div>
      <p style={{ textAlign: "center", color: "#888" }}>Click card to flip</p>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={prev}>Previous</button>
        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}