import axios from "axios";
import User from "../models/user.js";

// ✅ Connect GitHub (for users who didn't login via GitHub)
export const connectGithub = async (req, res) => {
  try {
    const userId = req.userId;
    const { githubUsername } = req.body;

    if (!githubUsername) {
      return res.status(400).json({ message: "GitHub username is required" });
    }

    await User.findByIdAndUpdate(userId, { githubUsername });

    res.status(200).json({ message: "GitHub username connected", githubUsername });
  } catch (error) {
    console.error("Error connecting GitHub:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Fetch user's GitHub repos (public repos)
export const fetchGithubRepos = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const githubUsername = user.githubUsername;
    if (!githubUsername) {
      return res.status(400).json({ message: "GitHub username not set. Please connect GitHub first." });
    }

    // Fetch public repos from GitHub API
    const headers = {};
    if (user.githubAccessToken) {
      headers["Authorization"] = `Bearer ${user.githubAccessToken}`;
    }

    const response = await axios.get(
      `https://api.github.com/users/${githubUsername}/repos?per_page=30&sort=updated`,
      { headers }
    );

    const repos = response.data.map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "",
      url: repo.html_url,
      language: repo.language || "Unknown",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));

    res.status(200).json({ repos });
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "GitHub user not found" });
    }
    res.status(500).json({ message: "Failed to fetch repos" });
  }
};

