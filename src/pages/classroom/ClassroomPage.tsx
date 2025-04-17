import { Outlet, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import InnerSidebar from "../../components/InnerSidebar";
import { useEffect, useState } from "react";
import { getClassroom } from "../../api/ClassroomApi";
import { Loader } from "../../components/Loader";

const ClassroomPage = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [classroom, setClassroom] = useState<{ title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classroomId) fetchClassroom(classroomId);
  }, [classroomId]);

  const fetchClassroom = async (id: string) => {
    setLoading(true);
    try {
      const data = await getClassroom(id);
      setClassroom(data as { title: string });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
        <InnerSidebar classId={classroomId!} />
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? <Loader /> : <Outlet />}
      </div>
    </div>
  );
};

export default ClassroomPage;
