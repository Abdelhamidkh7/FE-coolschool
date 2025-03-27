import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import InnerSidebar from "../components/InnerSidebar";
import Chat from "../components/Chat";
// import Assignments from "../components/Assignments";
// import Grades from "../components/Grades";
import AssignmentsTab from "./AssignmentTab";
import GradesTab from "../components/GradesTab";

import { getClassroom } from "../api/ClassroomApi";
import { Loader } from "../components/Loader";

const ClassroomPage = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [activeTab, setActiveTab] = useState<"chat" | "assignments" | "grades">("chat");
  const [classroom, setClassroom] = useState<{ title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classroomId) {
      fetchClassroom(classroomId);
    }
  }, [classroomId]);

  const fetchClassroom = async (id: string) => {
    setLoading(true);
    try {
      const data = await getClassroom(id);
      setClassroom(data as { title: string });
    } catch (error) {
      console.error("Failed to fetch classroom", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left global sidebar */}
      <Sidebar />

      {/* Inner classroom sidebar (navigation) */}
      <InnerSidebar classId={classroomId!} setActiveTab={setActiveTab} />

      {/* Main content area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <Loader />
        ) : (
          <>
            {/* Classroom Title */}
            <h1 className="text-2xl font-bold mb-4">{classroom?.title}</h1>

            {/* Conditional Tab Content */}
            {activeTab === "chat" && <Chat classId={classroomId!} />}

            {activeTab === "assignments" && <AssignmentsTab classId={classroomId!} />}

            {activeTab === "grades" &&  <GradesTab classId={classroomId!} />
            }
          </>
        )}
      </div>
    </div>
  );
};

export default ClassroomPage;
