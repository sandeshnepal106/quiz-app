import express from 'express';
import { checkAuth, login, logout, register, resetPassword, sendResetOtp } from '../controllers/userController.js';
import authCheck from '../middlewares/authCheck.js';
import { follow, unfollow } from '../controllers/followcontroller.js';
import { getUserFeed } from '../controllers/feedController.js';

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

export default userRouter;