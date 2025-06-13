import React, { useState } from "react";
import {
  getDocs,
  setDoc,
  doc,
  collection,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Button,
  Form,
  Table,
  Alert,
  Spinner
} from "react-bootstrap";

const AssignmentManagement = () => {
  const [empId, setEmpId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [assignmentNo, setAssignmentNo] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [section, setSection] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // 👈 Uploading flag
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const q = await getDocs(collection(db, "faculty"));
      const docSnap = q.docs.find((d) => d.data().employeeId === empId);

      if (!docSnap) {
        alert("❌ Faculty with this Employee ID not found.");
        setLoading(false);
        return;
      }

      const data = docSnap.data();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error("❌ Error fetching faculty subjects:", error);
      alert("Error fetching subjects. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "students"));

      if (snapshot.empty) {
        alert("❌ No students found in the database.");
        setStudentList([]);
        return;
      }

      const list = snapshot.docs.map((doc) => ({
        ...doc.data(),
        submitted: false,
        late: false
      }));

      list.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));
      setStudentList(list);
      setSelectedStudents(list);
      setSection(list[0]?.section || "Unknown");
    } catch (error) {
      console.error("🔥 Error loading students:", error);
      alert("Failed to fetch students. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleTick = (admissionNo, type, value) => {
    const updated = selectedStudents.map((student) =>
      student.admissionNo === admissionNo ? { ...student, [type]: value } : student
    );
    setSelectedStudents(updated);
  };

  // Function to create assignmentManagement collection if it doesn't exist
  const createAssignmentCollectionIfNotExists = async (subjectSection) => {
    try {
      const docRef = doc(db, "assignmentManagement", subjectSection);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create the document with initial structure
        await setDoc(docRef, {
          createdAt: new Date().toISOString(),
          subject: selectedSubject,
          section: section,
          assignments: {}
        });
        console.log(`✅ Created assignmentManagement collection for: ${subjectSection}`);
      }
    } catch (error) {
      console.error("❌ Error creating assignmentManagement collection:", error);
    }
  };

  const submitAssignmentStatus = async () => {
    if (!selectedSubject || !assignmentNo || selectedStudents.length === 0) {
      alert("⚠️ Please select subject, assignment number and load students first.");
      return;
    }

    try {
      setUploading(true);

      const submissions = {};
      selectedStudents.forEach((s) => {
        submissions[s.admissionNo] = {
          rollNo: s.rollNo,
          submitted: s.submitted,
          late: s.late,
          date: s.submitted ? new Date().toISOString().split("T")[0] : null
        };
      });

      const subjectSection = `${selectedSubject}_${section}`;
      
      // Create collection if it doesn't exist
      await createAssignmentCollectionIfNotExists(subjectSection);

      const docRef = doc(
        db,
        "assignmentManagement",
        subjectSection,
        "assignments",
        assignmentNo
      );

      await setDoc(
        docRef,
        {
          date: new Date().toISOString().split("T")[0],
          submissions
        },
        { merge: true }
      );

      setMessage("✅ Assignment submission saved successfully.");
      setAssignmentNo("");
      setStudentList([]);
      setSelectedStudents([]);
    } catch (error) {
      console.error("❌ Error saving assignment:", error);
      alert("Failed to save assignment.");
    } finally {
      setUploading(false);
    }
  };

  const filteredStudents = selectedStudents.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Assignment Management</h3>

      <Form.Group className="mb-3">
        <Form.Label>Employee Code</Form.Label>
        <Form.Control
          type="text"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
          placeholder="Enter Employee Code"
        />
        <Button className="mt-2" onClick={fetchSubjects} disabled={loading}>
          Fetch Subjects
        </Button>
      </Form.Group>

      {subjects.length > 0 && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Select Subject</Form.Label>
            <Form.Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">--Select Subject--</option>
              {subjects.map((subj, idx) => (
                <option key={idx} value={subj}>
                  {subj}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assignment Number</Form.Label>
            <Form.Select
              value={assignmentNo}
              onChange={(e) => setAssignmentNo(e.target.value)}
            >
              <option value="">--Select Assignment--</option>
              {["A1", "A2", "A3", "A4", "A5"].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Form.Select>
            <Button className="mt-2" onClick={fetchStudents} disabled={loading}>
              Load Students
            </Button>
          </Form.Group>
        </>
      )}

      {loading && (
        <div className="text-center my-3">
          <Spinner animation="border" />
        </div>
      )}

      {studentList.length > 0 && (
        <>
          <h5>Student List</h5>
          <p><strong>Subject:</strong> {selectedSubject}</p>
          <p><strong>Section:</strong> {section}</p>

          <Form.Control
            type="text"
            placeholder="Search by name or roll number"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table striped bordered responsive>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Admission No</th>
                  <th>Submitted</th>
                  <th>Late</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <tr key={student.admissionNo}>
                    <td>{student.rollNo}</td>
                    <td>{student.name}</td>
                    <td>{student.admissionNo}</td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={student.submitted || false}
                        onChange={(e) =>
                          handleTick(student.admissionNo, "submitted", e.target.checked)
                        }
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={student.late || false}
                        onChange={(e) =>
                          handleTick(student.admissionNo, "late", e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mt-3">
            <Button onClick={submitAssignmentStatus} variant="primary" disabled={uploading}>
              {uploading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Uploading...
                </>
              ) : (
                "Save Assignment"
              )}
            </Button>
          </div>
        </>
      )}

      {message && (
        <Alert variant="success" className="mt-3">
          {message}
        </Alert>
      )}
    </div>
  );
};

export default AssignmentManagement;