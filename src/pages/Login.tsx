import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import AuthForm from "../components/AuthForm";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async (formData: { username: string; password: string }) => {
    try {
      const data = await loginUser(formData.username, formData.password);
      localStorage.setItem("token", data.token); 
      navigate("/dashboard"); 
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100 dark:bg-gray-900">
      <AuthForm isSignup={false} onSubmit={handleLogin} />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Login;
