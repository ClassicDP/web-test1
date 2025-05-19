// tests/all.test.ts

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index';
import {StudentModel, TestModel} from "../src/models/all";


beforeAll(async () => {
    const url = 'mongodb://localhost:27017/student-test-app-test';
    await mongoose.connect(url, { });
});

beforeEach(async () => {
    await StudentModel.deleteMany({});
    await TestModel.deleteMany({});
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

    it('should register student to test and process attempt by uniqueUrl', async () => {
        // Готовим id вручную
        const q1o1 = new mongoose.Types.ObjectId();
        const q1o2 = new mongoose.Types.ObjectId();
        const q1o3 = new mongoose.Types.ObjectId();
        const q2o1 = new mongoose.Types.ObjectId();
        const q2o2 = new mongoose.Types.ObjectId();
        const q2o3 = new mongoose.Types.ObjectId();

        // Создаём тест
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
        const resTest = await request(app)
            .post('/tests')
            .send(testData)
            .expect(201);
        console.log('\n=== [1] Test created ===');
        console.dir(resTest.body, { depth: null, colors: true });

        const testId = resTest.body._id;

        // Создаём студента
        const studentRes = await request(app)
            .post('/students')
            .send({ name: 'Bob', email: 'bob@example.com', registrations: [] })
            .expect(201);
        console.log('\n=== [2] Student created ===');
        console.dir(studentRes.body, { depth: null, colors: true });

        const studentId = studentRes.body._id;

        // Регистрируем студента на тест (получаем uniqueUrl)
        const regRes = await request(app)
            .post('/students/register')
            .send({ studentId, testId })
            .expect(201);
        console.log('\n=== [3] Student registered for test ===');
        console.dir(regRes.body, { depth: null, colors: true });

        const { uniqueUrl } = regRes.body.registration;
        expect(typeof uniqueUrl).toBe('string');
        expect(regRes.body.testUrl.endsWith(uniqueUrl)).toBe(true);

        // Получаем структуру теста по токену
        const getAttemptRes = await request(app)
            .get(`/students/attempt/${uniqueUrl}`)
            .expect(200);
        console.log('\n=== [4] Fetched test by uniqueUrl (student\'s test view) ===');
        console.dir(getAttemptRes.body, { depth: null, colors: true });

        expect(getAttemptRes.body.test).toHaveProperty('title', 'Math Test');
        expect(getAttemptRes.body.student).toHaveProperty('name', 'Bob');
        expect(getAttemptRes.body.test.questions.length).toBe(2);

        // Готовим ответы (один правильный, один неправильный)
        const answersPayload = {
            answers: [
                { questionId: resTest.body.questions[0]._id, optionId: q1o2 }, // правильный
                { questionId: resTest.body.questions[1]._id, optionId: q2o1 } // неправильный
            ]
        };
        console.log('\n=== [5] Student answers ===');
        console.dir(answersPayload, { depth: null, colors: true });

        // Отправляем результат попытки
        const resultRes = await request(app)
            .post(`/students/attempt/${uniqueUrl}/result`)
            .send(answersPayload)
            .expect(200);
        console.log('\n=== [6] Result after attempt submitted ===');
        console.dir(resultRes.body, { depth: null, colors: true });

        expect(resultRes.body.score).toBe(1);
        expect(resultRes.body.answers.length).toBe(2);
        expect(resultRes.body.answers[0].correctOptionId).toBe(q1o2.toString());
        expect(resultRes.body.answers[1].correctOptionId).toBe(q2o2.toString());
    });
});