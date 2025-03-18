import React, { useState, useEffect } from "react";
import { useParams ,useNavigate} from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../Components/StudentResult.css";

const StudentResult = () => {
  const navigate = useNavigate();
  const { admissionNo } = useParams(); // 🔥 Get admission number from URL dynamically

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        //console.log("🚀 Fetching Student Data...");
        //console.log("🔹 Admission No:", admissionNo);

        if (!admissionNo) {
          setError("Invalid admission number.");
          setLoading(false);
          return;
        }

        const studentsCollection = collection(db, "students");
        const q = query(studentsCollection, where("admissionNo", "==", admissionNo.trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0]; // Assuming unique admission numbers
          setStudent(studentDoc.data());
          //console.log("🎉 Student Found:", studentDoc.data());
        } else {
          //console.error("❌ Student Not Found!");
          setError("Student not found.");
        }
      } catch (error) {
        //console.error("🔥 Error Fetching Student Data:", error);
        setError("Error fetching student data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [admissionNo]);

  if (loading) return <h2>Loading...</h2>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!student) return <h2>No student data found.</h2>;

  return (
    <div className="container">
      <div className="result-card">
        <h2>Student Result</h2>
        <div className="student-info">
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Admission No:</strong> {student.admissionNo}</p>
          <p><strong>Branch:</strong> {student.branch}</p>
          <p><strong>Year:</strong> {student.year}</p>
        </div>

        <h3>Marks Table</h3>
        <table className="result-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Sessional 1</th>
              <th>Sessional 2</th>
              <th>Sessional 3</th>
              <th>Internal Marks</th>
            </tr>
          </thead>
          <tbody>
            {student.marks &&
              Object.entries(student.marks).map(([subject, marks]) => (
                <tr key={subject}>
                  <td>{subject}</td>
                  <td>{marks["Sessional 1"] || "N/A"}</td>
                  <td>{marks["Sessional 2"] || "N/A"}</td>
                  <td>{marks["Sessional 3"] || "N/A"}</td>
                  <td>{marks["Internal Marks"] || "N/A"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => navigate("/student-login")}
        style={{ padding: "10px 20px", backgroundColor: "green", color: "white", cursor: "pointer", border: "none", borderRadius: "5px", marginTop: "20px"}}
      >
        Search Again
      </button>
    </div>
  );
};

export default StudentResult;
