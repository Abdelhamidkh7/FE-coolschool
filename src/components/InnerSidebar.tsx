import { useEffect, useState, useRef } from "react";
import {
  MessageSquare,
  ClipboardList,
  BarChart,
  Info,
  TrendingUp,
  CalendarCheck,
  Menu,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getClassroom } from "../api/ClassroomApi";
import { useQuizContext } from "../context/QuizContext";

interface InnerSidebarProps {
  classId: string;
}

export default function InnerSidebar({ classId }: InnerSidebarProps) {
  const [classroom, setClassroom] = useState<{ title: string; isOwner: boolean } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { quizInProgress, autoSubmitQuiz } = useQuizContext();

  useEffect(() => {
    getClassroom(classId)
      .then(data => setClassroom(data))
      .catch(console.error);
  }, [classId,location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path: string) => location.pathname.includes(path);

  const handleNav = async (path: string) => {
    if (quizInProgress) {
      if (window.confirm("A quiz is in progress – navigating away will submit it. Continue?")) {
        try { await autoSubmitQuiz(); } catch {}
      } else {
        return;
      }
    }
    navigate(path);
    setMobileOpen(false);
  };

  const commonItems = [
    { icon: <MessageSquare />,    label: "Chat",        path: "chat" },
    { icon: <ClipboardList />,    label: "Assignments", path: "assignments" },
    { icon: <BarChart />,         label: "Grades",      path: "grades" },
    { icon: <Info />,             label: "Class Info",  path: "info" },
  ];
  const ownerItems  = [
    { icon: <TrendingUp />,       label: "Analytics",   path: "analytics" },
    { icon: <CalendarCheck />,    label: "Attendance",  path: "attendance" },
  ];
  const navItems = classroom?.isOwner ? [...commonItems, ...ownerItems] : commonItems;

  const SidebarContent = (
    <aside className="flex flex-col h-full overflow-auto p-4 bg-gray-900 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-lg font-semibold truncate break-words max-w-[14rem]"
          title={classroom?.title}
        >
          {classroom?.title || "Loading..."}
        </h2>
        
      </div>
      <nav className="flex-1 flex flex-col space-y-2">
        {navItems.map(({ icon, label, path }) => (
          <button
            key={path}
            onClick={() => handleNav(`/classroom/${classId}/${path}`)}
            className={
              `
              flex items-center p-3 rounded-lg transition-colors
              ${isActive(path) ? "bg-gray-700" : "hover:bg-gray-800"}
            `}
          >
            <span className="mr-3 flex-shrink-0">{icon}</span>
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
    
      <header className="md:hidden flex items-center justify-between bg-gray-900 text-white p-3 shadow">
        <button onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="hidden md:flex flex-shrink-0 w-64 h-screen">
        {SidebarContent}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 flex">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 h-full bg-gray-900 text-white shadow-lg overflow-auto">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}