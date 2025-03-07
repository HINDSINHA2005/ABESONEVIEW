import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import Firebase setup
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Button, Table, Form } from "react-bootstrap";
import '../Components/StudentMnagement.css'

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    dob: "",
    admissionNo: "",
    rollNo: "",
    email: "",
    college: "",
    section: "A",
    year: "1st Year",
    branch: "CSE",
    subjects: [],
  });

  const [availableSubjects] = useState([
    "Web Technology",
    "Power Electronics",
    "Computer Networks",
    "Object Oriented Programming",
    "Microprocessor","Software Engineering","Machine Learning And Technologies","Big Data And Analytics","Software Project Management","Power System 2","Special Electrical Machines","DBMS",
  ]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const querySnapshot = await getDocs(collection(db, "students"));
    const studentsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStudents(studentsList);
  };

  const handleInputChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (subject) => {
    setNewStudent((prev) => {
      const updatedSubjects = prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const addStudent = async () => {
    const studentData = {
      ...newStudent,
      subjects: newStudent.subjects.length > 0 ? newStudent.subjects : [],
    };

    await addDoc(collection(db, "students"), studentData);
    setShowForm(false);
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await deleteDoc(doc(db, "students", id));
      fetchStudents();
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", color: "#333" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Student Management</h2>
      
      <Button 
        onClick={() => setShowForm(!showForm)} 
        style={{ marginBottom: "15px", background: "#007bff", border: "none" }}>
        {showForm ? "Hide Form" : "Add Student"}
      </Button>

      {showForm && (
        <Form style={{ padding: "20px",color:"black", border: "1px solid #ddd", borderRadius: "8px", background: "#f9f9f9" }}>
          <fieldset style={{ marginBottom: "15px",color:"black", border: "1px solid #ccc", padding: "10px", borderRadius: "6px" }}>
            <legend style={{ fontWeight: "bold" }}>Personal Details</legend>
            <Form.Group>
              <Form.Label className="hind">Name</Form.Label>
              <Form.Control type="text" name="name" onChange={handleInputChange} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" name="dob" onChange={handleInputChange} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Admission No</Form.Label>
              <Form.Control type="text" name="admissionNo" onChange={handleInputChange} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Roll No</Form.Label>
              <Form.Control type="text" name="rollNo" onChange={handleInputChange} />
            </Form.Group>
          </fieldset>

          <fieldset style={{ marginBottom: "15px", border: "1px solid #ccc", padding: "10px", borderRadius: "6px" }}>
            <legend style={{ fontWeight: "bold" }}>Academic Details</legend>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" onChange={handleInputChange} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Branch</Form.Label>
              <Form.Select name="branch" onChange={handleInputChange}>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="ELCE">ELCE</option>
                <option value="CSE DATA SCIENCE">CSE DATA SCIENCE</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Year</Form.Label>
              <Form.Select name="year" onChange={handleInputChange}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Section</Form.Label>
              <Form.Select name="section" onChange={handleInputChange}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Form.Select>
            </Form.Group>
          </fieldset>

          <fieldset style={{ marginBottom: "15px", border: "1px solid #ccc", padding: "10px", borderRadius: "6px" }}>
            <legend style={{ fontWeight: "bold" }}>Subjects</legend>
            {availableSubjects.map((subject) => (
              <Form.Check
                key={subject}
                type="checkbox"
                label={subject}
                checked={newStudent.subjects.includes(subject)}
                onChange={() => handleCheckboxChange(subject)}
              />
            ))}
          </fieldset>

          <Button onClick={addStudent} style={{ marginTop: "10px", background: "#28a745", border: "none" }}>
            Save Student
          </Button>
        </Form>
      )}

      <Table striped bordered hover style={{ marginTop: "20px", background: "white" }}>
        <thead style={{ background: "#007bff", color: "white" }}>
          <tr>
            <th>Name</th>
            <th>Admission No</th>
            <th>Branch</th>
            <th>Year</th>
            <th>Subjects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} style={{ textAlign: "center" }}>
              <td>{student.name}</td>
              <td>{student.admissionNo}</td>
              <td>{student.branch}</td>
              <td>{student.year}</td>
              <td>{Array.isArray(student.subjects) ? student.subjects.join(", ") : "No Subjects Assigned"}</td>
              <td>
                <Button 
                  variant="danger" 
                  onClick={() => deleteStudent(student.id)}
                  style={{ background: "#dc3545", border: "none" }}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <button
        onClick={() => navigate("/")}
        style={{ padding: "10px 20px", backgroundColor: "green", color: "white", cursor: "pointer", border: "none", borderRadius: "5px", marginTop: "20px"}}
      >
        Home
      </button>
    </div>
  );
};

export default StudentManagement;
