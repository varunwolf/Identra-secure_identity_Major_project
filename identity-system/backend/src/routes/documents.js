import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../utils/multer.js';
import { uploadDocument, listDocuments, downloadDocument, deleteDocument } from '../controllers/documentController.js';

const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), [
  body('expiryDate').optional().isISO8601().toDate(),
], validate, uploadDocument);

router.get('/', listDocuments);

router.get('/:id/download', [param('id').isMongoId()], validate, downloadDocument);

router.delete('/:id', [param('id').isMongoId()], validate, deleteDocument);

export default router;

