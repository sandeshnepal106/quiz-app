import mongoose from 'mongoose';
import { UserModel, FollowModel } from '../models/userModel.js';
import {QuizModel} from '../models/quizModel.js'; // make sure this model exists
import AttemptModel from '../models/attemptModel.js';
import {LikeModel, CommentModel} from '../models/engagementModel.js';

export const getUserFeed = async (req, res) => {
    try {
        const userId = req.userId;

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch followed users
        const following = await FollowModel.find({ followerId: userId }).select('followingId');
        const followingIds = following.map(f => f.followingId.toString());

        // Fetch user interests (assuming you store interests in a UserProfile or extended model)
        const user = await UserModel.findById(userId);
        const userInterests = user.interests || [];

        // Get quizzes already liked or attempted
        const liked = await LikeModel.find({ likedBy: userId }).select('quizId');
        const commented = await CommentModel.find({commentedBy: userId}).select('quizId');
        const attempted = await AttemptModel.find({ userId }).select('quizId');

        const excludedQuizIds = [
            ...liked.map(l => l.quizId.toString()),
            ...commented.map(c => c.quizId.toString()),
            ...attempted.map(a => a.quizId.toString()),
        ];

        let feedQuizzes = await QuizModel.find({
    _id: { $nin: excludedQuizIds },
    $or: [
        { createdBy: { $in: followingIds } },
        { tags: { $in: userInterests } }
    ]
})
.sort({ createdAt: -1 })
.skip(skip)
.limit(limit)
.populate('createdBy', 'name username')
.exec();

// Fallback: If no preferred quizzes found, fetch general quizzes
if (feedQuizzes.length === 0) {
    feedQuizzes = await QuizModel.find({
        _id: { $nin: excludedQuizIds }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name username')
    .exec();
}


        const totalQuizzes = await QuizModel.countDocuments({
            _id: { $nin: excludedQuizIds },
            $or: [
                { createdBy: { $in: followingIds } },
                { tags: { $in: userInterests } }
            ]
        });

        res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(totalQuizzes / limit),
            quizzes: feedQuizzes
        });

    } catch (error) {
        console.error('Feed Fetch Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feed',
            error: error.message
        });
    }
};
