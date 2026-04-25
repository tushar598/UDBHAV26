import api from "../api";

// ✅ Login user
export const userLogin = async (email: string, password: string) => {
  const response = await api.post("/user/login", { email, password });
  return response.data;
};
