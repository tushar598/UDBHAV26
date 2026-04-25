// import React, { useEffect, useState } from "react";
// import { useAuth } from "../hooks/useAuth";
// import {
//   fetchInternCards,
//   getInternships,
// } from "../services/internship/internship_service";

// interface Internship {
//   _id: string;
//   title: string;
//   company?: string;
//   location?: string;
//   platform?: string;
//   link?: string;
//   description?: string;
//   skillsRequired?: string[];
//   stipend?: string;
//   duration?: string;
//   postedAt?: string;
// }

// const InternshipPage: React.FC = () => {
//   const { user, loading } = useAuth();
//   const [internships, setInternships] = useState<Internship[]>([]);
//   const [loadingData, setLoadingData] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);

//   // 🔹 Fetch existing internships when component mounts
//   useEffect(() => {
//     const loadPreviousInternships = async () => {
//       if (!user?._id) return;
//       try {
//         setInitialLoading(true);
//         const response = await getInternships(user._id);
//         if (response?.internships) {
//           setInternships(response.internships);
//         }
//       } catch (error) {
//         console.error("Error loading saved internships:", error);
//       } finally {
//         setInitialLoading(false);
//       }
//     };

//     loadPreviousInternships();
//   }, [user?._id]);

//   // 🔹 Fetch fresh internships (scrape again)
//   const handleInternships = async () => {
//     if (!user?._id) {
//       alert("Please log in to view internships.");
//       return;
//     }

//     try {
//       setLoadingData(true);
//       const response = await fetchInternCards(user._id);
//       if (response?.internships) {
//         setInternships(response.internships);
//       } else {
//         setInternships([]);
//       }
//     } catch (err) {
//       console.error("Error fetching internships:", err);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   const handleApply = (url?: string) => {
//     if (url) window.open(url, "_blank");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-6">
//       <h1 className="text-3xl font-bold text-center mb-10">
//         Available Internship Opportunities
//       </h1>

//       <div className="flex justify-center mb-8">
//         <button
//           onClick={handleInternships}
//           disabled={loadingData || loading}
//           className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
//         >
//           {loadingData ? "Fetching..." : "Fetch New Internships"}
//         </button>
//       </div>

