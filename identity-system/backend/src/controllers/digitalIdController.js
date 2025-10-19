import QRCode from 'qrcode';
import DigitalID from '../models/DigitalID.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

function generateIdNumber(userId) {
  return `ID-${userId.slice(-6)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function getOrCreateDigitalId(req, res, next) {
  try {
    let digitalId = await DigitalID.findOne({ user: req.user.id });
    if (!digitalId) {
      const idNumber = generateIdNumber(req.user.id);
      const payload = { 
        user: req.user.id, 
        idNumber,
        name: req.user.name,
        email: req.user.email,
        issuedAt: new Date().toISOString()
      };
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload));
      digitalId = await DigitalID.create({ user: req.user.id, idNumber, qrDataUrl });
      await Activity.create({ user: req.user.id, type: 'digital-id', message: 'Digital ID issued' });
    }

    // Get user details for comprehensive response
    const user = await User.findById(req.user.id).select('-passwordHash');
    
    res.json({ 
      idNumber: digitalId.idNumber, 
      qrDataUrl: digitalId.qrDataUrl, 
      issuedAt: digitalId.issuedAt,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled,
        biometricEnabled: user.biometricEnabled,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

