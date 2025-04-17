// src/context/QuizContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface QuizContextProps {
  quizInProgress: boolean;        // Are we in a quiz?
  currentQuizId: number | null;  // Which quiz is in progress?

  startQuiz: (quizId: number) => void;
  autoSubmitQuiz: () => Promise<void>; // forcibly auto-submit if in progress
  clearQuiz: () => void;
}

const QuizContext = createContext<QuizContextProps>({
  quizInProgress: false,
  currentQuizId: null,
  startQuiz: () => {},
  autoSubmitQuiz: async () => {},
  clearQuiz: () => {}
});

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [quizInProgress, setQuizInProgress] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);

  // 1) Start a quiz
  const startQuiz = (quizId: number) => {
    setQuizInProgress(true);
    setCurrentQuizId(quizId);
  };

  // 2) forcibly auto-submit
  const autoSubmitQuiz = async () => {
    if (!quizInProgress || currentQuizId === null) {
      return; // do nothing if no quiz
    }
    try {
      // The actual POST logic can be stored here or you can call a function
      // from AssignmentsTab if you prefer. We'll keep it here for clarity.

      // Example:
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8080/api/quiz/${currentQuizId}/submit`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers: [] }) // or get from local storage, etc.
      });
    } catch (err) {
      console.error("Auto-submission error:", err);
    } finally {
      // Clear quiz
      setQuizInProgress(false);
      setCurrentQuizId(null);
    }
  };

  // 3) Clear quiz if user manually submits
  const clearQuiz = () => {
    setQuizInProgress(false);
    setCurrentQuizId(null);
  };

  return (
    <QuizContext.Provider value={{
      quizInProgress,
      currentQuizId,
      startQuiz,
      autoSubmitQuiz,
      clearQuiz
    }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizContext = () => useContext(QuizContext);
