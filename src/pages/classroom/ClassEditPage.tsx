import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

interface ClassroomDto {
  id: number;
  title: string;
  description: string;
  capacity: number;
  isOwner: boolean;
}

const COLORS = {
  primary: "#0065ea",
  dark: "#002d55",
};

export const ClassEditPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassroomDto | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  // Load existing data
  useEffect(() => {
    if (!classroomId) return;
    axios
      .get<ClassroomDto>(`http://localhost:8080/api/classroom/${classroomId}`, {
        headers,
      })
      .then((res) => {
        setCls(res.data);
        setTitle(res.data.title);
        setDescription(res.data.description);
        setCapacity(res.data.capacity);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load class");
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [classroomId, navigate]);

  const handleSave = async () => {
    if (!classroomId) return;
    try {
      const payload: ClassroomDto = {
        id: Number(classroomId),
        title,
        description,
        capacity,
        isOwner: true, // backend will ignore or re-check
      };
      await axios.put<ClassroomDto>(
        `http://localhost:8080/api/classroom/${classroomId}`,
        payload,
        { headers }
      );
      toast.success("Class updated");
      navigate(`/classroom/${classroomId}/info`);
    } catch {
      toast.error("Update failed");
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
        className="flex items-center space-x-4"
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          <ArrowLeftIcon size={16} /> Back
        </button>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.dark }}>
          Edit "{cls.title}"
        </h1>
      </motion.div>

      {/* Form */}
      <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-1 block w-32 border rounded p-2"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
           
            style={{ backgroundColor: COLORS.primary }}
            className="inline-flex items-center px-5 py-2 text-white rounded-lg hover:opacity-90 transition"
          >
            <SaveIcon className="mr-1" size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassEditPage;
