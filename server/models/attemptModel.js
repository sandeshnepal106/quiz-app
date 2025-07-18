import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    responses:[{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
        },
        SelectedOptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Option",
        },
        isCorrect: {
            type: Boolean,
            default: false,
        }
    },
    ],
    totalQuestions: {
        type: Number
    },
    totalQuestionsAttempted: {
        type: Number,
    },
    totalCorrectAnswers: {
        type: Number,
    },
    score: {
        type: Number,
        default: 0
    }
});

const AttemptModel = mongoose.model("Attempts", attemptSchema);
export default AttemptModel;