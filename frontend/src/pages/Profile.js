import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await API.get("/auth/profile");
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put("/user/update", user);
      setMessage("Profile updated successfully!");
      localStorage.setItem("user", JSON.stringify(user)); 
    } catch (error) {
      setMessage("Error updating profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await API.put("/user/change-password", { oldPassword, newPassword });
      setMessage("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      setMessage("Error changing password.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is irreversible.");
    if (confirmDelete) {
      try {
        await API.delete("/user/delete");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signup");
      } catch (error) {
        setMessage("Error deleting account.");
      }
    }
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleUpdateProfile}>
        <input type="text" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} placeholder="First Name" required />
        <input type="text" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} placeholder="Last Name" required />
        <input type="email" value={user.email} readOnly placeholder="Email" />
        <button type="submit">Update Profile</button>
      </form>

      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Old Password" required />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" required />
        <button type="submit">Change Password</button>
      </form>

      <button className="delete-button" onClick={handleDeleteAccount}>Delete Account</button>
    </div>
  );
}

export default Profile;
