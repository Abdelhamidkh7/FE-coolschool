import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

/** your existing direct‑fetch logic is preserved */
const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  /* ---------- keep the same POST logic ---------- */
  const handleSignup = async (formData: {
    username: string;
    password: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const body = await res.json();

      if (res.status === 409) {
        throw new Error(body.message); // "Username already exists" etc.
      }
      if (!res.ok) {
        throw new Error(body.message || "Signup failed – please try again.");
      }

      localStorage.setItem("token", body.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Network error – please try again.");
      throw err; // so AuthForm can display it in fieldErrors.submit
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100 dark:bg-gray-900">
      <AuthForm isSignup={true} onSubmit={handleSignup} />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Signup;
