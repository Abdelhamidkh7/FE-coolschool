
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { ChevronDownIcon, ChevronUpIcon, ArrowLeft } from "lucide-react";

interface QuizMeta    { id: number; title: string; startDate: string; }
interface QuizDetail  { id: number; maxScore: number; }
interface ClassRow    {
  studentId: number;
  name: string;
  email: string;
  quizScores: Record<number, number>;
  total: number;
  percentage: number;
}
interface Submission { studentId: number; isFinalized: boolean; }

const COLORS = {
  primary:    "#0065ea",
  dark:       "#002d55",
  yellow:     "#df8300",
  lightGray:  "#f3f4f6",
  grayBorder: "#e2e8f0",
  red:        "#e53e3e",
};

type SortField = "name" | "email" | "total" | "percentage";

export const AnalyticsPage: React.FC = () => {
  const { classroomId: classId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();

  const [quizzes, setQuizzes]             = useState<QuizMeta[]>([]);
  const [students, setStudents]           = useState<ClassRow[]>([]);
  const [maxScores, setMaxScores]         = useState<Record<number, number>>({});
  const [selected, setSelected]           = useState<ClassRow | null>(null);
  const [submissionMap, setSubmissionMap] = useState<Record<number, Submission>>({});
  const [loading, setLoading]             = useState(false);

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir,   setSortDir]   = useState<"asc"|"desc">("asc");
const API = "http://localhost:8080/api/quiz"
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    Promise.all([
      axios.get<QuizMeta[]>(`${API}/class/${classId}`, { headers }),
      axios.get<ClassRow[]>(`${API}/class/${classId}/grades-summary`, { headers })
    ])
      .then(async ([qr, sr]) => {
        const sortedQ = qr.data.sort((a,b)=>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        setQuizzes(sortedQ);
        setStudents(sr.data);
       
        const details = await Promise.all(
          sortedQ.map(q => axios.get<QuizDetail>(`${API}/${q.id}`, { headers }))
        );
        setMaxScores(Object.fromEntries(details.map(r => [r.data.id, r.data.maxScore])));
      })
      .catch(console.error)
      .finally(()=>setLoading(false));
  }, [classId]);

  useEffect(() => {
    if (!selected) return;
    let canceled = false;
    Promise.all(quizzes.map(q =>
      axios.get<{ content: Submission[] }>(`${API}/${q.id}/grades`, { headers })
        .then(r => {
          const sub = r.data.content.find(s => s.studentId === selected.studentId);
          return [q.id, { studentId:selected.studentId, isFinalized: sub?.isFinalized ?? false }] as const;
        })
        .catch(() => [q.id, { studentId:selected.studentId, isFinalized:false }] as const)
    )).then(pairs => {
      if (!canceled) setSubmissionMap(Object.fromEntries(pairs));
    });
    return ()=>{ canceled = true; };
  }, [selected, quizzes]);


  const sortedStudents = useMemo(() => {
    return [...students].sort((a,b)=>{
      const d = sortDir==="asc"?1:-1;
      switch(sortField){
        case "name":       return a.name.localeCompare(b.name)*d;
        case "email":      return a.email.localeCompare(b.email)*d;
        case "total":      return (a.total - b.total)*d;
        case "percentage": return (a.percentage - b.percentage)*d;
      }
    });
  }, [students, sortField, sortDir]);

  const handleSort = (f:SortField) => {
    if (sortField===f) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortField(f); setSortDir("asc"); }
  };


  const lineData = useMemo(() => {
    if (!selected) return [];
    return quizzes.map(q => {
      const raw = selected.quizScores[q.id] ?? 0;
      const pct = +(100 * raw / (maxScores[q.id]||1)).toFixed(1);
      const label = q.title + (submissionMap[q.id]?.isFinalized===false ? "*" : "");
      return { date: new Date(q.startDate).toLocaleDateString(), pct, quiz: label };
    });
  }, [selected, quizzes, submissionMap, maxScores]);

  // 5️⃣ Pie data
  const pieData = useMemo(() => {
    if (!selected) return [];
    let fin=0, pend=0;
    quizzes.forEach(q => {
      const sc = selected.quizScores[q.id];
      if (sc==null) return;
      submissionMap[q.id]?.isFinalized ? fin++ : pend++;
    });
    const miss = quizzes.length - fin - pend;
    return [
      { name:"Finalized",     value:fin,  color:COLORS.primary    },
      { name:"Pending",       value:pend, color:COLORS.yellow     },
      { name:"Not Submitted", value:miss, color:COLORS.grayBorder },
    ];
  }, [selected, quizzes, submissionMap]);

  // 6️⃣ Difficulty: class‑wide avg % per quiz
  const difficultyData = useMemo(() => {
    if (!students.length || !quizzes.length) return [];
    return quizzes.map(q => {
      const totalPoints = students.reduce((sum, s) => sum + (s.quizScores[q.id]||0), 0);
      const maxTotal    = (maxScores[q.id]||1) * students.length;
      const avgPct      = +(100 * totalPoints / maxTotal).toFixed(1);
      return { quiz:q.title, avg: avgPct };
    });
  }, [students, quizzes, maxScores]);

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <button
        onClick={()=>navigate(-1)}
        className="inline-flex items-center text-red-600 hover:underline"
      >
        <ArrowLeft className="mr-2"/> Back
      </button>
      <h1 className="text-3xl font-bold text-dark">Class Analytics</h1>

      {loading
        ? <div className="py-12 text-center text-dark">Loading…</div>
        : !selected
        ? (
          <motion.table
            initial={{opacity:0}} animate={{opacity:1}}
            className="w-full rounded-lg overflow-hidden border"
          >
            <thead className="bg-lightGray">
              <tr>
                {[
                  {lbl:"Name", field:"name"},
                  {lbl:"Email",field:"email"},
                  {lbl:"Total",field:"total"},
                  {lbl:"%",    field:"percentage"}
                ].map(c=>(
                  <th
                    key={c.field}
                    onClick={()=>handleSort(c.field as SortField)}
                    className="px-4 py-3 text-left font-medium text-dark cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      {c.lbl}
                      {sortField===c.field && (
                        sortDir==="asc" 
                          ? <ChevronUpIcon size={14}/>
                          : <ChevronDownIcon size={14}/>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map(s=>(
                <motion.tr
                  key={s.studentId}
                  className="hover:bg-lightGray cursor-pointer"
                  onClick={()=>setSelected(s)}
                  whileHover={{scale:1.02}}
                >
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2 font-semibold">{s.total}</td>
                  <td className="px-4 py-2">{s.percentage.toFixed(1)}%</td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        )
        : (
          <motion.div
            initial={{x:50,opacity:0}} animate={{x:0,opacity:1}}
            transition={{type:"spring",stiffness:120}}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-dark">{selected.name}</h2>
              <button
                onClick={()=>setSelected(null)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >← Back to List</button>
            </div>
            <p className="text-sm italic text-gray-600">* score not yet finalized</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quiz % Over Time */}
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="mb-2 text-lg font-medium text-primary">
                  Quiz % Over Time
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lineData} margin={{top:10,right:30,left:0,bottom:0}}>
                    <CartesianGrid stroke={COLORS.grayBorder}/>
                    <XAxis dataKey="date" tick={{fontSize:12}}/>
                    <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`}/>
                    <Tooltip formatter={(v:number)=>`${v}%`}/>
                    <Line
                      dataKey="pct"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{r:4,fill:COLORS.yellow}}
                      activeDot={{r:6}}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Your % vs Class Avg */}
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="mb-2 text-lg font-medium text-primary">
                  Your % vs Class Avg
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {name:selected.name, value:+selected.percentage.toFixed(1)},
                      {
                        name:"Class Avg",
                        value:+(
                          students.reduce((a,x)=>a+x.percentage,0)/students.length
                        ).toFixed(1)
                      }
                    ]}
                    margin={{top:5,right:30,left:0,bottom:5}}
                  >
                    <CartesianGrid stroke={COLORS.grayBorder}/>
                    <XAxis dataKey="name" tick={{fontSize:12}}/>
                    <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`}/>
                    <Tooltip formatter={(v:number)=>`${v}%`}/>
                    <Bar dataKey="value" fill={COLORS.primary} barSize={40}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

             
              <div className="bg-white p-4 rounded-lg shadow border lg:col-span-2">
                <h3 className="mb-2 text-lg font-medium text-primary">
                  Submission Status
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                      labelLine={false}
                      label={({name,percent})=>`${name}: ${(percent*100).toFixed(0)}%`}
                    >
                      {pieData.map((d,i)=>(
                        <Cell key={i} fill={d.color}/>
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom"/>
                    <Tooltip formatter={(v:number)=>`${v}`}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

           
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="mb-4 text-xl font-semibold text-primary">
                Quiz Difficulty (Avg %)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={difficultyData}
                  margin={{top:5,right:30,left:0,bottom:80}}
                >
                  <CartesianGrid stroke={COLORS.grayBorder}/>
                  <XAxis
                    dataKey="quiz"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize:12 }}
                  />
                  <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`}/>
                  <Tooltip formatter={(v:number)=>`${v}%`}/>
                  <Bar dataKey="avg" fill={COLORS.red} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )
      }
    </div>
  );
};

export default AnalyticsPage;
