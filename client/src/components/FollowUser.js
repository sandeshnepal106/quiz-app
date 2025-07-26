import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../context/AppContext'; // Correct path
import axios from 'axios';
import { toast } from 'react-toastify';

function FollowUser({ followingId, profilePage }) {
  // Destructure the new global state and updater from AppContext
  const { backendUrl, userId, userFollowDetails, updateFollowDetails } = useContext(AppContext);

  // Local loading state remains for the individual component's API calls
  const [loading, setLoading] = useState(false);
  // `initialCheckComplete` will now primarily manage if the initial data has been fetched into context
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  // Derive current status and counts from the global userFollowDetails
  const currentDetails = userFollowDetails[followingId] || {
    isFollowing: false,
    followersCount: 0,
    followingCount: 0,
  };
  const { isFollowing, followersCount, followingCount } = currentDetails;

  // Fetch status and counts
  const fetchFollowDetails = useCallback(async () => {
    if (!followingId || !userId) {
      setInitialCheckComplete(true);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/user/get-follow-details/${followingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.data.success) {
        // Update the global AppContext state with the fetched data
        updateFollowDetails(followingId, {
          isFollowing: res.data.followed || false,
          followersCount: res.data.followersCount || 0,
          followingCount: res.data.followingCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching follow details:', error);
    } finally {
      setLoading(false);
      setInitialCheckComplete(true);
    }
  }, [backendUrl, followingId, userId, updateFollowDetails]); // Add updateFollowDetails to deps

  useEffect(() => {
    // Only fetch if details for this `followingId` are not yet in the global context
    // or if the initial check hasn't completed yet.
    if (!userFollowDetails[followingId] || !initialCheckComplete) {
      fetchFollowDetails();
    }
  }, [fetchFollowDetails, followingId, initialCheckComplete, userFollowDetails]);


  // Follow action with optimistic update
  const follow = async () => {
    // Store previous state for potential rollback
    const previousDetails = { ...currentDetails };

    // Optimistically update the global state
    updateFollowDetails(followingId, {
      isFollowing: true,
      followersCount: followersCount + 1,
    });
    setLoading(true); // Still show loading for the network request

    try {
      const res = await axios.post(
        `${backendUrl}/api/user/follow`,
        { followingId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (res.data.success && res.data.followed) {
        toast.success(res.data.message);
        // If your backend returns the precise new counts, you can update with them here
        // e.g., updateFollowDetails(followingId, { followersCount: res.data.newFollowersCount });
      } else {
        toast.info(res.data.message);
        // Rollback global state on non-success from backend
        updateFollowDetails(followingId, previousDetails);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Follow failed';
      toast.error(msg);
      // Rollback global state on error
      updateFollowDetails(followingId, previousDetails);
    } finally {
      setLoading(false);
    }
  };

  // Unfollow action with optimistic update
  const unfollow = async () => {
    // Store previous state for potential rollback
    const previousDetails = { ...currentDetails };

    // Optimistically update the global state
    updateFollowDetails(followingId, {
      isFollowing: false,
      followersCount: Math.max(0, followersCount - 1), // Prevent negative count
    });
    setLoading(true); // Still show loading for the network request

    try {
      const res = await axios.delete(`${backendUrl}/api/user/unfollow`, {
        data: { followingId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.data.success && res.data.followed === false) {
        toast.success(res.data.message);
        // If your backend returns the precise new counts, you can update with them here
      } else {
        toast.info(res.data.message);
        // Rollback global state on non-success from backend
        updateFollowDetails(followingId, previousDetails);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unfollow failed');
      // Rollback global state on error
      updateFollowDetails(followingId, previousDetails);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (isFollowing) {
      unfollow();
    } else {
      follow();
    }
  };

  // Loading UI: Check if initial data for THIS specific user is being fetched
  if (!initialCheckComplete && !userFollowDetails[followingId]) {
    return (
      <div className="flex flex-col items-center">
        <button
          disabled
          className="px-4 py-2 rounded-md font-medium text-white bg-gray-400 cursor-not-allowed"
        >
          Loading...
        </button>
        <div className="mt-2 text-gray-600">Loading counts...</div>
      </div>
    );
  }

  // Self profile view
  if (userId === followingId) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex space-x-4 mt-2">
          <p className="text-gray-600">Followers: {followersCount}</p>
          <p className="text-gray-600">Following: {followingCount}</p>
        </div>
      </div>
    );
  }

  // Public profile view
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={loading} // Disable only when a network request for this button is in progress
        className={`px-4 py-2 rounded-md font-medium text-white ${
          isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? 'Processing...' : isFollowing ? 'Following' : 'Follow'}
      </button>

      {profilePage && (
        <div className="flex space-x-4 mt-2 text-gray-600">
          <p>Followers: {followersCount}</p>
          <p>Following: {followingCount}</p>
        </div>
      )}
    </div>
  );
}

export default FollowUser;