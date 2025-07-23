import React, { useEffect, useState, useContext, createContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LikeQuiz from '../components/LikeQuiz';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const { backendUrl, token } = useContext(AppContext);
  const [quizzes, setQuizzes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/quiz/get-user-feed?page=${pageNumber}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        setQuizzes(res.data.quizzes);
        setTotalPages(res.data.totalPages);
        setPage(pageNumber);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load feed.");
    } finally {
      setLoading(false);
    }
  };

  const goToQuiz = (quizId) =>{
    navigate(`/quiz/${quizId}`)
  }


  useEffect(() => {
    fetchFeed(page);
  }, []);

  const handleNext = () => {
    if (page < totalPages) fetchFeed(page + 1);
  };

  const handlePrevious = () => {
    if (page > 1) fetchFeed(page - 1);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Your Quiz Feed</h2>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center text-gray-500">No quizzes found for your feed.</div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition" >
              <h3 className="text-xl font-bold" onClick={()=>goToQuiz(quiz._id)}>{quiz.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {quiz.tags.map((tag, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Posted by <span className="font-medium">{quiz.createdBy?.name}</span> (@{quiz.createdBy?.username})
              </p>
              <LikeQuiz quizId={quiz._id}/>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
