// tests/all.test.ts

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index';
import { StudentModel, TestModel } from "../src/models/all";
import {programmingTestData} from "../src/initialTests";



beforeAll(async () => {
    const url = process.env.MONGO_URL + '/student-test-app-test' || 'mongodb://localhost:27017/student-test-app-test';
    await mongoose.connect(url, { });
});

beforeEach(async () => {
    await StudentModel.deleteMany({});
    await TestModel.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

it('should insert the Programming JS/TS test into the database', async () => {
    const res = await request(app)
        .post('/tests')
        .send(programmingTestData)
        .expect(201);
    console.log('[INIT] Programming test created:', res.body._id);
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
        // === ЭТАП 1. Формируем вопрос/тест заранее, чтобы id опций были известны клиенту ===
        // (Это важно для фронтенда: опции и вопросы с id будут в структуре теста, чтобы потом отправлять ответы)
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
        // --- Этап 1: Создаём тест (POST /tests) ---
        // Преподаватель отправляет структуру теста, сервер возвращает тест с id вопросов/опций.
        // Пример структуры, которую видит преподаватель (админ), и которую фронтенд может использовать для отображения/редактирования:
        //   {
        //     _id: string,
        //     title: string,
        //     description: string,
        //     questions: [{ _id, text, options: [{ _id, text }], correctOptionId }]
        //   }
        const resTest = await request(app)
            .post('/tests')
            .send(testData)
            .expect(201);
        console.log('\n=== [1] Создан тест. Его структуру видит преподаватель (админ) ===');
        console.dir(resTest.body, { depth: null, colors: true });

        const testId = resTest.body._id;

        // === ЭТАП 2. Создаём студента (POST /students) ===
        // Фронтенд отправляет данные студента, получает объект студента с _id.
        // Пример ответа:
        //   { _id: string, name: string, email: string, registrations: [] }
        const studentRes = await request(app)
            .post('/students')
            .send({ name: 'Bob', email: 'bob@example.com', registrations: [] })
            .expect(201);
        console.log('\n=== [2] Студент создан (id используется для регистрации на тест) ===');
        console.dir(studentRes.body, { depth: null, colors: true });

        const studentId = studentRes.body._id;

        // === ЭТАП 3. Регистрируем студента на тест (POST /students/register) ===
        // Фронтенд отправляет { studentId, testId }, получает уникальную ссылку для прохождения теста.
        // Пример ответа:
        //   {
        //     registration: { testId, uniqueUrl, status },
        //     testUrl: '/attempt/<uniqueUrl>'
        //   }
        const regRes = await request(app)
            .post('/students/register')
            .send({ studentId, testId })
            .expect(201);
        console.log('\n=== [3] Студент зарегистрирован на тест ===');
        console.log('[INFO] Теперь студенту выдаётся уникальная ссылка для прохождения:');
        console.log('GET', `/students/attempt/${regRes.body.registration.uniqueUrl}`);
        console.dir(regRes.body, { depth: null, colors: true });

        const { uniqueUrl } = regRes.body.registration;
        expect(typeof uniqueUrl).toBe('string');
        expect(regRes.body.testUrl.endsWith(uniqueUrl)).toBe(true);

        // === ЭТАП 4. Фронтенд загружает тест для прохождения по уникальному url (GET /students/attempt/:uniqueUrl) ===
        // Фронтенд делает GET-запрос по уникальному url.
        // Пример структуры ответа:
        //   {
        //     student: { _id, name },
        //     test: { _id, title, description, questions: [ { _id, text, options: [{ _id, text }] } ] },
        //     registration: { status }
        //   }
        const getAttemptRes = await request(app)
            .get(`/students/attempt/${uniqueUrl}`)
            .expect(200);
        console.log('\n=== [4] Студент получает структуру теста по токену ===');
        console.log('[INFO] Формат ответа для веб-клиента:');
        console.dir(getAttemptRes.body, { depth: null, colors: true });

        expect(getAttemptRes.body.test).toHaveProperty('title', 'Math Test');
        expect(getAttemptRes.body.student).toHaveProperty('name', 'Bob');
        expect(getAttemptRes.body.test.questions.length).toBe(2);

        // === ЭТАП 5. Формируем и отправляем ответы (POST /students/attempt/:uniqueUrl/result) ===
        // Фронтенд отправляет payload вида:
        //   { answers: [ { questionId, optionId }, ... ] }
        // Пример payload для фронта:
        const answersPayload = {
            answers: [
                { questionId: resTest.body.questions[0]._id, optionId: q1o2 }, // правильный
                { questionId: resTest.body.questions[1]._id, optionId: q2o1 } // неправильный
            ]
        };
        console.log('\n=== [5] Студент отправляет свои ответы на сервер ===');
        console.log('[INFO] Пример payload для фронта:');
        console.dir(answersPayload, { depth: null, colors: true });

        // === ЭТАП 6. Сервер сохраняет и возвращает результат проверки ===
        // После отправки ответов, сервер возвращает структуру результата:
        //   {
        //     score: number,
        //     answers: [
        //       { questionId, optionId, isCorrect, correctOptionId }
        //     ]
        //   }
        const resultRes = await request(app)
            .post(`/students/attempt/${uniqueUrl}/result`)
            .send(answersPayload)
            .expect(200);
        console.log('\n=== [6] Сервер возвращает подробный результат (score, ответы с корректностью) ===');
        console.log('[INFO] Формат для вывода пользователю:');
        console.dir(resultRes.body, { depth: null, colors: true });

        expect(resultRes.body.score).toBe(1);
        expect(resultRes.body.answers.length).toBe(2);
        expect(resultRes.body.answers[0].correctOptionId).toBe(q1o2.toString());
        expect(resultRes.body.answers[1].correctOptionId).toBe(q2o2.toString());
    });


    it('should update a test by id (PUT /tests/:id)', async () => {
        // Генерируем id для опций
        const o1 = new mongoose.Types.ObjectId();
        const o2 = new mongoose.Types.ObjectId();
        const o3 = new mongoose.Types.ObjectId();

        // Step 1. Create a test
        const testToCreate = {
            title: 'Initial Title',
            description: 'Initial Description',
            questions: [
                {
                    text: 'Original question',
                    options: [
                        { _id: o1, text: 'Option 1' },
                        { _id: o2, text: 'Option 2' },
                        { _id: o3, text: 'Option 3' }
                    ],
                    correctOptionId: o2 // Ставим правильный id
                }
            ]
        };

        const createRes = await request(app)
            .post('/tests')
            .send(testToCreate)
            .expect(201);

        console.log('[PUT] Created test for update:', createRes.body);

        const createdTestId = createRes.body._id;

        // Step 2. Prepare update payload (тоже с id для опций)
        const uo1 = new mongoose.Types.ObjectId();
        const uo2 = new mongoose.Types.ObjectId();
        const uo3 = new mongoose.Types.ObjectId();

        const updatedPayload = {
            title: 'Updated Title',
            description: 'Updated Description',
            questions: [
                {
                    text: 'Updated question',
                    options: [
                        { _id: uo1, text: 'Option 1 (edited)' },
                        { _id: uo2, text: 'Option 2 (edited)' },
                        { _id: uo3, text: 'Option 3 (edited)' }
                    ],
                    correctOptionId: uo2
                }
            ]
        };

        // Step 3. Update test via PUT or PATCH
        const updateRes = await request(app)
            .put(`/tests/${createdTestId}`)
            .send(updatedPayload)
            .expect(200);

        console.log('[PUT] Updated test response:', updateRes.body);

        // Step 4. Check fields
        expect(updateRes.body).toHaveProperty('title', 'Updated Title');
        expect(updateRes.body).toHaveProperty('description', 'Updated Description');
        expect(updateRes.body.questions[0]).toHaveProperty('text', 'Updated question');
        expect(updateRes.body.questions[0].options[0].text).toBe('Option 1 (edited)');
    });
});

