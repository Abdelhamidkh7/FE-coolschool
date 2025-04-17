
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Plus } from "lucide-react";
import CreateQuizForm from "../../components/CreateQuizForm";
import { useParams, useNavigate } from "react-router-dom";
import { useQuizContext } from "../../context/QuizContext";

// Quiz + question types
interface QuizMeta {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  submitted: boolean;
  opened: boolean;
  quizType: string;
  // if needed: classId: number;
}

const AssignmentsTab = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();

  // from QuizContext
  const { /* quizInProgress, currentQuizId, startQuiz, clearQuiz */ } = useQuizContext();

  // local states
  const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ─────────────────────────────────────────────────────────
  // 1) fetch quizzes for a classroom
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!classroomId) return;
      try {
        const res = await axios.get<QuizMeta[]>(
          `http://localhost:8080/api/quiz/class/${classroomId}`,
          { headers }
        );
        const sorted = res.data.sort(
          (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        setQuizzes(sorted);
      } catch (error) {
        console.error("Failed to fetch quizzes", error);
      }
    };
    fetchQuizzes();
  }, [classroomId]);

  // optional success overlay
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

 
  const isQuizAvailable = (quiz: QuizMeta) => {
    if (!quiz.startDate || !quiz.endDate) return true; 
    const now = new Date();
    const start = new Date(quiz.startDate);
    const end = new Date(quiz.endDate);
    return now >= start && now <= end;
  };

  // On click: navigate to /classroom/:classId/assignments/:quizId
  const handleQuizClick = (quiz: QuizMeta) => {
    const available = isQuizAvailable(quiz);
    const isLocked = quiz.opened && !quiz.submitted;

    if (!quiz.submitted && available && !isLocked) {
      // user can attempt quiz
      navigate(`/classroom/${classroomId}/assignments/${quiz.id}`);
    }
  };

  // create new quiz success
  const handleNewQuizSuccess = async () => {
    setShowForm(false);
    // refetch
    if (!classroomId) return;
    try {
      const res = await axios.get<QuizMeta[]>(
        `http://localhost:8080/api/quiz/class/${classroomId}`,
        { headers }
      );
      setQuizzes(res.data);
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to refetch quizzes", error);
    }
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto relative">
     {/* // {showSuccess && <SuccessOverlay />} */}

      {/* top bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quizzes / Assignments</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <Plus className="mr-2" size={18} />
          {showForm ? "Cancel" : "Create Quiz"}
        </button>
      </div>

      {/* create quiz form */}
      {showForm && classroomId && (
        <div className="absolute top-0 left-0 w-full h-full bg-white z-40 p-6 overflow-auto shadow-lg">
          <button
            className="mb-4 text-blue-600 hover:underline"
            onClick={() => setShowForm(false)}
          >
            ← Back
          </button>
          <CreateQuizForm classId={classroomId} onSuccess={handleNewQuizSuccess} />
        </div>
      )}

      {/* quiz cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => {
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
              onClick={() => handleQuizClick(quiz)}
            >
              <h3 className="text-lg font-medium mb-1">{quiz.title}</h3>
              <p className="text-sm text-gray-500">
                Starts: {moment(quiz.startDate).format("MMM Do YYYY, h:mm A")}
                <br />
                Ends: {moment(quiz.endDate).format("MMM Do YYYY, h:mm A")}
              </p>

              {quiz.submitted && (
                <p className="mt-2 text-sm font-semibold text-green-700">
                  ✓ Already Submitted
                </p>
              )}
              {isLocked && (
                <p className="mt-2 text-sm font-semibold text-orange-500">🕒 Already Opened</p>
              )}
              {!quiz.submitted && !available && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  Not Available
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentsTab;
