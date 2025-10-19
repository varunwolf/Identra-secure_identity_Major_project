import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function setupSocketHandlers(io) {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id;
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.email} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle document upload notifications
    socket.on('document_uploaded', (data) => {
      socket.emit('notification', {
        type: 'success',
        message: 'Document uploaded successfully',
        data
      });
    });

    // Handle document expiry warnings
    socket.on('subscribe_expiry_alerts', () => {
      socket.join('expiry_alerts');
    });

    // Handle admin notifications
    if (socket.user.role === 'admin') {
      socket.join('admin_notifications');
    }

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.email} disconnected`);
    });
  });

}

// Function to send notifications to specific users
export function sendNotificationToUser(userId, notification) {
  io.to(`user_${userId}`).emit('notification', notification);
}

// Function to send notifications to all admins
export function sendNotificationToAdmins(notification) {
  io.to('admin_notifications').emit('admin_notification', notification);
}

// Function to send expiry alerts
export function sendExpiryAlert(userId, documentData) {
  io.to(`user_${userId}`).emit('expiry_alert', {
    type: 'warning',
    message: 'Document expiring soon',
    document: documentData
  });
}
