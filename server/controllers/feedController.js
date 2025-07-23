import mongoose from 'mongoose';
import { UserModel, FollowModel } from '../models/userModel.js';
import { QuizModel } from '../models/quizModel.js';
import AttemptModel from '../models/attemptModel.js';
import { LikeModel, CommentModel } from '../models/engagementModel.js';

export const getUserFeed = async (req, res) => {
    try {
        const userId = req.userId;

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // --- Step 1: Gather User Interactions and Preferences ---
        const following = await FollowModel.find({ followerId: userId }).select('followingId');
        const followingIds = following.map(f => f.followingId.toString());

        const user = await UserModel.findById(userId);
        const userInterests = user.interests || [];

        // Get quizzes already interacted with (liked, commented, attempted)
        const likedQuizzes = await LikeModel.find({ likedBy: userId }).select('quizId');
        const commentedQuizzes = await CommentModel.find({ commentedBy: userId }).select('quizId');
        const attemptedQuizzes = await AttemptModel.find({ userId }).select('quizId');

        const excludedQuizIds = [
            ...likedQuizzes.map(l => l.quizId.toString()),
            ...commentedQuizzes.map(c => c.quizId.toString()),
            ...attemptedQuizzes.map(a => a.quizId.toString()),
            // Exclude quizzes created by the user themselves
            userId.toString()
        ];
        
        // Remove duplicates and convert to Mongoose ObjectIds
        const uniqueExcludedQuizIds = [...new Set(excludedQuizIds)].map(id => new mongoose.Types.ObjectId(id));


        // --- Step 2: Fetch Priority Quizzes ---
        // These are quizzes from followed users OR based on interests, NOT interacted with yet.
        const priorityQuizzes = await QuizModel.find({
            _id: { $nin: uniqueExcludedQuizIds },
            $or: [
                { createdBy: { $in: followingIds.map(id => new mongoose.Types.ObjectId(id)) } }, // Convert to ObjectId
                { tags: { $in: userInterests } }
            ]
        })
        .sort({ createdAt: -1 }) // Newest first for priority
        .limit(limit * 2) // Fetch more than 'limit' to ensure we have enough after mixing
        .populate('createdBy', 'name username')
        .exec();

        // --- Step 3: Fetch General/Discovery Quizzes ---
        // These are quizzes the user hasn't interacted with and aren't necessarily from followed/interests.
        // We'll fetch a larger pool and randomly select from it.
        const generalQuizzes = await QuizModel.find({
            _id: { $nin: uniqueExcludedQuizIds }
        })
        .sort({ createdAt: -1 }) // Still sort by newest for general relevancy
        .limit(limit * 3) // Fetch even more to ensure good random variety
        .populate('createdBy', 'name username')
        .exec();

        // --- Step 4: Mix and Paginate ---
        let mixedFeed = [];
        const priorityCount = priorityQuizzes.length;
        const generalCount = generalQuizzes.length;

        // Define a ratio for mixing (e.g., 70% priority, 30% general)
        const priorityRatio = 0.7; 
        const desiredPriorityInPage = Math.ceil(limit * priorityRatio);
        const desiredGeneralInPage = limit - desiredPriorityInPage;

        // Add priority quizzes up to the desired limit, ensuring uniqueness
        const seenQuizIds = new Set();
        for (const quiz of priorityQuizzes) {
            if (mixedFeed.length < desiredPriorityInPage && !seenQuizIds.has(quiz._id.toString())) {
                mixedFeed.push(quiz);
                seenQuizIds.add(quiz._id.toString());
            }
        }
        
        // Add general quizzes to fill the rest of the page, ensuring uniqueness and variety
        // Randomly select from the general pool
        const shuffledGeneral = generalQuizzes.sort(() => 0.5 - Math.random()); // Simple shuffle
        for (const quiz of shuffledGeneral) {
            if (mixedFeed.length < limit && !seenQuizIds.has(quiz._id.toString())) {
                mixedFeed.push(quiz);
                seenQuizIds.add(quiz._id.toString());
            }
        }

        // If after mixing, we still don't have enough (e.g., due to pagination or very few new quizzes),
        // fill up with remaining priority or general quizzes as available.
        // This is a robust way to ensure the page is always full if there's content.
        let currentIndex = 0;
        while (mixedFeed.length < limit && currentIndex < priorityQuizzes.length) {
            const quiz = priorityQuizzes[currentIndex];
            if (!seenQuizIds.has(quiz._id.toString())) {
                mixedFeed.push(quiz);
                seenQuizIds.add(quiz._id.toString());
            }
            currentIndex++;
        }

        currentIndex = 0;
        while (mixedFeed.length < limit && currentIndex < generalQuizzes.length) {
            const quiz = generalQuizzes[currentIndex];
            if (!seenQuizIds.has(quiz._id.toString())) {
                mixedFeed.push(quiz);
                seenQuizIds.add(quiz._id.toString());
            }
            currentIndex++;
        }

        // Apply pagination to the mixed feed (if needed, though the limits already manage this for one page)
        // If you were generating a huge list and then paginating, this step would be crucial.
        // For current logic, fetching `limit` directly means we already have one page.

        // --- Step 5: Calculate Total Pages for All Available Quizzes ---
        const totalAvailableQuizzes = await QuizModel.countDocuments({
             _id: { $nin: uniqueExcludedQuizIds }
        });

        res.status(200).json({
            success: true,
            page,
            limit, // Return limit for client to know
            totalPages: Math.ceil(totalAvailableQuizzes / limit),
            quizzes: mixedFeed
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