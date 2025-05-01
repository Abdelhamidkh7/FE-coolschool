// src/pages/Dashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const PRIMARY = "#0065ea";
const DARK = "#002d55";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Classrooms",
      desc: "Manage and view your classes.",
      to: "/classes",
    },
    {
      title: "Calendar",
      desc: "View upcoming events and deadlines.",
      to: "/calendar",
    },
    {
      title: "Quizzes",
      desc: "Start or review your quizzes.",
      to: "/quizzes",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
 

      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: DARK }}>
          Dashboard
        </h1>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ title, desc, to }) => (
            <div
              key={title}
              onClick={() => navigate(to)}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition cursor-pointer"
            >
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: PRIMARY }}
              >
                {title}
              </h2>
              <p className="text-gray-700">{desc}</p>
            </div>
          ))}
        </div>
      </main>
     </div>
  );
};

export default Dashboard;
