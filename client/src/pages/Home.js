import React from 'react'
import Dashboard from './Dashboard'
import CreateQuiz from '../components/CreateQuiz'
import Navbar from '../components/Navbar'

function Home() {
 return (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
    <CreateQuiz />
    <Dashboard />
  </div>
);

}

export default Home
