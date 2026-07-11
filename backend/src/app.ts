import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Car dealership inventory API' });
});
