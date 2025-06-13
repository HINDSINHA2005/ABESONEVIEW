import React, { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const ResultPage = () => {
  const [admissionNo, setAdmissionNo] = useState("");
  const [dob, setDob] = useState("");
  const [student, setStudent] = useState(null);
  const [marksData, setMarksData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError("");
    setStudent(null);
    setMarksData({});
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "students"));
      let matchedStudent = null;

      snapshot.forEach(doc => {
        const data = doc.data();
        const admission = data.admissionNo || data.admission_number || data.admission;
        if (admission === admissionNo && data.dob === dob) {
          matchedStudent = { id: doc.id, ...data };
        }
      });

      if (!matchedStudent) {
        setError("Student not found or incorrect details.");
        setLoading(false);
        return;
      }

      setStudent(matchedStudent);

      const quizSnapshot = await getDocs(collection(db, "quiz"));
      const resultData = {};

      for (const docSnap of quizSnapshot.docs) {
        const subjectData = docSnap.data();
        const subject = subjectData.subject || docSnap.id.replace(/_/g, " ");
        const quizzes = subjectData.quizzes || {};

        for (const [quizName, quizInfo] of Object.entries(quizzes)) {
          const marks = quizInfo.marks || {};
          const normalizedName = matchedStudent.name.trim().toLowerCase();
          const matchedKey = Object.keys(marks).find(
            key => key.trim().toLowerCase() === normalizedName
          );
          const mark = matchedKey ? marks[matchedKey] : "-";

          if (!resultData[subject]) resultData[subject] = {};
          resultData[subject][quizName] = mark;
        }
      }

      // Sort quizzes by quiz number
      for (const subject in resultData) {
        const sorted = Object.entries(resultData[subject]).sort(([a], [b]) => {
          const numA = parseInt(a.replace(/[^\d]/g, "")) || 0;
          const numB = parseInt(b.replace(/[^\d]/g, "")) || 0;
          return numA - numB;
        });

        resultData[subject] = Object.fromEntries(sorted);
      }

      setMarksData(resultData);
    } catch (err) {
      console.error(err);
      setError("Error fetching data.");
    }

    setLoading(false);
  };

  return (
    <div className="result-container" style={{ padding: "30px 10px", maxWidth: "960px", margin: "0 auto" }}>
      <div className="custom-card" style={{
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "30px",
        boxShadow: "0 4px 20px rgba(177, 36, 36, 0.1)"
      }}>
        <h3 className="text-center mb-4" style={{ fontWeight: 600, color: "#2c3e50" }}>Quiz Result Portal </h3>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Admission No</label>
            <input
              className="form-control"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              placeholder="Enter admission number"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-warning w-100 mb-3"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Get Result"}
        </button>

        {error && <div className="alert alert-danger mt-2">{error}</div>}

        {student && (
          <div className="mt-4">
            <h5 className="mb-3" style={{ borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Student Details</h5>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Roll No:</strong> {student.rollNo || "-"}</p>
            <p><strong>Admission No:</strong> {student.admissionNo}</p>

            <h5 className="mt-4 mb-3" style={{ borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Quiz Results</h5>
            {Object.entries(marksData).map(([subject, quizzes]) => (
              <div key={subject} className="mb-4">
                <h6 className="fw-bold" style={{ color: "#007bff" }}>{subject}</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered" style={{ fontSize: "0.95rem" }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "60%" }}>Quiz</th>
                        <th style={{ width: "40%" }}>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(quizzes).map(([quizName, mark]) => (
                        <tr key={quizName}>
                          <td>{quizName}</td>
                          <td>{mark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
