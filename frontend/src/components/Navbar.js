import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiMoon, FiSun, FiLogOut, FiUser } from "react-icons/fi";
import "./Navbar.css";

function Navbar({ setAuth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

    const storedTheme = localStorage.getItem("darkMode") === "true";
    setDarkMode(storedTheme);
    document.body.classList.toggle("dark-mode", storedTheme);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.classList.toggle("dark-mode", newMode);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <span className="greeting">Hello, {user.firstName || "User"} 👋</span>

      <span className="brand">Finance Tracker</span>

      <div className="nav-right">
        <Link to="/dashboard" className="nav-button">Dashboard</Link>
        <Link to="/analytics" className="nav-button">Analytics</Link>
        
        {/* Add tooltips using `title` attribute */}
        <Link to="/profile" className="icon-button" title="Profile">
          <FiUser size={20} />
        </Link>

        <button onClick={toggleDarkMode} className="icon-button" title={darkMode ? "Light Mode" : "Dark Mode"}>
          {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        <button onClick={handleLogout} className="icon-button" title="Logout">
          <FiLogOut size={20} />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
