import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";
import Button from "../components/Button";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Signup failed! Please try again.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Create an Account</h2>
        
        {error && (
  <div className="mt-3 text-red-500 text-sm text-center bg-red-100 p-2 rounded border border-red-400 shadow-md">
    {error}
  </div>
)}


        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              required
              className="w-1/2 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              required
              className="w-1/2 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Sign Up"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
