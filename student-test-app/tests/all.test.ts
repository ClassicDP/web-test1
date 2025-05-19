// tests/all.test.ts

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index';
import Student from '../src/models/Student';
import Test from '../src/models/Test';

beforeAll(async () => {
    const url = 'mongodb://localhost:27017/student-test-app-test';
    await mongoose.connect(url, { });
});

beforeEach(async () => {
    await Student.deleteMany({});
    await Test.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Student Test App', () => {
    it('Basic math works', () => {
        expect(2 + 2).toBe(4);
    });

    it('should create and get students via API', async () => {
        const studentData = { name: 'Ivan', email: 'ivan@example.com', registrations: [] };
        const resCreate = await request(app)
            .post('/students')
            .send(studentData)
            .expect(201);
        console.dir({ 'Created student': resCreate.body }, { depth: null, colors: true });

        expect(resCreate.body).toMatchObject({ name: 'Ivan', email: 'ivan@example.com' });

        const resGet = await request(app)
            .get('/students')
            .expect(200);
        console.dir({ 'Fetched students': resGet.body }, { depth: null, colors: true });

        expect(Array.isArray(resGet.body)).toBe(true);
        expect(resGet.body.length).toBe(1);
        expect(resGet.body[0].name).toBe('Ivan');
    });

    it('should create and get tests with questions and options via API', async () => {
        // Готовим id вручную
        const q1o1 = new mongoose.Types.ObjectId();
        const q1o2 = new mongoose.Types.ObjectId();
        const q1o3 = new mongoose.Types.ObjectId();
        const q2o1 = new mongoose.Types.ObjectId();
        const q2o2 = new mongoose.Types.ObjectId();
        const q2o3 = new mongoose.Types.ObjectId();

        const testData = {
            title: 'Math Test',
            description: 'Basic math test',
            questions: [
                {
                    text: '2 + 2 = ?',
                    options: [
                        { _id: q1o1, text: '3' },
                        { _id: q1o2, text: '4' },
                        { _id: q1o3, text: '5' }
                    ],
                    correctOptionId: q1o2
                },
                {
                    text: '5 - 3 = ?',
                    options: [
                        { _id: q2o1, text: '1' },
                        { _id: q2o2, text: '2' },
                        { _id: q2o3, text: '3' }
                    ],
                    correctOptionId: q2o2
                }
            ]
        };

        const resCreate = await request(app)
            .post('/tests')
            .send(testData)
            .expect(201);
        console.dir({ 'Created test': resCreate.body }, { depth: null, colors: true });

        expect(resCreate.body).toMatchObject({ title: 'Math Test', description: 'Basic math test' });
        expect(Array.isArray(resCreate.body.questions)).toBe(true);
        expect(resCreate.body.questions.length).toBe(2);
        expect(resCreate.body.questions[0].options.length).toBe(3);
        expect(resCreate.body.questions[0]).toHaveProperty('correctOptionId');
        expect(resCreate.body.questions[1]).toHaveProperty('correctOptionId');

        const testId = resCreate.body._id;
        const firstQuestion = resCreate.body.questions[0];
        const secondQuestion = resCreate.body.questions[1];

        // Создаем студента
        const studentRes = await request(app)
            .post('/students')
            .send({ name: 'Anna', email: 'anna@example.com', registrations: [] })
            .expect(201);
        console.dir({ 'Created student': studentRes.body }, { depth: null, colors: true });

        const studentId = studentRes.body._id;

        // Регистрируем студента на тест
        const registration = {
            testId,
            uniqueUrl: `unique-url-for-anna`,
            status: 'not_started',
            result: null,
        };

        // Добавляем регистрацию студенту
        const resRegister = await request(app)
            .put(`/students/${studentId}`)
            .send({
                registrations: [registration]
            })
            .expect(200);
        console.dir({ 'Updated student registrations': resRegister.body }, { depth: null, colors: true });

        // Отправляем ответы студента (один правильный, один неправильный)
        const answersPayload = {
            answers: [
                { questionId: firstQuestion._id, optionId: q1o2 }, // правильный
                { questionId: secondQuestion._id, optionId: q2o1 } // неправильный
            ]
        };

        // Сохраняем результат
        const resultRes = await request(app)
            .post(`/students/${studentId}/tests/${testId}/result`)
            .send(answersPayload)
            .expect(200);
        console.dir({ 'Result saved': resultRes.body }, { depth: null, colors: true });

        expect(resultRes.body.score).toBe(1);
        expect(resultRes.body.answers.length).toBe(2);
        expect(resultRes.body.answers[0].correctOptionId).toBe(q1o2.toString());
        expect(resultRes.body.answers[1].correctOptionId).toBe(q2o2.toString());
    });
});