
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Plus, Trash2 } from "lucide-react";
import CreateQuizForm from "../../components/CreateQuizForm";
import { useParams, useNavigate } from "react-router-dom";
import { useQuizContext } from "../../context/QuizContext";
import SuccessOverlay from "../../components/SuccessOverlay";
import toast from "react-hot-toast";

// Quiz metadata interface
interface QuizMeta {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  submitted: boolean;
  opened: boolean;
  quizType: string; // "QUIZ" or "ASSIGNMENT"
}

interface ClassroomDto {
  isOwner: boolean;
}

type Notice = {
  quiz: QuizMeta;
  message: string;
};

const AssignmentsTab: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const { startQuiz } = useQuizContext();

  const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch classroom to detect owner
  useEffect(() => {
    if (!classroomId) return;
    axios
      .get<ClassroomDto>(
        `http://localhost:8080/api/classroom/${classroomId}`,
        { headers }
      )
      .then(res => setIsOwner(res.data.isOwner))
      .catch(console.error);
  }, [classroomId]);

  // Fetch quizzes once
  useEffect(() => {
    if (!classroomId) return;
    axios
      .get<QuizMeta[]>(
        `http://localhost:8080/api/quiz/class/${classroomId}`,
        { headers }
      )
      .then(res => setQuizzes(
        res.data.sort(
          (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
      ))
      .catch(console.error);
  }, [classroomId]);

  // Success overlay timer
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 2000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  const isAvailable = (q: QuizMeta) => {
    if (!q.startDate || !q.endDate) return true;
    const now = new Date();
    return now >= new Date(q.startDate) && now <= new Date(q.endDate);
  };

  // Handle card click
  const onCardClick = (quiz: QuizMeta) => {
    if (isOwner) {
      // teacher: unlimited access
      navigate(`/classroom/${classroomId}/assignments/${quiz.id}`);
      return;
    }
    // students: original logic
    if (quiz.quizType === "QUIZ" && quiz.submitted) return;
    if (!isAvailable(quiz)) return;
    if (quiz.quizType === "QUIZ" && quiz.opened && !quiz.submitted) return;

    const message =
      quiz.quizType === "QUIZ"
        ? "You may only access this quiz once. Are you sure you want to begin?"
        : "This assignment can be revisited multiple times. Please do not cheat.";
    setNotice({ quiz, message });
  };

  // Confirm notice
  const handleNoticeConfirm = () => {
    if (!notice) return;
    const { quiz } = notice;
    if (quiz.quizType === "QUIZ") {
      startQuiz(quiz.id);
      setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, opened: true } : q));
    }
    navigate(`/classroom/${classroomId}/assignments/${quiz.id}`);
    setNotice(null);
  };
  const handleNoticeCancel = () => setNotice(null);

  // Delete quiz (owner only)
  const deleteQuiz = async (quizIdToDelete: number) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/quiz/${quizIdToDelete}`,
        { headers }
      );
      setQuizzes(prev => prev.filter(q => q.id !== quizIdToDelete));
      toast.success("Quiz deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto relative">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quizzes / Assignments</h2>
        {isOwner && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <Plus className="mr-2" size={18} />
            {showForm ? "Cancel" : "Create Quiz"}
          </button>
        )}
      </div>

      {/* Create form overlay */}
      {showForm && classroomId && (
        <div className="fixed inset-0 bg-white z-40 p-6 overflow-auto shadow-lg">
          <button
            className="mb-4 text-blue-600 hover:underline"
            onClick={() => setShowForm(false)}
          >
            ← Back
          </button>
          <CreateQuizForm
            classId={classroomId}
            onSuccess={async () => {
              setShowForm(false);
              const res = await axios.get<QuizMeta[]>(
                `http://localhost:8080/api/quiz/class/${classroomId}`,
                { headers }
              );
              setQuizzes(res.data);
              setShowSuccess(true);
            }}
          />
        </div>
      )}

      {/* Quiz cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map(q => {
          const available = isAvailable(q);
          const locked = q.quizType === "QUIZ" && q.opened && !q.submitted;
          const base = "p-4 rounded-lg shadow-lg border-l-4 transition-all relative";

          // student styles
          let style = "border-red-400 bg-gray-100 cursor-not-allowed";
          if (isOwner || (available && !(q.quizType === "QUIZ" && locked))) {
            style = "border-blue-500 bg-white hover:shadow-xl cursor-pointer";
          }
          if (!isOwner && q.quizType === "QUIZ" && q.submitted) {
            style = "border-green-500 bg-gray-50 cursor-not-allowed";
          }

          return (
            <div key={q.id} className={`${base} ${style}`}>              
              <h3 className="text-lg font-medium mb-1">{q.title}</h3>
              <p className="text-sm text-gray-500">
                Starts: {moment(q.startDate).format('MMM Do YYYY, h:mm A')}<br />
                Ends: {moment(q.endDate).format('MMM Do YYYY, h:mm A')}
              </p>
              {/* owner delete */}
              {isOwner && (
                <button
                  onClick={() => deleteQuiz(q.id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  title="Delete quiz"
                >
                  <Trash2 size={16} />
                </button>
              )}

              {/* student badges */}
              {!isOwner && q.quizType === "QUIZ" && q.submitted && (
                <p className="mt-2 text-sm font-semibold text-green-700">✓ Submitted</p>
              )}
              {!isOwner && locked && (
                <p className="mt-2 text-sm font-semibold text-orange-500">🕒 Already Opened</p>
              )}
              {!isOwner && !q.submitted && !available && (
                <p className="mt-2 text-sm font-semibold text-red-500">Not Available</p>
              )}

              {/* overlay click handler */}
              <div
                className="absolute inset-0"
                onClick={() => onCardClick(q)}
              />
            </div>
          );
        })}
      </div>

      {showSuccess && <SuccessOverlay />}

      {/* Notice Modal */}
      {notice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
            <p className="mb-4 text-gray-800">{notice.message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleNoticeCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >Cancel</button>
              <button
                onClick={handleNoticeConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >Proceed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;