import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, getMe, updateAvatar, deleteAvatar, resetPassword, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password min length 8'),
    body('phone').optional().isLength({ min: 10, max: 15 }).withMessage('Phone number must be 10-15 characters'),
    body('dateOfBirth').optional().isDate().withMessage('Valid date required'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', authenticateToken, getMe);

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}.jpg`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/avatar', authenticateToken, upload.single('avatar'), updateAvatar);
router.delete('/avatar', authenticateToken, deleteAvatar);

router.post('/reset-password', resetPassword);
router.post('/change-password', authenticateToken, changePassword);

export default router;

