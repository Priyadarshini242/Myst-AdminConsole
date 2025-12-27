 
import { useState } from "react";
import { checkPassword } from "../auth";
import "./Login.css";

export default function LoginPassword({ email, onBack, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (!checkPassword(email, password)) {
      setError("Incorrect password");
      return;
    }

    onSuccess();
  }

  return (
    <div className="login-card">
      <h2>Enter password</h2>
      <p className="muted">Signing in as <strong>{email}</strong></p>

      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Password
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="error">{error}</div>}

        <div className="actions">
          <button type="button" className="secondary" onClick={onBack}>
            Back
          </button>
          <button type="submit">Sign in</button>
        </div>
      </form>
    </div>
  );
}
