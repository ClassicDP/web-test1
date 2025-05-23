import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import studentRoutes from "./routes/studentRoutes";
import testRoutes from "./routes/testRoutes";


import dotenv from 'dotenv'
import {initProgrammingTest} from "./initialTests";
dotenv.config()

const app = express();
app.use(express.json());

app.use(cors({
    origin: '*', // или http://localhost:8080 если ты не на проде
    credentials: true, // можно убрать, если не используешь куки
}));
app.use('/students', studentRoutes);
app.use('/tests', testRoutes);

app.get('/', (req, res) => {
    res.send('Student Test API');
});

// Не подключаемся к базе, если идёт тестирование
if (process.env.NODE_ENV !== 'test') {
    // Use env MONGO_URL if set and correct, otherwise fallback to local MongoDB
    const mongoUrl = process.env.MONGO_URL
      ? (process.env.MONGO_URL.startsWith('mongodb://') || process.env.MONGO_URL.startsWith('mongodb+srv://')
          ? process.env.MONGO_URL
          : `mongodb://localhost:27017/student-test-app`)
      : 'mongodb://localhost:27017/student-test-app';
    mongoose.connect(mongoUrl)
        .then(async () => {
            console.log('MongoDB connected');
            // Initialize programming test in the database if needed
            await initProgrammingTest();
        })
        .catch(err => console.error('MongoDB connection error', err));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('Server running on port', PORT);
    });
}

export default app;