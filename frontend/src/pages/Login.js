import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "./Login.css"; // ✅ We'll create this CSS file for styling

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user info
      navigate("/dashboard"); // Redirect to dashboard
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome to Finance Tracker</h1>
        <p>Track your expenses & manage budgets efficiently!</p>
        
        {/* Logo (optional) */}
        <img src="../logo.svg" alt="Finance Tracker" className="logo" />

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit">Login</button>
        </form>

        <div className="login-links">
          <Link to="/signup">New User? Sign Up</Link>
          <button onClick={() => alert("Forgot Password Coming Soon!")}>
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
