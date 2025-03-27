import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  duration?: number;
}

export const Toast = ({ message, type = "success", duration = 3000 }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-5 right-5 px-4 py-3 rounded-md shadow-md text-white text-sm font-semibold transition-opacity duration-300 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
    </div>
  );
};
