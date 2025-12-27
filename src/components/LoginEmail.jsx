import logo from "../assets/logo.png";

import { useState } from "react";
import { isValidUser } from "../auth";
import "./Login.css";

export default function LoginEmail({ onNext }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isValidUser(email)) {
      setError("No user found with that email");
      return;
    }

    onNext(email);
  }

  return (
    <div className="login-wrapper">
      
      {/* 🔰 LOGO */}
      <img src={logo} alt="MySkillsTree" className="login-logo" />

      {/* CARD */}
      <div className="login-card">
        <h2>Welcome!</h2>
        <p className="sub text-bold">Enter your email address to proceed</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email Address*
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button type="submit">NEXT</button>
          </div>
        </form>
      </div>

      
      {/* 👇 CARD KELA CONTENT */}
      <div className="login-footer">
        <select className="lang">
          <option>EN-US</option>
        </select>

        <p>
          Need help? <a href="#">Contact Us</a>
        </p>

        <p className="policy">
          Privacy and Cookie Policies and Terms & Conditions apply
        </p>

        <p className="recaptcha">
          This site is protected by reCAPTCHA Enterprise.
    
          <a href="#">Privacy Policy</a> and <a href="#">Google Terms</a> apply.
        </p>
      </div>


    </div>
  );
}
