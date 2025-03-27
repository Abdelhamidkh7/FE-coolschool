const API_BASE_URL = "http://localhost:8080/api/v1/auth";

export const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  return response.json();
};

export const signupUser = async (username: string, email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    throw new Error("Signup failed. Please try again.");
  }

  return response.json();
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};
