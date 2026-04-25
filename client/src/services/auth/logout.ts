import api from "../api";

// ✅ Logout user
export const userLogout = async () => {
  const response = await api.post("/user/logout");
  return response.data;
};
