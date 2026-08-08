import { useState } from "react";
import { api } from "../api";

export default function Account() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.updateAccount({ email: email || null, password: password || null });
      setMessage("Account updated.");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Account Settings</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="New email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="New password (optional)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Update</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}