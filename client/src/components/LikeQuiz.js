import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function LikeQuiz({ quizId }) {
  const { backendUrl, userId } = useContext(AppContext);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false); // To manage initial loading state

  // Fetch status and counts
  const fetchLikeStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/quiz/get-like/${quizId}`);
      if (res.data.success) {
        setLiked(res.data.liked);
        setLikes(res.data.likes);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
      // Only show toast if it's not a common "not found" or similar initial error
      if (error?.response?.status !== 404) { // Example: don't toast if quiz not found
        toast.error(error?.response?.data?.message || error.message);
      }
    } finally {
      setInitialFetchComplete(true); // Mark initial fetch as complete
    }
  }, [backendUrl, quizId]); // Dependencies for useCallback

  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]); // Dependency for useEffect

  const handleLikeToggle = useCallback(async () => {
    if (!userId) { // Ensure user is logged in before allowing like/unlike
      toast.info('Please log in to like quizzes.');
      return;
    }

    // Optimistic UI Update: Change UI immediately
    const previousLiked = liked;
    const previousLikes = likes;

    setLiked(prev => !prev);
    setLikes(prev => (previousLiked ? prev - 1 : prev + 1));
    setLoading(true); // Disable button during API call

    try {
      if (previousLiked) {
        // User is unliking
        const res = await axios.delete(`${backendUrl}/api/quiz/unlike/${quizId}`);
        if (!res.data.success) {
          toast.error(res.data.message || 'Failed to unlike quiz.');
          // Rollback UI on failure
          setLiked(previousLiked);
          setLikes(previousLikes);
        }
      } else {
        // User is liking
        const res = await axios.post(`${backendUrl}/api/quiz/like`, { quizId, userId });
        if (!res.data.success) {
          toast.error(res.data.message || 'Failed to like quiz.');
          // Rollback UI on failure
          setLiked(previousLiked);
          setLikes(previousLikes);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'An error occurred.');
      // Rollback UI on network/server error
      setLiked(previousLiked);
      setLikes(previousLikes);
    } finally {
      setLoading(false); // Re-enable button
    }
  }, [liked, likes, backendUrl, quizId, userId]); // Dependencies for useCallback

  // Show a loading state until the initial fetch is complete
  if (!initialFetchComplete) {
    return (
      <div className="flex items-center justify-center h-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleLikeToggle}
        disabled={loading}
        className={`
          flex items-center gap-1 px-3 py-4 rounded-full font-semibold
          transition-all duration-300 ease-in-out transform
          ${liked
            ? 'bg-red-500 text-white shadow-md hover:bg-red-600 active:scale-95'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'
          }
          ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        `}
      >
        <span className="text-xl leading-none">
          {liked ? '❤️' : '🤍'}
        </span>
        
      </button>
      <span className="text-gray-700 font-medium text-sm md:text-lg min-w-[50px] text-left">
        {likes} {likes === 1 ? 'Like' : 'Likes'}
      </span>
    </div>
  );
}

export default LikeQuiz;