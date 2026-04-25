// import React, { useState, useEffect } from "react";
// import { fetchJobCards, getJobs } from "../services/jobs/job_services";
// import { useAuth } from "../hooks/useAuth";

// interface Job {
//   _id: string;
//   title: string;
//   company?: string;
//   location?: string;
//   platform?: string;
//   link?: string;
//   description?: string;
//   skillsRequired?: string[];
//   salary?: string;
//   postedAt?: string;
//   dateFetched?: string;
// }

// const JobListPage: React.FC = () => {
//   const { user } = useAuth();
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // ✅ Automatically fetch previously saved jobs when user logs in
//   useEffect(() => {
//     const fetchExistingJobs = async () => {
//       if (!user?._id) return;
//       setLoading(true);
//       setError(null);
//       try {
//         const data = await getJobs(user._id);
//         if (data.jobs && data.jobs.length > 0) {
//           setJobs(data.jobs);
//         } else {
//           console.log("ℹ️ No existing jobs found for this user");
//         }
//       } catch (err) {
//         console.error("❌ Error loading existing jobs:", err);
//         setError("Failed to load saved jobs");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExistingJobs();
//   }, [user?._id]);

//   // 🧠 Manual trigger — scrape & save new jobs
//   const handleFetchJobs = async () => {
//     if (!user?._id) {
//       setError("User not found. Please log in.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const data = await fetchJobCards(user._id);
//       setJobs(data.jobs || []);
//     } catch (err) {
//       console.error("❌ Error fetching jobs:", err);
//       setError("Failed to load job data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApply = (url?: string) => {
//     if (url) window.open(url, "_blank");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-6">
//       <h1 className="text-3xl font-bold text-center mb-6">
//         Available Job Opportunities
//       </h1>

//       <div className="flex justify-center mb-8">
//         <button
//           onClick={handleFetchJobs}
//           disabled={loading}
//           className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all disabled:opacity-50"
//         >
//           {loading ? "Fetching..." : "Fetch New Job Listings"}
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <p className="text-center text-red-500 mb-6 font-medium">{error}</p>
//       )}

//       {/* Job Cards */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
//         {!loading &&
//           jobs.map((job) => (
//             <div
//               key={job._id}
//               className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
//             >
//               <div>
//                 <h2 className="text-xl font-semibold mb-2 text-gray-800">
//                   {job.title}
//                 </h2>

//                 {job.company && (
//                   <p className="text-gray-700 mb-1">
//                     🏢 <span className="font-medium">{job.company}</span>
//                   </p>
//                 )}

//                 {job.location && (
//                   <p className="text-gray-600 mb-1">📍 {job.location}</p>
//                 )}

//                 {job.salary && (
//                   <p className="text-green-700 font-semibold mb-2">
//                     💰 {job.salary}
//                   </p>
//                 )}

//                 {job.description && (
//                   <p className="text-gray-700 text-sm mb-3 whitespace-pre-line">
//                     📝 {job.description}
//                   </p>
//                 )}

//                 {job.skillsRequired && job.skillsRequired.length > 0 && (
//                   <div className="flex flex-wrap gap-2 mb-3">
//                     {job.skillsRequired.map((skill, i) => (
//                       <span
//                         key={i}
//                         className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
//                       >
//                         {skill}
//                       </span>
//                     ))}
//                   </div>
//                 )}

//                 <div className="text-xs text-gray-500 space-y-1 mt-2">
//                   {job.platform && <p>📦 Source: {job.platform}</p>}
//                   {job.postedAt && <p>🗓️ Posted: {job.postedAt}</p>}
//                   {job.dateFetched && (
//                     <p>
//                       📅 Fetched:{" "}
//                       {new Date(job.dateFetched).toLocaleDateString()}
//                     </p>
//                   )}
//                   {job.link && (
//                     <p className="truncate text-blue-600">
//                       🔗{" "}
//                       <a
//                         href={job.link}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         {job.link}
//                       </a>
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <button
//                 onClick={() => handleApply(job.link)}
//                 className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
//               >
//                 Apply Now
//               </button>
//             </div>
//           ))}
//       </div>

