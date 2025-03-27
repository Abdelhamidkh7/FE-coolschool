import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

interface Quiz {
  id: number;
  title: string;
  startDate: string;
  questions: Question[];
}

interface Question {
  question_id: number;
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
  const [submittedQuizIds, setSubmittedQuizIds] = useState<number[]>([]); // You can fetch this from the backend later

  const token = localStorage.getItem("token");

  // Fetch quizzes
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

  const handleStartQuiz = (quiz: Quiz) => {
    if (submittedQuizIds.includes(quiz.id)) {
      // Already submitted — show something else later if needed
      return;
    }
    setSelectedQuiz(quiz);
    setAnswers([]);
    setShowModal(true);
  };

  const handleConfirmStart = () => {
    setShowModal(false);
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const questionId = selectedQuiz!.questions[questionIndex].question_id;
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
      setSubmittedQuizIds((prev) => [...prev, selectedQuiz.id]);
    } catch (err) {
      console.error("Error submitting quiz", err);
      alert("Failed to submit quiz.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className={`border p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition ${
              submittedQuizIds.includes(quiz.id)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={() => !submittedQuizIds.includes(quiz.id) && handleStartQuiz(quiz)}
          >
            <h3 className="text-lg font-medium">{quiz.title}</h3>
            <p className="text-sm text-gray-500">
              Starts at: {moment(quiz.startDate).format("MMMM Do YYYY, h:mm A")}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
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

      {/* Quiz Form */}
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
                  onChange={(e) =>
                    handleAnswerChange(index, e.target.value)
                  }
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
