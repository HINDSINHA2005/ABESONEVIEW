import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  
} from "firebase/firestore";
import {
  Form,
  Button,
  Table,
  Spinner,
  Alert,
} from "react-bootstrap";

const AssignmentResult = () => {
  const [admissionNo, setAdmissionNo] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAssignmentStatus = async () => {
    setLoading(true);
    setResult([]);
    setError("");

    const adm = admissionNo.trim();
    if (!adm) {
      setError("❌ Please enter a valid Admission Number.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Fetch student details
      const studentsSnap = await getDocs(collection(db, "students"));
      const student = studentsSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .find((s) => s.admissionNo === adm);

      if (!student) {
        setError("❌ No student found with this Admission Number.");
        setLoading(false);
        return;
      }

      setStudentData(student);
      const resultData = [];

      // Step 2: Loop through all assignmentManagement documents
      const assignmentManagementSnap = await getDocs(collection(db, "assignmentManagement"));

      for (const subjectDoc of assignmentManagementSnap.docs) {
        const subjectSectionId = subjectDoc.id;

        // Get all assignments under each subject-section
        const assignmentsSnap = await getDocs(
          collection(db, `assignmentManagement/${subjectSectionId}/assignments`)
        );

        for (const assignmentDoc of assignmentsSnap.docs) {
          const assignmentData = assignmentDoc.data();
          const submissions = assignmentData.submissions || {};
          const submission = submissions[adm];

          if (submission) {
            resultData.push({
              subjectSection: subjectSectionId.replace(/_/g, " "),
              assignmentNo: assignmentDoc.id,
              submitted: submission.submitted ?? false,
              late: submission.late ?? false,
              date: submission.date ?? "-",
              score: submission.score ?? "-",
            });
          }
        }
      }

      setResult(resultData);
    } catch (e) {
      console.error(e);
      setError("🔥 Error fetching data or insufficient Firestore permissions.");
    }

    setLoading(false);
  };

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      <div className="mx-auto" style={{ maxWidth: "960px" }}>
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-center text-primary mb-4">📊 Assignment Results</h3>

          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3">
              <Form.Label>Admission Number</Form.Label>
              <Form.Control
                type="text"
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                placeholder="Enter Admission Number"
              />
            </Form.Group>
            <div className="d-grid">
              <Button onClick={fetchAssignmentStatus} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "🔍 View Results"}
              </Button>
            </div>
          </Form>

          {error && (
            <Alert className="mt-3" variant="danger">
              {error}
            </Alert>
          )}

          {result.length > 0 && (
            <>
              <h5 className="mt-4 text-center">
                Results for: <strong>{studentData.name}</strong>
              </h5>

              <div
                className="table-responsive mt-3"
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  border: "1px solid #dee2e6",
                  borderRadius: ".25rem",
                }}
              >
                <Table
                  bordered
                  hover
                  className="mb-0 text-center align-middle"
                >
                  <thead className="table-dark sticky-top">
                    <tr>
                      <th>Subject</th>
                      <th>Assignment</th>
                      <th>Submitted</th>
                      <th>Late</th>
                      <th>Submission Date</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((r, i) => (
                      <tr key={i}>
                        <td>{r.subjectSection}</td>
                        <td>{r.assignmentNo}</td>
                        <td>{r.submitted ? "✅" : "❌"}</td>
                        <td>{r.late ? "⚠️" : "-"}</td>
                        <td>{r.date}</td>
                        <td>{r.score !== "-" ? r.score : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}

          {!loading && result.length === 0 && studentData && (
            <Alert className="mt-3" variant="info">
              ℹ️ No assignment submissions found for this student.
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentResult;