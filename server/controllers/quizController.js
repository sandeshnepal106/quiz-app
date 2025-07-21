import {QuizModel, QuestionModel, OptionModel} from "../models/quizModel.js";

export const postQuiz = async (req, res) =>{
    const {title, description, tags, createdBy, isPrivate, allowedUsers} = req.body;
    if(!title){
        return res.json({success: false, message:"Please enter the quiz title."})
    }
    if(!createdBy){
        return res.json({success: false, message:"Missing quiz author."});
    }
    try {
        const quiz = new QuizModel({title, description, tags, createdBy,isPrivate, allowedUsers});
        await quiz.save();
        return res.json({success: true, message: "Quiz created successfully."});
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const postQuestion = async (req, res) =>{
    const {quizId, question} = req.body;
    if(!quizId || !question){
        return res.json({success: false, message: "Missing details."})
    }
    try {
        const valid = await QuizModel.findById(quizId);
        if(!valid) {
            return res.json({success: false, message: "Quiz does not exist."})
        }
        const newQuestion = new QuestionModel({quizId, question});
        await newQuestion.save();
        return res.json({success: true, message: "Question saved successfully."})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const postOption = async (req, res) =>{
    const {questionId, option, isCorrect} = req.body;
    if(!questionId || !option) {
        return res.json({success: false, message: "Missing details."});
    }
    try {
        const valid = QuestionModel.findById(questionId);
        if(!valid){
            return res.json({success: false, message: "The question does not exist."});
        }
        const newOption = new OptionModel({questionId, option, isCorrect});
        await newOption.save();
        return res.json({success: true, message: "Option saved successfully."})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
    
}

export const getPrivateQuizzes = async (req, res) => {
    const userId = req.userId;

    try {
        const quizzes = await QuizModel.find();

        // Filter quizzes where the userId is in allowedUsers array
        const allowedQuizzes = quizzes.filter(quiz =>
            quiz.allowedUsers.includes(userId)
        );

        if (allowedQuizzes.length === 0) {
            return res.json({ success: false, message: "User not allowed for any quiz." });
        }

        return res.json({ success: true, quizzes: allowedQuizzes });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};




export const getQuiz = async (req, res) =>{
    const userId = req.userId;

    const { quizId } = req.query;
    try {
        const quiz = await QuizModel.findById(quizId);
        if(!quiz) {
            return res.json({success:false, message: "Could not find quiz."})
        }
        const questions = await QuestionModel.find({ quizId });
        const questionsWithOptions = await Promise.all(
            questions.map(async(question)=>{
                const options = await OptionModel.find({questionId: question._id}, '-isCorrect');
                return{...question._doc, options}
            })
        );

        return res.json({success: true, totalQuestions: questions.length, question: questionsWithOptions});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

