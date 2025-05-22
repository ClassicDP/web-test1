
import { Request, Response, NextFunction } from 'express';
import {TestModel} from "../models/all";

export async function getTests(req: Request, res: Response) {
  const tests = await TestModel.find();
  res.json(tests);
}

export async function getTest(req: Request, res: Response) {
  const id = req.params.id;
  const test = await TestModel.findByIdAndUpdate(id);
  res.json(test);
}

export async function createTest(req: Request, res: Response) {
  const test = new TestModel(req.body);
  await test.save();
  res.status(201).json(test);
}

export async function updateTest(req: Request, res: Response) {
  try {
    const id = req.params.id;
    console.log(await TestModel.find())
    const updateData = req.body;
    const test = await TestModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json(test);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteTest(req: Request, res: Response) {
  try {
    const id = req.params.id;
    console.log(await TestModel.find())
    const updateData = req.body;
    const test = await TestModel.findByIdAndDelete(id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json(test);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}