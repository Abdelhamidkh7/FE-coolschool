import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/chat";

export const fetchMessages = async (classroomId: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_BASE_URL}/${classroomId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// export const sendMessage = async (classroomId: string, content: string) => {
//   const token = localStorage.getItem("token");
//   await axios.post(
//     `${API_BASE_URL}/${classroomId}/messages`,
//     { content },
//     { headers: { Authorization: `Bearer ${token}` } }
//   );
// };

export const getChatHistory = async (classroomId: string) => {
  console.log(`Fetching chat history for classroom: ${classroomId}`);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("🚨 No authentication token found. User may not be logged in.");
      return []; 
    }

    const response = await fetch(`http://localhost:8080/api/chat/${classroomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response received:", response);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Chat history loaded:", data);
    return data;
  } catch (error) {
    console.error("Error fetching chat history", error);
    return []; 
  }
};


