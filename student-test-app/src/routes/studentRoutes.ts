import express, {RequestHandler} from 'express';
import {
    getStudents,
    createStudent,
    updateStudent,
    submitTestResult,
    submitAttemptResult,
    registerStudentToTest, getAttemptTest,
    deleteStudent, getAttemptResult
} from '../controllers/studentController';
const router = express.Router();

router.get('/', getStudents);
router.get('/attempt/:uniqueUrl',   getAttemptTest as RequestHandler);
router.post('/', createStudent);
router.put('/:id', updateStudent as RequestHandler);
router.post('/:studentId/tests/:testId/result', submitTestResult as RequestHandler);
router.post('/attempt/:uniqueUrl/result', submitAttemptResult as RequestHandler);
router.post('/register', registerStudentToTest as RequestHandler);
router.delete('/:id', deleteStudent as RequestHandler);
router.get('/attempt/:uniqueUrl/result', getAttemptResult as RequestHandler);
export default router;

