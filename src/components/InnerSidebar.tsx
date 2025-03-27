import { useState, useEffect, useRef } from "react";
import { MessageSquare, ClipboardList, BarChart, MoreVertical } from "lucide-react";
import ClassroomDropdown from "./ClassroomDropdown";
import { getClassroom } from "../api/ClassroomApi";

interface InnerSidebarProps {
  classId: string;
  setActiveTab: (tab: string) => void;
}

const InnerSidebar: React.FC<InnerSidebarProps> = ({ classId, setActiveTab }) => {
  const [classroom, setClassroom] = useState<{ title: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const data = await getClassroom(classId);
        setClassroom(data as { title: string });
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
          onClick={() => setActiveTab("chat")}
          className="p-3 rounded hover:bg-gray-700 flex items-center transition-colors"
        >
          <MessageSquare className="mr-2" /> Chat
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className="p-3 rounded hover:bg-gray-700 flex items-center transition-colors"
        >
          <ClipboardList className="mr-2" /> Assignments
        </button>

        <button
          onClick={() => setActiveTab("grades")}
          className="p-3 rounded hover:bg-gray-700 flex items-center transition-colors"
        >
          <BarChart className="mr-2" /> Grades
        </button>
      </nav>
    </div>
  );
};

export default InnerSidebar;
