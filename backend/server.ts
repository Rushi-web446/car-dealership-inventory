import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Car dealership inventory API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
