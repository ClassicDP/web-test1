import express, { RequestHandler } from 'express';
import * as testController from '../controllers/testController';

const router = express.Router();

router.get('/', testController.getTests);
router.get('/:id', testController.getTest);
router.post('/', testController.createTest);

const updateTestHandler = testController.updateTest as unknown as RequestHandler;
const deleteTestHandler = testController.deleteTest as unknown as RequestHandler;
router.put('/:id', updateTestHandler);
router.delete('/:id', deleteTestHandler);

export default router;