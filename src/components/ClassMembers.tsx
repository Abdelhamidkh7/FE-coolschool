import { useEffect, useState } from "react";
import { getStudents } from "../api/ClassroomApi"; 

interface StudentListProps {
  classId: string;
  onClose: () => void;
}

interface Student {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

const StudentList: React.FC<StudentListProps> = ({ classId, onClose }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentList = await getStudents(classId);
        setStudents(studentList as Student[]);
      } catch (err) {
        setError("Failed to fetch students.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Classroom Students</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-gray-700">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : students.length === 0 ? (
          <p className="text-gray-700">No students in this classroom.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2 text-left">Username</th>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border px-4 py-2">{student.username}</td>
                    <td className="border px-4 py-2">
                      {student.firstname} {student.lastname}
                    </td>
                    <td className="border px-4 py-2">{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
