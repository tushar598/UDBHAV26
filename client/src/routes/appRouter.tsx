import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/RegisterPage";
import ResumeUpload from "../pages/ResumeUpload";
import JobListPage from "../pages/JobListPage";
import InternshipPage from "../pages/InternshipPage";
import ProfilePage from "../pages/ProfilePage";
import Navbar from "../components/Navbar";

// Separate component so `useLocation` can be used
const AppContent = () => {
  const location = useLocation();

  // Paths where Navbar should be hidden
  const hideNavbarRoutes = ["/", "/login", "/register"];

  // Determine whether to show Navbar
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/internships" element={<InternshipPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
};

const AppRouter = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default AppRouter;
