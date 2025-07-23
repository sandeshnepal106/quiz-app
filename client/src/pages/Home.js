import React from 'react'
import Dashboard from './Dashboard'
import CreateQuiz from '../components/CreateQuiz'
import Navbar from '../components/Navbar'

function Home() {
  return (
    <div>
      
      <CreateQuiz/>
      <Dashboard/>
    </div>
  )
}

export default Home
