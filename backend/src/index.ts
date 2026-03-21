import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

(() => {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), '../../.env'),
  ];

  const envPath = candidates.find((p) => fs.existsSync(p));
  dotenv.config(envPath ? { path: envPath } : undefined);
})();

import express from 'express';
import cors from 'cors';
import routes from './routes';
import { query } from './utils/db';

const app = express();
const PORT = process.env.PORT || 3001;

// Increase timeout for long-running AI tasks
app.use((req, res, next) => {
  res.setTimeout(300000, () => {
    console.log('Request has timed out.');
    res.sendStatus(408);
  });
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
  try {
    await query('select 1');
    res.json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(503).json({ status: 'degraded', db: 'down', error: e?.message || 'db error' });
  }
});

app.use('/api', routes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
