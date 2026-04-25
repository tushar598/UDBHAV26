import api from "../api";

export const fetchJobCards = async (userId: string) => {
  try {
    const response = await api.get(`/job/fetch/${userId}`);
    return response.data; // returns { message, total, jobs }
  } catch (error) {
    console.error("❌ Error fetching job cards:", error);
    throw new Error("Failed to fetch job data");
  }
};

export const getJobs = async (userId: string) => {
  try {
    const response = await api.get(`/job/get/${userId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching job cards:", error);
    throw new Error("Failed to fetch job data");
  }
};
