import axios from "axios";

const API = axios.create({
  baseURL: "https://student-grev.onrender.com/api" // ✅ FIX
});

// token attach
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;