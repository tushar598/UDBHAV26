// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import {
//   Sparkles,
//   Target,
//   TrendingUp,
//   CheckCircle,
//   ArrowRight,
//   Star,
//   Play,
// } from "lucide-react";

// const HomePage = () => {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuth();

//   const handleStarted = () => {
//     if (isAuthenticated) {
//       navigate("/resume-upload");
//     } else {
//       navigate("/login");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-950">
//       {/* Hero Section */}
//       <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 pt-20 pb-32">
//         {/* Animated background elements */}
//         <div className="absolute inset-0 overflow-hidden opacity-30">
//           <div className="absolute w-96 h-96 bg-green-400/20 rounded-full blur-3xl top-0 right-1/4 animate-pulse"></div>
//           <div
//             className="absolute w-96 h-96 bg-green-500/20 rounded-full blur-3xl bottom-0 left-1/4 animate-pulse"
//             style={{ animationDelay: "700ms" }}
//           ></div>
//         </div>

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             {/* Left Content */}
//             <div className="text-left space-y-8">
//               <div className="inline-flex items-center gap-2 px-4 py-2 shadow-2xl shadow-amber-50 border-1 border-green-400 backdrop-blur-2xl 0 rounded-full ">
                
//                 <span className="text-sm font-medium text-green-400">
//                   AI-Powered Career Intelligence
//                 </span>
//               </div>

//               <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
//                 Join Thousands Who’ve Transformed 
//                 <br />
//                 <span className="text-green-400">Their Careers Using AI-Powered Tools</span>
//               </h1>

//               <p className="text-lg text-gray-400 max-w-xl">
//                 Leverage cutting-edge artificial intelligence, discover perfect job matches, and accelerate your career
//                 growth with real-time insights.
//               </p>

//               <div className="flex flex-wrap gap-4">
//                 <button
//                   onClick={handleStarted}
//                   className="group px-8 py-4 bg-green-400 hover:bg-green-500 text-gray-900 text-lg font-bold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-green-400/50"
//                 >
//                   Get Started
//                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </button>

//                 <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-lg font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 hover:bg-red-600">
//                   <Play className="w-5 h-5" />
//                   Watch Demo
//                 </button>
//               </div>

//               {/* Stats */}
//               <div className="flex flex-wrap gap-8 pt-8">
//                 <div>
//                   <div className="text-3xl font-bold text-white">1K+</div>
//                   <div className="text-sm text-gray-400">Resumes Analyzed</div>
//                 </div>
//                 <div>
//                   <div className="text-3xl font-bold text-white">15K+</div>
//                   <div className="text-sm text-gray-400">Jobs Matched</div>
//                 </div>
//                 <div>
//                   <div className="text-3xl font-bold text-white">200+</div>
//                   <div className="text-sm text-gray-400">Success Stories</div>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 pt-4">
//                 <div className="flex">
//                   {[...Array(4)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className="w-5 h-5 text-yellow-400 fill-yellow-400"
//                     />
//                   ))}
//                   <Star className="w-5 h-5 text-yellow-400" />
//                 </div>
//                 <span className="text-gray-400">4/5 from 2k+ reviews</span>
//               </div>
//             </div>

//             {/* Right Image Area */}
//             <div className="relative lg:h-[600px] flex items-center justify-center">
//               <div className="relative w-full h-full rounded-3xl overflow-hidden">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <img
//                     src="/student.png"
//                     alt="Hero Character"
//                     className="w-full h-full object-contain"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Collection Section */}
//       {/* Collection Section */}
//       <section className="py-20 bg-gray-950">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-16 items-center">
//             {/* Image with green blob */}
//             <div className="relative order-2 lg:order-1 flex justify-center items-center">
//               {/* Soft green background blob */}
//               <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-30 scale-75"></div>

//               {/* Responsive Image container */}
//               <div
//                 className="
//           relative 
//           w-[250px] h-[250px]          /* base mobile size */
//           sm:w-[300px] sm:h-[300px]    /* small devices */
//           md:w-[350px] md:h-[350px]    /* tablets */
//           lg:w-[400px] lg:h-[400px]    /* desktops */
//           xl:w-[400px] xl:h-[400px]    /* large screens */
//           bg-transparent 
//           flex items-center justify-center
//         "
//               >
//                 <img
//                   src="/luffy_staw.png"
//                   alt="Hero Character"
//                   className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,255,100,0.4)]"
//                 />
//               </div>
//             </div>

