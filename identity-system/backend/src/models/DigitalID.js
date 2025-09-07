import mongoose from 'mongoose';

const digitalIdSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    idNumber: { type: String, required: true, unique: true },
    qrDataUrl: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('DigitalID', digitalIdSchema);