// ✅ Analyze selected repos + resume data with Gemini
export const analyzeReposWithGemini = async (req, res) => {
  try {
    const userId = req.userId;
    const { selectedRepos } = req.body; // array of repo objects [{name, fullName, ...}]

    if (!selectedRepos || !Array.isArray(selectedRepos) || selectedRepos.length === 0) {
      return res.status(400).json({ message: "Please select at least 1 repo" });
    }

    if (selectedRepos.length > 5) {
      return res.status(400).json({ message: "Maximum 5 repos allowed" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const githubUsername = user.githubUsername;
    const headers = {};
    if (user.githubAccessToken) {
      headers["Authorization"] = `Bearer ${user.githubAccessToken}`;
    }

    // Fetch detailed info for each selected repo (languages, topics)
    const repoDetails = [];
    for (const repo of selectedRepos) {
      try {
        // Fetch languages used
        const langResponse = await axios.get(
          `https://api.github.com/repos/${githubUsername}/${repo.name}/languages`,
          { headers }
        );

        // Fetch topics
        const topicsResponse = await axios.get(
          `https://api.github.com/repos/${githubUsername}/${repo.name}/topics`,
          {
            headers: {
              ...headers,
              Accept: "application/vnd.github.mercy-preview+json",
            },
          }
        );

        repoDetails.push({
          name: repo.name,
          fullName: repo.fullName || `${githubUsername}/${repo.name}`,
          description: repo.description || "",
          url: repo.url || `https://github.com/${githubUsername}/${repo.name}`,
          language: repo.language || "Unknown",
          techStack: Object.keys(langResponse.data || {}),
          frameworks: topicsResponse.data?.names || [],
          stars: repo.stars || 0,
          forks: repo.forks || 0,
        });
      } catch (err) {
        console.warn(`Failed to fetch details for ${repo.name}:`, err.message);
        repoDetails.push({
          name: repo.name,
          fullName: `${githubUsername}/${repo.name}`,
          description: repo.description || "",
          url: repo.url || `https://github.com/${githubUsername}/${repo.name}`,
          language: repo.language || "Unknown",
          techStack: [repo.language].filter(Boolean),
          frameworks: [],
          stars: repo.stars || 0,
          forks: repo.forks || 0,
        });
      }
    }

    // Build prompt for Gemini
    const repoSummary = repoDetails
      .map(
        (r) =>
          `- **${r.name}**: ${r.description || "No description"} | Languages: ${r.techStack.join(", ") || "N/A"} | Topics/Frameworks: ${r.frameworks.join(", ") || "N/A"} | Stars: ${r.stars} | Forks: ${r.forks}`
      )
      .join("\n");

    const prompt = `
You are a senior technical recruiter and career advisor. Analyze the following developer profile and determine their skill level.

**User Profile:**
- Name: ${user.name}
- Skills from Resume: ${user.skills?.join(", ") || "Not parsed yet"}
- Location: ${user.location || "Unknown"}
- Desired Posts: ${user.desiredPost?.join(", ") || "Not set"}

**GitHub Repositories (${repoDetails.length} selected):**
${repoSummary}

Based on the resume skills and GitHub repository analysis (languages used, project complexity indicated by description/topics, stars, and tech diversity), determine:
1. The user's skill level: "beginner", "intermediate", or "advanced"
2. A brief analysis (2-3 sentences) explaining your reasoning

Return a JSON object:
{
  "skillLevel": "beginner" | "intermediate" | "advanced",
  "analysis": "Your reasoning here..."
}

Generate only valid JSON without additional explanation.
`.trim();

    // Call Gemini API
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "GOOGLE_API_KEY is not set" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    let geminiResponse;
    try {
      geminiResponse = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (apiErr) {
      console.error("Gemini API error:", apiErr.response?.data);
      return res.status(502).json({
        message: "AI analysis failed",
        error: apiErr.response?.data?.error?.message || apiErr.message,
      });
    }

    // Parse Gemini response
    const candidate = geminiResponse?.data?.candidates?.[0];
    const partText =
      candidate?.content?.parts?.[0]?.text ||
      candidate?.content?.parts?.map((p) => p.text).join(" ") ||
      null;

    if (!partText) {
      return res.status(502).json({ message: "AI returned no usable content" });
    }

    let output;
    try {
      const cleaned = partText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      output = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse error from Gemini:", partText);
      return res.status(502).json({
        message: "AI output was not valid JSON",
        error: err.message,
      });
    }

    // Save to user
    await User.findByIdAndUpdate(userId, {
      githubRepos: repoDetails,
      skillLevel: output.skillLevel || "",
      skillLevelAnalysis: output.analysis || "",
    });

    res.status(200).json({
      message: "Repos analyzed successfully",
      repos: repoDetails,
      skillLevel: output.skillLevel,
      analysis: output.analysis,
    });
  } catch (error) {
    console.error("Error analyzing repos:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Fetch GitHub Contribution Activity (green squares heatmap data)
export const fetchGithubContributions = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const githubUsername = user.githubUsername;
    if (!githubUsername) {
      return res.status(400).json({
        message: "GitHub username not set. Please connect GitHub first.",
      });
    }

    // Try GraphQL API first (requires access token)
    if (user.githubAccessToken) {
      try {
        const graphqlQuery = {
          query: `
            query($username: String!) {
              user(login: $username) {
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                    weeks {
                      contributionDays {
                        date
                        contributionCount
                        color
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { username: githubUsername },
        };

        const response = await axios.post(
          "https://api.github.com/graphql",
          graphqlQuery,
          {
            headers: {
              Authorization: `Bearer ${user.githubAccessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const calendar =
          response.data?.data?.user?.contributionsCollection
            ?.contributionCalendar;

        if (calendar) {
          return res.status(200).json({
            totalContributions: calendar.totalContributions,
            weeks: calendar.weeks,
          });
        }
      } catch (graphqlErr) {
        console.warn(
          "GraphQL contributions failed, falling back to REST:",
          graphqlErr.message
        );
      }
    }

    // Fallback: Use GitHub events API (public, no auth needed)
    try {
      const headers = {};
      if (user.githubAccessToken) {
        headers["Authorization"] = `Bearer ${user.githubAccessToken}`;
      }

      const eventsResponse = await axios.get(
        `https://api.github.com/users/${githubUsername}/events/public?per_page=100`,
        { headers }
      );

      // Build contribution data from events (last ~90 days approximation)
      const contributionMap = {};
      for (const event of eventsResponse.data || []) {
        if (event.type === "PushEvent" || event.type === "CreateEvent") {
          const date = event.created_at?.split("T")[0];
          if (date) {
            contributionMap[date] = (contributionMap[date] || 0) + 1;
          }
        }
      }

      // Build 52 weeks of data (fill with zeros for missing days)
      const weeks = [];
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 364);
      // Align to start of week (Sunday)
      startDate.setDate(startDate.getDate() - startDate.getDay());

      let currentDate = new Date(startDate);
      while (currentDate <= today) {
        const week = { contributionDays: [] };
        for (let d = 0; d < 7 && currentDate <= today; d++) {
          const dateStr = currentDate.toISOString().split("T")[0];
          const count = contributionMap[dateStr] || 0;
          let color = "#161b22"; // none
          if (count >= 1 && count <= 3) color = "#0e4429";
          else if (count >= 4 && count <= 6) color = "#006d32";
          else if (count >= 7 && count <= 9) color = "#26a641";
          else if (count >= 10) color = "#39d353";

          week.contributionDays.push({
            date: dateStr,
            contributionCount: count,
            color,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
      }

      const totalContributions = Object.values(contributionMap).reduce(
        (a, b) => a + b,
        0
      );

      return res.status(200).json({
        totalContributions,
        weeks,
      });
    } catch (eventsErr) {
      console.error("Events API also failed:", eventsErr.message);
      return res.status(500).json({
        message: "Failed to fetch contribution data",
        error: eventsErr.message,
      });
    }
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// ✅ Public GitHub contributions — for company viewing any developer's heatmap
export const fetchPublicContributions = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: "GitHub username is required" });
    }

    // Use public events API (no token needed)
    let eventsData = [];
    try {
      const eventsResponse = await axios.get(
        `https://api.github.com/users/${username}/events/public?per_page=100`
      );
      eventsData = eventsResponse.data || [];
    } catch (e) {
      // GitHub user not found or rate-limited — return empty grid
      if (e.response?.status === 404) {
        return res.status(404).json({ message: "GitHub user not found" });
      }
    }

    // Build contribution map from events
    const contributionMap = {};
    for (const event of eventsData) {
      if (event.type === "PushEvent" || event.type === "CreateEvent") {
        const date = event.created_at?.split("T")[0];
        if (date) {
          contributionMap[date] = (contributionMap[date] || 0) + 1;
        }
      }
    }

    // Build 52-week grid (same format as the authenticated endpoint)
    const weeks = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const week = { contributionDays: [] };
      for (let d = 0; d < 7 && currentDate <= today; d++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const count = contributionMap[dateStr] || 0;
        let color = "#161b22";
        if (count >= 1 && count <= 3) color = "#0e4429";
        else if (count >= 4 && count <= 6) color = "#006d32";
        else if (count >= 7 && count <= 9) color = "#26a641";
        else if (count >= 10) color = "#39d353";
        week.contributionDays.push({ date: dateStr, contributionCount: count, color });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    const totalContributions = Object.values(contributionMap).reduce((a, b) => a + b, 0);
    return res.status(200).json({ totalContributions, weeks });
  } catch (error) {
    console.error("Error fetching public contributions:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
