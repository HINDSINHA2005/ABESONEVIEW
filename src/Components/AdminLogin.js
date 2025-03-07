import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { motion } from "framer-motion";
import { auth } from "../firebase"; // Import Firebase authentication
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Components/AdminLogin.css";
import logo from "../Assets/logo.png";

const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (adminId.trim() === "" || password.trim() === "") {
      setError("Admin ID and Password are required!");
      return;
    }

    try {
      // Authenticate Admin using Firebase
      await signInWithEmailAndPassword(auth, adminId, password);
      console.log("✅ Admin Logged In Successfully!");
      navigate("/admin-dashboard"); // Redirect to Admin Dashboard
    } catch (err) {
      setError("❌ Invalid Admin Credentials!");
      console.error("Login Error:", err.message);
    }
  };

  return (
    <motion.div
      className="admin-login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="login-box"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.img
          src={logo}
          alt="College Logo"
          className="admin-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
        <h2 className="login-title">Admin Login</h2>

        <form onSubmit={handleLogin}>
          {/* Admin Email Field */}
          <div className="form-group">
            <label>Email</label>
            <div className="input-container">
              <i className="bi bi-person-fill-lock"></i>
              <input
                type="email"
                placeholder="Enter your Admin Email"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password</label>
            <div className="input-container">
              <i className="bi bi-lock-fill"></i>
              <input
                type="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="error-text">{error}</p>}

          {/* Admin Login Button */}
          <motion.button
            type="submit"
            className="btn-login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-shield-lock"></i> Login
          </motion.button>
          <button
        onClick={() => navigate("/landing")}
        style={{ padding: "10px 20px", backgroundColor: "green", color: "white", cursor: "pointer", border: "none", borderRadius: "5px", marginTop: "20px"}}
      >
        Home
      </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminLogin;
