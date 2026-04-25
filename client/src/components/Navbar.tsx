import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const userNavLinks = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Internships", path: "/internships" },
    { name: "Resume Upload", path: "/resume-upload" },
  ];

  const companyNavLinks = [
    { name: "Dashboard", path: "/company/dashboard" },
    { name: "Developers", path: "/company/developers" },
    { name: "Chat", path: "/chat" },
  ];

  const navLinks = user?.role === "company" ? companyNavLinks : userNavLinks;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-white">Career</span>
              <span className="text-green-400">Connect</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-300 hover:text-green-400 ${
                  location.pathname === link.path
                    ? "text-green-400"
                    : "text-gray-300"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Profile Avatar */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group"
                  title="View Profile"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-700 group-hover:border-green-400 transition-colors"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-black border-2 border-gray-700 group-hover:border-green-400 transition-colors">
                      {initials}
                    </div>
                  )}
                  <span className={`text-sm font-medium transition-colors duration-300 group-hover:text-green-400 ${
                    location.pathname === "/profile" ? "text-green-400" : "text-gray-300"
                  }`}>
                    Profile
                  </span>
                </Link>
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors duration-300 hover:text-green-400 ${
                    location.pathname === "/login"
                      ? "text-green-400"
                      : "text-gray-300"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-400 hover:bg-green-500 text-gray-900 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-green-400/50"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    location.pathname === link.path
                      ? "bg-gray-800 text-green-400"
                      : "text-gray-300 hover:bg-gray-800 hover:text-green-400"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      location.pathname === "/profile"
                        ? "bg-gray-800 text-green-400"
                        : "text-gray-300 hover:bg-gray-800 hover:text-green-400"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-[10px] font-bold text-black">
                        {initials}
                      </div>
                    )}
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                      location.pathname === "/login"
                        ? "bg-gray-800 text-green-400"
                        : "text-gray-300 hover:bg-gray-800 hover:text-green-400"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block mx-3 mt-2 bg-green-400 hover:bg-green-500 text-gray-900 px-4 py-2 rounded-lg text-base font-bold transition-all duration-300 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
