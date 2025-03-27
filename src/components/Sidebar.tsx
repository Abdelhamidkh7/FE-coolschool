import { useState } from "react";
import { Home, ClipboardList, Users, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Classes", icon: Users, path: "/classes" },
    { name: "Quizzes", icon: ClipboardList, path: "/quizzes" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
  ];

  return (
    <div className={cn("h-screen bg-gray-900 text-white flex flex-col p-4 transition-all", isCollapsed ? "w-16" : "w-64")}>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="text-white p-2 rounded focus:outline-none hover:bg-gray-700 mb-4"
      >
        {isCollapsed ? "☰" : "✖"}
      </button>


      <nav className="flex flex-col space-y-2 flex-grow">
        {menuItems.map(({ name, icon: Icon, path }) => (
          <button
            key={name}
            onClick={() => navigate(path)}
            className="flex items-center p-3 rounded-md hover:bg-gray-700 transition"
          >

            <Icon size={24} className="shrink-0" />
            <span className={cn("ml-3 transition-opacity", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto")}>
              {name}
            </span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <button className="flex items-center space-x-2 mt-auto p-3 rounded-md hover:bg-gray-700 transition">
        <LogOut size={24} className="shrink-0" />
        <span className={cn("ml-3 transition-opacity", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto")}>
          Logout
        </span>
      </button>
    </div>
  );
};

export default Sidebar;