//             {/* Content */}
//             <div className="space-y-6 order-1 lg:order-2">
//               <h2 className="text-4xl md:text-5xl font-bold text-white">
//                Discover <span className="text-green-400">1000+</span>
//                 <br />
//                 Career Opportunities
//               </h2>
//               <p className="text-gray-400 text-lg">
//                 Access thousands of verified job listings across multiple
//                 industries. Our AI-powered platform ensures every opportunity
//                 matches your unique skill set.
//               </p>
//               <button
//                 onClick={handleStarted}
//                 className="px-8 py-4 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2"
//               >
//                 Explore Now
//                 <ArrowRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section className="py-20 bg-gray-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-16 items-center">
//             {/* Content */}
//             <div className="space-y-6">
//               <h2 className="text-4xl md:text-5xl font-bold text-white">
//                 See With
//                 <br />
//                 <span className="text-green-400">Low Price</span>
//                 <br />
//                 Of Subscription
//               </h2>
//               <p className="text-gray-400 text-lg">
//                 Get premium features at an affordable price. Choose the plan
//                 that fits your career goals and start your journey today.
//               </p>
//               <button
//                 onClick={handleStarted}
//                 className="px-8 py-4 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2"
//               >
//                 View Plans
//                 <ArrowRight className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Image with green blob */}
//             <div className="relative flex justify-center items-center">
//               {/* Soft amber background blob */}
//               <div
//                 className="absolute top-1/2 left-1/2 w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-amber-50 rounded-full blur-3xl opacity-30"
//                 style={{ transform: "translate(-50%, -50%)" }}
//               ></div>
//               {/* Responsive Image container */}
//               <div
//                 className="
//                   relative
//                   w-40 h-40
//                   sm:w-56 sm:h-56
//                   md:w-72 md:h-72
//                   lg:w-96 lg:h-96
//                   xl:w-[400px] xl:h-[400px]
//                   bg-transparent
//                   flex items-center justify-center
//                   z-10
//                 "
//               >
//                 <img
//                   src="/subscription.png"
//                   alt="Hero Character"
//                   className="w-full h-full object-contain"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Quality Section */}
//       <section className="py-20 bg-gray-950">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid lg:grid-cols-2 gap-16 items-center">
//             {/* Image with green blob */}
//             <div className="relative order-2 lg:order-1">
//               <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl opacity-30"></div>
//               <div className="relative w-full h-96 bg-gray-800 rounded-3xl border-2 border-dashed border-gray-700 flex items-center justify-center">
//                 <div className="text-center text-gray-600">
//                   <Target className="w-16 h-16 mx-auto mb-2" />
//                   <p className="text-sm">Character Image 3</p>
//                   <p className="text-xs mt-1">PNG with transparency</p>
//                 </div>
//               </div>
//             </div>

