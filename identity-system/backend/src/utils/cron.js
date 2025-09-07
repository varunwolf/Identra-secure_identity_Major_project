import cron from 'node-cron';
import dayjs from 'dayjs';
import Document from '../models/Document.js';
import User from '../models/User.js';
import { sendExpiryAlert } from './email.js';

export function scheduleExpiryAlerts() {
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    const soon = dayjs().add(3, 'day').toDate();
    const now = new Date();
    const docs = await Document.find({ expiryDate: { $gte: now, $lte: soon } }).populate('owner').lean();
    for (const doc of docs) {
      try {
        await sendExpiryAlert({ to: doc.owner.email, filename: doc.originalFilename, expiryDate: doc.expiryDate });
        // eslint-disable-next-line no-console
        console.log('Sent expiry alert for', doc.originalFilename);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to send expiry alert', e);
      }
    }
  });
}

