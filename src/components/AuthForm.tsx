import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

interface AuthFormProps {
  isSignup: boolean;
  onSubmit: (formData: { username: string; email?: string; password: string }) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ isSignup, onSubmit }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit(formData);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-gray-900 transition-all">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
        {isSignup ? "Create Account" : "Welcome Back"}
      </h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email!}
              onChange={handleChange}
              placeholder="Email"
              className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        )}

        <div className="relative">
          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
          disabled={loading}
        >
          {loading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <Link to={isSignup ? "/login" : "/signup"} className="text-blue-500 hover:underline">
          {isSignup ? "Login" : "Sign Up"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
