import React, { useState, useEffect, useMemo } from "react";
import { FiPlus, FiSearch, FiPlusCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import ClassroomCard from "../components/ClassroomCard";
import JoinClassroomModal from "../components/JoinClassroomModal";
import { CreateClassroomModal } from "../components/CreateClassroomModal";
import { fetchClassrooms, createClassroom, joinClassroom } from "../api/ClassroomApi";
import { Loader } from "../components/Loader";
import Sidebar from "../components/Sidebar";

// Brand colors
const PRIMARY = "#0065ea";
const DARK = "#002d55";
const ACCENT = "#df8300";
const DANGER = "#dc2626";

export default function ClassesPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadClassrooms();
  }, []);

  async function loadClassrooms() {
    setLoading(true);
    try {
      const list = (await fetchClassrooms()) as any[];
      setClassrooms(list);
    } catch (err) {
      console.error("Error fetching classrooms:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(code: string) {
    try {
      await joinClassroom(code);
      setIsJoinOpen(false);
      loadClassrooms();
    } catch (err) {
      console.error("Join failed:", err);
    }
  }

  async function handleCreate(data: { title: string; description: string; capacity: number }) {
    try {
      await createClassroom(data);
      setIsCreateOpen(false);
      loadClassrooms();
    } catch (err) {
      console.error("Create failed:", err);
    }
  }

  const filtered = useMemo(
    () => classrooms.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    ),
    [search, classrooms]
  );

  return (
    <div className="flex h-full">
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[DARK]" style={{ color: DARK }}>
            My Classrooms
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search classrooms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[PRIMARY]"
                style={{ borderColor: '#ccc' }}
              />
            </div>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="flex items-center px-4 py-2 bg-[PRIMARY] hover:bg-opacity-90 text-white rounded-lg transition"
              style={{ backgroundColor: PRIMARY }}
            >
              <FiSearch className="mr-2" /> Join
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center px-4 py-2 bg-[ACCENT] hover:bg-opacity-90 text-white rounded-lg transition"
              style={{ backgroundColor: ACCENT }}
            >
              <FiPlusCircle className="mr-2" /> Create
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center mt-20">
            <Loader size={64} color={PRIMARY} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-gray-600 mt-10 text-center"
          >
            No classrooms found. Try creating one.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filtered.map(room => (
              <motion.div key={room.id} whileHover={{ scale: 1.03 }}>
                <ClassroomCard {...room} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Modals */}
        
        <JoinClassroomModal
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          onJoin={handleJoin}
          primaryColor={PRIMARY}
          accentColor={ACCENT}
        />
        <CreateClassroomModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
          primaryColor={PRIMARY}
          dangerColor={DANGER}
        />
      </main>
    </div>
  );
}
