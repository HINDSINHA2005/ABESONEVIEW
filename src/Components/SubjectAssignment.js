import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from "firebase/firestore";
import * as XLSX from "xlsx";

const AssignmentMarksUploader = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [assignmentNo, setAssignmentNo] = useState("");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [submittedStatus, setSubmittedStatus] = useState({});
  const [submissionDates, setSubmissionDates] = useState({});
  const [bulkSubmitted, setBulkSubmitted] = useState(false);
  const [bulkDate, setBulkDate] = useState("");

  const handleFetchSubjects = async () => {
    const q = query(collection(db, "faculty"), where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      setSubjects(data.subjects || []);
    } else {
      alert("Faculty not found!");
    }
  };

  const handleFetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setStudents(studentList);
      setMarks({});
      setSubmittedStatus({});
      setSubmissionDates({});
    } catch (err) {
      console.error("Error fetching students: ", err);
      alert("Failed to fetch students.");
    }
  };

  const handleBulkApply = () => {
    if (!bulkDate && bulkSubmitted) {
      alert("Please select a bulk submission date.");
      return;
    }

    const newSubmittedStatus = {};
    const newSubmissionDates = {};

    students.forEach((student) => {
      newSubmittedStatus[student.admissionNo] = bulkSubmitted;
      if (bulkSubmitted) {
        newSubmissionDates[student.admissionNo] = bulkDate;
      }
    });

    setSubmittedStatus(newSubmittedStatus);
    setSubmissionDates((prev) => ({ ...newSubmissionDates, ...prev }));
  };

  const handleMarksChange = (admissionNo, value) => {
    setMarks({ ...marks, [admissionNo]: value });
  };

  const handleSubmissionChange = (admissionNo, isSubmitted) => {
    setSubmittedStatus({ ...submittedStatus, [admissionNo]: isSubmitted });
  };

  const handleDateChange = (admissionNo, date) => {
    setSubmissionDates({ ...submissionDates, [admissionNo]: date });
  };

  const handleUpload = async () => {
    if (!selectedSubject || !assignmentNo) {
      alert("Select both subject and assignment number first.");
      return;
    }

    for (const student of students) {
      const admissionNo = student.admissionNo;
      const data = {
        admissionNo,
        marks: marks[admissionNo] || "",
        submitted: submittedStatus[admissionNo] || false,
        submissionDate: submissionDates[admissionNo] || "",
        name: student.name,
        rollNo: student.rollNo,
        branch: student.branch,
        section: student.section,
      };

      const path = `assignment_marks/${selectedSubject}/assignments/assignment${assignmentNo}/students/${admissionNo}`;
      await setDoc(doc(db, path), data);
    }

    alert("Marks uploaded successfully!");
  };

  const handleExport = () => {
    const data = students.map((student) => ({
      Name: student.name,
      RollNo: student.rollNo,
      AdmissionNo: student.admissionNo,
      Branch: student.branch,
      Section: student.section,
      Marks: marks[student.admissionNo] || "",
      Submitted: submittedStatus[student.admissionNo] ? "Yes" : "No",
      SubmissionDate: submissionDates[student.admissionNo] || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AssignmentMarks");
    XLSX.writeFile(workbook, "Assignment_Marks.xlsx");
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen text-black font-sans">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">
        Upload Assignment Marks
      </h2>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Enter Employee ID:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleFetchSubjects}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Fetch Subjects
          </button>
        </div>
      </div>

      {subjects.length > 0 && (
        <>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Select Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((subj, index) => (
                <option key={index} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-1 font-semibold">Assignment No:</label>
            <select
              value={assignmentNo}
              onChange={(e) => setAssignmentNo(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">-- Select Assignment No --</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  Assignment {num}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFetchStudents}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mb-6"
          >
            Load Students
          </button>
        </>
      )}

      {students.length > 0 && (
        <>
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <label className="flex items-center font-medium">
              <input
                type="checkbox"
                checked={bulkSubmitted}
                onChange={(e) => {
                  setBulkSubmitted(e.target.checked);
                }}
                className="mr-2"
              />
              Apply Bulk Submitted Status
            </label>
            <input
              type="date"
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
              className="border p-2 rounded"
            />
            <button
              onClick={handleBulkApply}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Apply Bulk to All
            </button>
          </div>

          <div className="overflow-auto mb-6">
            <table className="min-w-full border rounded bg-white">
              <thead className="bg-blue-200">
                <tr>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Roll No</th>
                  <th className="border px-4 py-2">Marks</th>
                  <th className="border px-4 py-2">Submitted</th>
                  <th className="border px-4 py-2">Submission Date</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student.admissionNo}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-4 py-2">{student.name}</td>
                    <td className="border px-4 py-2">{student.rollNo}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="number"
                        value={marks[student.admissionNo] || ""}
                        onChange={(e) =>
                          handleMarksChange(student.admissionNo, e.target.value)
                        }
                        className="border p-1 rounded w-20"
                      />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={submittedStatus[student.admissionNo] || false}
                        onChange={(e) =>
                          handleSubmissionChange(student.admissionNo, e.target.checked)
                        }
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        type="date"
                        value={submissionDates[student.admissionNo] || ""}
                        onChange={(e) =>
                          handleDateChange(student.admissionNo, e.target.value)
                        }
                        className="border p-1 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Upload to Firebase
            </button>
            <button
              onClick={handleExport}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
            >
              Export to Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AssignmentMarksUploader;
