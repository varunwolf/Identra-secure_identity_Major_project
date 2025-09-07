import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validationResult } from 'express-validator';
import { encryptBufferWithHybridScheme, decryptBufferWithHybridScheme } from '../utils/rsa.js';
import Document from '../models/Document.js';
import Activity from '../models/Activity.js';
import { uploadDir } from '../utils/multer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadDocument(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.file) return res.status(400).json({ message: 'File is required' });
    const { originalname, mimetype, size, buffer } = req.file;
    const { expiryDate } = req.body;

    const { ciphertext, authTag, encryptedKey } = encryptBufferWithHybridScheme(buffer);
    const storedFilename = `${Date.now()}_${Math.random().toString(36).slice(2)}.bin`;
    const filePath = path.join(uploadDir, storedFilename);
    fs.writeFileSync(filePath, ciphertext);

    const doc = await Document.create({
      owner: req.user.id,
      originalFilename: originalname,
      storedFilename,
      mimeType: mimetype,
      size,
      path: filePath,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      encryptedKey,
      authTag,
    });

    await Activity.create({ user: req.user.id, type: 'document', message: `Uploaded ${originalname}` });
    res.status(201).json({ id: doc._id, originalFilename: doc.originalFilename });
  } catch (err) {
    next(err);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(docs.map(d => ({
      id: d._id,
      originalFilename: d.originalFilename,
      mimeType: d.mimeType,
      size: d.size,
      createdAt: d.createdAt,
      expiryDate: d.expiryDate,
    })));
  } catch (err) {
    next(err);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Document.findOne({ _id: id, owner: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });

    const ciphertext = fs.readFileSync(doc.path);
    const plain = decryptBufferWithHybridScheme(ciphertext, doc.authTag, doc.encryptedKey);
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalFilename}"`);
    res.send(plain);
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Document.findOneAndDelete({ _id: id, owner: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    try { fs.unlinkSync(doc.path); } catch {}
    await Activity.create({ user: req.user.id, type: 'document', message: `Deleted ${doc.originalFilename}` });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

