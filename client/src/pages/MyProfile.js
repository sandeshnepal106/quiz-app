import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LikeQuiz from '../components/LikeQuiz';

function MyProfile() {
    const navigate = useNavigate();
  const [myDetails, setMyDetails] = useState(null);
  const [myQuizzes, setMyQuizzzes] = useState([]);
  const { backendUrl } = useContext(AppContext);

  const getMyDetails = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/my-details`);
      setMyDetails(response.data.user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMyQuizzes = async () =>{
    try {
        const res = await axios.get(`${backendUrl}/api/user/get-my-quizzes`);
        setMyQuizzzes(res.data.myQuizzes)
    } catch (error) {
        toast.error(error.message);
    }
  }

  useEffect(() => {
    getMyDetails();
    getMyQuizzes();
  }, []);

  if (!myDetails) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  const goToQuiz = (quizId) =>{
    navigate(`/quiz/${quizId}`)
  }

  return (
    <div>
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600">
              {myDetails.name?.charAt(0).toUpperCase()}
            </div >
            <div>
              <h1 className="text-2xl font-bold">{myDetails.name}</h1>
              <p className="text-gray-600">@{myDetails.username}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-gray-700">
            <p><span className="font-semibold">Email:</span> {myDetails.email}</p>
            {/* Add more fields if available, like location, bio, etc. */}
          </div>
          <div className="mt-6 text-right">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border">
            <h2 className="text-xl font-bold mb-4">My Quizzes</h2>
            {myQuizzes.length === 0 ? (
                <p className="text-gray-500">You haven't created any quizzes yet.</p>
            ) : (
                <ul className="space-y-4">
                {myQuizzes.map((quiz) => (
                    <li key={quiz._id}  onClick={()=>goToQuiz(quiz._id)} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <p className="text-sm text-gray-600">Created on: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                    <LikeQuiz quizId={quiz._id}/>
                    </li>
                ))}
                </ul>
            )}
            </div>

    </div>
  );
}

export default MyProfile;
