import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import MyQuizzesPage from "./pages/MyQuizzesPage";
import ClassesPage from "./pages/ClassesPage";
import ClassroomPage from "./pages/classroom/ClassroomPage";
import AssignmentQuizPage from "./pages/classroom/AssignmentQuizPage";
import ChatTab from "./pages/classroom/Chat";
import AssignmentsTab from "./pages/classroom/AssignmentTab";
import GradesTab from "./pages/classroom/GradesTab";
import AttendanceTab from "./pages/classroom/AttendanceTab";
import SubmissionGradePage from "./pages/classroom/SubmissionGradePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/quizzes" element={<MyQuizzesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />

            {/* //Classroom layout and nested tabs */}
            <Route path="/classroom/:classroomId" element={<ClassroomPage />}>
              <Route index element={<Navigate to="chat" replace />} />
              <Route path="chat" element={<ChatTab />} />
              <Route path="assignments" element={<AssignmentsTab />} />
              <Route
                path="/classroom/:classroomId/assignments/:quizId"
                element={<AssignmentQuizPage />}
              />
              <Route path="grades" element={<GradesTab />} />
              <Route
                path="grades/:quizId/submission/:submissionId"
                element={<SubmissionGradePage />}
              />
              <Route path="attendance" element={<AttendanceTab />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
