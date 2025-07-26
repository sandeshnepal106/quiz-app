import 'dotenv/config';
import express from 'express';
import userRouter from './routes/userRoutes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import quizRouter from './routes/quizRoutes.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ['http://localhost:3000', 'http://192.168.29.32:3000'];

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.get('/', (req, res)=> res.send("API working...."));
app.use('/api/user', userRouter);
app.use('/api/quiz', quizRouter);
app.listen(port, '0.0.0.0', () => console.log(`Server started at ${port}`));