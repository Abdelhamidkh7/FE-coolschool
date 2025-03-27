import { useState, useEffect } from "react";
import ClassroomCard from "../components/ClassroomCard";
import JoinClassroomModal from "../components/JoinClassroomModal";
import { CreateClassroomModal } from "../components/CreateClassroomModal";
import { fetchClassrooms, createClassroom, joinClassroom } from "../api/ClassroomApi";
import { Loader } from "../components/Loader";
import Sidebar from "../components/Sidebar";

const ClassesPage = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
   
    setLoading(true);
    try {
      const data: any[] = await fetchClassrooms() as any[];
      setClassrooms(data);
    } finally {
      setLoading(false);
    }
  };
  const handleJoinClassroom = async (accessCode: string) => {
    try {
      await joinClassroom(accessCode);
      await loadClassrooms();
      setShowJoinModal(false);
    } catch (error) {
      console.error("Failed to join classroom:", error);
    }
  };

  const handleCreateClassroom = async (classroomData: { title: string; description: string; capacity: number }) => {
    try {
      await createClassroom(classroomData);
      loadClassrooms(); 
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create classroom:", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-4">My Classrooms</h1>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((classroom) => (
              <ClassroomCard key={classroom.id} {...classroom} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6 space-x-4">
          <button className="px-5 py-2 bg-blue-600 text-white rounded" onClick={() => setShowJoinModal(true)}>
            Join Classroom
          </button>
          <button className="px-5 py-2 bg-green-600 text-white rounded" onClick={() => setShowCreateModal(true)}>
            Create Classroom
          </button>
        </div>

        <JoinClassroomModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} onJoin={handleJoinClassroom} />
        <CreateClassroomModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateClassroom} />
      </div>
    </div>
  );
};

export default ClassesPage;
