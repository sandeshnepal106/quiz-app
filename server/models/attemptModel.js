import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    responses: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedOptionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Option",
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalQuestions: {
      type: Number,
      required: true,
    },
    totalQuestionsAttempted: {
      type: Number,
      required: true,
    },
    totalCorrectAnswers: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const AttemptModel = mongoose.model("Attempt", attemptSchema);
export default AttemptModel;
