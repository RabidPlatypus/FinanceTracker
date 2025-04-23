import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "./Signup.css"; 

function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); 

    try {
      const { data } = await API.post("/auth/signup", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); 
      navigate("/dashboard"); 
    } catch (err) {
      setError("Signup failed. This email may already be in use.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>Create an Account</h1>
        <p>Start tracking your finances today!</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSignup}>
          <input 
            type="text" 
            name="firstName" 
            placeholder="First Name" 
            value={form.firstName} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="lastName" 
            placeholder="Last Name" 
            value={form.lastName} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
          <button type="submit">Sign Up</button>
        </form>

        <div className="signup-links">
          <Link to="/login">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
