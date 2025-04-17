import React from "react";
import ReactDOM from "react-dom/client";
import { UserProvider } from "./context/UserContext";
import {QuizProvider } from "./context/QuizContext"
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UserProvider>
    <QuizProvider>
    <App />
    </QuizProvider>
    </UserProvider>
  </React.StrictMode>
);
