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

  const next = () => { setFlipped(false); setIndex((i) => (i + 1) % cards.length); };
  const prev = () => { setFlipped(false); setIndex((i) => (i - 1 + cards.length) % cards.length); };

  if (error) return <p className="error">{error}</p>;
  if (cards.length === 0) return <div className="empty-state">No flashcards yet. Generate some from a note or document first.</div>;

  const card = cards[index];

  return (
    <div>
      <h1>Study</h1>
      <p>{index + 1} / {cards.length}</p>
      <div className="flip-card" onClick={() => setFlipped(!flipped)}>
        {flipped ? card.answer : card.question}
      </div>
      <div className="flip-hint">Click card to flip</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <button className="secondary" onClick={prev}>Previous</button>
        <button className="secondary" onClick={next}>Next</button>
      </div>
    </div>
  );
}