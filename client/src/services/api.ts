import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // your backend
  withCredentials: true, // 🔥 allow cookies to be sent
});

export default api;
