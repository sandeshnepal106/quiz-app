import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description:{
        type: String
    },
    tags:{
        type: [String]
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isPrivate: { 
        type: Boolean,
        default: false,
    },
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
}, {timestamps: true});

const questionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    question: {
        type: String,
        required: true
    }
}, {timestamps: true});

const optionSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    option: {
        type: String,
        required: true,
    },
    isCorrect:{
        type: Boolean,
        default: false,
    }
});

const QuizModel = mongoose.model("Quiz", quizSchema);
const QuestionModel = mongoose.model("Question", questionSchema);
const OptionModel = mongoose.model("Option", optionSchema);
export { QuizModel, QuestionModel, OptionModel };
