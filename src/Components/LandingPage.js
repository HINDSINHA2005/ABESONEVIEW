import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Components/LandingPage.css"; // Separate CSS file
import logo from "../Assets/logo.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      {/* College Logo with Fade-In Effect */}
      <motion.img
        src={logo}
        alt="College Logo"
        className="college-logo mb-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Animated College Name & Heading */}
      <motion.h1
        className="fw-bold text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        ABES One View 
      </motion.h1>
      <motion.p
        className="text-white subtitle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        Your Portal for Sessional & Internal Marks 

        
      </motion.p>

     

      {/* Faculty & Student Buttons with Previous Styling */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <motion.button
          className="btn faculty-btn me-3 px-4 py-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/faculty-login")}
        >
          Faculty Login
        </motion.button>

        <motion.button
          className="btn student-btn px-4 py-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/student-login")}
        >
          Students Result
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LandingPage;
