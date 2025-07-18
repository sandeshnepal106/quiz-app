import AttemptModel from "../models/attemptModel.js";
import { OptionModel, QuestionModel } from "../models/quizModel.js";

export const attempt = async (req, res) => {
    const {userId, quizId, responses} = req.body;

    if (!userId || !quizId || !responses) {
        return res.json({ success: false, message: "Missing required fields." });
    }
    
    try {
        const totalQuestions = await QuestionModel.countDocuments({ quizId });
        let totalCorrectAnswers =0;
        let score=0;
        let totalQuestionsAttempted = responses.length;

        for(const response of responses){
            const correctOption = await OptionModel.findOne({
                questionId: response.questionId,
                isCorrect: true
            })

            if(correctOption._id.toString() === response.selectedOptionId){
                totalCorrectAnswers++;
            }

        }
        score = (totalCorrectAnswers/totalQuestions)*100;

        const attempt = new AttemptModel({userId, quizId, responses, totalQuestions, totalQuestionsAttempted, totalCorrectAnswers, score})
        await attempt.save();

        return res.json({ success: true, message: "Attempt submitted successfully." });

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}