import nodemailer from 'nodemailer';

export function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.example.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = port === 465;
  const user = process.env.SMTP_USER || 'user@example.com';
  const pass = process.env.SMTP_PASS || 'password';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendExpiryAlert({ to, filename, expiryDate }) {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    to,
    subject: `Document expiring soon: ${filename}`,
    text: `Your document ${filename} is expiring on ${new Date(expiryDate).toDateString()}.`,
  });
  return info;
}

