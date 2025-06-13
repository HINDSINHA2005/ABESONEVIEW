import React, { useState } from "react";
import * as XLSX from "xlsx";
import { db } from "../firebase";
import { doc, setDoc,getDoc } from "firebase/firestore";

const QuizUploadPage = () => {
  const [subject, setSubject] = useState("");
  const [quizNo, setQuizNo] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !subject || !quizNo) {
    alert("Please select subject, quiz number, and file.");
    return;
  }

  setUploading(true);
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsedData = XLSX.utils.sheet_to_json(worksheet);

    const marksObj = {};
    parsedData.forEach(row => {
      const studentName = (row["student_name"] || row["Student Name"] || "").trim();
      const marks = parseFloat(row["marks_obtained"] || row["Marks Obtained"] || 0);
      if (studentName && !isNaN(marks)) {
        marksObj[studentName] = marks;
      }
    });

    const docId = subject.replace(/\s+/g, "_");
    const subjectRef = doc(db, "quiz", docId);
    const docSnap = await getDoc(subjectRef);

    const existingData = docSnap.exists() ? docSnap.data() : {};

    const updatedQuizzes = {
      ...(existingData.quizzes || {}),
      [quizNo]: {
        date: new Date(),
        marks: marksObj
      }
    };

    await setDoc(subjectRef, {
      subject,
      quizzes: updatedQuizzes
    });

    alert("Quiz marks uploaded and merged successfully!");
  } catch (error) {
    console.error("Error uploading quiz marks:", error);
    alert("An error occurred while uploading marks.");
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="container mt-4">
      <h3>Upload Quiz Marks</h3>

      <div className="mb-3">
        <label>Subject</label>
        <select
          className="form-select"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        >
          <option value="">Select Subject</option>
          <option value="Object Oriented Programming">Object Oriented Programming</option>
          <option value="Web Technology"> Web Technology</option>
          <option value="Computer Networks">Computer Networks</option>
          <option value="Microprocessor">Microprocessor</option>
          <option value="Power Electronics">Power Electronics</option>
          <option value="Computer Networks Lab">Computer Networks Lab</option>
          <option value="Power Electronics Lab">Power Electronics Lab</option>
          <option value="Microprocessor Lab">Microprocerssor Lab</option>

          
          

          {/* Add more subjects as needed */}
        </select>
      </div>

      <div className="mb-3">
        <label>Quiz Number</label>
        <select
          className="form-select"
          value={quizNo}
          onChange={e => setQuizNo(e.target.value)}
        >
          <option value="">Select Quiz</option>
          <option value="Quiz 1">Quiz 1</option>
          <option value="Quiz 2">Quiz 2</option>
          <option value="Quiz 3">Quiz 3</option>
          <option value="Quiz 4">Quiz 4</option>
          <option value="Quiz 5">Quiz 5</option>
          <option value="Quiz 6">Quiz 6</option>
          <option value="Quiz 7">Quiz 7</option>
          <option value="Quiz 8">Quiz 8</option>
          <option value="Quiz 9">Quiz 9</option>
          <option value="Quiz 10">Quiz 10</option>


        </select>
      </div>

      <div className="mb-3">
        <label>Upload Excel File</label>
        <input
          type="file"
          accept=".xlsx, .xls"
          className="form-control"
          onChange={handleFileUpload}
        />
      </div>

      {uploading && <p>Uploading and processing...</p>}
    </div>
  );
};

export default QuizUploadPage;
