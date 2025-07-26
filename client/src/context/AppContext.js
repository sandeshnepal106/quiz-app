// src/context/AppContext.js

import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

export const AppContext = createContext();
axios.defaults.withCredentials = true;

export const AppContextProvider = (props) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const [userId, setUserId] = useState(null);
    const [profilePic, setProfilePic] = useState('');
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- NEW: Centralized state for user follow details ---
    // This will store a map: { [targetUserId]: { isFollowing: boolean, followersCount: number, followingCount: number } }
    const [userFollowDetails, setUserFollowDetails] = useState({});

    // --- NEW: Function to update global follow details ---
    const updateFollowDetails = (targetUserId, newDetails) => {
        setUserFollowDetails(prevDetails => ({
            ...prevDetails,
            [targetUserId]: {
                ...(prevDetails[targetUserId] || {}), // Keep existing details if any
                ...newDetails, // Merge new updates
            },
        }));
    };
    // -----------------------------------------------------

    const checkAuth = async () => {
        setLoading(true);
        try {
            const res = await axios.get(backendUrl + '/api/user/check-auth');
            if (res.data.success) {
                setIsLoggedin(true);
                setProfilePic(res.data.profilePic)
                setUserId(res.data.userId);
            } else {
                setIsLoggedin(false);
                if (res.data.message !== "Not authorized. Try Again.") {
                    toast.error(res.data.message);
                }
            }
        } catch (error) {
            setIsLoggedin(false);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        backendUrl,
        userId, setUserId,
        isLoggedin, setIsLoggedin,
        profilePic, setProfilePic,
        loading,
        userFollowDetails,   // --- NEW: Provide the global state ---
        updateFollowDetails  // --- NEW: Provide the updater function ---
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};