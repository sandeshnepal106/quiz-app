import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import logo from '../assets/QuizosLogo.webp';

function Navbar() {

  const { backendUrl, userId, setUserId, isLoggedin, setIsLoggedin } = useContext(AppContext);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1'
      : 'text-gray-700 hover:text-blue-600 transition pb-1';

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/user/logout`, { withCredentials: true });
      setIsLoggedin(false);
      setUserId(null);
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoggedin(false);
      setUserId(null);
      navigate('/login');
    }
  };

  return (
    <div className='sticky top-0'>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="text-xl font-bold text-blue-700">
            <img src={logo} className='w-16 h-16'/>
          </NavLink>
          {/* Navigation Links */}
          <div className="space-x-6 text-sm sm:text-base">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/my-attempts" className={navLinkClass}>
              My Attempts
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          </div>
          {/* Auth Button */}
          {isLoggedin ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition text-sm sm:text-base"
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition text-sm sm:text-base"
            >
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
