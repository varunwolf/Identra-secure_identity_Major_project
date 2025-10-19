import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'
import {
  beginRegistration,
  completeRegistration,
  beginAuthentication,
  completeAuthentication,
  getCredentials,
  deleteCredential
} from '../controllers/biometricController.js'

const router = Router()

// Registration endpoints
router.post('/register/begin', authenticateToken, beginRegistration)
router.post('/register/complete', authenticateToken, completeRegistration)

// Authentication endpoints
router.post('/authenticate/begin', authenticateToken, beginAuthentication)
router.post('/authenticate/complete', authenticateToken, completeAuthentication)

// Credential management
router.get('/credentials', authenticateToken, getCredentials)
router.delete('/credentials/:credentialId', authenticateToken, deleteCredential)

export default router
