import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {  collection, getDocs, query, where } from "firebase/firestore";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./AdminDashboard.css";
import FacultyManagement from "./FacultyManagement";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [facultyCount, setFacultyCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Query admin data using email instead of UID
          const q = query(collection(db, "admins"), where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const adminData = querySnapshot.docs[0].data();
            setAdmin(adminData);
          } else {
            console.error("Admin not found in Firestore.");
          }

          fetchFacultyCount();
          fetchStudentCount();
        } catch (error) {
          console.error("Error fetching admin data:", error.message);
        }
      } else {
        navigate("/admin-login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchFacultyCount = async () => {
    const facultySnapshot = await getDocs(collection(db, "faculty"));
    setFacultyCount(facultySnapshot.size);
  };

  const fetchStudentCount = async () => {
    const studentSnapshot = await getDocs(collection(db, "students"));
    setStudentCount(studentSnapshot.size);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin-login");
  };

  return (
    <div className="admin-dashboard">
      <nav className="sidebar">
        <h2 style={{ color: "white" }}>Admin Panel</h2>
        <ul>
          <li onClick={() => navigate("/admin-dashboard")}>
            <i className="bi bi-house"></i> Home
          </li>
          <li onClick={() => navigate("/admin-dashboard/faculty")}>
            <i className="bi bi-person-badge"></i> Faculty
          </li>
          <li onClick={() => navigate("/admin-dashboard/students")}>
            <i className="bi bi-people"></i> Students
          </li>
          <li onClick={() => navigate("/admin-report")}>
            <i className="bi bi-file-earmark-text"></i> Report
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <header>
          <h1>Welcome, {admin?.name || "Admin"}</h1>
          <div className="admin-info">
            <div className="admin-info-item">
              <i className="bi bi-envelope"></i>
              <span>{admin?.email || "N/A"}</span>
            </div>
            <div className="admin-info-item">
              <i className="bi bi-person-fill-gear"></i>
              <span>{admin?.role || "N/A"}</span>
            </div>
          </div>
        </header>

        {location.pathname === "/admin-dashboard/faculty" ? (
          <FacultyManagement onFacultyChange={fetchFacultyCount} />
        ) : (
          <div className="stats">
            <div className="card">
              <i className="bi bi-person-badge"></i>
              <div>
                <h3>Total Faculty</h3>
                <p>{facultyCount}</p>
              </div>
            </div>
            <div className="card">
              <i className="bi bi-people"></i>
              <div>
                <h3>Total Students</h3>
                <p>{studentCount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
