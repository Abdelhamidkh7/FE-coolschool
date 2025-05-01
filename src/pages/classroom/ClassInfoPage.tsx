
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  Trash2Icon,
  Edit2Icon,
  RefreshCcwIcon,
  LogOutIcon,
  UserXIcon,
} from "lucide-react";

interface ClassroomDto {
  id: number;
  title: string;
  description: string;
  capacity: number;
  isOwner: boolean;
}
interface UserDTOResponse {
  studentId: number;
  firstname: string;
  lastname: string;
  email: string;
}

const COLORS = {
  primary: "#0065ea",
  dark: "#002d55",
  yellow: "#df8300",
  red: "#e53e3e",
};
const API = "http://localhost:8080/api/classroom";

export const ClassInfoPage: React.FC = () => {
  const { classroomId: classId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();

  const [cls, setCls] = useState<ClassroomDto | null>(null);
  const [students, setStudents] = useState<UserDTOResponse[]>([]);
  const [accessCode, setAccessCode] = useState<string>("—");
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  // 1️⃣ Load only the core classroom DTO
  useEffect(() => {
    if (!classId) return;
    axios
      .get<ClassroomDto>(`${API}/${classId}`, { headers })
      .then(res => {
        setCls(res.data);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load class info");
      })
      .finally(() => setLoading(false));
  }, [classId]);


  useEffect(() => {
    if (!cls?.isOwner) return;
    axios
      .all([
        axios.get<UserDTOResponse[]>(`${API}/${classId}/students`, { headers }),
        axios.get<string>(`${API}/${classId}/access-code`, { headers }),
      ])
      .then(([sRes, codeRes]) => {
        setStudents(sRes.data);
        setAccessCode(codeRes.data);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load owner data");
      });
  }, [cls, classId]);


  const regenerate = async () => {
    try {
      const { data } = await axios.post<string>(
        `${API}/${classId}/access-code/generate`,
        {},
        { headers }
      );
      setAccessCode(data);
      toast.success("Access code regenerated");
    } catch {
      toast.error("Could not regenerate code");
    }
  };


  const handleDelete = async () => {
    if (!window.confirm("Delete this class forever?")) return;
    try {
      await axios.delete(`${API}/delete-class/${classId}`, { headers });
      toast.success("Class deleted");
      navigate("/classes");
    } catch {
      toast.error("Delete failed");
    }
  };


  const handleLeave = async () => {
    if (!window.confirm("Leave this class?")) return;
    try {
      await axios.post(`${API}/leave/${classId}`, {}, { headers });
      toast.success("You left the class");
      navigate("/classes");
    } catch {
      toast.error("Could not leave");
    }
  };


  const kickStudent = async (stuId: number) => {
    if (!window.confirm("Remove this student?")) return;
    try {
      await axios.post(`${API}/${classId}/kick/${stuId}`, {}, { headers });
      setStudents(students.filter(s => s.studentId !== stuId));
      toast.success("Student removed");
    } catch {
      toast.error("Could not remove");
    }
  };

  if (loading || !cls) {
    return <div className="p-6 text-center text-gray-600">Loading…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold" style={{ color: COLORS.dark }}>
          {cls.title}
        </h1>
        <div className="space-x-2">
          {cls.isOwner && (
            <>
              <button
                onClick={() => navigate(`/classroom/${classId}/edit`)}
                className="inline-flex items-center px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                <Edit2Icon className="mr-1" size={16} /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2Icon className="mr-1" size={16} /> Delete
              </button>
            </>
          )}
          <button
            onClick={handleLeave}
            className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            <LogOutIcon className="mr-1" size={16} /> Leave
          </button>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Details */}
        <div className="space-y-4 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
            Class Details
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap break-words">
  {cls.description}
</p>

          <div className="flex flex-wrap gap-4 text-gray-800">
            <div>
              <strong>Capacity:</strong> {cls.capacity}
            </div>
            {cls.isOwner && (
              <div className="flex items-center space-x-2">
                <strong>Access Code:</strong>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{accessCode}</span>
                <button
                  onClick={regenerate}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Regenerate Code"
                >
                  <RefreshCcwIcon size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Students list (owner only) */}
        {cls.isOwner && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: COLORS.primary }}
            >
              Students ({students.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.studentId} className="hover:bg-gray-100">
                      <td className="p-2">
                        {s.firstname} {s.lastname}
                      </td>
                      <td className="p-2">{s.email}</td>
                      <td className="p-2">
                        <button
                          onClick={() => kickStudent(s.studentId)}
                          className="text-red-600 hover:underline flex items-center"
                        >
                          <UserXIcon size={16} className="mr-1" /> Kick
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
