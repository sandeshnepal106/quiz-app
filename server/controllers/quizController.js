import {QuizModel, QuestionModel, OptionModel} from "../models/quizModel.js";
import { UserModel } from "../models/userModel.js";

export const postQuiz = async (req, res) =>{
    const {title, description, tags, isPrivate, allowedUsers} = req.body;
    const createdBy = req.userId;
    if(!title){
        return res.json({success: false, message:"Please enter the quiz title."})
    }
    if(!createdBy){
        return res.json({success: false, message:"Missing quiz author."});
    }
    try {
        const quiz = new QuizModel({title, description, tags, createdBy, isPrivate, allowedUsers});
        await quiz.save();
        return res.json({success: true, data: quiz, message: "Quiz created successfully."});
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const putQuiz = async (req, res) =>{
    const {title, description, tags, isPrivate, allowedUsers, quizId} = req.body;
    if(!title){
        return res.json({success: false, message:"Please enter the quiz title."})
    }
    try {
        const editedQuiz = await QuizModel.findOneAndUpdate({ _id: quizId },{title, description, tags, isPrivate, allowedUsers}, {new: true});
        if(!editedQuiz){
            return res.json({success: false, message: "Quiz not edited."})
        }
        return res.json({success: true, message: "Quiz updated successfully."})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const deleteQuiz = async (req, res) =>{
    const {quizId} = req.body;
    if(!quizId){
        return res.json({success: false, message: "Quiz id not given."})
    }
    try{
        const deletedQuiz = await QuizModel.findOneAndDelete({ _id: quizId });
        if(!deletedQuiz){
            return res.json({success: false, message: "Quiz not deleted."});
        }
        return res.json({success: true, message: "Quiz deleted successfully."})
    }
    catch(error){
        return res.json({success: false, message: error.message});
    }
}

export const postQuestion = async (req, res) => {
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
        
        // Return the created question with its ID - THIS IS THE KEY FIX
        return res.json({
            success: true, 
            question: newQuestion, // Frontend needs this to get the real question ID
            message: "Question saved successfully."
        })
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const putQuestion = async (req, res) =>{
    const {questionId, question} = req.body;
    if(!questionId || !question){
        return res.json({success: false, message: "Missing details."})
    }
    try {
        const editedQuestion = await QuestionModel.findOneAndUpdate({ _id: questionId }, { question }, { new: true });
        if(!editedQuestion){
            return res.json({success: false, message: "Could not edit question"})
        }
        return res.json({success: true, message: "Edited question successfully"})
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const deleteQuestion = async (req, res) =>{
    const {questionId} = req.body;
    if(!questionId){
        return res.json({success: false, message: "Question Id not found."})
    }
    try {
        const deletedQuestion = await QuestionModel.findOneAndDelete({ _id: questionId });
;
        if (!deletedQuestion){
            return res.json({success: false, message: "Question could not be deleted."})
        }
        return res.json({success: true, message: "Question deleted successfully."});


    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}


export const postOption = async (req, res) => {
    const {questionId, option, isCorrect} = req.body;
    if(!questionId || !option) {
        return res.json({success: false, message: "Missing details."});
    }
    try {
        const valid = await QuestionModel.findById(questionId);
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

export const putOption = async(req, res) =>{
    const {optionId, option} = req.body;
    if(!optionId) {
        return res.json({success: false, message: "Option id not found."})
    }
    try {
        const editedOption = await findOneAndUpdate({optionId}, {option});
        if(!editedOption){
            return res.json({success: false, message: "Option could not be edited."});
        }
        return res.json({success: true, message: "Option added successfully."})
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }

}
export const deleteOption = async (req, res) => {
  const { optionId } = req.body;
  if (!optionId) {
    return res.json({ success: false, message: "Option ID not provided." });
  }
  try {
    const deletedOption = await OptionModel.findOneAndDelete({ _id: optionId });
    if (!deletedOption) {
      return res.json({ success: false, message: "Option not found or already deleted." });
    }
    return res.json({ success: true, message: "Option deleted successfully." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const getPrivateQuizzes = async (req, res) => {
    const userId = req.userId;

    try {
        const quizzes = await QuizModel.find();
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
        const user = await UserModel.findById(quiz.createdBy);
        if(!user) {
            return res.json({success: false, message: "User not found."})
        }
        const author = user.username;
        const authorId = quiz.createdBy;
        const title = quiz.title;
        const description = quiz.description;

        const questions = await QuestionModel.find({ quizId });
        const questionsWithOptions = await Promise.all(
            questions.map(async(question)=>{
                const options = await OptionModel.find({questionId: question._id}, '-isCorrect');
                return{...question._doc, options}
            })
        );

        return res.json({success: true, title, description, author, authorId, totalQuestions: questions.length, question: questionsWithOptions});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

