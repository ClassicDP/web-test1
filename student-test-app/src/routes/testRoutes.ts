import express, { RequestHandler } from 'express';
import * as testController from '../controllers/testController';

const router = express.Router();

router.get('/', testController.getTests);
router.post('/', testController.createTest);

const updateTestHandler = testController.updateTest as unknown as RequestHandler;
router.put('/:id', updateTestHandler);

export default router;