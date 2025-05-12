import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import { Table, Form, Button, Container, Row, Col } from "react-bootstrap";

const FacultyMarksUpload = () => {
  const navigate = useNavigate();
  const [subjects] = useState([
    "Web Technology",
    "Computer Networks",
    "Power Electronics",
    "Object Oriented Programming",
    "Microprocessor",
    "Software Engineering",
    "Machine Learning And Technologies",
    "Big Data And Analytics",
    "Software Project Management",
    "Power System 2",
    "Special Electrical Machines",
    "DBMS",
  ]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sessionalType, setSessionalType] = useState("Sessional 1");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const inputRefs = useRef([]);

  useEffect(() => {
    if (selectedSubject) fetchStudents();
  }, [selectedSubject]);

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, "students"), orderBy("rollNo", "asc"));
      const snap = await getDocs(q);
      const studentList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(studentList);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleMarksChange = (studentId, value, index) => {
  const val = Math.min(100, Math.max(0, parseFloat(value) || 0));
  setMarks((prev) => ({ ...prev, [studentId]: val }));

  // Navigate to next input on Enter key
  if (index !== undefined) {
    const nextRef = inputRefs.current[index + 1];
    if (nextRef) nextRef.focus();
  }
};

  const handleSubmit = async () => {
    if (!selectedSubject) return alert("Select a subject first!");

    try {
      for (let studentId in marks) {
        const ref = doc(db, "students", studentId);
        await setDoc(ref, {
          marks: {
            [selectedSubject]: {
              [sessionalType]: marks[studentId],
            },
          },
        }, { merge: true });
      }
      alert("Marks uploaded!");
      setMarks({});
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error uploading marks.");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        minHeight: "100vh",
        padding: "40px 0",
        color: "white",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Container className="bg-white rounded p-4" style={{ maxWidth: "95%", color: "black" }}>
          <h2 className="text-center mb-4">Faculty Marks Upload</h2>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="">Select Subject</option>
                {subjects.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Select value={sessionalType} onChange={(e) => setSessionalType(e.target.value)}>
                {["Sessional 1", "Sessional 2", "Sessional 3", "Internal Marks"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {selectedSubject && (
            <>
              <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc" }}>
                <Table bordered hover responsive>
                  <thead className="table-primary text-center sticky-top">
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Admission No</th>
                      <th>Marks (0-30/40)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.admissionNo}</td>
                        <td>
                          <Form.Control
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={marks[student.id] || ""}
                            ref={(el) => inputRefs.current[index] = el}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleMarksChange(student.id, e.target.value, index);
                              }
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>Total Entries: {Object.keys(marks).length} Wait to 10 sec to For Upload</div>
                <div>
                  <Button
                    variant="success"
                    className="me-2"
                    onClick={handleSubmit}
                    disabled={students.length === 0 || !selectedSubject}
                  >
                    Upload Marks
                  </Button>
                  <Button variant="dark" onClick={() => navigate("/faculty-login")}>Home</Button>
                </div>
              </div>
            </>
          )}
        </Container>
      </motion.div>
    </div>
  );
};

export default FacultyMarksUpload;
