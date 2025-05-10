import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs,query,orderBy } from "firebase/firestore";
import { utils, writeFile } from "xlsx";


// Make sure you have Bootstrap imported in your project

const Report = () => {
   
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessional, setSessional] = useState("Sessional 1");
  const [error, setError] = useState(null);
  // Constants for grading
  const TOTAL_MARKS = 30;
  const PASSING_PERCENTAGE = 50;

  // Inline styles object to avoid CSS conflicts
  const styles = {
    reportContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px 15px',
      backgroundColor: '#f8f9fa',
    },
    pageTitle: {
      color: '#345785',
      textAlign: 'center',
      marginBottom: '25px',
      paddingBottom: '15px',
      borderBottom: '3px solid #8fbcbb',
    },
    sectionTitle: {
      color: '#345785',
      borderLeft: '4px solid #8fbcbb',
      paddingLeft: '10px',
      marginBottom: '20px',
    },
    controlsCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '25px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
    gradingInfo: {
      padding: '8px 12px',
      backgroundColor: '#eceff4',
      borderRadius: '6px',
      borderLeft: '3px solid #4a6fa5',
      fontWeight: '500',
      color: '#345785',
    },
    exportButton: {
      
      backgroundColor: '#4a6fa5',
      borderColor: '#4a6fa5',
    },
    statCard: {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
      textAlign: 'center',
      height: '100%',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
    statValue: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#5e81ac',
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      overflow: 'auto',
      marginBottom: '25px',
    },
    tableHeader: {
      backgroundColor: '#4a6fa5',
      color: 'white',
    },
    failedRow: {
      backgroundColor: 'rgba(191, 97, 106, 0.05)',
    },
    failedMark: {
      color: '#bf616a',
      fontWeight: '500',
    },
    statusPass: {
      color: '#a3be8c',
      fontWeight: 'bold',
    },
    statusFail: {
      color: '#bf616a',
      fontWeight: 'bold',
    },
    statusNoData: {
      color: '#888',
      fontStyle: 'italic',
    },
    overallStatsRow: {
      backgroundColor: 'rgba(94, 129, 172, 0.1)',
      fontWeight: 'bold',
    },
    noDataWarning: {
      backgroundColor: '#ebcb8b',
      color: '#664d03',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
    },
    errorMessage: {
      backgroundColor: '#bf616a',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      margin: '30px auto',
      maxWidth: '800px',
      textAlign: 'center',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(191, 97, 106, 0.3)',
    },
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentCollection = collection(db, "students");
         const q=query(studentCollection,orderBy("rollNo","asc"));
        const studentSnapshot = await getDocs(q);
        const studentList = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        //console.log("Fetched students:", studentList);
        setStudents(studentList);
        setError(null);
      } catch (err) {
        setError("Failed to fetch students: " + err.message);
        //console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const calculateStatistics = () => {
    if (!students.length) return { 
      studentData: [], 
      subjectSummary: [], 
      totalPassed: 0, 
      totalFailed: 0,
      subjectsList: []
    };

    //console.log("Calculating statistics for sessional:", sessional);
    
    // Get all subjects from all students
    const allSubjects = new Set();
    students.forEach(student => {
      if (student.marks) {
        Object.keys(student.marks).forEach(subject => {
          allSubjects.add(subject);
        });
      }
    });
    const subjectsList = Array.from(allSubjects);
    //console.log("All subjects found:", subjectsList);

    let subjectStats = {};
    let studentData = [];
    
    students.forEach((student) => {
      let passedSubjects = 0;
      let failedSubjects = 0;
      let totalMarks = 0;
      let subjectCount = 0;
      
      let studentRow = { 
        Name: student.name || student.Name || "Unknown", 
        AdmissionNo: student.admissionNo || student.AdmissionNo || "Unknown" 
      };
      
      // Process each subject for this student
      subjectsList.forEach(subject => {
        // Check if student has marks for this subject
        const subjectMarks = student.marks?.[subject];
        
        // Check if the subject has the specific sessional
        const sessionKey = Object.keys(subjectMarks || {})
          .find(key => key.toLowerCase() === sessional.toLowerCase());
        
        // Get the marks for this sessional
        const marks = sessionKey ? subjectMarks[sessionKey] : null;
        
        // Store the mark in the student row
        studentRow[subject] = marks !== null ? marks : "-";
        
        if (marks !== null && marks !== undefined) {
          // Update subject statistics
          if (!subjectStats[subject]) {
            subjectStats[subject] = { total: 0, count: 0, passed: 0, failed: 0 };
          }
          
          const numericMarks = Number(marks);
          const percentage = (numericMarks / TOTAL_MARKS) * 100;
          
          subjectStats[subject].total += numericMarks;
          subjectStats[subject].count++;
          
          // Check if passed based on percentage threshold
          if (percentage >= PASSING_PERCENTAGE) {
            subjectStats[subject].passed++;
            passedSubjects++;
          } else {
            subjectStats[subject].failed++;
            failedSubjects++;
          }
          
          totalMarks += numericMarks;
          subjectCount++;
        }
      });
      
      // Calculate student's average marks
      studentRow["Average"] = subjectCount > 0 ? (totalMarks / subjectCount).toFixed(2) : "-";
      
      // Calculate average percentage
      const averagePercentage = subjectCount > 0 ? 
        ((totalMarks / subjectCount) / TOTAL_MARKS * 100).toFixed(2) + "%" : "-";
      studentRow["Average %"] = averagePercentage;
      
      studentRow["Passed"] = passedSubjects;
      studentRow["Failed"] = failedSubjects;
      
      // Only mark as PASS if there are subjects and all are passed
      studentRow["Status"] = subjectCount > 0 ? 
        (failedSubjects === 0 ? "PASS" : "FAIL") : 
        "NO DATA";
      
      studentData.push(studentRow);
    });

    // Count total passed and failed students
    const totalPassed = studentData.filter(s => s.Status === "PASS").length;
    const totalFailed = studentData.filter(s => s.Status === "FAIL").length;

    // Generate subject summary
    let subjectSummary = subjectsList.map((subject) => {
      const stats = subjectStats[subject] || { total: 0, count: 0, passed: 0, failed: 0 };
      return {
        Subject: subject,
        "Average Marks": stats.count > 0 ? (stats.total / stats.count).toFixed(2) : "-",
        "Average %": stats.count > 0 ? ((stats.total / stats.count / TOTAL_MARKS) * 100).toFixed(2) + "%" : "-",
        "Total Passed": stats.passed,
        "Total Failed": stats.failed,
        "Pass Percentage": stats.count > 0 ? ((stats.passed / stats.count) * 100).toFixed(2) + "%" : "-",
        "Fail Percentage": stats.count > 0 ? ((stats.failed / stats.count) * 100).toFixed(2) + "%" : "-"
      };
    });

    const overallStats = {
      Subject: "OVERALL",
      "Average Marks": "-",
      "Average %": "-",
      "Total Passed": totalPassed,
      "Total Failed": totalFailed,
      "Pass Percentage": (totalPassed + totalFailed) > 0 ? 
        ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2) + "%" : "-",
      "Fail Percentage": (totalPassed + totalFailed) > 0 ? 
        ((totalFailed / (totalPassed + totalFailed)) * 100).toFixed(2) + "%" : "-"
    };

    return { 
      studentData, 
      subjectSummary, 
      totalPassed, 
      totalFailed,
      subjectsList,
      overallStats
    };
  };

  const exportToExcel = () => {
    const { studentData, subjectSummary, overallStats } = calculateStatistics();
    
    const wb = utils.book_new();
    
    // Student marks sheet
    const studentSheet = utils.json_to_sheet(studentData);
    utils.book_append_sheet(wb, studentSheet, "Student Marks");
    
    // Subject statistics sheet with overall stats appended
    const summarySheet = utils.json_to_sheet([...subjectSummary, {}, overallStats]);
    utils.book_append_sheet(wb, summarySheet, "Subject Statistics");
    
    writeFile(wb, `Student_Report_${sessional.replace(/\s+/g, '_')}.xlsx`);
  };

  const stats = calculateStatistics();

  // Function to check if a mark is a passing mark
  const isPassingMark = (mark) => {
    if (mark === "-") return true; // No styling for no data
    const numericMark = Number(mark);
    const percentage = (numericMark / TOTAL_MARKS) * 100;
    return percentage >= PASSING_PERCENTAGE;
  };

  if (loading) return <div className="text-center p-5">Loading student data...</div>;
  if (error) return <div style={styles.errorMessage}>{error}</div>;
  if (!students.length) return <div className="text-center p-5">No student data available</div>;

  return (
    <div style={styles.reportContainer}>
      <h2 style={styles.pageTitle} className="mb-4">Student Performance Report</h2>
      
      <div style={styles.controlsCard} className="row g-3 align-items-center">
        <div className="col-md-4">
          <div className="d-flex align-items-center">
            <label htmlFor="sessional-select" className="me-2">Select Examination: </label>
            <select 
              id="sessional-select"
              className="form-select"
              value={sessional} 
              onChange={(e) => setSessional(e.target.value)}
            >
              <option value="Sessional 1">Sessional 1</option>
              <option value="Sessional 2">Sessional 2</option>
              <option value="Sessional 3">Sessional 3</option>
            </select>
          </div>
        </div>
        
        <div className="col-md-4">
          <div style={styles.gradingInfo}>
            Marks are out of {TOTAL_MARKS} | Passing criteria: {PASSING_PERCENTAGE}%
          </div>
        </div>
        
        <div className="col-md-4 text-md-end">
          <button 
            className="btn btn-primary" 
            style={styles.exportButton}
            onClick={exportToExcel}
          >
            <i className="bi bi-file-earmark-excel me-2"></i>
            Download Excel Report
          </button>
          
          
        </div>
      </div>
      
      <h3 style={styles.sectionTitle}>Summary Statistics</h3>
      <div className="row g-3 mb-4">
        <div className="col-lg-15th col-md-4 col-sm-6">
          <div style={styles.statCard} className="bg-white">
            <div style={styles.statValue} className="text-primary">{students.length}</div>
            <div style={styles.statLabel}>Total Students</div>
          </div>
        </div>
        <div className="col-lg-15th col-md-4 col-sm-6">
          <div style={styles.statCard} className="bg-white">
            <div style={{...styles.statValue, color: '#a3be8c'}}>{stats.totalPassed}</div>
            <div style={styles.statLabel}>Students Passed</div>
          </div>
        </div>
        <div className="col-lg-15th col-md-4 col-sm-6">
          <div style={styles.statCard} className="bg-white">
            <div style={{...styles.statValue, color: '#bf616a'}}>{stats.totalFailed}</div>
            <div style={styles.statLabel}>Students Failed</div>
          </div>
        </div>
        <div className="col-lg-15th col-md-6 col-sm-6">
          <div style={styles.statCard} className="bg-white">
            <div style={{...styles.statValue, color: '#a3be8c'}}>
              {(stats.totalPassed + stats.totalFailed) > 0 
                ? ((stats.totalPassed / (stats.totalPassed + stats.totalFailed)) * 100).toFixed(2) + "%"
                : "-"}
            </div>
            <div style={styles.statLabel}>Overall Pass %</div>
          </div>
        </div>
        <div className="col-lg-15th col-md-6 col-sm-6">
          <div style={styles.statCard} className="bg-white">
            <div style={{...styles.statValue, color: '#bf616a'}}>
              {(stats.totalPassed + stats.totalFailed) > 0 
                ? ((stats.totalFailed / (stats.totalPassed + stats.totalFailed)) * 100).toFixed(2) + "%"
                : "-"}
            </div>
            <div style={styles.statLabel}>Overall Fail %</div>
          </div>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Student Marks</h3>
      <div style={styles.tableContainer} className="mb-4">
        <table className="table table-hover mb-0">
          <thead>
            <tr style={styles.tableHeader}>
              <th>Name</th>
              <th>Admission No</th>
              {stats.subjectsList.map((subject) => (
                <th key={subject}>{subject}</th>
              ))}
              <th>Average</th>
              <th>Average %</th>
              <th>Subjects Passed</th>
              <th>Subjects Failed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.studentData.map((student, index) => (
              <tr key={index} style={student.Status === "FAIL" ? styles.failedRow : {}}>
                <td>{student.Name}</td>
                <td>{student.AdmissionNo}</td>
                {stats.subjectsList.map((subject) => {
                  const marks = student[subject];
                  const percentage = marks !== "-" ? ((Number(marks) / TOTAL_MARKS) * 100).toFixed(2) : "-";
                  
                  return (
                    <td 
                      key={subject} 
                      style={!isPassingMark(marks) ? styles.failedMark : {}}
                      title={percentage !== "-" ? `${percentage}%` : "No data"}
                    >
                      {marks} {marks !== "-" ? `(${((Number(marks) / TOTAL_MARKS) * 100).toFixed(0)}%)` : ""}
                    </td>
                  );
                })}
                <td>{student.Average}</td>
                <td>{student["Average %"]}</td>
                <td>{student.Passed}</td>
                <td>{student.Failed}</td>
                <td style={
                  student.Status === "FAIL" ? styles.statusFail : 
                  student.Status === "PASS" ? styles.statusPass : 
                  styles.statusNoData
                }>
                  {student.Status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={styles.sectionTitle}>Subject Statistics</h3>
      <div style={styles.tableContainer}>
        <table className="table table-hover mb-0">
          <thead>
            <tr style={styles.tableHeader}>
              <th>Subject</th>
              <th>Average Marks</th>
              <th>Average %</th>
              <th>Students Passed</th>
              <th>Students Failed</th>
              <th>Pass Percentage</th>
              <th>Fail Percentage</th>
            </tr>
          </thead>
          <tbody>
            {stats.subjectSummary.map((subject, index) => (
              <tr key={index}>
                <td>{subject.Subject}</td>
                <td>{subject["Average Marks"]}</td>
                <td>{subject["Average %"]}</td>
                <td>{subject["Total Passed"]}</td>
                <td>{subject["Total Failed"]}</td>
                <td>{subject["Pass Percentage"]}</td>
                <td>{subject["Fail Percentage"]}</td>
              </tr>
            ))}
            {stats.subjectSummary.length > 0 && (
              <tr style={styles.overallStatsRow}>
                <td>{stats.overallStats.Subject}</td>
                <td>-</td>
                <td>-</td>
                <td>{stats.overallStats["Total Passed"]}</td>
                <td>{stats.overallStats["Total Failed"]}</td>
                <td>{stats.overallStats["Pass Percentage"]}</td>
                <td>{stats.overallStats["Fail Percentage"]}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {stats.subjectsList.length === 0 && (
        <div style={styles.noDataWarning} className="mt-4">
          <p className="mb-0">No subject data found. Please check your Firebase data structure.</p>
        </div>
      )}
    </div>
  );
};

export default Report;