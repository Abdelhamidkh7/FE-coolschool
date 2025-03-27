import { useEffect, useState } from "react";
import axios from "axios";

interface SubmissionDto {
  studentId: number;
  score: number;
  feedback: string;
  answers: any[];
}

interface UserDTOResponse {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface QuizDto {
  id: number;
  title: string;
  createdAt: string;
}

const GradesTab = ({ classId }: { classId: string }) => {
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [grades, setGrades] = useState<
    (SubmissionDto & { user?: UserDTOResponse })[]
  >([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get<QuizDto[]>(`http://localhost:8080/api/quiz/class/${classId}`,{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        const sorted = res.data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setQuizzes(sorted);
        if (sorted.length > 0) {
          setSelectedQuizId(sorted[0].id);
        }
      } catch (err) {
        console.error("Failed to load quizzes", err);
      }
    };
    fetchQuizzes();
  }, [classId]);

  useEffect(() => {
    if (!selectedQuizId) return;
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const res = await axios.get<SubmissionDto[]>(
          `http://localhost:8080/api/quiz/${selectedQuizId}/grades`,{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        const withUserInfo = await Promise.all(
          res.data.map(async (submission) => {
            try {
              const userRes = await axios.get<UserDTOResponse>(
                `http://localhost:8080/api/user/${submission.studentId}`
              );
              return { ...submission, user: userRes.data };
            } catch {
              return { ...submission, user: undefined };
            }
          })
        );

        setGrades(withUserInfo);
      } catch (err) {
        console.error("Failed to load grades", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [selectedQuizId]);

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Quiz
        </label>
        <select
          value={selectedQuizId ?? ""}
          onChange={(e) => setSelectedQuizId(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded shadow-sm w-full max-w-sm"
        >
          {quizzes.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading grades...</p>
      ) : grades.length === 0 ? (
        <p className="text-gray-500">No submissions yet for this quiz.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {grades.map((g, i) => (
                <tr key={i} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-2">{g.user?.firstname || "Unknown"}</td>
                  <td className="px-4 py-2">{g.user?.lastname || "Unknown"}</td>
                  <td className="px-4 py-2">{g.user?.username || "-"}</td>
                  <td className="px-4 py-2">{g.user?.email || "-"}</td>
                  <td className="px-4 py-2">{g.score}</td>
                  <td className="px-4 py-2">{g.feedback || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GradesTab;
