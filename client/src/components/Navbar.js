import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import logo from '../assets/QuizosLogo.webp';
import {
  FaUserCircle,
  FaSignOutAlt,
  FaUser,
  FaHome,
  FaTachometerAlt,
  FaClipboardList,
} from 'react-icons/fa';

function Navbar() {
  const { backendUrl, userId, setUserId, isLoggedin, setIsLoggedin } = useContext(AppContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/user/logout`, { withCredentials: true });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoggedin(false);
      setUserId(null);
      navigate('/login');
      setIsDropdownOpen(false);
    }
  };

  const navIconClass = ({ isActive }) =>
    `flex flex-col items-center justify-center ${
      isActive ? 'text-blue-600' : 'text-gray-500'
    } hover:text-blue-600 transition`;

  return (
    <>
      {/* Top Logo (Always Visible) */}
      <div className="sticky top-0 z-50 bg-white shadow-sm px-4 py-2 flex items-center justify-between sm:justify-start">
        <NavLink to="/" className="flex items-center">
          <img src={logo} className="w-12 h-12 sm:w-16 sm:h-16" alt="Quizos Logo" />
        </NavLink>

        {/* Desktop Nav Links */}
        <div className="hidden sm:flex flex-1 justify-center space-x-8 ml-8 text-sm sm:text-base">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600 transition pb-1'}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600 transition pb-1'}>
            Dashboard
          </NavLink>
          <NavLink to="/my-attempts" className={({ isActive }) => isActive ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600 transition pb-1'}>
            My Attempts
          </NavLink>
        </div>

        {/* Profile Dropdown */}
        <div className="hidden sm:block ml-auto" ref={dropdownRef}>
          {isLoggedin ? (
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(prev => !prev)} className="focus:outline-none">
                <FaUserCircle className="text-3xl text-gray-700 hover:text-blue-600 transition" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  <NavLink
                    to="/profile"
                    className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaUser className="mr-2" /> My Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition text-sm sm:text-base"
            >
              Login
            </NavLink>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-inner">
        <div className="flex justify-around py-2">
          <NavLink to="/" className={navIconClass}>
            <FaHome className="text-xl" />
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          <NavLink to="/dashboard" className={navIconClass}>
            <FaTachometerAlt className="text-xl" />
            <span className="text-xs mt-1">Dashboard</span>
          </NavLink>
          <NavLink to="/my-attempts" className={navIconClass}>
            <FaClipboardList className="text-xl" />
            <span className="text-xs mt-1">Attempts</span>
          </NavLink>
          {isLoggedin ? (
            <NavLink to="/profile" className={navIconClass}>
              <FaUserCircle className="text-xl" />
              <span className="text-xs mt-1">Profile</span>
            </NavLink>
          ) : (
            <NavLink to="/login" className={navIconClass}>
              <FaUser className="text-xl" />
              <span className="text-xs mt-1">Login</span>
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
