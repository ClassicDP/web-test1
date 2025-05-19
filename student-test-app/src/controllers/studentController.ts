import Student from '../models/Student';
import { Request, Response, NextFunction } from 'express';
import Test from '../models/Test'

export async function getStudents(req: Request, res: Response) {
  const students = await Student.find();
  res.json(students);
}

export async function createStudent(req: Request, res: Response) {
  const student = new Student(req.body);
  await student.save();
  res.status(201).json(student);
}

export async function updateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const student = await Student.findByIdAndUpdate(id, req.body, { new: true });
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
    const test = await Test.findById(testId).lean();
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Оценить ответы
    let score = 0;
    const checkedAnswers = answers.map((ans: { questionId: string, optionId: string }) => {
      const q = test.questions.find((q: any) => q._id.toString() === ans.questionId);
      const isCorrect = q && q.correctOptionId && q.correctOptionId.toString() === ans.optionId;
      if (isCorrect) score++;
      return { ...ans, isCorrect, correctOptionId: q?.correctOptionId?.toString() || null };
    });

    // Сохранить результат студенту (обновить нужную регистрацию)
    const student = await Student.findById(studentId);
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
