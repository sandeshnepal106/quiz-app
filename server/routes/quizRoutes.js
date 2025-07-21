import express from "express";
import { getPrivateQuizzes, getQuiz, postOption, postQuestion, postQuiz } from "../controllers/quizController.js";
import { attempt } from "../controllers/attemptController.js";
import { checkAuth } from "../controllers/userController.js";
import authCheck from "../middlewares/authCheck.js";
import { getUserFeed } from "../controllers/feedController.js";
import { deleteComment, deleteLike, postComment, postLike } from "../controllers/engagementController.js";

const quizRouter = express.Router();

quizRouter.post('/post-quiz', authCheck, postQuiz);
quizRouter.post('/post-question', authCheck, postQuestion);
quizRouter.post('/post-option', authCheck, postOption);
quizRouter.post('/attempt', authCheck, attempt);

quizRouter.get('/get-quiz', authCheck, getQuiz);
quizRouter.get('/get-private-quizzes', authCheck, getPrivateQuizzes);
quizRouter.get('/get-user-feed', authCheck, getUserFeed);

quizRouter.post('/like', authCheck, postLike);
quizRouter.post('/unlike', authCheck, deleteLike);
quizRouter.post('/comment', authCheck, postComment);
quizRouter.post('/delete-comment', authCheck, deleteComment);

export default quizRouter;