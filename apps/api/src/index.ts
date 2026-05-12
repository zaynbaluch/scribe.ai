import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './lib/logger';
import { errorHandler } from './middleware/error-handler.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import resumeRoutes from './routes/resume.routes';
import exportRoutes from './routes/export.routes';
import jobRoutes from './routes/job.routes';
import tailorRoutes from './routes/tailor.routes';
import coverLetterRoutes from './routes/cover-letter.routes';
import applicationRoutes from './routes/application.routes';
import portfolioRoutes from './routes/portfolio.routes';
import { getTemplates } from './controllers/export.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Routes ─────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/resumes', exportRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/tailor', tailorRoutes);
app.use('/api/cover-letters', coverLetterRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/p', portfolioRoutes); // Public portfolio routes
app.get('/api/templates', getTemplates);

// ─── Error Handler (must be last) ───────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`API server ready at http://localhost:${PORT}`);
});
