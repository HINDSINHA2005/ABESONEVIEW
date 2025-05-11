import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Components/StudentLogin.css";
import logo from "../Assets/logo.png";

const StudentLogin = () => {
  const [admissionNo, setAdmissionNo] = useState("");
  const [dob, setDob] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Convert YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`; // Converts to DD-MM-YYYY
  };

  const validateForm = () => {
    let newErrors = {};
    if (!admissionNo.trim()) {
      newErrors.admissionNo = "Admission number is required.";
    }
    if (!dob) {
      newErrors.dob = "Date of Birth is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formattedDob = formatDate(dob);
      console.log("Login Attempt:", { admissionNo, dob, formattedDob });

      // Trim input values before navigating
      navigate(`/student-result/${admissionNo.trim()}/${formattedDob.trim()}`);
    }
  };

  return (
    <div className="student-login-container">
      <div className="login-box">
        <motion.img
          src={logo}
          alt="College Logo"
          className="college-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.h3
          className="college-name"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          ABES One View
        </motion.h3>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="login-title"
        >
          Student Result
         
        </motion.h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admission Number</label>
            <div className="input-container">
              <i className="bi bi-person-badge"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Admission No:"
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
              />
            </div>
            {errors.admissionNo && <small className="text-danger">{errors.admissionNo}</small>}
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <div className="input-container">
              <i className="bi bi-calendar"></i>
              <input
                type="date"
                className="form-control"
                 placeholder="dd-mm-yyyy"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            {errors.dob && <small className="text-danger">{errors.dob}</small>}
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary btn-block custom-btn"
            whileTap={errors.admissionNo || errors.dob ? { x: [-5, 5, -5, 5, 0] } : { scale: 0.95 }}
          >
            Search
          </motion.button>
          <button
        onClick={() => navigate("/")}
        style={{ padding: "10px 20px", backgroundColor: "green", color: "white", cursor: "pointer", border: "none", borderRadius: "5px", marginTop: "20px"}}
      >
        Home
      </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
