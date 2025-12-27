// import { useState } from 'react'
// import './App.css'
// import LoginEmail from './components/LoginEmail'
// import LoginPassword from './components/LoginPassword'

// function App() {
//   const [stage, setStage] = useState('email') // 'email' | 'password' | 'success'
//   const [email, setEmail] = useState('')

//   function handleEmailNext(e) {
//     setEmail(e)
//     setStage('password')
//   }

//   function handleBack() {
//     setStage('email')
//   }

//   function handleSuccess() {
//     setStage('success')
//   }

//   return (
//     <div>
//       {stage === 'email' && <LoginEmail onNext={handleEmailNext} />}
//       {stage === 'password' && (
//         <LoginPassword email={email} onBack={handleBack} onSuccess={handleSuccess} />
//       )}

//       {stage === 'success' && (
//         <div style={{ textAlign: 'center', padding: '3rem' }}>
//           <h2>✅ Signed in</h2>
//           <p>Welcome, <strong>{email}</strong> — you are now signed in.</p>
//           <button onClick={() => { setStage('email'); setEmail('') }}>Sign out</button>
//         </div>
//       )}
//     </div>
//   )
// }

// export default App


import { useState } from "react";
import LoginEmail from "./components/LoginEmail";
import LoginPassword from "./components/LoginPassword";
import "./components/Login.css";
import loginImg from "./assets/login-image.jpg";
// import router from "./routes";

function App() {
  const [stage, setStage] = useState("email");
  const [email, setEmail] = useState("");

  return (
    <div className="login-page">
      {/* LEFT IMAGE */}
      <div
        className="login-image"
        style={{ backgroundImage: `url(${loginImg})` }}
      />

      {/* RIGHT CONTENT */}
      <div className="login-right">
        {stage === "email" && <LoginEmail onNext={(e) => { setEmail(e); setStage("password"); }} />}

        {stage === "password" && (
          <LoginPassword
            email={email}
            onBack={() => setStage("email")}
            onSuccess={() => setStage("success")}
          />
        )}

        {stage === "success" && (
          <div className="login-card" style={{ textAlign: "center" }}>
            <h2>✅ Signed in</h2>
            <p>Welcome, <strong>{email}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
