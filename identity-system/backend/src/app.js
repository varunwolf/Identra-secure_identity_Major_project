import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import digitalIdRoutes from './routes/digitalId.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static serves for uploaded files (secured via routes for download)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/digital-id', digitalIdRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

export default app;

