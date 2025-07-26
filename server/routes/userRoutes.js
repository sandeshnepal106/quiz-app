import express from 'express';
import { checkAuth, editProfile, getMyQuizzes, login, logout, myDetails, register, resetPassword, sendResetOtp, uploadProfilePic } from '../controllers/userController.js';
import authCheck from '../middlewares/authCheck.js';
import { follow, getFollowDetails, unfollow } from '../controllers/followcontroller.js';
import { getUserFeed } from '../controllers/feedController.js';
import { attempts, getAttemptDetails } from '../controllers/attemptController.js';
import { getProfile } from '../controllers/profileController.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/logout', logout);
userRouter.put('/edit-details', authCheck, editProfile);
userRouter.post('/send-reset-otp', sendResetOtp);
userRouter.post('/reset-password', resetPassword);

userRouter.post('/follow', authCheck, follow);
userRouter.get('/get-follow-details/:followingId', authCheck, getFollowDetails);
userRouter.delete('/unfollow', authCheck, unfollow);

userRouter.all('/check-auth',authCheck, checkAuth);
userRouter.get('/get-user-feed', authCheck, getUserFeed);
userRouter.get('/attempts', authCheck, attempts);

userRouter.get('/get-my-quizzes', authCheck, getMyQuizzes);
userRouter.get('/my-details', authCheck, myDetails);
userRouter.get('/get-attempt-details/:attemptId', authCheck, getAttemptDetails);

userRouter.get('/user-profile/:profileId', authCheck, getProfile);
userRouter.post('/profile/upload', authCheck, upload.single('image'), uploadProfilePic);

export default userRouter;