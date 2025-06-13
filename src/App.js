import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoadingScreen from "./Components/LoadingScreen";
import LandingPage from "./Components/LandingPage";
import StudentLogin from "./Components/StudentLogin";
import FacultyLogin from "./Components/FacultyLogin";
import AdminLogin from "./Components/AdminLogin";
import AdminDashboard from "./Components/AdminDashboard";
import PrivateRoute from "./Components/PrivateRoute";
import FacultyManagement from "./Components/FacultyManagement";
import FacultyDashboard from "./Components/FacultyDashboard";
import StudentManagement from "./Components/StudentManagement";
import FacultyMarksPage from "./Components/FacultyMarksPage";
import UploadMarks from "./Components/UploadMarks";
import StudentResult from "./Components/StudentResult";
import Report from './Components/Report';
import SubjectAssignment from './Components/SubjectAssignment';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomeAchievements from "./Components/HomeAchievements";
import StudentUploadAchievement from "./Components/StudentUploadAchievement";
import AdminAchievement from "./Components/AdminAchievement";
import InternalMarksGenerator from "./Components/InternalMarksGenerator";
import QuizUploadPage from "./Components/QuizUploadPage";
import QuizMarksTable from "./Components/QuizMarksTable";
import ResultPage from "./Components/ResultPage";
import AssignmentManagement from "./Components/AssignmentManagement";
import AssignmentResult from "./Components/AssignmentResult";






const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  return (
    <Router>
      {isLoading ? <LoadingScreen /> : <MainRoutes />}
    </Router>
  );
};

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landing" />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/faculty-login" element={<FacultyLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-report" element={<Report/>} />
      <Route path="/achievement-verify" element={<AdminAchievement/>} />

      
      
     
      
      <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin-dashboard/faculty" element={<PrivateRoute><FacultyManagement /></PrivateRoute>} />
      <Route path="/admin-dashboard/students" element={<PrivateRoute><StudentManagement /></PrivateRoute>} />
      <Route path="/generate-internal" element={<InternalMarksGenerator/>}/>
      <Route path="/QUIZ" element={<QuizUploadPage/>}/>
      <Route path="/QUIZMARKS" element={<QuizMarksTable/>}/>
      
      <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
      
      <Route path="/faculty-assignment" element={<SubjectAssignment/>}/>
      <Route path="/faculty/students" element={<FacultyMarksPage/>} />
      <Route path="/ASSIGN" element={<AssignmentManagement/>}/>
       <Route path="/ASSIGNR" element={<AssignmentResult/>}/>
     

      <Route path="/uploadmarks" element={<UploadMarks/>} />
      <Route path="/student-result/:admissionNo/:dob" element={<StudentResult />} />
      <Route path="/achievements" element={<HomeAchievements/>}/>
      <Route path="/QuizResult" element={<ResultPage/>}/>
      <Route path="/file-achievements" element={<StudentUploadAchievement/>}/>



      <Route path="*" element={<Navigate to="/landing" />} />
    </Routes>
  );
};

export default App;