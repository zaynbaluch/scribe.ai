import express from 'express';
import cors from 'cors';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      messageFormat: '{msg}',
    },
  },
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'api' });
});

app.listen(PORT, () => {
  logger.info(`🚀 API server ready at http://localhost:${PORT}`);
});
