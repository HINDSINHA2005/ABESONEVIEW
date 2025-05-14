import React, { useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Table, Button, Container, Spinner } from "react-bootstrap";

const InternalMarksGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const calculateInternal = (s1, s2, s3) => {
  const converted = [];

  // Scale sessionals to a 7.5-point scale
  if (s1 !== undefined) converted.push((s1 / 30) * 7.5);  // Scale ST1 (out of 30)
  if (s2 !== undefined) converted.push((s2 / 30) * 7.5);  // Scale ST2 (out of 30)
  if (s3 !== undefined) converted.push((s3 / 40) * 7.5);  // Scale ST3 (out of 40)

  // If no marks are provided, return null
  if (converted.length === 0) return null;

  // Sort the marks in descending order and get the top 2
  converted.sort((a, b) => b - a);
  const bestTwo = converted.slice(0, 2);

  // If only one submission, return the fixed 15 marks + the scaled marks for one sessional, other one is 0
  if (bestTwo.length === 1) {
    return Math.round(15 + bestTwo[0]); // No cap, just add the one test's scaled marks
  }

  // Calculate total: Fixed 15 marks + Top 2 scaled sessionals
  const total = 15 + bestTwo[0] + bestTwo[1];

  // Return total marks, capped at 30
  return Math.min(30, Math.round(total)); // Cap at 30
};


  const generateInternalMarks = async () => {
    setLoading(true);
    const studentSnap = await getDocs(collection(db, "students"));
    const updates = [];

    for (const studentDoc of studentSnap.docs) {
      const studentData = studentDoc.data();
      const studentId = studentDoc.id;
      const studentMarks = studentData.marks || {};
      const newMarks = { ...studentMarks };

      for (const subject in studentMarks) {
        const subjectMarks = studentMarks[subject];
        const s1 = subjectMarks["Sessional 1"];
        const s2 = subjectMarks["Sessional 2"];
        const s3 = subjectMarks["Sessional 3"];

        const internal = calculateInternal(s1, s2, s3);

        if (internal !== null) {
          if (!newMarks[subject]) newMarks[subject] = {};
          newMarks[subject]["Internal Marks"] = internal;

          updates.push({
            name: studentData.name,
            admissionNo: studentData.admissionNo,
            subject,
            internal,
          });
        }
      }

      await updateDoc(doc(db, "students", studentId), {
        marks: newMarks,
      });
    }

    setResults(updates);
    setLoading(false);
  };

  return (
    <Container className="mt-5 p-4 bg-light rounded">
      <h3 className="mb-3 text-center">Auto Generate Internal Marks</h3>
      <div className="text-center mb-3">
        <Button onClick={generateInternalMarks} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Generating...
            </>
          ) : (
            "Generate Internal Marks"
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div>
          <h5>Updated Internal Marks</h5>
          <Table bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Admission No</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Internal Marks (out of 30)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((entry, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{entry.admissionNo}</td>
                  <td>{entry.name}</td>
                  <td>{entry.subject}</td>
                  <td>{entry.internal}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default InternalMarksGenerator;
