import axios from "axios";
import User from "../models/user.js";

/**
 * Fetch LeetCode profile data using the public GraphQL API.
 * No authentication required — works for any public LeetCode profile.
 */
export const fetchLeetcodeProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "LeetCode username is required" });
    }

    const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

    // Query 1: User profile, badges, and submission stats
    const profileQuery = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              ranking
              reputation
              starRating
              realName
              aboutMe
              userAvatar
            }
            badges {
              id
              name
              icon
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username: username.trim() },
    };

    // Query 2: Contest ranking
    const contestQuery = {
      query: `
        query getUserContestRanking($username: String!) {
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
            topPercentage
          }
          userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            contest {
              title
              startTime
            }
          }
        }
      `,
      variables: { username: username.trim() },
    };

    // Execute both queries in parallel
    const [profileRes, contestRes] = await Promise.allSettled([
      axios.post(LEETCODE_GRAPHQL, profileQuery, {
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/${username}/`,
        },
        timeout: 10000,
      }),
      axios.post(LEETCODE_GRAPHQL, contestQuery, {
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/${username}/`,
        },
        timeout: 10000,
      }),
    ]);

    const profileData =
      profileRes.status === "fulfilled"
        ? profileRes.value?.data?.data?.matchedUser
        : null;

    if (!profileData) {
      return res.status(404).json({
        message: "LeetCode user not found or profile is private",
      });
    }

    const contestData =
      contestRes.status === "fulfilled"
        ? {
            ranking: contestRes.value?.data?.data?.userContestRanking,
            history: (
              contestRes.value?.data?.data?.userContestRankingHistory || []
            )
              .filter((h) => h.attended)
              .slice(-10), // last 10 contests
          }
        : { ranking: null, history: [] };

    // Parse submission stats
    const submissionStats = {};
    if (profileData.submitStatsGlobal?.acSubmissionNum) {
      for (const stat of profileData.submitStatsGlobal.acSubmissionNum) {
        submissionStats[stat.difficulty.toLowerCase()] = stat.count;
      }
    }

    const result = {
      username: profileData.username,
      profile: {
        ranking: profileData.profile?.ranking || 0,
        reputation: profileData.profile?.reputation || 0,
        starRating: profileData.profile?.starRating || 0,
        realName: profileData.profile?.realName || "",
        aboutMe: profileData.profile?.aboutMe || "",
        avatar: profileData.profile?.userAvatar || "",
      },
      badges: (profileData.badges || []).map((b) => ({
        id: b.id,
        name: b.name,
        icon: b.icon,
      })),
      solved: {
        all: submissionStats["all"] || 0,
        easy: submissionStats["easy"] || 0,
        medium: submissionStats["medium"] || 0,
        hard: submissionStats["hard"] || 0,
      },
      contest: {
        rating: Math.round(contestData.ranking?.rating || 0),
        globalRanking: contestData.ranking?.globalRanking || 0,
        totalParticipants: contestData.ranking?.totalParticipants || 0,
        topPercentage: contestData.ranking?.topPercentage || 0,
        attendedContests: contestData.ranking?.attendedContestsCount || 0,
        recentContests: contestData.history,
      },
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching LeetCode profile:", error.message);
    return res.status(500).json({
      message: "Failed to fetch LeetCode profile",
      error: error.message,
    });
  }
};

/**
 * Save the user's LeetCode username to their profile.
 */
export const connectLeetcode = async (req, res) => {
  try {
    const userId = req.userId;
    const { leetcodeUsername } = req.body;

    if (!leetcodeUsername || !leetcodeUsername.trim()) {
      return res
        .status(400)
        .json({ message: "LeetCode username is required" });
    }

    await User.findByIdAndUpdate(userId, {
      leetcodeUsername: leetcodeUsername.trim(),
    });

    res.status(200).json({
      message: "LeetCode username saved",
      leetcodeUsername: leetcodeUsername.trim(),
    });
  } catch (error) {
    console.error("Error connecting LeetCode:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
