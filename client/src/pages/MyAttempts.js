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

  const goToQuiz = (quizId, attemptId) => {
    navigate(`/quiz/${quizId}?attemptId=${attemptId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-6">My Quiz Attempts</h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : attempts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You haven't attempted any quizzes yet.</p>
      ) : (
        <div className="grid gap-4">
          {attempts.map((attempt, index) => (
            <div
              key={attempt.attemptId || index}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition flex justify-between items-center bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <div
                className="flex flex-col cursor-pointer"
                onClick={() => goToQuiz(attempt.quizId, attempt.attemptId)}
              >
                <h3 className="text-lg font-semibold p-1">{attempt.quizTitle}</h3>
                <p className="text-md italic text-gray-700 dark:text-gray-300 p-1">
                  {attempt.quizDescription}
                </p>
                <p className="text-sm italic text-gray-600 dark:text-gray-400 p-1">
                  Created By: {attempt.createdBy}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 p-1">
                  Score: {attempt.score}/100
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 p-1">
                  Date: {new Date(attempt.date).toLocaleString()}
                </p>
              </div>

              <LikeQuiz quizId={attempt.quizId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAttempts;
