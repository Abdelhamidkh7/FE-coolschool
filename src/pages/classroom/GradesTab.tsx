/* === src/pages/classroom/GradesTab.tsx === */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

interface Quiz { id: number; title: string; createdAt: string; submitted?: boolean; }
interface User { username: string; firstname: string; lastname: string; email: string; }
interface Submission { id: number; studentId: number; score: number; feedback: string; submissionDate: string; user?: User; }

type SortField = 'name' | 'username' | 'email' | 'score' | 'submissionDate';

const GradesTab: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Load quizzes
  useEffect(() => {
    if (!classroomId) return;
    (async () => {
      try {
        const res = await axios.get<Quiz[]>(
          `http://localhost:8080/api/quiz/class/${classroomId}`,
          { headers }
        );
        const sorted = res.data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map(q => ({ ...q, title: q.title.trim() }));
        setQuizzes(sorted);
        if (sorted.length) setSelectedQuizId(sorted[0].id);
      } catch (e) {
        console.error('Failed loading quizzes', e);
      }
    })();
  }, [classroomId]);

  // Load submissions for selected quiz
  useEffect(() => {
    if (!selectedQuizId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await axios.get<{ content: Submission[] }>(
          `http://localhost:8080/api/quiz/${selectedQuizId}/grades`,
          { headers }
        );
        const withUsers = await Promise.all(
          res.data.content.map(async s => {
            try {
              const { data: user } = await axios.get<User>(
                `http://localhost:8080/api/user/${s.studentId}`,
                { headers }
              );
              return { ...s, user };
            } catch {
              return s;
            }
          })
        );
        setSubmissions(withUsers);
      } catch (e) {
        console.error('Failed loading submissions', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedQuizId]);

  const handleSort = (field: SortField) => {
    setSortDirection(field === sortField && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedSubs = [...submissions].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'name': {
        const nameA = a.user ? `${a.user.firstname} ${a.user.lastname}` : '';
        const nameB = b.user ? `${b.user.firstname} ${b.user.lastname}` : '';
        return nameA.localeCompare(nameB) * dir;
      }
      case 'username':
        return (a.user?.username ?? '').localeCompare(b.user?.username ?? '') * dir;
      case 'email':
        return (a.user?.email ?? '').localeCompare(b.user?.email ?? '') * dir;
      case 'score':
        return ((a.score ?? 0) - (b.score ?? 0)) * dir;
      case 'submissionDate':
        return (
          new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime()
        ) * dir;
      default:
        return 0;
    }
  });

  return (
    <div className="p-8 space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grades</h1>
        <div>
          <label htmlFor="quiz-select" className="sr-only">Select Quiz</label>
          <select
            id="quiz-select"
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-300"
            value={selectedQuizId ?? ''}
            onChange={e => setSelectedQuizId(Number(e.target.value))}
          >
            {quizzes.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading submissions...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Username', 'Email', 'Score', 'Date', 'Feedback'].map((hdr, i) => {
                  const field: SortField = ['name','username','email','score','submissionDate'][i] as SortField;
                  return (
                    <th
                      key={hdr}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center gap-1">
                        {hdr}
                        {sortField === field && (
                          sortDirection === 'asc'
                            ? <ChevronUpIcon size={14} />
                            : <ChevronDownIcon size={14} />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedSubs.map(s => (
                <motion.tr
                  key={s.id}
                  className="hover:bg-indigo-50 cursor-pointer transition-colors"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(
                    `/classroom/${classroomId}/grades/${selectedQuizId}/submission/${s.id}`
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{s.user?.firstname} {s.user?.lastname}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{s.user?.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{s.user?.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{s.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(s.submissionDate).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{s.feedback || '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GradesTab;
