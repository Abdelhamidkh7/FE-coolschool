import React, { useEffect, useState, useRef, useCallback } from "react";
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
  description: string;
  submitted: boolean;
  opened: boolean;
  quizType: string; // "ASSIGNMENT" or "QUIZ"
  questions: Question[];
}

interface Answer {
  question_id: number;
  answerText: string;
}

const AssignmentQuizPage: React.FC = () => {
  const { classroomId, quizId } = useParams<{ classroomId: string; quizId: string }>();
  const navigate = useNavigate();
  const { startQuiz, clearQuiz } = useQuizContext();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [timer, setTimer] = useState(0);

  const timerRef = useRef<number | null>(null);
  const fetchedRef = useRef(false);
  const autoSubmittedRef = useRef(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // submit handler, wrapped in useCallback
  const handleSubmit = useCallback(async () => {
    if (!quiz || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    setLoading(true);
    try {
      if (quiz.quizType === "ASSIGNMENT") {
        const formData = new FormData();
        formData.append("submission", new Blob([JSON.stringify({ answers })], { type: "application/json" }));
        if (file) formData.append("file", file);
        await axios.post(
          `http://localhost:8080/api/quiz/${quiz.id}/submit-file`,
          formData,
          { headers }
        );
      } else {
        await axios.post(
          `http://localhost:8080/api/quiz/${quiz.id}/submit`,
          { answers },
          { headers }
        );
      }
      setShowSuccess(true);
      clearQuiz();
      setTimeout(() => navigate(`/classroom/${classroomId}/assignments`), 2000);
    } catch {
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  }, [quiz, answers, file, headers, classroomId, clearQuiz, navigate]);

  // fetch quiz only once
  const fetchQuiz = async () => {
    if (!quizId) return;
    setLoading(true);
    try {
      startQuiz(Number(quizId));
      const res = await axios.get<QuizDetail>(`http://localhost:8080/api/quiz/${quizId}`, { headers });
      const quizData = res.data;
      setQuiz(quizData);
      const now = moment();
      const end = moment(quizData.endDate);
      const diff = end.diff(now, 'seconds');
      if (diff <= 0) {
        setExpired(true);
      } else {
        setTimer(diff);
        timerRef.current = window.setInterval(() => {
          setTimer(prev => {
            const next = prev - 1;
            if (next <= 0) {
              if (timerRef.current) clearInterval(timerRef.current);
              setExpired(true);
              return 0;
            }
            return next;
          });
        }, 1000);
      }
    } catch {
      navigate(`/classroom/${classroomId}/assignments`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchQuiz();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // auto-submit 3 seconds before time runs out
  useEffect(() => {
    if (timer === 3) {
      handleSubmit();
    }
  }, [timer, handleSubmit]);

  const handleAnswerChange = (qIndex: number, text: string) => {
    if (!quiz) return;
    const questionId = quiz.questions[qIndex].id;
    setAnswers(prev => {
      const existing = prev.find(a => a.question_id === questionId);
      if (existing) {
        return prev.map(a => a.question_id === questionId ? { ...a, answerText: text } : a);
      }
      return [...prev, { question_id: questionId, answerText: text }];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleExit = () => {
    if (window.confirm("Are you sure? Unsubmitted answers are lost.")) {
      clearQuiz();
      navigate(`/classroom/${classroomId}/assignments`);
    }
  };

  if (loading && !quiz) return <div>Loading...</div>;
  if (expired && !showSuccess) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl text-red-600">Time's up! Submitting...</h2>
      </div>
    );
  }
  if (!quiz) return null;

  const h = Math.floor(timer/3600);
  const m = Math.floor((timer%3600)/60);
  const s = timer%60;

  return (
    <div className="p-4 space-y-4">
      {showSuccess && <SuccessOverlay />}
      <div className="flex justify-between">
        <button onClick={handleExit}>← Back</button>
        <div>Time Left: {`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`}</div>
      </div>

      <h2 className="text-2xl font-bold text-[#002d55]">{quiz.title}</h2>

      {/* Description block */}
      <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-md">
        <h3 className="font-semibold text-blue-600 mb-2">
          {quiz.quizType === 'QUIZ' ? 'Quiz Description' : 'Assignment Description'}
        </h3>
        <p className="text-gray-800 whitespace-pre-wrap">{quiz.description}</p>
      </div>

      <p className="text-sm text-gray-600">
        Begins: {moment(quiz.startDate).format('LLL')} | Ends: {moment(quiz.endDate).format('LLL')}
      </p>

      <div className="space-y-6">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="p-4 border rounded-md bg-gray-50">
            <p className="font-semibold mb-3">{idx+1}. {q.question}</p>
            {q.questionType === 'MCQ' ? (
              <div className="space-y-2">
                {q.choices.map((c,i) => (
                  <label key={i} className="flex items-center">
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      disabled={loading || expired}
                      onChange={() => handleAnswerChange(idx,c)}
                      className="mr-2 accent-[#002d55]"
                    />
                    {c}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                rows={4}
                disabled={loading || expired}
                onChange={e => handleAnswerChange(idx,e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#002d55]"
                placeholder="Type your answer..."
              />
            )}
          </div>
        ))}
      </div>

      {quiz.quizType === 'ASSIGNMENT' && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <label className="block mb-2 text-[#002d55]">Upload File (optional)</label>
          <input
            type="file"
            accept="application/pdf"
            disabled={loading || expired}
            onChange={handleFileChange}
            className="block file:py-2 file:px-4 file:bg-[#0065ea] file:text-white"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || expired}
        className="px-6 py-2 bg-[#0065ea] text-white rounded hover:bg-[#0050aa] transition disabled:opacity-50"
      >Submit Quiz</button>
    </div>
  );
};

export default AssignmentQuizPage;
