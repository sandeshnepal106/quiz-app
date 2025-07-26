import { FollowModel } from "../models/userModel.js";

export const follow = async (req, res) => {
    const followerId = req.userId;
    const { followingId } = req.body;

    if (!followerId || !followingId) {
        return res.status(400).json({ success: false, message: "Missing follower or following ID." });
    }

    if (followerId === followingId) {
        return res.status(400).json({ success: false, message: "You cannot follow yourself." });
    }

    try {
        // Check if already following
        const existingFollow = await FollowModel.findOne({ followerId, followingId });
        if (existingFollow) {
            return res.status(400).json({ success: false, followed: true, message: "Already following this user." });
        }

        const follow = new FollowModel({ followerId, followingId });
        await follow.save();

        return res.status(201).json({ success: true, followed: true, message: "Followed successfully." });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const unfollow = async (req, res) => {
    const followerId = req.userId;
    const { followingId } = req.body;

    if (!followerId || !followingId) {
        return res.status(400).json({ success: false, message: "Missing follower or following ID." });
    }

    try {
        const deletedFollow = await FollowModel.findOneAndDelete({ followerId, followingId });

        if (!deletedFollow) {
            return res.status(404).json({ success: false, followed: false, message: "User is not followed." });
        }

        return res.status(200).json({ success: true, followed:false, message: "Unfollowed successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getFollowDetails = async (req, res) => {
    const followerId = req.userId;
    const { followingId } = req.params; // Destructure followingId from req.params

    if (!followerId || !followingId) {
        return res.status(400).json({ success: false, message: "Missing follower or following ID." });
    }

    try {
        const followed = await FollowModel.findOne({ followerId, followingId });
        const followersCount = await FollowModel.countDocuments({ followingId });
        const followingCount = await FollowModel.countDocuments({ followerId:followingId });

        return res.status(200).json({
            success: true,
            followed: !!followed, // Convert to boolean: true if followed, false otherwise
            followersCount: followersCount,
            followingCount: followingCount,
            message: followed ? "User is followed." : "User is not followed."
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};