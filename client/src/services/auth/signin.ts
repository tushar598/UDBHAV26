import api from "../api";

// ✅ Register user
export const userSignin = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await api.post("/user/register", { name, email, password });
  return response.data;
};
