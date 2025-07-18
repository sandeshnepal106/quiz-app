import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/userRoutes.js'

import connectDB from './config/mongodb.js';
import quizRouter from './routes/quizRoutes.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();

app.use(express.json());


app.get('/', (req, res)=> res.send("API working...."));
app.use('/api/user', userRouter);
app.use('/api/quiz', quizRouter);
app.listen(port, '0.0.0.0', () => console.log(`Server started at ${port}`));