//       {/* No Jobs */}
//       {!loading && jobs.length === 0 && !error && (
//         <p className="text-center text-gray-500 mt-10">
//           No job opportunities found.
//         </p>
//       )}
//     </div>
//   );
// };

import React, { useState, useEffect } from "react";
import { fetchJobCards, getJobs } from "../services/jobs/job_services";
import { useAuth } from "../hooks/useAuth";

interface Job {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  platform?: string;
  link?: string;
  description?: string;
  skillsRequired?: string[];
  salary?: string;
  postedAt?: string;
  dateFetched?: string;
}

const JobListPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically fetch previously saved jobs when user logs in
  useEffect(() => {
    const fetchExistingJobs = async () => {
      if (!user?._id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getJobs(user._id);
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        } else {
          console.log("ℹ️ No existing jobs found for this user");
        }
      } catch (err) {
        console.error("❌ Error loading existing jobs:", err);
        setError("Failed to load saved jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchExistingJobs();
  }, [user?._id]);

  // Manual trigger — scrape & save new jobs
  const handleFetchJobs = async () => {
    if (!user?._id) {
      setError("User not found. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJobCards(user._id);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      setError("Failed to load job data");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (url?: string) => {
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-black py-16 px-6 mb-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-green-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Can't Find Your Perfect Job?
          </h3>
          <p className="text-gray-400 text-lg mb-8">
            Fetch the latest listings and discover new opportunities every day.
          </p>
          <button
            onClick={handleFetchJobs}
            disabled={loading}
            className="px-8 py-4 bg-green-400 text-black font-bold rounded-full shadow-lg hover:bg-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-lg"
          >
            {loading ? "Fetching..." : "Fetch New Job Listings"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-6 py-4 rounded-xl">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Job Cards Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {jobs.length > 0 && (
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Available <span className="text-green-400">Opportunities</span>
          </h2>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            jobs.map((job) => (
              <div
                key={job._id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-green-400 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-400/20 flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-400/20 to-green-600/20 p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {job.title}
                  </h2>
                  {job.company && (
                    <p className="text-gray-300 font-medium flex items-center gap-2">
                      <span className="text-green-400">🏢</span> {job.company}
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow">
                  {job.location && (
                    <p className="text-gray-300 mb-2 flex items-center gap-2">
                      <span className="text-green-400">📍</span> {job.location}
                    </p>
                  )}
                  {job.salary && (
                    <p className="text-green-400 font-bold text-lg mb-3 flex items-center gap-2">
                      <span>💰</span> {job.salary}
                    </p>
                  )}
                  {job.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {job.description}
                    </p>
                  )}
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skillsRequired.slice(0, 6).map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-green-400/10 text-green-400 border border-green-400/30 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 6 && (
                        <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs font-medium">
                          +{job.skillsRequired.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 space-y-1 mt-4 border-t border-gray-700 pt-4">
                    {job.platform && (
                      <p className="flex items-center gap-2">
                        <span className="text-green-400">📦</span> Source:{" "}
                        {job.platform}
                      </p>
                    )}
                    {job.postedAt && (
                      <p className="flex items-center gap-2">
                        <span className="text-green-400">🗓️</span> Posted:{" "}
                        {job.postedAt}
                      </p>
                    )}
                    {job.dateFetched && (
                      <p className="flex items-center gap-2">
                        <span className="text-green-400">📅</span> Fetched:{" "}
                        {new Date(job.dateFetched).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleApply(job.link)}
                    className="w-full bg-green-400 text-black font-bold py-3 rounded-xl hover:bg-green-300 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-400/50"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* No Jobs Message */}
        {!loading && jobs.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Jobs Found
              </h3>
              <p className="text-gray-400 mb-6">
                Click the button above to fetch new job opportunities tailored
                for you.
              </p>
              <button
                onClick={handleFetchJobs}
                className="px-6 py-3 bg-green-400 text-black font-bold rounded-full hover:bg-green-300 transition-all transform hover:scale-105"
              >
                Fetch Jobs Now
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-400 mb-4"></div>
            <p className="text-gray-400 text-lg">Loading opportunities...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListPage;
