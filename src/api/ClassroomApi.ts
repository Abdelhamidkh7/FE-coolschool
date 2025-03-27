import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/classroom";

export const fetchClassrooms = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_BASE_URL}/classrooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const joinClassroom = async (accessCode: string) => {
  const token = localStorage.getItem("token");
  await axios.post(
    `${API_BASE_URL}/join?accessCode=${accessCode}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const createClassroom = async (classroomData: { title: string; description: string; capacity: number }) => {
  const token = localStorage.getItem("token");
  await axios.post(`${API_BASE_URL}`, classroomData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const generateAccessCode = async (classroomId: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_BASE_URL}/${classroomId}/access-code/generate`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const leaveClassroom = async (classroomId: string) => {
  const token = localStorage.getItem("token");
  await axios.post(`${API_BASE_URL}/leave/${classroomId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const getClassroom = async (classroomId: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_BASE_URL}/${classroomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const getStudents = async (classroomId: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_BASE_URL}/${classroomId}/students`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}