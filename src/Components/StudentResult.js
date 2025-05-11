import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const StudentResult = () => {
  const navigate = useNavigate();
  const { admissionNo, dob } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert DOB from 'DD-MM-YYYY' to 'YYYY-MM-DD'
  const formatDob = (dobInput) => {
    const [day, month, year] = dobInput.split("-");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!admissionNo || !dob) {
          setError("Missing admission number or date of birth.");
          setLoading(false);
          return;
        }

        const formattedDob = formatDob(dob);
        const formattedAdmissionNo = admissionNo.toLowerCase().trim();

        const studentsCollection = collection(db, "students");
        const q = query(
          studentsCollection,
          where("admissionNo", "==", formattedAdmissionNo),
          where("dob", "==", formattedDob)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          setStudent(studentDoc.data());
        } else {
          setError("Student not found or DOB does not match.");
        }
      } catch (error) {
        setError("Error fetching student data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [admissionNo, dob]);

  if (loading) return <h2 className="text-center mt-5">Loading...</h2>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;
  if (!student) return <h2 className="text-center">No student data found.</h2>;

  return (
    <div
      className="py-5"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #a1c4fd, #c2e9fb)",
      }}
    >
      <div className="container">
        <div className="bg-white shadow-lg rounded-4 p-4 mx-auto" style={{ maxWidth: "800px" }}>
          <h2 className="text-center mb-4 text-primary fw-bold">📋 Student Result</h2>

          <div className="mb-4">
            <p><strong>👤 Name:</strong> {student.name}</p>
            <p><strong>🎓 Admission No:</strong> {student.admissionNo}</p>
            <p><strong>🏫 Branch:</strong> {student.branch}</p>
            <p><strong>📅 Year:</strong> {student.year}</p>
          </div>

          <h4 className="mb-3">📊 Marks Table</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-striped text-center">
              <thead className="table-light">
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

          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/student-login")}
              className="btn btn-success px-4 py-2 rounded-pill"
            >
              🔍 Search Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
