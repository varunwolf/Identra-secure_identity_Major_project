import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

function signToken(user) {
  const payload = { id: user._id.toString(), role: user.role };
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

export async function register(req, res, next) {
  try {
    console.log('Registration request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, dateOfBirth } = req.body;
    console.log('Extracted data:', { name, email, password: password ? '***' : 'undefined', phone, dateOfBirth });
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userData = { 
      name, 
      email, 
      passwordHash,
      ...(phone && { phone }),
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) })
    };
    
    const user = await User.create(userData);
    await Activity.create({ user: user._id, type: 'auth', message: 'User registered' });

    const token = signToken(user);
    console.log('Registration successful for:', email);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Registration error:', err);
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    console.log('Login request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Login validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log('Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    await Activity.create({ user: user._id, type: 'auth', message: 'User logged in' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });
    
    res.json({ 
      message: 'Avatar updated successfully',
      avatarUrl: avatarUrl 
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAvatar(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { avatar: null });
    
    res.json({ message: 'Avatar removed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.passwordHash = hashedPassword;
    await user.save();

    await Activity.create({ 
      user: user._id, 
      type: 'auth', 
      message: 'Password reset successfully' 
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    
    user.passwordHash = hashedNewPassword;
    await user.save();

    await Activity.create({ 
      user: user._id, 
      type: 'auth', 
      message: 'Password changed successfully' 
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}

