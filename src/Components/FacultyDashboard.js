import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./FacultyDashboard.css";

const FacultyDashboard = () => {
  const [facultyData, setFacultyData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const facultyCollection = collection(db, "faculty");
          const q = query(facultyCollection, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setFacultyData(doc.data());
          } else {
            console.error("Faculty data not found.");
            setFacultyData(null);
          }
        } catch (error) {
          console.error("Error fetching faculty data:", error);
          setFacultyData(null);
        }
      } else {
        navigate("/faculty-login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/faculty-login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!facultyData) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  return (
    <div className="faculty-dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title" style={{"color":"white"}}>Faculty Panel</h2>
        <ul className="sidebar-menu">
          <li>
            <i className="bi bi-house-door-fill"></i> Home
          </li>
          <li onClick={() => navigate("/admin-report")}>
            <i className="bi bi-book-fill"></i> Subject Report
          </li>
          <li onClick={() => navigate("/faculty-assignment")}>
            <i className="bi bi-book-fill"></i> Upload Assignment Marks
          </li>
          <li onClick={() => navigate("/faculty/students")}> {/* Navigate to Students Page */}
            <i className="bi bi-people-fill"></i> Students
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>

      <div className="content">
        <div className="header">
          <h2>Welcome, {facultyData.name}</h2>
          <div className="user-info">
            <i className="bi bi-person-circle"></i>
            <span>{facultyData.email}</span>
          </div>
        </div>

        <div className="faculty-details">
          <div className="card">
            <h5><i className="bi bi-person-badge-fill"></i> Employee ID</h5>
            <p>{facultyData.employeeId}</p>
          </div>

          <div className="card">
            <h5><i className="bi bi-bookmark-star-fill"></i> Assigned Subjects</h5>
            <ul>
              {facultyData.subjects.map((subject, index) => (
                <li key={index}>
                  <i className="bi bi-journal-code"></i> {subject}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
