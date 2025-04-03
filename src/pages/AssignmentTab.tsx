import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Plus } from "lucide-react";
import CreateQuizForm from "../components/CreateQuizForm";

interface Quiz {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  questions: Question[];
  isSubmitted: boolean;
}

interface Question {
  id: number;
  question: string;
  questionType: "MCQ" | "ESSAY";
  choices: { text: string; isCorrect: boolean }[];
  points: number;
}

interface Answer {
  question_id: number;
  answerText: string;
}

const AssignmentsTab = ({ classId }: { classId: string }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get<Quiz[]>(
          `http://localhost:8080/api/quiz/class/${classId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const sorted = res.data.sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        setQuizzes(sorted);
      } catch (error) {
        console.error("Failed to fetch quizzes", error);
      }
    };
    fetchQuizzes();
  }, [classId]);

  const isQuizAvailable = (quiz: Quiz) => {
    const now = new Date();
    const start = new Date(quiz.startDate);
    const end = new Date(quiz.endDate);
    return now >= start && now <= end;
  };

  const handleStartQuiz = (quiz: Quiz) => {
    if (quiz.isSubmitted || !isQuizAvailable(quiz)) return;
    setSelectedQuiz(quiz);
    setAnswers([]);
    setShowModal(true);
  };

  const handleConfirmStart = () => {
    setShowModal(false);
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const questionId = selectedQuiz!.questions[questionIndex].id;
    const updated = [...answers];
    const existing = updated.find((a) => a.question_id === questionId);

    if (existing) {
      existing.answerText = answer;
    } else {
      updated.push({ question_id: questionId, answerText: answer });
    }

    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (!selectedQuiz) return;
    try {
      await axios.post(
        `http://localhost:8080/api/quiz/${selectedQuiz.id}/submit`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Quiz submitted successfully!");
      setSelectedQuiz(null);
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === selectedQuiz.id ? { ...q, isSubmitted: true } : q
        )
      );
    } catch (err) {
      console.error("Error submitting quiz", err);
      alert("Failed to submit quiz.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Available Quizzes</h2>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <Plus className="mr-2" size={18} /> {showForm ? "Cancel" : "Create Quiz"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <CreateQuizForm
            classId={classId}
            onSuccess={() => {
              setShowForm(false);
            }}
          />
        </div>
      )}

      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const available = isQuizAvailable(quiz);
          return (
            <div
              key={quiz.id}
              className={`border p-4 rounded-lg shadow-sm transition ${
                quiz.isSubmitted || !available
                  ? "bg-gray-100 text-gray-600 cursor-default"
                  : "cursor-pointer hover:bg-gray-50"
              }`}
              onClick={() =>
                !quiz.isSubmitted && available && handleStartQuiz(quiz)
              }
            >
              <h3 className="text-lg font-medium">{quiz.title}</h3>
              <p className="text-sm text-gray-500">
                Starts at: {moment(quiz.startDate).format("MMMM Do YYYY, h:mm A")}<br />
                Ends at: {moment(quiz.endDate).format("MMMM Do YYYY, h:mm A")}
              </p>
              {quiz.isSubmitted && (
                <p className="mt-1 text-sm font-semibold text-green-600">Submitted</p>
              )}
              {!available && !quiz.isSubmitted && (
                <p className="mt-1 text-sm font-semibold text-red-500">Not Available</p>
              )}
            </div>
          );
        })}
      </div>

      {showModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to enter this quiz?</h3>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStart}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enter Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedQuiz && !showModal && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6">{selectedQuiz.title}</h2>

          {selectedQuiz.questions.map((q, index) => (
            <div key={index} className="mb-6">
              <p className="mb-2 font-medium">
                {index + 1}. {q.question}
              </p>

              {q.questionType === "MCQ" ? (
                <div className="space-y-2">
                  {q.choices.map((choice, i) => (
                    <label key={i} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={choice.text}
                        onChange={() => handleAnswerChange(index, choice.text)}
                        className="accent-blue-600"
                      />
                      <span>{choice.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  placeholder="Type your answer..."
                  value={
                    answers.find((a) => a.question_id === q.id)?.answerText || ""
                  }
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;
