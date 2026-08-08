import { useState, useEffect, useRef } from "react";
import { api } from "../api";

const FOCUS_MINUTES = 25;

export default function Timer() {
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleSessionComplete = async () => {
    setMessage("Session complete — great work.");
    try { await api.logStudySession(FOCUS_MINUTES, null); } catch (err) { console.error(err); }
  };

  const start = () => { setMessage(""); setIsRunning(true); };
  const pause = () => setIsRunning(false);
  const reset = () => { setIsRunning(false); setSecondsLeft(FOCUS_MINUTES * 60); setMessage(""); };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Focus Timer</h1>
      <div className="timer-display">{display}</div>
      {message && <p className="success" style={{ textAlign: "center" }}>{message}</p>}
      <div className="timer-controls">
        {!isRunning ? (
          <button onClick={start}>{secondsLeft === FOCUS_MINUTES * 60 ? "Start" : "Resume"}</button>
        ) : (
          <button onClick={pause}>Pause</button>
        )}
        <button className="secondary" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}