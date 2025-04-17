// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import InnerSidebar from "../components/InnerSidebar";
// import Chat from "./classroom/Chat";
// // import Assignments from "../components/Assignments";
// // import Grades from "../components/Grades";
// import AssignmentsTab from "./classroom/AssignmentTab";
// import GradesTab from "./classroom/GradesTab";

// import { getClassroom } from "../api/ClassroomApi";
// import { Loader } from "../components/Loader";
// import AttendanceComponent from "./classroom/AttendanceTab";


// const ClassroomPage = () => {
//   const { classroomId } = useParams<{ classroomId: string }>();
//   const [activeTab, setActiveTab] = useState<"chat" | "assignments" | "grades" | "attendance">("chat");

//   const [classroom, setClassroom] = useState<{ title: string } | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (classroomId) {
//       fetchClassroom(classroomId);
//     }
//   }, [classroomId]);

//   const fetchClassroom = async (id: string) => {
//     setLoading(true);
//     try {
//       const data = await getClassroom(id);
//       setClassroom(data as { title: string });
//     } catch (error) {
//       console.error("Failed to fetch classroom", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen">
//       <Sidebar />

//       <InnerSidebar classId={classroomId!} setActiveTab={setActiveTab} />

//       <div className="flex-1 p-6 overflow-y-auto">
//         {loading ? (
//           <Loader />
//         ) : (
//           <>
//             {activeTab === "chat" && <Chat classId={classroomId!} />}
// {activeTab === "assignments" && <AssignmentsTab classId={classroomId!} />}
// {activeTab === "grades" && <GradesTab classId={classroomId!} />}
// {activeTab === "attendance" && <AttendanceComponent classId={classroomId!} />}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ClassroomPage;
