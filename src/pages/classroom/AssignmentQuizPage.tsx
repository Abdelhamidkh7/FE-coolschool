import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";
import { useQuizContext } from "../../context/QuizContext";
import SuccessOverlay from "../../components/SuccessOverlay";

interface Question {
  id: number;
  question: string;
  questionType: "MCQ" | "ESSAY";
  choices: string[];
  points: number;
}

interface QuizDetail {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  submitted: boolean;
  opened: boolean;
  quizType: string; // "ASSIGNMENT" or "QUIZ"
  questions: Question[];
}

interface Answer {
  question_id: number;
  answerText: string;
}

const AssignmentQuizPage = () => {
  const { classroomId, quizId } = useParams<{ classroomId: string; quizId: string }>();
  const navigate = useNavigate();
  const { startQuiz, clearQuiz } = useQuizContext();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [showNotice, setShowNotice] = useState(true);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch quiz metadata only after user confirms "Enter Quiz"
  const fetchQuiz = async () => {
    if (!quizId) return;
    try {
      startQuiz(Number(quizId));
      const res = await axios.get<QuizDetail>(`http://localhost:8080/api/quiz/${quizId}`, {
        headers
      });
      setQuiz(res.data);
    } catch (error) {
      console.error("Failed to load quiz detail:", error);
      alert("Failed to load quiz. Please try again.");
    }
  };

  // If showSuccess is true, hide overlay after 2s
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Called when user types in an ESSAY or chooses MCQ radio
  const handleAnswerChange = (qIndex: number, text: string) => {
    if (!quiz) return;
    const questionId = quiz.questions[qIndex].id;
    const updated = [...answers];
    const existing = updated.find((a) => a.question_id === questionId);
    if (existing) {
      existing.answerText = text;
    } else {
      updated.push({ question_id: questionId, answerText: text });
    }
    setAnswers(updated);
  };

  // Called when user picks a PDF or any file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };


  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      if (quiz.quizType === "ASSIGNMENT") {
        const formData = new FormData();

        formData.append(
          "submission",
          new Blob([JSON.stringify({ answers })], { type: "application/json" })
        );


        if (file) {
          formData.append("file", file);
        }
        await axios.post(
          `http://localhost:8080/api/quiz/${quiz.id}/submit-file`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
      } else {
        // Quiz => normal JSON
        await axios.post(
          `http://localhost:8080/api/quiz/${quiz.id}/submit`,
          { answers },
          { headers }
        );
      }

      setShowSuccess(true);
      clearQuiz();

      // Delay for 2s to show success animation
      setTimeout(() => {
        navigate(`/classroom/${classroomId}/assignments`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting quiz", error);
      alert("Failed to submit quiz.");
    }
  };

  // If user hits "Back", auto-submit or lose changes
  const handleExit = () => {
    const confirmLeave = window.confirm("Are you sure? Unsubmitted answers are lost.");
    if (confirmLeave) {
      clearQuiz();
      navigate(`/classroom/${classroomId}/assignments`);
    }
  };

  // Show instructions before fetching quiz
  if (showNotice) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 text-center">
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl w-full">
          <h2 className="text-xl font-semibold mb-4">📚 Quiz Instructions</h2>
          <p className="text-gray-700 mb-3">
            Please make sure you're ready before starting. Once you enter, you must complete in one sitting. Your answers will be auto-submitted if you leave.
          </p>
          <p className="text-gray-700 mb-6">
            Don’t open other tabs or refresh. Cheating is not tolerated and may result in penalties.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => navigate(`/classroom/${classroomId}/assignments`)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowNotice(false);
                fetchQuiz();
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Enter Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return <div className="p-4">Loading quiz...</div>;
  }

  return (
    <div className="relative p-4">
      {showSuccess && <SuccessOverlay />}

      <button
        onClick={handleExit}
        className="mb-4 text-blue-600 hover:underline flex items-center"
      >
        ← Back (Auto-Submit)
      </button>

      <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
      <p className="text-sm text-gray-600 mb-6">
        Starts: {moment(quiz.startDate).format("MMM Do YYYY, h:mm A")} <br />
        Ends: {moment(quiz.endDate).format("MMM Do YYYY, h:mm A")}
      </p>

      <div className="space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="p-4 border rounded-md bg-gray-50 shadow-sm">
            <p className="font-semibold mb-3">
              {idx + 1}. {q.question}
            </p>

            {q.questionType === "MCQ" && q.choices.length > 0 ? (
              <div className="space-y-2">
                {q.choices.map((choice, i) => (
                  <label key={i} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={choice}
                      onChange={() => handleAnswerChange(idx, choice)}
                      className="accent-indigo-600"
                    />
                    <span className="text-gray-700">{choice}</span>
                  </label>
                ))}
              </div>
            ) : q.questionType === "MCQ" ? (
              <p className="text-red-500 text-sm">No choices provided!</p>
            ) : (
              <textarea
                className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={4}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {quiz.quizType === "ASSIGNMENT" && (
        <div className="my-6 p-4 border rounded-lg shadow-sm bg-gray-50">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Upload Assignment File (Optional)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded
              file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
              file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            PDF only. Max size: 10MB (example limit).
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default AssignmentQuizPage;
