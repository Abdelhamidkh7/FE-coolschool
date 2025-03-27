import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ClassesPage from "./pages/ClassesPage";
import ClassroomPage from "./pages/ClassroomPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes (Require Login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classroom/:classroomId" element={<ClassroomPage />} /> {/* ✅ Fix: Add this route */}
          
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
