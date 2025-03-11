import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, orderBy,query} from "firebase/firestore";
import { useNavigate} from "react-router-dom";
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

  useEffect(() => {
    if (selectedSubject) {
      fetchStudents();
    }
  }, [selectedSubject]);

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, "students");
      const q=query(studentsRef,orderBy("rollNo","asc"));
      const studentSnap = await getDocs(q);
      let studentList = [];

      studentSnap.forEach((doc) => {
        studentList.push({ id: doc.id, ...doc.data() });
      });

      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleMarksChange = (studentId, value) => {
    setMarks((prevMarks) => ({
      ...prevMarks,
      [studentId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      alert("Please select a subject before uploading marks.");
      return;
    }

    try {
      for (let studentId in marks) {
        const studentDocRef = doc(db, "students", studentId);

        await setDoc(
          studentDocRef,
          {
            marks: {
              [selectedSubject]: {
                [sessionalType]: marks[studentId] || 0,
              },
            },
          },
          { merge: true }
        );
      }
      alert("Marks uploaded successfully!");
      setMarks({});
    } catch (error) {
      console.error("Error uploading marks:", error);
      alert("Failed to upload marks. Please try again.");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "black",
        position: "relative",
      }}
    >
      

      <h2 style={{ marginBottom: "20px" }}>Upload Marks</h2>

      <select
        onChange={(e) => setSelectedSubject(e.target.value)}
        value={selectedSubject}
        style={{ padding: "10px", marginBottom: "10px", borderRadius: "5px" }}
      >
        <option value="">Select Subject</option>
        {subjects.map((sub, index) => (
          <option key={index} value={sub}>
            {sub}
          </option>
        ))}
      </select>

      <select
        onChange={(e) => setSessionalType(e.target.value)}
        value={sessionalType}
        style={{ padding: "10px", marginBottom: "20px", borderRadius: "5px" }}
      >
        <option value="Sessional 1">Sessional 1</option>
        <option value="Sessional 2">Sessional 2</option>
        <option value="Sessional 3">Sessional 3</option>
        <option value="Internal Marks">Internal Marks</option>
      </select>

      {selectedSubject && students.length > 0 && (
        <table
          style={{
            width: "80%",
            textAlign: "center",
            borderCollapse: "collapse",
          
            color: "black",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "blue" }}>
              <th style={{ padding: "10px" }}>Student Name</th>
              <th style={{ padding: "10px" }}>Admission No</th>
              <th style={{ padding: "10px" }}>Marks</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #555" }}>{student.name}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #555" }}>{student.admissionNo}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #555" }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={marks[student.id] || ""}
                    onChange={(e) => handleMarksChange(student.id, e.target.value)}
                    style={{
                      backgroundColor:"white",
                      color:"black",
                      fontWeight:"larger",
                      padding: "5px",
                      borderRadius: "5px",
                      border: "none",
                      textAlign: "center",
                      width: "70px",
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        disabled={!selectedSubject || students.length === 0}
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          borderRadius: "5px",
          border: "none",
          background: "#ff9800",
          color: "black",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Upload Marks
      </button>
      <button
        onClick={() => navigate("/faculty-login")}
        style={{ padding: "10px 20px", backgroundColor: "green", color: "white", cursor: "pointer", border: "none", borderRadius: "5px", marginTop: "20px"}}
      >
        Home
      </button>
    </div>
  );
};

export default FacultyMarksUpload;
