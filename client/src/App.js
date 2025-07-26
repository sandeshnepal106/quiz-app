import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import ResetPassword from './components/ResetPassword.js';
import Dashboard from './pages/Dashboard.js';
import Quiz from './pages/Quiz.js';
import MyProfile from './pages/MyProfile.js';
import Navbar from './components/Navbar.js';
import MyAttempts from './pages/MyAttempts.js';
import Profile from './pages/Profile.js';

function App() {
  const { loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/my-attempts" element={<MyAttempts />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/profiles/:profileId" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
