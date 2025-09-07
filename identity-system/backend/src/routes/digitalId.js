import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getOrCreateDigitalId } from '../controllers/digitalIdController.js';

const router = Router();
router.use(authenticate);

router.get('/', getOrCreateDigitalId);

export default router;

