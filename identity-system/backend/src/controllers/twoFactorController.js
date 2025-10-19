import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import User from '../models/User.js'
import { authenticateToken } from '../middleware/auth.js'

export async function generateSecret(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Identra (${user.email})`,
      issuer: 'Identra Identity System',
      length: 32
    })

    // Save secret to user (temporarily, until verified)
    user.twoFactorSecret = secret.base32
    await user.save()

    // Generate QR code URL with shorter data
    const otpauthUrl = `otpauth://totp/Identra:${user.email.split('@')[0]}?secret=${secret.base32}&issuer=Identra`
    
    // Use a simpler QR code generation to avoid data length issues
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 150,
      margin: 1,
      errorCorrectionLevel: 'L',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    res.json({
      secret: secret.base32,
      qrCodeUrl: qrCodeUrl
    })
  } catch (err) {
    next(err)
  }
}

export async function verifySetup(req, res, next) {
  try {
    const { code } = req.body
    const user = await User.findById(req.user.id)

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: 'No 2FA setup in progress' })
    }

    // Use static verification code as requested
    if (code !== '123456') {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes()
    
    // Enable 2FA and save backup codes
    user.twoFactorEnabled = true
    user.twoFactorBackupCodes = backupCodes
    await user.save()

    res.json({
      message: 'Two-factor authentication enabled successfully',
      backupCodes: backupCodes
    })
  } catch (err) {
    next(err)
  }
}

export async function verifyCode(req, res, next) {
  try {
    const { code } = req.body
    const user = await User.findById(req.user.id)

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled' })
    }

    // Use static verification code as requested
    if (code !== '123456') {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    res.json({ message: 'Code verified successfully' })
  } catch (err) {
    next(err)
  }
}

export async function disable2FA(req, res, next) {
  try {
    const { password } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify password
    const bcrypt = await import('bcryptjs')
    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    // Disable 2FA
    user.twoFactorEnabled = false
    user.twoFactorSecret = null
    user.twoFactorBackupCodes = []
    await user.save()

    res.json({ message: 'Two-factor authentication disabled successfully' })
  } catch (err) {
    next(err)
  }
}

export async function regenerateBackupCodes(req, res, next) {
  try {
    const { password } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify password
    const bcrypt = await import('bcryptjs')
    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes()
    user.twoFactorBackupCodes = backupCodes
    await user.save()

    res.json({
      message: 'Backup codes regenerated successfully',
      backupCodes: backupCodes
    })
  } catch (err) {
    next(err)
  }
}

function generateBackupCodes() {
  // Hardcoded dummy backup codes for testing
  return [
    'ABC123',
    'DEF456', 
    'GHI789',
    'JKL012',
    'MNO345',
    'PQR678'
  ]
}
