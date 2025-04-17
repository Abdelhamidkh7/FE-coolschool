import { useState } from "react";
import {
  Home,
  ClipboardList,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";
import { useQuizContext } from "../context/QuizContext";
import { logoutUser } from "../services/authService";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const { quizInProgress, autoSubmitQuiz } = useQuizContext();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const confirmAndLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Classes", icon: Users, path: "/classes" },
    { name: "Quizzes", icon: ClipboardList, path: "/quizzes" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
  ];

  // intercept nav away during active quiz
  const handleNav = async (path: string) => {
    if (quizInProgress) {
      const confirmLeave = window.confirm(
        "A quiz is in progress. Navigating away will auto-submit your quiz. Continue?"
      );
      if (confirmLeave) {
        try {
          await autoSubmitQuiz();
        } catch (err) {
          console.error("Quiz submission failed:", err);
        }
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        "h-screen bg-gray-900 text-white flex flex-col p-4 transition-all",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="text-white p-2 rounded focus:outline-none hover:bg-gray-700 mb-4"
      >
        {isCollapsed ? <Menu size={24} /> : <X size={24} />}
      </button>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex flex-col flex-grow">
        <ul className="space-y-2">
          {menuItems.map(({ name, icon: Icon, path }) => (
            <li key={name}>
              <button
                title={isCollapsed ? name : undefined}
                onClick={() => handleNav(path)}
                className="flex items-center p-3 rounded-md hover:bg-gray-700 transition w-full text-left"
              >
                <Icon size={24} className="shrink-0" />
                <span
                  className={cn(
                    "ml-3 transition-opacity",
                    isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
                  )}
                >
                  {name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        title={isCollapsed ? "Logout" : undefined}
        className="flex items-center space-x-2 mt-auto p-3 rounded-md hover:bg-gray-700 transition"
      >
        <LogOut size={24} className="shrink-0" />
        <span
          className={cn(
            "ml-3 transition-opacity",
            isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
          )}
        >
          Logout
        </span>
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white rounded-lg p-6 w-80">
            <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndLogout}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 transition focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
