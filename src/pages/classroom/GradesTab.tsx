
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ViewIcon,
  ListIcon,
  DownloadIcon,
} from 'lucide-react';

interface ClassroomDto {
  isOwner: boolean;
}

interface ClassRow {
  studentId: number;
  name: string;
  email: string;
  quizScores: Record<number, number>;
  total: number;
  percentage: number;
}

interface QuizMeta {
  id: number;
  title: string;
}

interface Submission {
  id: number;
  studentId: number;
  score: number;
  feedback: string;
  submissionDate: string;
  isFinalized: boolean;
  user?: { firstname: string; lastname: string; username: string; email: string };
}

type SortField =
  | 'name'
  | 'email'
  | 'total'
  | 'percentage'
  | 'submissionDate'
  | 'score'
  | 'isGraded'
  | `quiz-${number}`;

const API = "http://localhost:8080/api/quiz";

export const GradesTab: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
 
  const state = (location.state as { viewAll?: boolean; selectedQuizId?: number }) || {};
  
  const [isOwner, setIsOwner] = useState(false);
  const [viewAll, setViewAll] = useState<boolean>(state.viewAll ?? true);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(
    state.selectedQuizId ?? null
  );

  const [classRows, setClassRows] = useState<ClassRow[]>([]);
  const [quizzes, setQuizzes] = useState<QuizMeta[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };


  useEffect(() => {
    if (!classroomId) return;
    (async () => {
      try {
        const { data } = await axios.get<ClassroomDto>(
          `http://localhost:8080/api/classroom/${classroomId}`,
          { headers }
        );
        setIsOwner(data.isOwner);
      } catch (err) {
        console.error('Could not fetch classroom owner flag', err);
      }
    })();
  }, [classroomId]);


  useEffect(() => {
    if (!classroomId) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<QuizMeta[]>(
          `${API}/class/${classroomId}`,
          { headers }
        );
        setQuizzes(data);
        if (selectedQuizId === null && data.length) {
          setSelectedQuizId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load quizzes', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [classroomId]);


    useEffect(() => {
      if (!classroomId || !viewAll) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<ClassRow[]>(
          `${API}/class/${classroomId}/grades-summary`,
          { headers }
        );
        setClassRows(data);
      } catch (err) {
        console.error('Failed to load class summary', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [classroomId, isOwner, viewAll]);

 
  useEffect(() => {
    if (selectedQuizId === null) return;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get<{ content: Submission[] }>(
          `${API}/${selectedQuizId}/grades`,
          { headers }
        );
     
        const enriched = await Promise.all(
          res.data.content.map(async s => {
            try {
              const { data: u } = await axios.get<Submission['user']>(
                `http://localhost:8080/api/user/${s.studentId}`,
                { headers }
              );
              return { ...s, user: u };
            } catch {
              return s;
            }
          })
        );
        setSubmissions(enriched);
      } catch (err) {
        console.error('Failed to load quiz submissions', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedQuizId]);

  // sorting helpers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedClass = [...classRows].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'name':       return a.name.localeCompare(b.name) * dir;
      case 'email':      return a.email.localeCompare(b.email) * dir;
      case 'total':      return (a.total - b.total) * dir;
      case 'percentage': return (a.percentage - b.percentage) * dir;
      default:
        if (sortField.startsWith('quiz-')) {
          const id = +sortField.split('-')[1];
          return ((a.quizScores[id]||0) - (b.quizScores[id]||0)) * dir;
        }
        return 0;
    }
  });

  const sortedSubs = [...submissions].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'name': {
        const na = a.user ? `${a.user.firstname} ${a.user.lastname}` : '';
        const nb = b.user ? `${b.user.firstname} ${b.user.lastname}` : '';
        return na.localeCompare(nb) * dir;
      }
      case 'email':
        return (a.user?.email||'').localeCompare(b.user?.email||'') * dir;
      case 'score':
        return (a.score - b.score) * dir;
      case 'submissionDate':
        return (new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime()) * dir;
      case 'isGraded':
        return ((a.isFinalized ? 1 : 0) - (b.isFinalized ? 1 : 0)) * dir;
      default:
        return 0;
    }
  });

  // export (owner only)
  const handleExport = async () => {
    if (!isOwner || !classroomId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/class/${classroomId}/grades-summary/export`, {
        headers,
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cd = res.headers['content-disposition'];
      let fn = 'grades_summary.xlsx';
      if (cd) {
        const m = cd.match(/filename="?(.+)"?/);
        if (m) fn = m[1];
      }
      a.download = fn;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-white text-black">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: '#002d55' }}>
          Grades
        </h1>
        <div className="space-x-2">
          {isOwner && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <DownloadIcon size={16} /> Export
            </button>
          )}
          {/* {isOwner && ( */}
            <button
              onClick={() => setViewAll(v => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {viewAll ? <ListIcon size={16} /> : <ViewIcon size={16} />}
              {viewAll ? 'Class Summary' : 'Quiz Grades'}
            </button>
          {/* )} */}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: '#002d55' }}>
          Loading…
        </div>
      ) : viewAll ? (
        /* ── OWNER: CLASS SUMMARY ── */
        <motion.table
          className="w-full table-auto rounded-2xl shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <thead className="bg-gray-50">
            <tr>
              <th onClick={() => handleSort('name')} className="px-4 py-3 cursor-pointer">
                <div className="flex items-center gap-1">
                  Name {sortField==='name' && (sortDir==='asc'? <ChevronUpIcon size={14}/> : <ChevronDownIcon size={14}/>)}
                </div>
              </th>
              <th onClick={() => handleSort('email')} className="px-4 py-3 cursor-pointer">
                <div className="flex items-center gap-1">
                  Email {sortField==='email'&& (sortDir==='asc'? <ChevronUpIcon size={14}/> : <ChevronDownIcon size={14}/>)}
                </div>
              </th>
              {quizzes.map(q => (
                <th
                  key={q.id}
                  onClick={() => handleSort(`quiz-${q.id}` as SortField)}
                  className="px-4 py-3 cursor-pointer text-center"
                  title={q.title}
                >
                  <div className="flex justify-center items-center gap-1">
                    {q.title.length > 10 ? `${q.title.slice(0,10)}…` : q.title}
                    {sortField===`quiz-${q.id}`&& (sortDir==='asc'? <ChevronUpIcon size={12}/> : <ChevronDownIcon size={12}/>)}
                  </div>
                </th>
              ))}
              <th onClick={() => handleSort('total')} className="px-4 py-3 cursor-pointer">
                <div className="flex items-center gap-1">
                  Total {sortField==='total'&& (sortDir==='asc'? <ChevronUpIcon size={14}/> : <ChevronDownIcon size={14}/>)}
                </div>
              </th>
              <th onClick={() => handleSort('percentage')} className="px-4 py-3 cursor-pointer">
                <div className="flex items-center gap-1">
                  % {sortField==='percentage'&& (sortDir==='asc'? <ChevronUpIcon size={14}/> : <ChevronDownIcon size={14}/>)}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedClass.map(r => (
              <tr key={r.studentId} className="hover:bg-blue-50">
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2">{r.email}</td>
                {quizzes.map(q => (
                  <td key={q.id} className="px-4 py-2 text-center">
                    {r.quizScores[q.id] ?? '-'}
                  </td>
                ))}
                <td className="px-4 py-2 text-center font-semibold">{r.total}</td>
                <td className="px-4 py-2 text-center">{r.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </motion.table>
      ) : (
        /* ── STUDENT OR OWNER: PER-QUIZ VIEW ── */
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="font-medium" style={{ color: '#002d55' }}>Quiz:</label>
            <select
              value={selectedQuizId || ''}
              onChange={e => setSelectedQuizId(Number(e.target.value))}
              className="px-4 py-2 rounded border"
            >
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>

          <motion.table
            className="w-full rounded-2xl shadow-lg table-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <thead className="bg-gray-50">
              <tr>
                {['Name','Username','Email','Score','Graded','Date','Feedback'].map(hdr => {
                  let field: SortField = 'name';
                  if (hdr === 'Username')    field = 'name';
                  if (hdr === 'Email')       field = 'email';
                  if (hdr === 'Score')       field = 'score';
                  if (hdr === 'Graded')      field = 'isGraded';
                  if (hdr === 'Date')        field = 'submissionDate';
                  return (
                    <th
                      key={hdr}
                      onClick={() => handleSort(field)}
                      className="px-6 py-3 cursor-pointer text-left text-sm font-semibold"
                      style={{ color: '#002d55' }}
                    >
                      <div className="flex items-center gap-1">
                        {hdr}
                        {sortField===field && (
                          sortDir==='asc'
                            ? <ChevronUpIcon size={14}/>
                            : <ChevronDownIcon size={14}/>
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
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={
                    isOwner
                      ? () =>
                          navigate(
                            `/classroom/${classroomId}/grades/${selectedQuizId}/submission/${s.id}`
                          )
                      : undefined
                  }
                  
                >
                  <td className="px-6 py-4">{s.user?.firstname} {s.user?.lastname}</td>
                  <td className="px-6 py-4">{s.user?.username}</td>
                  <td className="px-6 py-4">{s.user?.email}</td>
                  <td className="px-6 py-4 font-semibold">{s.score}</td>
                  <td className="px-6 py-4">{s.isFinalized ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4">{new Date(s.submissionDate).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600">{s.feedback || '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      )}
    </div>
  );
};

export default GradesTab;
