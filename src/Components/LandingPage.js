import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Components/LandingPage.css";
import logo from "../Assets/logo.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="landing-container d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <motion.img
        src={logo}
        alt="College Logo"
        className="college-logo mb-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />

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
          className="btn student-btn px-4 py-2 me-3"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/student-login")}
        >
          Sessional Result
        </motion.button>
        <motion.button
          className="btn btn-light px-3 py-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/QuizResult")}
        >
          Quiz Results{" "}
        </motion.button>

         <motion.button
          className="btn btn-light px-3 py-2 me-2 ms-3"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/ASSIGNR")}
        >
          Assignment Status{" "}
        </motion.button>
        <motion.button
          className="btn btn-outline-light px-4 py-2 mx-2 my-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Hide" : "More"}
        </motion.button>
      </motion.div>

      {showMore && (
        <motion.div
          className="mt-4 d-flex flex-wrap justify-content-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            className="btn btn-secondary px-3 py-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              window.open(
                "https://oneview.aktu.ac.in/WebPages/AKTU/OneView.aspx",
                "_blank"
              )
            }
          >
            University Results
          </motion.button>

          <motion.button
            className="btn btn-info px-3 py-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              window.open("https://abesquiz.netlify.app/", "_blank")
            }
          >
            ABES Quiz
          </motion.button>

          <motion.button
            className="btn btn-warning px-3 py-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              window.open("https://abes.web.simplifii.com/index.php")
            }
          >
            Attendance
          </motion.button>

          <motion.button
            className="btn btn-primary px-3 py-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              window.open(
                "https://exams.aktu.ac.in/studentlogin.aspx",
                "_blank"
              )
            }
          >
            Fill Exam Form
          </motion.button>

          <motion.button
            className="btn btn-dark px-3 py-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open("https://aktu.ac.in/", "_blank")}
          >
            AKTU Official
          </motion.button>

          <motion.button
            className="btn btn-light px-3 py-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/achievements")}
          >
            Achievements
          </motion.button>

          <motion.button
            className="btn btn-success px-3 py-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/file-achievements")}
          >
            File Achievement
          </motion.button>

          <motion.button
            className="btn btn-danger px-3 py-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open("https://abes.ac.in", "_blank")}
          >
            ABES Official
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;
