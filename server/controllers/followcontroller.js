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
            return res.status(400).json({ success: false, message: "Already following this user." });
        }

        const follow = new FollowModel({ followerId, followingId });
        await follow.save();

        return res.status(201).json({ success: true, message: "Followed successfully." });

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
            return res.status(404).json({ success: false, message: "User is not followed." });
        }

        return res.status(200).json({ success: true, message: "Unfollowed successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
