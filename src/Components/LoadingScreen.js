import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "./LoadingScreen.css"; // Import CSS file for styling
import logo from "../Assets/logo.png";

const LoadingScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof onComplete === "function") {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="loading-container d-flex flex-column align-items-center justify-content-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.5 }}
    >
      {/* Animated Logo */}
      <motion.img
        src={logo}
        alt="ABES One View"
        className="loading-logo"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Loading Text */}
      <motion.h2
        className="mt-3 text-light"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Welcome to ABES One View 
      </motion.h2>

      {/* Framer Motion Round Loader */}
      <motion.div
        className="custom-spinner mt-3"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </motion.div>
  );
};

export default LoadingScreen;
