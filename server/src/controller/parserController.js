import Resume from "../models/resume.js";
import User from "../models/user.js";
import { extractResumeData } from "../services/parser/resumeParser.js";
import axios from "axios"; // for API calls

/** Utility: find neighbouring cities given a city */
const getNeighbouringCities = (city) => {
  const neighbours = {
    indore: ["Bhopal", "Gwalior", "Ujjain", "Dewas", "Ratlam"],
    delhi: ["Noida", "Gurugram", "Faridabad", "Ghaziabad", "Jaipur"],
    mumbai: ["Pune", "Nashik", "Thane", "Aurangabad", "Vasai"],
    bangalore: ["Mysore", "Hubli", "Belgaum", "Tumkur", "Hassan"],
    // add more city mappings as you need
  };
  if (!city) return [];
  const key = String(city).toLowerCase();
  return neighbours[key] || [];
};

export const parseResume = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. fetch resume
    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // 2. parse raw data
    const parsedData = await extractResumeData(resume.fileData);
    const { skills = [], location = "Unknown" } = parsedData || {};

    // 3. update user with parsed skills and primary location
    await User.findByIdAndUpdate(userId, {
      skills,
      location,
    });

    // 4. compute neighbouring cities
    const nearbyCities = getNeighbouringCities(location);

    // 5. construct prompt for Gemini
    const prompt = `
You are a career advisor AI. A user has these skills: ${skills.join(
      ", "
    )} and lives in ${location}. 
List 4-5 job titles (desiredPost) for which the user is best fit given their skills and location. 
Also, list those titles again but show 2 alternative locations each: the user's location plus nearby cities: ${nearbyCities.join(
      ", "
    )}. 
Return a JSON object with keys:
{
  "desiredPosts": [ /* list of titles */ ],
  "recommendedLocations": [ /* list of cities including user's and neighbours */ ]
}
Generate only valid JSON without additional explanation.
`.trim();

    // 6. Call Gemini (Generative Language API)
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GOOGLE_API_KEY,
    };

    const geminiResponse = await axios.post(url, payload, { headers });

    // 7. Extract the returned text safely
    const candidate = geminiResponse?.data?.candidates?.[0];
    const partText =
      candidate?.content?.parts?.[0]?.text ||
      candidate?.content?.parts?.map((p) => p.text).join(" ") ||
      null;

    if (!partText) {
      console.error(
        "No text found in Gemini response:",
        JSON.stringify(geminiResponse.data)
      );
      return res
        .status(502)
        .json({ message: "AI service returned no usable content" });
    }

    // ✅ 8. Clean AI output and safely parse JSON
    let output;
    try {
      // Clean code block markers (```json ... ```)
      const cleaned = partText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      output = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON parse error from Gemini output:", partText);
      return res.status(502).json({
        message: "AI output was not valid JSON",
        aiRaw: partText.slice(0, 2000),
        error: err.message,
      });
    }

    // 9. update user with desiredPost and desiredLocation
    let cleanLocations = [];

    if (Array.isArray(output.recommendedLocations)) {
      for (const item of output.recommendedLocations) {
        // Case: { desiredPost: "Software Engineer", locations: ["Ujjain", "Indore", "Bhopal"] }
        if (item && Array.isArray(item.locations)) {
          cleanLocations.push(...item.locations);
        } else if (typeof item === "string") {
          cleanLocations.push(item);
        } else if (typeof item === "object" && item !== null) {
          // fallback if structure changes slightly
          const values = Object.values(item).flat();
          cleanLocations.push(...values);
        }
      }
    } else if (
      typeof output.recommendedLocations === "object" &&
      output.recommendedLocations !== null
    ) {
      // Handle object format just in case
      const cities = Object.values(output.recommendedLocations).flat();
      cleanLocations.push(...cities);
    }

    // ✅ Remove duplicates and invalid entries
    cleanLocations = [...new Set(cleanLocations.filter(Boolean))];

    await User.findByIdAndUpdate(userId, {
      desiredPost: Array.isArray(output.desiredPosts)
        ? output.desiredPosts
        : [],
      desiredLocation: cleanLocations,
    });

    // 10. return full response
    return res.status(200).json({
      message: "Resume parsed and recommendations generated",
      skills,
      location,
      desiredPosts: output.desiredPosts,
      recommendedLocations: output.recommendedLocations,
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
