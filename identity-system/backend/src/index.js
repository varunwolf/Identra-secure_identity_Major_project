import dotenv from 'dotenv';
dotenv.config();

import { app, server } from './app.js';
import { connectToDatabase } from './config/db.js';
import { ensureRsaKeysExist } from './utils/rsa.js';
import { scheduleExpiryAlerts } from './utils/cron.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectToDatabase();
    await ensureRsaKeysExist();
    scheduleExpiryAlerts();

    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on port ${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      // eslint-disable-next-line no-console
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

