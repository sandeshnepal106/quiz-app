import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LikeQuiz from '../components/LikeQuiz';
import FollowUser from '../components/FollowUser';

const Dashboard = () => {
  const navigate = useNavigate();
  const { backendUrl, token, userId } = useContext(AppContext);

  const [quizzes, setQuizzes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async (pageNumber = 1) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/quiz/get-user-feed?page=${pageNumber}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const newQuizzes = res.data.quizzes;

        // Avoid duplicates
        setQuizzes((prev) => {
          const existingIds = new Set(prev.map((q) => q._id));
          const filtered = newQuizzes.filter((q) => !existingIds.has(q._id));
          return [...prev, ...filtered];
        });

        if (newQuizzes.length === 0 || pageNumber >= res.data.totalPages) {
          setHasMore(false);
        } else {
          setPage((prev) => prev + 1);
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  };

  const goToQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const goToProfile = (profileId) => {
    if (profileId === userId) {
      navigate(`/profile`);
    } else {
      navigate(`/profiles/${profileId}`);
    }
  };

  // Scroll handler
  const handleScroll = useCallback(() => {
    const bottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200;
    if (bottom) {
      fetchFeed(page);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    fetchFeed(1); // Initial load
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Your Quiz Feed</h2>

      {quizzes.length === 0 && !loading ? (
  <div className="text-center text-gray-500 text-lg mt-10">
    No quizzes found for your feed.
  </div>
) : (
  <div className="space-y-6">
    {quizzes.map((quiz) => (
      <div
        key={quiz._id}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition duration-300 flex flex-col justify-center"
      >
        {/* Title & Like */}
        <div className="flex items-start justify-between mb-4 pt-4">
          <div className='flex flex-col justify-between gap-y-2'>
            <h3
              className="text-2xl font-semibold text-gray-800 hover:underline cursor-pointer"
              onClick={() => goToQuiz(quiz._id)}
            >
              {quiz.title}
            </h3>
            <p className="text-gray-700 text-base mb-4">
          {quiz.description}
        </p>
          </div>
          <LikeQuiz quizId={quiz._id} />
        </div>

        {/* Description */}
        

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quiz.tags.map((tag, idx) => (
            <span
              key={`${quiz._id}-tag-${idx}`}
              className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer: Posted by & Follow */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            Posted by{' '}
            <span
              onClick={() => goToProfile(quiz.createdBy?._id)}
              className="font-medium text-blue-600 hover:underline cursor-pointer"
            >
              {quiz.createdBy?.name} (@{quiz.createdBy?.username})
            </span>
          </div>
          <FollowUser followingId={quiz.createdBy?._id} profilepage={false} />
        </div>
      </div>
    ))}
  </div>
)}


      {loading && (
        <div className="text-center py-6 text-sm text-gray-500">Loading more quizzes...</div>
      )}

      {!hasMore && quizzes.length > 0 && (
        <div className="text-center text-sm text-gray-400 mt-6">You've reached the end of the feed.</div>
      )}
    </div>
  );
};

export default Dashboard;
