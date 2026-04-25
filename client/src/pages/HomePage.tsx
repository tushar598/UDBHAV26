import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Play,
} from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStarted = () => {
    if (isAuthenticated) {
      navigate("/resume-upload");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 pt-20 pb-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute w-96 h-96 bg-green-400/20 rounded-full blur-3xl top-0 right-1/4 animate-pulse"></div>
          <div
            className="absolute w-96 h-96 bg-green-500/20 rounded-full blur-3xl bottom-0 left-1/4 animate-pulse"
            style={{ animationDelay: "700ms" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 shadow-2xl shadow-amber-50 border-1 border-green-400 backdrop-blur-2xl 0 rounded-full ">
                
                <span className="text-sm font-medium text-green-400">
                  AI-Powered Career Intelligence
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Join Thousands Who’ve Transformed 
                <br />
                <span className="text-green-400">Their Careers Using AI-Powered Tools</span>
              </h1>

              <p className="text-lg text-gray-400 max-w-xl">
                Leverage cutting-edge artificial intelligence, discover perfect job matches, and accelerate your career
                growth with real-time insights.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleStarted}
                  className="group px-8 py-4 bg-green-400 hover:bg-green-500 text-gray-900 text-lg font-bold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-green-400/50"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-lg font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 hover:bg-red-600">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-white">1K+</div>
                  <div className="text-sm text-gray-400">Resumes Analyzed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">15K+</div>
                  <div className="text-sm text-gray-400">Jobs Matched</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">200+</div>
                  <div className="text-sm text-gray-400">Success Stories</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <div className="flex">
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-gray-400">4/5 from 2k+ reviews</span>
              </div>
            </div>

            {/* Right Image Area */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/student.png"
                    alt="Hero Character"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      {/* Collection Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image with green blob */}
            <div className="relative order-2 lg:order-1 flex justify-center items-center">
              {/* Soft green background blob */}
              <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-30 scale-75"></div>

              {/* Responsive Image container */}
              <div
                className="
          relative 
          w-[250px] h-[250px]          /* base mobile size */
          sm:w-[300px] sm:h-[300px]    /* small devices */
          md:w-[350px] md:h-[350px]    /* tablets */
          lg:w-[400px] lg:h-[400px]    /* desktops */
          xl:w-[400px] xl:h-[400px]    /* large screens */
          bg-transparent 
          flex items-center justify-center
        "
              >
                <img
                  src="/luffy_staw.png"
                  alt="Hero Character"
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,255,100,0.4)]"
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
               Discover <span className="text-green-400">1000+</span>
                <br />
                Career Opportunities
              </h2>
              <p className="text-gray-400 text-lg">
                Access thousands of verified job listings across multiple
                industries. Our AI-powered platform ensures every opportunity
                matches your unique skill set.
              </p>
              <button
                onClick={handleStarted}
                className="px-8 py-4 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                Explore Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                See With
                <br />
                <span className="text-green-400">Low Price</span>
                <br />
                Of Subscription
              </h2>
              <p className="text-gray-400 text-lg">
                Get premium features at an affordable price. Choose the plan
                that fits your career goals and start your journey today.
              </p>
              <button
                onClick={handleStarted}
                className="px-8 py-4 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                View Plans
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Image with green blob */}
            <div className="relative flex justify-center items-center">
              {/* Soft amber background blob */}
              <div
                className="absolute top-1/2 left-1/2 w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-amber-50 rounded-full blur-3xl opacity-30"
                style={{ transform: "translate(-50%, -50%)" }}
              ></div>
              {/* Responsive Image container */}
              <div
                className="
                  relative
                  w-40 h-40
                  sm:w-56 sm:h-56
                  md:w-72 md:h-72
                  lg:w-96 lg:h-96
                  xl:w-[400px] xl:h-[400px]
                  bg-transparent
                  flex items-center justify-center
                  z-10
                "
              >
                <img
                  src="/subscription.png"
                  alt="Hero Character"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image with green blob */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl opacity-30"></div>
              <div className="relative w-full h-96 bg-gray-800 rounded-3xl border-2 border-dashed border-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <Target className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Character Image 3</p>
                  <p className="text-xs mt-1">PNG with transparency</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                <span className="text-green-400">4K Quality</span>
                <br />
                Assurance
              </h2>
              <p className="text-gray-400 text-lg">
                Experience crystal-clear resume analysis and detailed insights.
                Our advanced AI provides comprehensive feedback on every aspect
                of your career profile.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  "Real-time ATS compatibility scoring",
                  "Industry-specific keyword optimization",
                  "Professional formatting suggestions",
                  "Competitive salary insights",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Job Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Job Card 1 */}
            <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10"></div>
              <div className="h-96 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Featured Job Banner</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white mb-2">
                  See Top Career
                  <br />
                  Opportunities
                </h3>
                <button className="px-6 py-2 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2">
                  View Jobs
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Job Card 2 */}
            <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10"></div>
              <div className="h-96 bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Trending Jobs Banner</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white mb-2">
                  See Trending
                  <br />
                  Internships
                </h3>
                <button className="px-6 py-2 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2">
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Job Card 3 */}
            <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10"></div>
              <div className="h-96 bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Target className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Premium Jobs Banner</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Can't Find Your
                  <br />
                  Dream Job?
                </h3>
                <button className="px-6 py-2 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2">
                  Get Help
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Let's See Together
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of professionals who have transformed their careers
            with our AI-powered platform
          </p>
          <button
            onClick={handleStarted}
            className="px-12 py-4 bg-green-400 hover:bg-green-500 text-gray-900 text-lg font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-green-400/50"
          >
            Join Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
