import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";

const UploadMarks = () => {
  const [students, setStudents] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      const facultyEmail = auth.currentUser?.email;
      if (!facultyEmail) return;

      const facultyQuery = query(collection(db, "faculty"), where("email", "==", facultyEmail));
      const facultySnapshot = await getDocs(facultyQuery);
      if (!facultySnapshot.empty) {
        const facultyData = facultySnapshot.docs[0].data();
        setAssignedSubjects(facultyData.assignedSubjects || []);
      }
    };

    const fetchStudents = async () => {
      const studentsCollection = collection(db, "students");
      const studentSnapshot = await getDocs(studentsCollection);
      const studentList = studentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(studentList);
    };

    fetchAssignedSubjects();
    fetchStudents();
  }, []);

  const handleMarkChange = (studentId, subject, value) => {
    setMarks((prevMarks) => ({
      ...prevMarks,
      [studentId]: {
        ...prevMarks[studentId],
        [subject]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    for (const studentId in marks) {
      const studentRef = doc(db, "students", studentId);
      await updateDoc(studentRef, {
        marks: {
          ...students.find((student) => student.id === studentId).marks,
          ...marks[studentId],
        },
      });
    }
    alert("Marks uploaded successfully!");
  };

  const handleAssignSubject = async () => {
    if (!newSubject) return;
    const facultyEmail = auth.currentUser?.email;
    if (!facultyEmail) return;

    const facultyQuery = query(collection(db, "faculty"), where("email", "==", facultyEmail));
    const facultySnapshot = await getDocs(facultyQuery);
    if (!facultySnapshot.empty) {
      const facultyDoc = facultySnapshot.docs[0];
      const facultyRef = doc(db, "faculty", facultyDoc.id);
      await updateDoc(facultyRef, {
        assignedSubjects: [...assignedSubjects, newSubject],
      });
      setAssignedSubjects((prev) => [...prev, newSubject]);
      setNewSubject("");
    }
  };

  return (
    <div className="p-4 rounded shadow" style={{ color: 'orange', backgroundColor: 'yellow' }}>
      <h2 className="text-xl font-bold mb-3" style={{ color: 'orange' }}>Upload Marks</h2>
      {students.map((student) => (
        <div key={student.id} className="mb-3 p-3 border rounded" style={{ color: 'orange' }}>
          <p>
            <strong>Name:</strong> {student.name}
          </p>
          <p>
            <strong>Admission No:</strong> {student.admissionNo}
          </p>
          {assignedSubjects.length > 0 ? (
            assignedSubjects.map((subject, index) => (
              <Form.Group key={index} style={{ color: 'orange' }}>
                <Form.Label style={{ color: 'orange' }}>{subject}</Form.Label>
                <Form.Control
                  type="number"
                  value={marks[student.id]?.[subject] || ""}
                  onChange={(e) => handleMarkChange(student.id, subject, e.target.value)}
                  style={{color:'orange', borderColor: 'orange', backgroundColor:'white'}}
                />
              </Form.Group>
            ))
          ) : (
            <p style={{ color: 'orange' }}>No subjects assigned</p>
          )}
        </div>
      ))}
      <Button className="mt-3" onClick={handleSubmit} variant="outline-warning" >Submit Marks</Button>

      <div className="mt-5 p-3 border rounded" style={{ color: 'orange' }}>
        <h3 style={{ color: 'orange' }}>Assign Subject</h3>
        <Form.Group style={{ color: 'orange' }}>
          <Form.Label style={{ color: 'orange' }}>New Subject</Form.Label>
          <Form.Control
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            style={{color:'orange', borderColor: 'orange', backgroundColor:'white'}}
          />
        </Form.Group>
        <Button className="mt-2" onClick={handleAssignSubject} variant="outline-warning">Assign Subject</Button>
      </div>
    </div>
  );
};

export default UploadMarks;