//       {initialLoading ? (
//         <p className="text-center text-gray-500 mt-10">
//           Loading your internships...
//         </p>
//       ) : internships.length > 0 ? (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
//           {internships.map((internship) => (
//             <div
//               key={internship._id}
//               className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
//             >
//               <div>
//                 <h2 className="text-xl font-semibold mb-1">
//                   {internship.title}
//                 </h2>
//                 {internship.company && (
//                   <p className="text-gray-600 mb-1">{internship.company}</p>
//                 )}
//                 {internship.location && (
//                   <p className="text-gray-500 text-sm mb-3">
//                     📍 {internship.location}
//                   </p>
//                 )}
//                 {internship.stipend && (
//                   <p className="text-green-600 font-medium mb-1">
//                     💰 {internship.stipend}
//                   </p>
//                 )}
//                 {internship.duration && (
//                   <p className="text-blue-600 text-sm font-medium mb-3">
//                     ⏳ Duration: {internship.duration}
//                   </p>
//                 )}
//                 {internship.description && (
//                   <p className="text-gray-700 text-sm mb-3 line-clamp-3">
//                     {internship.description}
//                   </p>
//                 )}
//                 {internship.skillsRequired &&
//                   internship.skillsRequired.length > 0 && (
//                     <div className="flex flex-wrap gap-2 mb-3">
//                       {internship.skillsRequired.map((skill, i) => (
//                         <span
//                           key={i}
//                           className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
//                         >
//                           {skill}
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                 {internship.platform && (
//                   <p className="text-xs text-gray-400">
//                     📦 Source: {internship.platform}
//                   </p>
//                 )}
//               </div>

//               <button
//                 onClick={() => handleApply(internship.link)}
//                 className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
//               >
//                 Apply Now
//               </button>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-center text-gray-500 mt-10">
//           No internships available. Click the button above to fetch data.
//         </p>
//       )}
//     </div>
//   );
// };

// export default InternshipPage;

import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  fetchInternCards,
  getInternships,
} from "../services/internship/internship_service";

interface Internship {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  platform?: string;
  link?: string;
  description?: string;
  skillsRequired?: string[];
  stipend?: string;
  duration?: string;
  postedAt?: string;
}

const InternshipPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Fetch existing internships on mount
  useEffect(() => {
    const loadPreviousInternships = async () => {
      if (!user?._id) return;
      try {
    
        setError(null);
        const response = await getInternships(user._id);
        if (response?.internships) {
          setInternships(response.internships);
        }
      } catch (err) {
        console.error("❌ Error loading internships:", err);
        setError("Failed to load saved internships");
      } 
    };
    loadPreviousInternships();
  }, [user?._id]);

  // Fetch fresh internships
  const handleInternships = async () => {
    if (!user?._id) {
      setError("Please log in to view internships.");
      return;
    }

    try {
      setLoadingData(true);
      setError(null);
      const response = await fetchInternCards(user._id);
      setInternships(response?.internships || []);
    } catch (err) {
      console.error("❌ Error fetching internships:", err);
      setError("Failed to fetch new internships");
    } finally {
      setLoadingData(false);
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Explore Internship
            <span className="text-green-400"> Opportunities</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Browse through curated internships tailored for you. Apply and gain
            valuable experience.
          </p>

          <button
            onClick={handleInternships}
            disabled={loadingData || loading}
            className="px-8 py-4 bg-green-400 text-black font-bold rounded-full shadow-lg hover:bg-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-lg"
          >
            {loadingData ? "Fetching..." : "Fetch New Internships"}
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

   

      {/* Internship Cards Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {internships.length > 0 && (
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Available <span className="text-green-400">Internships</span>
          </h2>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!loadingData &&
            internships.map((intern) => (
              <div
                key={intern._id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-green-400 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-400/20 flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-400/20 to-green-600/20 p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {intern.title}
                  </h2>
                  {intern.company && (
                    <p className="text-gray-300 font-medium flex items-center gap-2">
                      <span className="text-green-400">🏢</span>{" "}
                      {intern.company}
                    </p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow">
                  {intern.location && (
                    <p className="text-gray-300 mb-2 flex items-center gap-2">
                      <span className="text-green-400">📍</span>{" "}
                      {intern.location}
                    </p>
                  )}
                  {intern.stipend && (
                    <p className="text-green-400 font-bold text-lg mb-3 flex items-center gap-2">
                      <span>💰</span> {intern.stipend}
                    </p>
                  )}
                  {intern.duration && (
                    <p className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                      <span>⏳</span> {intern.duration}
                    </p>
                  )}
                  {intern.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {intern.description}
                    </p>
                  )}
                  {intern.skillsRequired &&
                    intern.skillsRequired.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {intern.skillsRequired.slice(0, 6).map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-green-400/10 text-green-400 border border-green-400/30 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {intern.skillsRequired.length > 6 && (
                          <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs font-medium">
                            +{intern.skillsRequired.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  {intern.platform && (
                    <p className="text-xs text-gray-500 mt-2">
                      📦 Source: {intern.platform}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleApply(intern.link)}
                    className="w-full bg-green-400 text-black font-bold py-3 rounded-xl hover:bg-green-300 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-400/50"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* No Internships Message */}
        {!loadingData && internships.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Internships Found
              </h3>
              <p className="text-gray-400 mb-6">
                Click the button above to fetch new internship opportunities
                tailored for you.
              </p>
              <button
                onClick={handleInternships}
                className="px-6 py-3 bg-green-400 text-black font-bold rounded-full hover:bg-green-300 transition-all transform hover:scale-105"
              >
                Fetch Internships Now
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingData && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-400 mb-4"></div>
            <p className="text-gray-400 text-lg">Loading internships...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipPage;
