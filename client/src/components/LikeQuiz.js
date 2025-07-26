import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function LikeQuiz({ quizId }) {
  const { backendUrl, userId } = useContext(AppContext);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);

  const fetchLikeStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/quiz/get-like/${quizId}`);
      if (res.data.success) {
        setLiked(res.data.liked);
        setLikes(res.data.likes);
      }
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error(error?.response?.data?.message || error.message);
      }
    } finally {
      setInitialFetchComplete(true);
    }
  }, [backendUrl, quizId]);

  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  const handleLikeToggle = useCallback(async () => {
    if (!userId) {
      toast.info('Please log in to like quizzes.');
      return;
    }

    const previousLiked = liked;
    const previousLikes = likes;

    setLiked(prev => !prev);
    setLikes(prev => (previousLiked ? prev - 1 : prev + 1));
    setLoading(true);

    try {
      const res = previousLiked
        ? await axios.delete(`${backendUrl}/api/quiz/unlike/${quizId}`)
        : await axios.post(`${backendUrl}/api/quiz/like`, { quizId, userId });

      if (!res.data.success) {
        toast.error(res.data.message || 'Failed to update like.');
        setLiked(previousLiked);
        setLikes(previousLikes);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'An error occurred.');
      setLiked(previousLiked);
      setLikes(previousLikes);
    } finally {
      setLoading(false);
    }
  }, [liked, likes, backendUrl, quizId, userId]);

  if (!initialFetchComplete) {
    return (
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 ">
      <button
        onClick={handleLikeToggle}
        disabled={loading}
        aria-label={liked ? 'Unlike this quiz' : 'Like this quiz'}
        className={`
          px-3 py-3 rounded-full flex items-center justify-center
          text-xl transition-all duration-200
          ${liked ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
          dark:${liked ? 'bg-red-900 text-red-100 hover:bg-red-800' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
          ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {liked ? '❤️' : '🤍'}
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {likes} {likes === 1 ? 'Like' : 'Likes'}
      </span>
    </div>
  );
}

export default LikeQuiz;
