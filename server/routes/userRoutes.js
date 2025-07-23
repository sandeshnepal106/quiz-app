import express from 'express';
import { checkAuth, getMyQuizzes, login, logout, myDetails, register, resetPassword, sendResetOtp } from '../controllers/userController.js';
import authCheck from '../middlewares/authCheck.js';
import { follow, unfollow } from '../controllers/followcontroller.js';
import { getUserFeed } from '../controllers/feedController.js';
import { attempts, getAttemptDetails } from '../controllers/attemptController.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/logout', logout);
userRouter.post('/send-reset-otp', sendResetOtp);
userRouter.post('/reset-password', resetPassword);

userRouter.post('/follow', authCheck, follow);
userRouter.post('/unfollow', authCheck, unfollow);

userRouter.all('/check-auth',authCheck, checkAuth);
userRouter.get('/get-user-feed', authCheck, getUserFeed);
userRouter.get('/attempts', authCheck, attempts);

userRouter.get('/get-my-quizzes', authCheck, getMyQuizzes);
userRouter.get('/my-details', authCheck, myDetails);
userRouter.get('/get-attempt-details/:attemptId', authCheck, getAttemptDetails);

export default userRouter;