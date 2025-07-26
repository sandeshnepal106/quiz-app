import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import FollowUser from '../components/FollowUser';

function Profile() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/user-profile/${profileId}`);
      if (res.data.success) {
        setProfile(res.data);
      } else {
        toast.error(res.data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const goToQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return <div className="text-center mt-10 text-lg text-gray-600 dark:text-gray-300">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center mt-10 text-red-500 text-lg">Profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* User Details Card */}
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border dark:border-gray-700">
        <div className="flex items-center space-x-6">
          {/* Profile Picture */}
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border dark:border-gray-600"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-200">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">@{profile.username}</p>
            <FollowUser followingId={profileId} profilePage={true} />
          </div>
        </div>

        <div className="mt-6 space-y-3 text-gray-700 dark:text-gray-300">
          <p>
            <span className="font-semibold">Email:</span> {profile.email}
          </p>
        </div>
      </div>

      {/* Quiz List Card */}
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border dark:border-gray-700 mb-20">
        <h2 className="text-xl font-bold mb-4">Quizzes Created</h2>
        {profile.profileQuizzes && profile.profileQuizzes.length > 0 ? (
          <ul className="space-y-4">
            {profile.profileQuizzes.map((quiz) => (
              <li
                key={quiz._id}
                onClick={() => goToQuiz(quiz._id)}
                className="border dark:border-gray-600 p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <h3 className="text-lg font-semibold">{quiz.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">ID: {quiz._id}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">This user hasn't created any quizzes yet.</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
