import LoginEmail from "../components/LoginEmail";
import "../components/Login.css";
import logo from "../assets/logo.jpg";

export default function LoginPage() {
  return (
    <div className="login-wrapper">
      {/* LOGO */}
      <div className="login-header">
        <img src={logo} alt="MySkillsTree" />
      </div>

      {/* CARD */}
      <LoginEmail onNext={() => {}} />

      {/* FOOTER */}
      <div className="login-footer">
        <select>
          <option>EN-US</option>
        </select>

        <p className="help">
          Need help? <a href="#">Contact Us</a>
        </p>

        <p className="links">
          Privacy and Cookie Policies and Terms & Conditions apply
        </p>

        <p className="captcha">
          This site is protected by reCAPTCHA Enterprise.
        </p>
      </div>
    </div>
  );
}
