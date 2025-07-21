import React, { useContext } from 'react'
import { AppContext } from './context/AppContext'
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import ResetPassword from './components/ResetPassword.js';

function App() {
  const {loading} = useContext(AppContext);
  if(loading){
    return(
      <div>
        Loading...
      </div>
    )
  }
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path = '/reset-password' element={<ResetPassword/>}/>
      </Routes>
     
    </div>
  )
}

export default App