//             {/* Content */}
//             <div className="space-y-6 order-1 lg:order-2">
//               <h2 className="text-4xl md:text-5xl font-bold text-white">
//                 <span className="text-green-400">4K Quality</span>
//                 <br />
//                 Assurance
//               </h2>
//               <p className="text-gray-400 text-lg">
//                 Experience crystal-clear resume analysis and detailed insights.
//                 Our advanced AI provides comprehensive feedback on every aspect
//                 of your career profile.
//               </p>
//               <div className="space-y-4 pt-4">
//                 {[
//                   "Real-time ATS compatibility scoring",
//                   "Industry-specific keyword optimization",
//                   "Professional formatting suggestions",
//                   "Competitive salary insights",
//                 ].map((benefit, index) => (
//                   <div key={index} className="flex items-start gap-3">
//                     <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
//                     <span className="text-gray-300 text-lg">{benefit}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Featured Jobs Section */}
//       <section className="py-20 bg-gray-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Job Cards */}
//           <div className="grid md:grid-cols-3 gap-8">
//             {/* Job Card 1 */}
//             <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
//               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10"></div>
//               <div className="h-96 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
//                 <div className="text-white text-center">
//                   <Sparkles className="w-16 h-16 mx-auto mb-2" />
//                   <p className="text-sm">Featured Job Banner</p>
//                 </div>
//               </div>
//               <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
//                 <h3 className="text-2xl font-bold text-white mb-2">
//                   See Top Career
//                   <br />
//                   Opportunities
//                 </h3>
//                 <button className="px-6 py-2 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2">
//                   View Jobs
//                   <ArrowRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             {/* Job Card 2 */}
//             <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
//               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10"></div>
//               <div className="h-96 bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center">
//                 <div className="text-white text-center">
//                   <TrendingUp className="w-16 h-16 mx-auto mb-2" />
//                   <p className="text-sm">Trending Jobs Banner</p>
//                 </div>
//               </div>
//               <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
//                 <h3 className="text-2xl font-bold text-white mb-2">
//                   See Trending
//                   <br />
//                   Internships
//                 </h3>
//                 <button className="px-6 py-2 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2">
//                   Explore
//                   <ArrowRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             {/* Job Card 3 */}
//             <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
//               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10"></div>
//               <div className="h-96 bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
//                 <div className="text-white text-center">
//                   <Target className="w-16 h-16 mx-auto mb-2" />
//                   <p className="text-sm">Premium Jobs Banner</p>
//                 </div>
//               </div>
//               <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
//                 <h3 className="text-2xl font-bold text-white mb-2">
//                   Can't Find Your
//                   <br />
//                   Dream Job?
//                 </h3>
//                 <button className="px-6 py-2 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2">
//                   Get Help
//                   <ArrowRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-gray-950">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
//             Let's See Together
//           </h2>
//           <p className="text-gray-400 text-lg mb-8">
//             Join thousands of professionals who have transformed their careers
//             with our AI-powered platform
//           </p>
//           <button
//             onClick={handleStarted}
//             className="px-12 py-4 bg-green-400 hover:bg-green-500 text-gray-900 text-lg font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-green-400/50"
//           >
//             Join Now
//             <ArrowRight className="w-5 h-5" />
//           </button>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Zap, ArrowRight, Github, Code2, Cpu, 
  Terminal, Globe, Lock, Layers, Command, Search, Activity, ShieldCheck
} from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  const handleStarted = () => {
    navigate("/login");
  };

  // 1. Immersive Hero with Background
  return (
    <div className="min-h-screen bg-[#020202] text-gray-400 selection:bg-green-400/30 font-sans overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        
        {/* BACKGROUND IMAGE LAYER */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-[0.15] grayscale"
            alt="Abstract Tech Mesh"
          />
          {/* VIGNETTE & GRADIENTS */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-transparent to-[#020202]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-[#020202]" />
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/5 blur-[140px]" />
        </div>

        {/* TOP STATUS HUD (The "Stuff") */}
        <div className="absolute top-32 left-10 hidden xl:flex flex-col gap-4 font-mono text-[10px] uppercase tracking-widest text-green-400/40">
          <div className="flex items-center gap-2"><Activity className="w-3 h-3"/> UPTIME: 90.99%</div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3"/> SECURE_NODE: ACTIVE</div>
          <div className="w-32 h-[1px] bg-white/10" />
          <div className="text-gray-600">SYS_LOC: IND-ASIA-1</div>
        </div>

        <div className="relative z-10 w-full max-w-7xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/5 bg-black/40 px-5 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-white backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Join the AI Revolution
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-6 text-7xl font-black tracking-[-0.07em] text-white md:text-[160px] leading-[0.8] uppercase italic"
          >
            Career <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Connect.</span>
          </motion.h1>

          <div className="flex flex-col items-center gap-12">
            <motion.p className="max-w-xl text-lg font-medium text-gray-500 md:text-xl leading-relaxed">
              The first autonomous career engine that doesn't just find jobs—it builds the technical proof to win them.
            </motion.p>

            {/* ACTION CENTER */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <button 
                onClick={handleStarted}
                className="group relative overflow-hidden flex h-20 items-center gap-6 rounded-full bg-white px-12 text-xl font-black text-black transition-all hover:pr-14 active:scale-95"
              >
                <span>INITIALIZE SYNC</span>
                <ArrowRight className="transition-transform group-hover:translate-x-2" />
              </button>
              
              <div className="flex -space-x-4 opacity-60 hover:opacity-100 transition-opacity">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#020202] bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-[#020202] bg-green-400 flex items-center justify-center text-[10px] font-black text-black">
                  +2k
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
          <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
          <span className="text-[10px] font-bold tracking-[0.5em] rotate-90 translate-y-12">SCROLL</span>
        </div>
      </section>

      {/* --- LIVE ANALYTICS SECTION --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Matches / Min", val: "842" },
            { label: "Avg Salary Jump", val: "+42%" },
            { label: "Verified Devs", val: "18.4k" },
            { label: "Neural Uptime", val: "100%" }
          ].map((stat, idx) => (
            <div key={idx} className="group cursor-default">
              <div className="text-[10px] font-black text-green-400 mb-2 tracking-widest uppercase">{stat.label}</div>
              <div className="text-4xl md:text-6xl font-black text-white group-hover:text-green-400 transition-colors">{stat.val}</div>
            </div>
          ))}
        </div>
      </section>
      {/* --- THE NEURAL PATH --- */}
<section className="py-32 px-6 relative overflow-hidden">
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
      <div className="max-w-2xl">
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase italic">
          Automated <br /> Execution.
        </h2>
        <p className="text-xl text-gray-500">Stop manually applying. Our engine handles the heavy lifting from discovery to deployment.</p>
      </div>
      <div className="text-right hidden md:block">
        <div className="text-[10px] font-black text-green-400 tracking-[0.5em] mb-2 uppercase">Step_Process</div>
        <div className="h-1 w-32 bg-green-400 ml-auto" />
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-1 px-1 bg-white/5 rounded-[2rem] overflow-hidden border border-white/5">
      {[
        { 
          step: "01", 
          title: "Deep Ingestion", 
          desc: "Drop your PDF or Sync GitHub. We don't just read text; we analyze commit frequency and code complexity." 
        },
        { 
          step: "02", 
          title: "Vector Matching", 
          desc: "Our neural network maps your skills against 50,000+ active roles to find the 0.1% you actually want." 
        },
        { 
          step: "03", 
          title: "Auto-Pilot", 
          desc: "The system prepares tailored cover letters and submits applications via headless browser agents." 
        }
      ].map((item, idx) => (
        <div key={idx} className="bg-[#050505] p-12 hover:bg-[#080808] transition-colors group">
          <div className="text-6xl font-black text-white/5 mb-8 group-hover:text-green-400/20 transition-colors">
            {item.step}
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">{item.title}</h3>
          <p className="text-gray-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* --- THE STACK INTEGRATION --- */}
<section className="py-32 bg-white/[0.01] border-y border-white/5">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-8">
        <div className="inline-block px-3 py-1 rounded border border-green-400/20 text-[10px] font-bold text-green-400 uppercase tracking-widest">
          Native_Integrations
        </div>
        <h2 className="text-5xl font-black text-white leading-none tracking-tighter">
          WORKS WITH THE <br /> TOOLS YOU USE.
        </h2>
        <p className="text-gray-400 text-lg">
          We don't live in a vacuum. Connect your developer ecosystem to give the AI the data it needs to verify your expertise.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {['GitHub', 'LeetCode', 'StackOverflow', 'LinkedIn', 'BitBucket', 'GitLab'].map(tool => (
            <div key={tool} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-green-400/30 transition-all cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm font-bold text-gray-300">{tool}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-green-500/10 blur-[100px] rounded-full" />
        <div className="relative p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl">
           <div className="flex items-center justify-between mb-8">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
              </div>
              <div className="text-[10px] font-mono text-gray-600 tracking-widest">TERMINAL_SECURE</div>
           </div>
           {/* Mock Verified Profile */}
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10" />
                 <div>
                    <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="h-2 w-full bg-white/5 rounded" />
                 <div className="h-2 w-[90%] bg-white/5 rounded" />
                 <div className="h-2 w-[75%] bg-white/5 rounded" />
              </div>
              <div className="pt-4 flex gap-2">
                 <div className="h-8 w-24 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center justify-center text-[10px] font-black text-green-400">GITHUB_SYNCED</div>
                 <div className="h-8 w-24 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-[10px] font-black text-blue-400">LEETCODE_P99</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* --- FINAL CALL TO ACTION --- */}
<section className="py-40 relative">
  <div className="absolute inset-0 bg-green-400 opacity-[0.02]" />
  <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
    <h2 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter italic uppercase">
      The Search <br /> Ends Here.
    </h2>
    <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">
      Stop wasting hours on dead-end job boards. Initialize your autonomous agent and let the opportunities come to you.
    </p>
    <button 
      onClick={handleStarted}
      className="group relative px-12 py-6 bg-white text-black font-black text-2xl rounded-2xl hover:bg-green-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
    >
      LET SET CAREER IN MOTION
      <div className="absolute -top-2 -right-2 px-2 py-1 bg-green-500 text-[10px] text-black font-bold animate-bounce">NOW FREE</div>
    </button>
  </div>
</section>

      
    </div>
  );
};

export default HomePage;