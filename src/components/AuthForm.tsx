import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaIdBadge,
} from "react-icons/fa";

interface AuthFormProps {
  /** true → signup, false → login */
  isSignup: boolean;
  onSubmit: (formData: {
    username: string;
    password: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function AuthForm({ isSignup, onSubmit }: AuthFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    submit?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!formData.username.trim()) errs.username = "Username is required.";
    if (isSignup) {
      if (!formData.firstName.trim())
        errs.firstName = "First name is required.";
      if (!formData.lastName.trim())
        errs.lastName = "Last name is required.";
      if (!/\S+@\S+\.\S+/.test(formData.email))
        errs.email = "Please enter a valid email address.";
      if (!PASSWORD_REGEX.test(formData.password))
        errs.password =
          "Password must be ≥8 characters and include uppercase, lowercase, number & special character.";
    }
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setFieldErrors(fe => ({ ...fe, [name]: undefined, submit: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setTriedSubmit(true);

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setFieldErrors({
        submit: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#002d55]">
        {isSignup ? "Create Account" : "Welcome Back"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignup && (
          <div className="flex gap-2">
            {(["firstName", "lastName"] as const).map(field => (
              <div key={field} className="flex-1">
                <div
                  className={`relative ${
                    triedSubmit && fieldErrors[field] ? "animate-shake" : ""
                  }`}
                >
                  <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={field === "firstName" ? "First Name" : "Last Name"}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ea]"
                  />
                </div>
                {/* moved inline under input */}
                {triedSubmit && fieldErrors[field] && (
                  <p className="text-red-500 text-sm mt-1 fade-in-down">
                    {fieldErrors[field]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Username */}
        <div>
          <div className={`relative ${
            triedSubmit && fieldErrors.username ? "animate-shake" : ""
          }`}>
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ea]"
            />
          </div>
          {triedSubmit && fieldErrors.username && (
            <p className="text-red-500 text-sm mt-1 fade-in-down">
              {fieldErrors.username}
            </p>
          )}
        </div>

        {/* Email */}
        {isSignup && (
          <div>
            <div className={`relative ${
              triedSubmit && fieldErrors.email ? "animate-shake" : ""
            }`}>
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ea]"
              />
            </div>
            {triedSubmit && fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1 fade-in-down">
                {fieldErrors.email}
              </p>
            )}
          </div>
        )}

        {/* Password */}
        <div>
          <div className={`relative ${
            triedSubmit && fieldErrors.password ? "animate-shake" : ""
          }`}>
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065ea]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {triedSubmit && fieldErrors.password && (
            <p className="text-red-500 text-sm mt-1 fade-in-down">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Submission error */}
        {fieldErrors.submit && (
          <p className="text-red-600 text-center text-sm fade-in-down">
            {fieldErrors.submit}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-semibold rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0065ea", color: "#fff" }}
        >
          {loading
            ? isSignup
              ? "Creating…"
              : "Logging in…"
            : isSignup
            ? "Sign Up"
            : "Log In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <Link
          to={isSignup ? "/login" : "/signup"}
          className="font-medium hover:underline"
          style={{ color: "#0065ea" }}
        >
          {isSignup ? "Login" : "Sign Up"}
        </Link>
      </p>
    </div>
  );
}
