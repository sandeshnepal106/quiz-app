import { CommentModel, LikeModel } from "../models/engagementModel.js";

// POST: Like a quiz
export const postLike = async (req, res) => {
    const userId = req.userId;
    const { quizId } = req.body;

    if (!quizId) {
        return res.status(400).json({ success: false, message: "Quiz ID is required." });
    }

    try {
        const existingLike = await LikeModel.findOne({ userId, quizId });
        if (existingLike) {
            return res.status(400).json({ success: false, message: "Quiz already liked by this user." });
        }

        await new LikeModel({ userId, quizId }).save();

        const totalLikes = await LikeModel.countDocuments({ quizId });

        return res.status(200).json({
            success: true,
            message: "Quiz liked successfully.",
            likes: totalLikes,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET: Get like status & total likes
export const getLike = async (req, res) => {
    const userId = req.userId;
    const { quizId } = req.params;

    if (!quizId) {
        return res.status(400).json({ success: false, message: "Quiz ID is required." });
    }

    try {
        const liked = await LikeModel.exists({ userId, quizId });
        const likes = await LikeModel.countDocuments({ quizId });

        return res.status(200).json({
            success: true,
            liked: !!liked,
            likes,
            message: liked ? "Quiz is liked by the user." : "Quiz is not liked by the user.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE: Unlike a quiz
export const deleteLike = async (req, res) => {
    const userId = req.userId;
    const { quizId } = req.params;

    if (!quizId) {
        return res.status(400).json({ success: false, message: "Quiz ID is required." });
    }

    try {
        const like = await LikeModel.findOneAndDelete({ userId, quizId });
        if (!like) {
            return res.status(404).json({ success: false, message: "Like does not exist." });
        }

        const totalLikes = await LikeModel.countDocuments({ quizId });

        return res.status(200).json({
            success: true,
            message: "Unliked successfully.",
            likes: totalLikes,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// POST: Add a comment
export const postComment = async (req, res) => {
    const userId = req.userId;
    const { quizId, comment } = req.body;

    if (!quizId || !comment) {
        return res.status(400).json({ success: false, message: "Quiz ID and comment are required." });
    }

    try {
        const newComment = new CommentModel({ userId, quizId, comment });
        await newComment.save();

        return res.status(201).json({
            success: true,
            message: "Comment posted successfully.",
            data: newComment,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE: Remove a comment
export const deleteComment = async (req, res) => {
    const userId = req.userId;
    const { quizId, commentId } = req.body;

    if (!quizId || !commentId) {
        return res.status(400).json({ success: false, message: "Quiz ID and Comment ID are required." });
    }

    try {
        const comment = await CommentModel.findOneAndDelete({
            _id: commentId,
            quizId,
            userId,
        });

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found or not authorized." });
        }

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
