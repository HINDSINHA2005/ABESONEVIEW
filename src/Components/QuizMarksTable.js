import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import * as XLSX from "xlsx";

const QuizMarksTable = () => {
  const [subject, setSubject] = useState("");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [studentList, setStudentList] = useState([]); // normalized student names
  const [quizList, setQuizList] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [studentDetailsMap, setStudentDetailsMap] = useState({}); // normalized name => {rollNo, admissionNo}

  // Fetch all subjects from 'quiz' collection
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const quizSnapshot = await getDocs(collection(db, "quiz"));
        const subjects = quizSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().subject || doc.id.replace(/_/g, " "),
        }));
        setAvailableSubjects(subjects);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        alert("Failed to fetch subjects.");
      }
    };
    fetchSubjects();
  }, []);

  // Fetch student details from 'students' collection once
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const map = {};
        studentsSnapshot.forEach(doc => {
          const d = doc.data();
          if (!d.name) return;
          const nameKey = d.name.trim().toLowerCase();
          map[nameKey] = {
            rollNo: d.rollNo || d.roll_number || d.roll || "-",
            admissionNo: d.admissionNo || d.admission_number || d.admission || "-",
          };
        });
        setStudentDetailsMap(map);
      } catch (err) {
        console.error("Error fetching student details:", err);
        alert("Failed to load student details.");
      }
    };
    fetchStudentDetails();
  }, []);

  // Fetch quiz data for selected subject
  useEffect(() => {
    const fetchData = async () => {
      if (!subject) return;
      setLoading(true);
      try {
        const docId = subject.replace(/\s+/g, "_");
        const docRef = doc(db, "quiz", docId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("No data found for this subject.");
          setData({});
          setQuizList([]);
          setStudentList([]);
          setLoading(false);
          return;
        }

        const quizData = docSnap.data().quizzes || {};

        // Normalize quiz marks keys (student names) to lowercase
        const normalizedQuizData = {};
        Object.entries(quizData).forEach(([quizName, quizInfo]) => {
          const marks = quizInfo.marks || {};
          const normalizedMarks = {};
          Object.entries(marks).forEach(([name, mark]) => {
            normalizedMarks[name.trim().toLowerCase()] = mark;
          });
          normalizedQuizData[quizName] = { ...quizInfo, marks: normalizedMarks };
        });
        setData(normalizedQuizData);

        // Extract all student names from quiz marks (normalized)
        const allStudents = new Set();
        Object.values(normalizedQuizData).forEach(quiz => {
          Object.keys(quiz.marks || {}).forEach(name => allStudents.add(name));
        });

        // Sort quizzes numerically by numbers inside quiz names
        const quizzes = Object.keys(normalizedQuizData);
        const sortedQuizzes = quizzes.sort((a, b) => {
          const numA = Number(a.replace(/[^\d]/g, "")) || 0;
          const numB = Number(b.replace(/[^\d]/g, "")) || 0;
          return numA - numB;
        });

        setQuizList(sortedQuizzes);
        setStudentList([...allStudents]);
      } catch (err) {
        console.error("Error loading quiz data:", err);
        alert("Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subject]);

  // Sort student list by roll no (numeric if possible, else lex)
  const sortedStudentList = [...studentList].sort((a, b) => {
    const rollA = studentDetailsMap[a]?.rollNo || "";
    const rollB = studentDetailsMap[b]?.rollNo || "";

    const numA = Number(rollA);
    const numB = Number(rollB);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return rollA.localeCompare(rollB);
  });

  // Download Excel file
  const handleDownload = () => {
    const sheetData = [];
    const header = ["Student Name", "Roll No", "Admission No", ...quizList];
    sheetData.push(header);

    sortedStudentList.forEach(name => {
      const studentInfo = studentDetailsMap[name] || {};
      const row = [
        name,
        studentInfo.rollNo || "-",
        studentInfo.admissionNo || "-",
      ];
      quizList.forEach(quiz => {
        row.push(data[quiz]?.marks?.[name] ?? "");
      });
      sheetData.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Marks");
    XLSX.writeFile(workbook, `${subject.replace(/\s+/g, "_")}_Quiz_Marks.xlsx`);
  };

  return (
    <div className="container mt-4">
      <h3>Quiz Marks Viewer</h3>

      <div className="mb-3">
        <label>Select Subject</label>
        <select
          className="form-select"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        >
          <option value="">-- Select Subject --</option>
          {availableSubjects.map(sub => (
            <option key={sub.id} value={sub.name}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading quiz marks...</p>}

      {subject && !loading && quizList.length > 0 && (
        <>
          <button className="btn btn-success mb-3" onClick={handleDownload}>
            Download as Excel
          </button>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Admission No</th>
                {quizList.map(quiz => (
                  <th key={quiz}>{quiz}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedStudentList.map(name => {
                const studentInfo = studentDetailsMap[name] || {};
                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{studentInfo.rollNo || "-"}</td>
                    <td>{studentInfo.admissionNo || "-"}</td>
                    {quizList.map(quiz => (
                      <td key={quiz}>{data[quiz]?.marks?.[name] ?? "-"}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {subject && !loading && quizList.length === 0 && (
        <p>No quiz data found for this subject.</p>
      )}
    </div>
  );
};

export default QuizMarksTable;
