import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Components/FacultyLogin.css";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import logo from "../Assets/logo.png";

const FacultyLogin = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (employeeId.trim() === "" || password.trim() === "") {
      setError("Employee ID and Password are required!");
      return;
    }

    setError("");

    try {
      const email = `${employeeId}@abes.ac.in`; 

      await signInWithEmailAndPassword(auth, email, password);

      const userQuery = query(collection(db, "faculty"), where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();

        if (userData.employeeId === employeeId) {
          navigate("/faculty-dashboard");
        } else {
          setError("Incorrect Employee ID");
        }
      } else {
        setError("User data not found.");
      }
    } catch (firebaseError) {
      let errorMessage = "Login failed. Please check your credentials.";

      if (firebaseError.code === "auth/user-not-found" || firebaseError.code === "auth/wrong-password") {
        errorMessage = "Invalid Employee ID or password.";
      } else if (firebaseError.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }

      setError(errorMessage);
      console.error("Firebase Authentication Error:", firebaseError);
    }
  };

  const handleAdminLogin = () => {
    navigate("/admin-login");
  };

  return (
    <motion.div
      className="faculty-login-container"
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
          className="faculty-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
        <h2 className="login-title">Faculty Login</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Employee ID</label>
            <div className="input-container">
              <i className="bi bi-person-badge"></i>
              <input
                type="text"
                placeholder="Enter your Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-container">
              <i className="bi bi-lock"></i>
              <input
                type="password"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <motion.button
            type="submit"
            className="btn-login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>

          <motion.button
            type="button"
            className="btn-admin"
            onClick={handleAdminLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="bi bi-shield-lock"></i> Admin Login
          </motion.button>
          <button
        onClick={() => navigate("/")}
        style={{ padding: "10px 20px", backgroundColor: "green", color: "white", cursor: "pointer", border: "none", borderRadius: "5px", marginTop: "20px"}}
      >
        Home
      </button>
        </form>
      </motion.div>
    </motion.div>
    
  );
};

export default FacultyLogin;