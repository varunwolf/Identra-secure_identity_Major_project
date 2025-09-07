import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalFilename: { type: String, required: true },
    storedFilename: { type: String, required: true, unique: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    expiryDate: { type: Date },
    encryptedKey: { type: Buffer, required: true },
    authTag: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);

