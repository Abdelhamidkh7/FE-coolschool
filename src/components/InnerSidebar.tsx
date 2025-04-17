import { useState, useEffect, useRef } from "react";
import { MessageSquare, ClipboardList, BarChart, MoreVertical, CalendarCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import ClassroomDropdown from "./ClassroomDropdown";
import { getClassroom } from "../api/ClassroomApi";
import { useQuizContext } from "../context/QuizContext";

interface InnerSidebarProps {
  classId: string;
}

const InnerSidebar: React.FC<InnerSidebarProps> = ({ classId }) => {
  const [classroom, setClassroom] = useState<{ title: string; isOwner: boolean } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { quizInProgress, autoSubmitQuiz } = useQuizContext();

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const data = await getClassroom(classId);
        setClassroom(data as { title: string; isOwner: boolean });
      } catch (error) {
        console.error("Failed to fetch classroom", error);
      }
    };
    fetchClassroom();
  }, [classId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname.endsWith(path);

  // Intercept nav
  const handleNav = async(path: string) => {
    if (quizInProgress) {
      const confirmLeave = window.confirm(
        "A quiz is in progress. Navigating away will submit your quiz. Continue?"
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
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col p-4 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold truncate max-w-[180px]">
          {classroom?.title || "Loading..."}
        </h2>
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)}>
            <MoreVertical size={20} />
          </button>
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-0 mt-6 w-48 bg-white text-black shadow-lg rounded-md z-10"
            >
              <ClassroomDropdown classId={classId} onClose={() => setShowDropdown(false)} />
            </div>
          )}
        </div>
      </div>

      <nav className="flex flex-col space-y-2">
        <button
          onClick={() => handleNav(`/classroom/${classId}/chat`)}
          className={`p-3 rounded flex items-center transition-colors ${
            isActive("chat") ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
        >
          <MessageSquare className="mr-2" /> Chat
        </button>

        <button
          onClick={() => handleNav(`/classroom/${classId}/assignments`)}
          className={`p-3 rounded flex items-center transition-colors ${
            isActive("assignments") ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
        >
          <ClipboardList className="mr-2" /> Assignments
        </button>

        <button
          onClick={() => handleNav(`/classroom/${classId}/grades`)}
          className={`p-3 rounded flex items-center transition-colors ${
            isActive("grades") ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
        >
          <BarChart className="mr-2" /> Grades
        </button>

        {/* {classroom?.isOwner && ( */}
          <button
            onClick={() => handleNav(`/classroom/${classId}/attendance`)}
            className={`p-3 rounded flex items-center transition-colors ${
              isActive("attendance") ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            <CalendarCheck className="mr-2" /> Attendance
          </button>
       {/* // )} */}
      </nav>
    </div>
  );
};

export default InnerSidebar;
