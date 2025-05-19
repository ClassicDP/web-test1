import express from 'express';
import mongoose from 'mongoose';
import studentRoutes from "./routes/studentRoutes";
import testRoutes from "./routes/testRoutes";



const app = express();
app.use(express.json());

app.use('/students', studentRoutes);
app.use('/tests', testRoutes);

app.get('/', (req, res) => {
    res.send('Student Test API');
});

// Не подключаемся к базе, если идёт тестирование
if (process.env.NODE_ENV !== 'test') {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/student-test-app';
    mongoose.connect(mongoUrl)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error', err));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('Server running on port', PORT);
    });
}

export default app;