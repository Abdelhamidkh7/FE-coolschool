import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Types
interface QuizDetail { quizType: string; }
interface Answer {
  id: number;
  questionText?: string;
  answerText: string;
  questionType: string;
  score: number;
  maxScore: number;
  assignedScore: number;
}
interface SubmissionDetail {
  id: number;
  studentId: number;
  feedback: string;
  answers: Answer[];
  submissionDate: string;
  user?: { firstname: string; lastname: string };
}

const SubmissionGradePage: React.FC = () => {
  const { classroomId, quizId, submissionId } = useParams<{ classroomId: string; quizId: string; submissionId: string }>();
  const navigate = useNavigate();

  // State
  const [quizType, setQuizType] = useState<string>('');
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [assignmentScore, setAssignmentScore] = useState<number>(0);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        // Fetch quiz type
        const { data: quiz } = await axios.get<QuizDetail>(
          `http://localhost:8080/api/quiz/${quizId}`,
          { headers }
        );
        setQuizType(quiz.quizType);

        if (quiz.quizType === 'ASSIGNMENT') {
          // Download assignment PDF
          const { data: blob } = await axios.get<Blob>(
            `http://localhost:8080/api/quiz/${quizId}/submission/${submissionId}/file`,
            { headers, responseType: 'blob' }
          );
          setFileUrl(URL.createObjectURL(blob));
        } else {
          // Load quiz submission data
          const { data } = await axios.get<SubmissionDetail>(
            `http://localhost:8080/api/quiz/${quizId}/submission/${submissionId}`,
            { headers }
          );
          setSubmission(data);
          setFeedback(data.feedback);
          setAnswers(
            data.answers.map(a => ({
              ...a,
              assignedScore: a.questionType === 'MCQ' ? a.score : 0,
            }))
          );
        }
      } catch (err) {
        console.error('Error loading submission:', err);
        toast.error('Failed to load submission');
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId, submissionId]);

  const handleScoreChange = (idx: number, val: number) => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[idx].assignedScore = Math.max(0, Math.min(val, copy[idx].maxScore));
      return copy;
    });
  };

  const saveGrade = async () => {
    try {
      const payload = quizType === 'ASSIGNMENT'
        ? { score: assignmentScore, feedback, answers: [] }
        : { score: answers.reduce((sum, a) => sum + a.assignedScore, 0), feedback, answers: answers.map(a => ({ submissionAnswerId: a.id, score: a.assignedScore })) };
      const id = quizType === 'ASSIGNMENT' ? submissionId : submission?.id;
      await axios.put(
        `http://localhost:8080/api/quiz/${quizId}/grade/${id}`,
        payload,
        { headers }
      );
      toast.success('Grade saved successfully!');
      setTimeout(() => navigate(-1), 600);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Could not save grade');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <Toaster position="top-right" />
      <motion.button
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }}
        className="flex items-center text-indigo-600 hover:underline"
      >
        ← Back to Grades
      </motion.button>

      {quizType === 'ASSIGNMENT' ? (
        <div className="space-y-6">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Download Assignment Submission</h3>
            <a
              href={fileUrl}
              download={`submission_${submissionId}.pdf`}
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Download PDF
            </a>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-medium mb-2">Grade Assignment</h4>
            <div className="mb-4">
              <label className="block font-medium mb-1">Score</label>
              <input
                type="number"
                min={0}
                value={assignmentScore}
                onChange={e => setAssignmentScore(Number(e.target.value))}
                className="w-32 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Overall Feedback</label>
              <textarea
                rows={4}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter feedback for the assignment"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={saveGrade}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
              >
                Submit Grade
              </button>
            </div>
          </div>
        </div>
      ) : submission ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <header className="mb-6">
            <h2 className="text-2xl font-bold">
              Student: {submission.user?.firstname} {submission.user?.lastname}
            </h2>
            <p className="text-gray-500">
              Submitted on {new Date(submission.submissionDate).toLocaleString()}
            </p>
          </header>

          <div className="space-y-4">
            {answers.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="text-lg font-semibold mb-2">{a.questionText || `Question ${i + 1}`}</h3>
                <p className="mb-4 text-gray-700">
                  <strong>Answer:</strong> {a.answerText || '—'}
                </p>
                <div className="flex items-center gap-3">
                  <label className="font-medium">Score:</label>
                  <input
                    type="number"
                    min={0}
                    max={a.maxScore}
                    value={a.assignedScore}
                    onChange={e => handleScoreChange(i, parseInt(e.target.value, 10) || 0)}
                    className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <span className="text-gray-500">/ {a.maxScore}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <label className="block font-medium mb-1">Overall Feedback</label>
            <textarea
              rows={4}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Enter overall feedback"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={saveGrade}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Submit Grade
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12 text-gray-500">No submission found.</div>
      )}
    </div>
  );
};

export default SubmissionGradePage;