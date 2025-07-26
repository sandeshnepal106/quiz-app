import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import LikeQuiz from '../components/LikeQuiz';

function MyAttempts() {
    const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttempts = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/attempts`);
      if (!res.data.success) {
        toast.error(res.data.message || 'Failed to fetch attempts');
      } else {
        setAttempts(res.data.attempts || []);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const goToQuiz = (quizId, attemptId) =>{
    navigate(`/quiz/${quizId}?attemptId=${attemptId}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">My Quiz Attempts</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : attempts.length === 0 ? (
        <p className="text-gray-500">You haven't attempted any quizzes yet.</p>
      ) : (
        <div className="grid gap-4">
          {attempts.map((attempt, index) => (
            <div
              key={attempt.attemptId || index}
              className="border rounded-lg shadow-sm p-4 hover:shadow-md transition" 
            >
              <div className='flex justify-between'>
                <h3 className="text-lg font-semibold p-1"  onClick={()=>goToQuiz(attempt.quizId, attempt.attemptId)}>{attempt.quizTitle}</h3>
                <LikeQuiz quizId={attempt.quizId}/>
              </div>
              <p className='text-md text-gray-200 italic p-1'>{attempt.description}</p>
              <p className="text-sm text-gray-600 italic p-1">Created By: {attempt.createdBy}</p>
              <p className="text-sm text-gray-600 p-1">Score: {attempt.score}/100</p>
              <p className="text-sm text-gray-600 p-1 ">
                Date: {new Date(attempt.date).toLocaleString()}
              </p>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAttempts;
