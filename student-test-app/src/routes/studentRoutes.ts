import express, {RequestHandler} from 'express';
import {getStudents, createStudent, updateStudent, submitTestResult} from '../controllers/studentController';
const router = express.Router();

router.get('/', getStudents);
router.post('/', createStudent);
router.put('/:id', updateStudent as RequestHandler);
router.post('/:studentId/tests/:testId/result', submitTestResult as RequestHandler);

export default router;
