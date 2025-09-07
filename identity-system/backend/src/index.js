import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import { connectToDatabase } from './config/db.js';
import { ensureRsaKeysExist } from './utils/rsa.js';
import { scheduleExpiryAlerts } from './utils/cron.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectToDatabase();
    await ensureRsaKeysExist();
    scheduleExpiryAlerts();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

