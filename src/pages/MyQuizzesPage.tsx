import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

interface StudentQuizMetaDto {
  id: number;
  title: string;
  startDate: string | null;
  endDate: string | null;
  classId: number;
  opened: boolean;
  submitted: boolean;
}

const MyQuizzesPage: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<StudentQuizMetaDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.get<StudentQuizMetaDto[]>(
        "http://localhost:8080/api/quiz/my-quizzes",
        { headers }
      );
      setQuizzes(res.data);
    } catch (error) {
      console.error("Failed to fetch user quizzes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  const isQuizAvailable = (quiz: StudentQuizMetaDto) => {
    if (!quiz.startDate || !quiz.endDate) return false;
    const now = new Date();
    const start = new Date(quiz.startDate);
    const end = new Date(quiz.endDate);
    return now >= start && now <= end;
  };

  if (loading) return <div className="p-4">Loading your quizzes...</div>;

  if (quizzes.length === 0)
    return <div className="p-4">No quizzes found.</div>;

  return (
  <div className="flex-1 overflow-y-auto p-4">
  <h1 className="text-2xl font-semibold mb-4">My Quizzes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => {
          const startStr = quiz.startDate
            ? moment(quiz.startDate).format("MMM Do YYYY, h:mm A")
            : "N/A";
          const endStr = quiz.endDate
            ? moment(quiz.endDate).format("MMM Do YYYY, h:mm A")
            : "N/A";

          const available = isQuizAvailable(quiz);
          const isLocked = quiz.opened && !quiz.submitted;

          return (
          
            <div
              key={quiz.id}
              className={`p-4 rounded-lg shadow-lg border-l-4 transition-all ${
                quiz.submitted
                  ? "border-green-500 bg-gray-50 cursor-not-allowed"
                  : available && !isLocked
                  ? "border-blue-500 bg-white hover:shadow-xl cursor-pointer"
                  : "border-red-400 bg-gray-100 cursor-not-allowed"
              }`}
            >
              <h2 className="text-lg font-medium mb-2">{quiz.title}</h2>
              <p className="text-sm text-gray-600">
                Starts: {startStr}
                <br />
                Ends: {endStr}
              </p>

              {quiz.submitted && (
                <p className="mt-2 text-sm font-semibold text-green-700">
                  ✓ Already Submitted
                </p>
              )}
              {isLocked && (
                <p className="mt-2 text-sm font-semibold text-orange-500">
                  🕒 Already Opened
                </p>
              )}
              {!quiz.submitted && !available && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  Not Available
                </p>
              )}

              {/* Only show "View" if it's available and not yet submitted */}
              {!quiz.submitted && available && !isLocked && (
                <button
                  onClick={() =>
                    navigate(
                      `/classroom/${quiz.classId}/assignments/${quiz.id}`
                    )
                  }
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  View
                </button>
              )}
               {/* Classroom link button */}
  <button
    onClick={() => navigate(`/classroom/${quiz.classId}/assignments`)}
    className="mt-2 px-4 py-1 text-sm text-indigo-700 underline hover:text-indigo-900 transition-colors"
  >
    Go to Classroom
  </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyQuizzesPage;
