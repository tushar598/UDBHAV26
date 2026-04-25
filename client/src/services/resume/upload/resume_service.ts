import api from "../../api";

export const uploadResume = async (file: File, userId: string) => {
  try {
    // Step 1️⃣ — Prepare form data for upload
    const formData = new FormData();
    formData.append("resume", file); 
    formData.append("userId", userId);

    // Step 2️⃣ — Upload resume
    const uploadResponse = await api.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });


    // Step 3️⃣ — Trigger parsing API
    const parseResponse = await api.post(`/parser/parse/${userId}`);


    // Step 4️⃣ — Combine and return results
    return {
      upload: uploadResponse.data,
      parse: parseResponse.data,
    };
  } catch (error) {
    console.error("❌ Resume upload or parsing failed:", error);
    throw  { message: "Unknown error occurred" };
  }
};
