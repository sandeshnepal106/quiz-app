import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LikeQuiz from '../components/LikeQuiz';
import FollowUser from '../components/FollowUser';

function MyProfile() {
  const navigate = useNavigate();
  const [myDetails, setMyDetails] = useState(null);
  const [myQuizzes, setMyQuizzzes] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const { backendUrl } = useContext(AppContext);

  const getMyDetails = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/my-details`);
      setMyDetails(response.data.user);
      setEditForm({
        name: response.data.user.name || '',
        username: response.data.user.username || '',
        email: response.data.user.email || '',
        password: ''
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMyQuizzes = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/get-my-quizzes`);
      setMyQuizzzes(res.data.myQuizzes);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${backendUrl}/api/user/edit-details`, {
        name: editForm.name,
        username: editForm.username,
        email: editForm.email,
        password: editForm.password
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setShowEdit(false);
        getMyDetails(); // refresh details
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ⬇️ Profile Picture Upload Handler
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${backendUrl}/api/user/profile/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Profile picture updated');
        getMyDetails();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const [profilePicFile, setProfilePicFile] = useState(null);

const handleProfilePicChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await axios.post(`${backendUrl}/api/user/profile/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data.success) {
      toast.success(res.data.message);
      getMyDetails(); // refresh profile pic
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};


  useEffect(() => {
    getMyDetails();
    getMyQuizzes();
  }, []);

  if (!myDetails) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  const goToQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {myDetails.profilePic ? (
              <img
                src={myDetails.profilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600">
                {myDetails.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white p-1 rounded-full cursor-pointer text-xs hover:bg-opacity-80">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              ✎
            </label>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{myDetails.name}</h1>
            <p className="text-gray-600">@{myDetails.username}</p>
            <FollowUser followingId={myDetails._id} />
          </div>
        </div>

        <div className="mt-6 space-y-3 text-gray-700">
          <p><span className="font-semibold">Email:</span> {myDetails.email}</p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={() => setShowEdit(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>

          {showEdit && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full border p-2 rounded"
              />
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border p-2 rounded"
              />
              <input
                type="password"
                name="password"
                value={editForm.password}
                onChange={handleChange}
                placeholder="New Password"
                className="w-full border p-2 rounded"
              />
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border mb-16">
        <h2 className="text-xl font-bold mb-4">My Quizzes</h2>
        {myQuizzes.length === 0 ? (
          <p className="text-gray-500">You haven't created any quizzes yet.</p>
        ) : (
          <ul className="space-y-4">
            {myQuizzes.map((quiz) => (
              <li
                key={quiz._id}
                className="border p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex justify-between"
              >
                <div onClick={() => goToQuiz(quiz._id)}>
                  <h3 className="text-lg font-semibold">{quiz.title}</h3>
                  <p className="text-sm text-gray-600">Created on: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                </div>
                <LikeQuiz quizId={quiz._id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MyProfile;
