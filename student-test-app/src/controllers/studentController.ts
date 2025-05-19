import { Request, Response, NextFunction } from 'express';
import {IRegistration, StudentModel, TestModel} from "../models/all";
import { v4 as uuidv4 } from 'uuid';

function evaluateTestAnswers(test: any, answers: { questionId: string, optionId: string }[]) {
  let score = 0;
  const checkedAnswers = answers.map((ans: { questionId: string, optionId: string }) => {
    const q = test.questions.find((q: any) => q._id.toString() === ans.questionId);
    const isCorrect = q && q.correctOptionId && q.correctOptionId.toString() === ans.optionId;
    if (isCorrect) score++;
    return { ...ans, isCorrect, correctOptionId: q?.correctOptionId?.toString() || null };
  });
  return { score, checkedAnswers };
}

export async function getStudents(req: Request, res: Response) {
  const students = await StudentModel.find();
  res.json(students);
}

export async function createStudent(req: Request, res: Response) {
  const student = new StudentModel(req.body);
  await student.save();
  res.status(201).json(student);
}

export async function updateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const student = await StudentModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
}
export async function submitTestResult(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId, testId } = req.params;
    const { answers } = req.body; // [{ questionId, optionId }, ...]

    // Найти тест
    const test = await TestModel.findById(testId).lean();
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Оценить ответы
    const { score, checkedAnswers } = evaluateTestAnswers(test, answers);

    // Сохранить результат студенту (обновить нужную регистрацию)
    const student = await StudentModel.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const registration = student.registrations.find((r: any) => r.testId.toString() === testId);
    if (registration) {
      registration.status = 'completed';
      registration.result = { score, answers: checkedAnswers };
    }

    await student.save();

    return res.json({ score, answers: checkedAnswers });
  } catch (err) {
    next(err);
  }
}

export async function submitAttemptResult(req: Request, res: Response, next: NextFunction) {
  try {
    const { uniqueUrl } = req.params;
    const { answers } = req.body; // [{ questionId, optionId }, ...]

    // Находим студента и регистрацию по uniqueUrl
    const student = await StudentModel.findOne({ 'registrations.uniqueUrl': uniqueUrl });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const registration = student.registrations.find((r: any) => r.uniqueUrl === uniqueUrl);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    // Находим тест по testId из регистрации
    const test = await TestModel.findById(registration.testId).lean();
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Оцениваем ответы
    const { score, checkedAnswers } = evaluateTestAnswers(test, answers);

    registration.status = 'completed';
    registration.result = { score, answers: checkedAnswers };

    await student.save();

    return res.json({ score, answers: checkedAnswers });
  } catch (err) {
    next(err);
  }
}

export async function registerStudentToTest(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId, testId } = req.body; // или из params, если удобнее

    const student = await StudentModel.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Проверить, есть ли уже регистрация на этот тест
    const alreadyRegistered = student.registrations.some((r: any) => r.testId.toString() === testId);
    if (alreadyRegistered) return res.status(400).json({ message: 'Already registered' });

    const uniqueUrl = uuidv4();
    const registration: IRegistration = {
      testId,
      uniqueUrl,
      status: 'not_started',
      result: undefined,
    };
    student.registrations.push(registration);

    await student.save();

    // Отправляем ссылку вида /attempt/{uniqueUrl}
    res.status(201).json({
      registration,
      testUrl: `/attempt/${uniqueUrl}`,
      // или полный URL: `${req.protocol}://${req.get('host')}/attempt/${uniqueUrl}`
    });
  } catch (err) {
    next(err);
  }
}

export async function getAttemptTest(req: Request, res: Response, next: NextFunction) {
  try {
    const { uniqueUrl } = req.params;
    const student = await StudentModel.findOne({ 'registrations.uniqueUrl': uniqueUrl });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const registration = student.registrations.find(r => r.uniqueUrl === uniqueUrl);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    const test = await TestModel.findById(registration.testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // (Безопасно — можно не возвращать correctOptionId)
    const questions = test.questions.map(q => ({
      _id: q._id,
      text: q.text,
      options: q.options.map(o => ({ _id: o._id, text: o.text }))
    }));

    res.json({
      student: { _id: student._id, name: student.name },
      test: {
        _id: test._id,
        title: test.title,
        description: test.description,
        questions,
      },
      registration: {
        status: registration.status,
        startedAt: registration.startedAt,
        completedAt: registration.completedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}