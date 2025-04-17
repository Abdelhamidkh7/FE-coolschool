import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle, ChevronDown, Download, Trash2 } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface Student {
  studentId: number;
  firstname: string;
  lastname: string;
  username: string;
}

interface AttendanceCell {
  id?: number;
  studentId: number;
  date: string;
  status: "PRESENT" | "ABSENT";
}

const AttendanceComponent = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceCell[]>([]);
  const [sessionDates, setSessionDates] = useState<{ date: string; editable: boolean }[]>([]);
  const [editingCell, setEditingCell] = useState<{ studentId: number; date: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const updateSessionDates = (records: AttendanceCell[]) => {
    const dates = Array.from(new Set(records.map((a) => a.date))).sort();
    setSessionDates(dates.map((d) => ({ date: d, editable: false })));
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get<Student[]>(`http://localhost:8080/api/classroom/${classroomId}/students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to load students", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttendance = async () => {
      try {
        const res = await axios.get<AttendanceCell[]>(`http://localhost:8080/api/attendance/${classroomId}/students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAttendance(res.data);
        updateSessionDates(res.data);
      } catch (err) {
        console.error("Failed to load attendance", err);
      }
    };

    if (classroomId) {
      fetchStudents();
      fetchAttendance();
    }
  }, [classroomId]);

  const addClassSession = () => {
    const latestDate = sessionDates.length > 0
      ? new Date(sessionDates[sessionDates.length - 1].date)
      : new Date();
    const nextDate = new Date(latestDate);
    nextDate.setDate(latestDate.getDate() + 1);
    const newDate = nextDate.toISOString().split("T")[0];

    setSessionDates((prev) => [...prev, { date: newDate, editable: true }]);
  };

  const deleteSessionDate = async (dateToDelete: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/attendance/${classroomId}/date/${dateToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessionDates((prev) => prev.filter((s) => s.date !== dateToDelete));
      setAttendance((prev) => prev.filter((a) => a.date !== dateToDelete));
    } catch (err) {
      console.error("Failed to delete date column", err);
    }
  };

  const toggleAttendance = async (studentId: number, date: string, newStatus: "PRESENT" | "ABSENT") => {
    const existing = attendance.find((a) => a.studentId === studentId && a.date === date);

    const payload = { studentId, date, status: newStatus };
    try {
      if (existing && existing.id) {
        await axios.put(`http://localhost:8080/api/attendance/${existing.id}/update`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        existing.status = newStatus;
      } else {
        const res = await axios.post(`http://localhost:8080/api/attendance/${classroomId}/mark`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setAttendance((prev) => [...prev, res.data as AttendanceCell]);
      }
    } catch (err) {
      console.error("Failed to update attendance", err);
    }
    setEditingCell(null);
  };

  const getStatus = (studentId: number, date: string): "PRESENT" | "ABSENT" | null => {
    const record = attendance.find((a) => a.studentId === studentId && a.date === date);
    return record?.status || null;
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/attendance/${classroomId}/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
  
      // Type assertion to fix the TypeScript error
      const blob = new Blob([response.data as BlobPart], { type: response.headers['content-type'] });
  
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_${classroomId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export attendance", err);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Attendance Tracker</h2>
        <div className="flex gap-2">
          <button
            onClick={addClassSession}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="mr-2" size={18} /> Add Class
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            <Download className="mr-2" size={18} /> Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500">No students in this classroom.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                
                {sessionDates.map((session, idx) => (
                  <th key={session.date} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center justify-center gap-1">
                      {session.editable ? (
                        <input
                          type="date"
                          value={session.date}
                          className="border rounded px-2 py-1 text-xs"
                          onChange={(e) => {
                            const updated = [...sessionDates];
                            updated[idx].date = e.target.value;
                            setSessionDates(updated);
                          }}
                          onBlur={() => {
                            const updated = [...sessionDates];
                            updated[idx].editable = false;
                            setSessionDates(updated);
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => {
                            const updated = [...sessionDates];
                            updated[idx].editable = true;
                            setSessionDates(updated);
                          }}
                          className="cursor-pointer"
                        >
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      )}
                      <button
                        onClick={() => deleteSessionDate(session.date)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </th>
                  
                ))}
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
  Total Present
</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
  {students.map((student) => {
    const presentCount = attendance.filter(
      (a) => a.studentId === student.studentId && a.status === "PRESENT"
    ).length;

    return (
      <tr key={student.studentId} className="hover:bg-gray-100 transition">
        <td className="px-4 py-2 text-sm text-gray-600">{student.studentId}</td>
        <td className="px-4 py-2 font-medium">
          {student.firstname} {student.lastname}{" "}
          <span className="text-sm text-gray-500">({student.username})</span>
        </td>
        {sessionDates.map((session) => {
          const date = session.date;
          const status = getStatus(student.studentId, date);
          const isEditing =
            editingCell?.studentId === student.studentId &&
            editingCell?.date === date;
          return (
            <td key={date} className="px-4 py-2 text-center">
              {isEditing ? (
                <div className="inline-flex gap-2">
                  <button
                    onClick={() =>
                      toggleAttendance(student.studentId, date, "PRESENT")
                    }
                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() =>
                      toggleAttendance(student.studentId, date, "ABSENT")
                    }
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() =>
                    setEditingCell({ studentId: student.studentId, date })
                  }
                  className="text-gray-500 hover:text-black"
                >
                  {status === "PRESENT" ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : status === "ABSENT" ? (
                    <XCircle className="text-red-600" size={20} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              )}
            </td>
          );
        })}
        <td className="px-4 py-2 text-center font-semibold text-blue-600">
          {presentCount}
        </td>
      </tr>
    );
  })}
</tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceComponent;
