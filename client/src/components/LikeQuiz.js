import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function LikeQuiz({ quizId }) {
  const { backendUrl, userId } = useContext(AppContext);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLikeStatus();
  }, []);

  const fetchLikeStatus = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/quiz/get-like/${quizId}`);
      if (res.data.success) {
        setLiked(res.data.liked);
        setLikes(res.data.likes);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleLikeToggle = async () => {
    try {
      setLoading(true);
      if (liked) {
        const res = await axios.delete(`${backendUrl}/api/quiz/unlike/${quizId}`);
        if (res.data.success) {
          setLiked(false);
          setLikes(prev => prev - 1);
        }
      } else {
        const res = await axios.post(`${backendUrl}/api/quiz/like`,{quizId, userId});
        if (res.data.success) {
          setLiked(true);
          setLikes(prev => prev + 1);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={handleLikeToggle}
        disabled={loading}
        style={{
          padding: '8px 12px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          backgroundColor: liked ? '#e0f7fa' : '#f0f0f0',
          color: liked ? '#00796b' : '#333',
          fontWeight: liked ? 'bold' : 'normal',
        }}
      >
        {liked ? '❤️ Liked' : '🤍 Like'}
      </button>
      <span>{likes} Likes</span>
    </div>
  );
}

export default LikeQuiz;
