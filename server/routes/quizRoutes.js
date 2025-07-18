import express from "express";
import { getQuiz, postOption, postQuestion, postQuiz } from "../controllers/quizController.js";
import { attempt } from "../controllers/attemptController.js";

const quizRouter = express.Router();

quizRouter.post('/post-quiz', postQuiz);
quizRouter.post('/post-question', postQuestion);
quizRouter.post('/post-option', postOption);
quizRouter.post('/attempt', attempt);

quizRouter.get('/get-quiz', getQuiz);

export default quizRouter;