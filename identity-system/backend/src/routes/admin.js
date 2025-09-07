import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { listUsers, listAllDocuments, elevateUser } from '../controllers/adminController.js';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/users', listUsers);
router.get('/documents', listAllDocuments);
router.post('/elevate', [body('userId').isMongoId()], elevateUser);

export default router;

