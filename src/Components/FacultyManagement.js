import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./FacultyManagement.css";
import { useNavigate } from "react-router-dom";

const FacultyManagement = ({ onFacultyChange }) => {
  const [facultyList, setFacultyList] = useState();
  const [newFaculty, setNewFaculty] = useState({
    employeeId: "",
    name: "",
    email: "",
    subjects:[],
  });
  const [subjectInput, setSubjectInput] = useState("");
  const navigate = useNavigate();

  const fetchFaculty = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "faculty"));
    const facultyData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFacultyList(facultyData);
    if (onFacultyChange) {
      onFacultyChange();
    }
  }, [onFacultyChange]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const handleChange = (e) => {
    setNewFaculty({ ...newFaculty, [e.target.name]: e.target.value });
  };

  const addSubject = () => {
    if (subjectInput.trim() !== "") {
      setNewFaculty({ ...newFaculty, subjects: [...newFaculty.subjects, subjectInput.trim()] });
      setSubjectInput("");
    }
  };

  const removeSubject = (index) => {
    setNewFaculty({ ...newFaculty, subjects: newFaculty.subjects.filter((_, i) => i !== index) });
  };

  const addFaculty = async () => {
    try {
      const newFacultyData = { ...newFaculty };
      await addDoc(collection(db, "faculty"), newFacultyData);
      setNewFaculty({ employeeId: "", name: "", email: "", subjects:[]});
      setSubjectInput("");
      fetchFaculty();
    } catch (error) {
      console.error("Error adding faculty:", error);
    }
  };

  const deleteFaculty = async (id) => {
    try {
      await deleteDoc(doc(db, "faculty", id));
      fetchFaculty();
    } catch (error) {
      console.error("Error deleting faculty:", error);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin-dashboard");
  };

  return (
    <div className="faculty-management">
      <div className="faculty-management-header">
        <h2>Faculty Management</h2>
        <button className="back-to-dashboard-btn" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </div>
      <div className="add-faculty-form">
        <h3>Add New Faculty</h3>
        <div className="form-group">
          <label htmlFor="employeeId">Employee ID</label>
          <input type="text" id="employeeId" name="employeeId" placeholder="Employee ID" value={newFaculty.employeeId} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" placeholder="Name" value={newFaculty.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Email" value={newFaculty.email} onChange={handleChange} />
        </div>

        <div className="subject-input-area">
          <label htmlFor="subject">Subjects</label>
          <div className="subject-input">
            <input type="text" id="subject" placeholder="Subject" value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} />
            <button type="button" onClick={addSubject}>
              Add Subject
            </button>
          </div>
        </div>

        <div className="subject-list">
          {newFaculty.subjects.map((subject, index) => (
            <div key={index} className="subject-item">
              {subject}
              <button type="button" onClick={() => removeSubject(index)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
        </div>

        <button onClick={addFaculty}>Add Faculty</button>
      </div>

      <div className="faculty-list">
        <h3>Faculty List</h3>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subjects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(facultyList) && facultyList.length > 0 ? (
              facultyList.map((faculty) => (
                <tr key={faculty.id}>
                  <td>{faculty.employeeId}</td>
                  <td>{faculty.name}</td>
                  <td>{faculty.email}</td>
                  <td>
                    <ul className="subjects-list">
                      {faculty.subjects.map((subject, index) => (
                        <li key={index}>{subject}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteFaculty(faculty.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Loading faculty data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyManagement;