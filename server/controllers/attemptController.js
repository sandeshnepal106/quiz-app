import AttemptModel from "../models/attemptModel.js";
import { OptionModel, QuestionModel, QuizModel } from "../models/quizModel.js";
import { UserModel } from "../models/userModel.js";

// Controller for submitting a quiz attempt
export const attempt = async (req, res) => {
    const userId = req.userId;
    const { quizId, responses } = req.body;

    if (!userId || !quizId || !responses) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found." });
        }

        const questions = await QuestionModel.find({ quizId: quiz._id });
        const questionIdsInQuiz = questions.map(q => q._id.toString());

        // Validate that all submitted responses correspond to questions in the quiz
        if (responses.some(r => !questionIdsInQuiz.includes(r.questionId))) {
             return res.status(400).json({ success: false, message: "One or more responses refer to questions not in this quiz." });
        }

        const totalQuestions = questions.length;
        let totalCorrectAnswers = 0;
        let totalQuestionsAttempted = responses.length;

        // Prepare responses to be saved, including `isCorrect` status
        const detailedResponses = [];

        for (const response of responses) {
            const correctOption = await OptionModel.findOne({
                questionId: response.questionId,
                isCorrect: true
            });

            let isResponseCorrect = false;
            if (correctOption && correctOption._id.toString() === response.selectedOptionId) {
                totalCorrectAnswers++;
                isResponseCorrect = true;
            }

            // Fetch the selected option's text for better context in frontend review
            const selectedOption = await OptionModel.findById(response.selectedOptionId);
            
            detailedResponses.push({
                questionId: response.questionId,
                selectedOptionId: response.selectedOptionId,
                isCorrect: isResponseCorrect,
                // Optionally store selectedOptionText and correctOptionId/Text for easier retrieval later
                selectedOptionText: selectedOption ? selectedOption.option : "N/A",
                correctOptionId: correctOption ? correctOption._id : null,
                correctOptionText: correctOption ? correctOption.option : "N/A"
            });
        }

        const score = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0;

        const attempt = new AttemptModel({
            userId,
            quizId,
            responses: detailedResponses, // Save the detailed responses
            totalQuestions,
            totalQuestionsAttempted,
            totalCorrectAnswers,
            score
        });
        await attempt.save();

        return res.status(201).json({ success: true, message: "Attempt submitted successfully.", attemptId: attempt._id });

    } catch (error) {
        console.error("Error submitting attempt:", error); // Log the error for debugging
        return res.status(500).json({ success: false, message: "Something went wrong while submitting the attempt.", error: error.message });
    }
};

// Controller for fetching a summary of all user attempts
export const attempts = async (req, res) => {
    const userId = req.userId;

    try {
        // Find all attempts for the user
        const attemptedQuizzes = await AttemptModel.find({ userId }).lean();

        // Populate quiz details and creator username for each attempt
        const populatedAttempts = await Promise.all(
            attemptedQuizzes.map(async (attempt) => {
                const quiz = await QuizModel.findById(attempt.quizId).lean();

                let creatorUsername = "Unknown";
                if (quiz?.createdBy) {
                    const creator = await UserModel.findById(quiz.createdBy).lean();
                    if (creator?.username) {
                        creatorUsername = creator.username;
                    }
                }

                return {
                    attemptId: attempt._id,
                    attemptorId: userId,
                    quizId: attempt.quizId,
                    quizTitle: quiz?.title || "Untitled Quiz",
                    quizDescription: quiz?.description || "",
                    createdBy: creatorUsername,
                    score: attempt.score,
                    date: attempt.createdAt || attempt.date,
                    totalQuestions: attempt.totalQuestions,
                    totalQuestionsAttempted: attempt.totalQuestionsAttempted,
                    totalCorrectAnswers: attempt.totalCorrectAnswers,
                };
            })
        );

        return res.status(200).json({
            success: true,
            attempts: populatedAttempts,
            message: "Attempts fetched successfully.",
        });
    } catch (error) {
        console.error("Error fetching attempts:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching attempts.",
            error: error.message,
        });
    }
};

// New controller for fetching full details of a single attempt for review
export const getAttemptDetails = async (req, res) => {
    const userId = req.userId;
    const { attemptId } = req.params; // Get attemptId from URL parameters

    if (!userId || !attemptId) {
        return res.status(400).json({ success: false, message: "Missing required fields (attemptId)." });
    }

    try {
        const attempt = await AttemptModel.findById(attemptId).lean();

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Attempt not found." });
        }

        // Ensure the attempt belongs to the authenticated user
        if (attempt.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized: This attempt does not belong to you." });
        }

        const quiz = await QuizModel.findById(attempt.quizId).lean();
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Associated quiz not found." });
        }

        // Fetch all questions and options for this quiz
        const questions = await QuestionModel.find({ quizId: quiz._id }).lean();
        const questionIds = questions.map(q => q._id);
        const options = await OptionModel.find({ questionId: { $in: questionIds } }).lean();

        // Map options to their respective questions and add correctOptionId
        const questionsWithDetails = questions.map(q => {
            const questionOptions = options.filter(opt => opt.questionId.toString() === q._id.toString());
            const correctOption = questionOptions.find(opt => opt.isCorrect);
            
            // Find the user's response for this specific question within the attempt
            const userAnswer = attempt.responses.find(res => res.questionId.toString() === q._id.toString());

            return {
                _id: q._id,
                question: q.question,
                options: questionOptions.map(opt => ({
                    _id: opt._id,
                    option: opt.option,
                    // isCorrect: opt.isCorrect // Can include this if needed on frontend
                })),
                correctOptionId: correctOption ? correctOption._id.toString() : null,
                selectedOptionId: userAnswer ? userAnswer.selectedOptionId.toString() : null, // User's selected answer
                isCorrectAnswer: userAnswer ? userAnswer.isCorrect : false, // Pre-calculated correctness
            };
        });

        // Combine all necessary details into a single response
        const fullAttemptDetails = {
            _id: attempt._id,
            userId: attempt.userId,
            quizId: attempt.quizId,
            quizTitle: quiz.title,
            quizDescription: quiz.description,
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            totalQuestionsAttempted: attempt.totalQuestionsAttempted,
            totalCorrectAnswers: attempt.totalCorrectAnswers,
            createdAt: attempt.createdAt,
            updatedAt: attempt.updatedAt,
            questions: questionsWithDetails, // Array of questions with options, correct and selected answers
        };

        return res.status(200).json({ success: true, attempt: fullAttemptDetails, message: "Attempt details fetched successfully." });

    } catch (error) {
        console.error("Error fetching attempt details:", error);
        return res.status(500).json({ success: false, message: "Something went wrong while fetching attempt details.", error: error.message });
    }
};