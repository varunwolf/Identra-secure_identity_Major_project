import { Router } from 'express'
import { body } from 'express-validator'
import { authenticateToken } from '../middleware/auth.js'
import {
  generateSecret,
  verifySetup,
  verifyCode,
  disable2FA,
  regenerateBackupCodes
} from '../controllers/twoFactorController.js'

const router = Router()

// Generate 2FA secret
router.post('/generate', authenticateToken, generateSecret)

// Verify 2FA setup
router.post('/verify', authenticateToken, [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
], verifySetup)

// Verify 2FA code
router.post('/verify-code', authenticateToken, [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
], verifyCode)

// Disable 2FA
router.post('/disable', authenticateToken, [
  body('password').notEmpty().withMessage('Password is required')
], disable2FA)

// Regenerate backup codes
router.post('/regenerate-backup-codes', authenticateToken, [
  body('password').notEmpty().withMessage('Password is required')
], regenerateBackupCodes)

export default router
