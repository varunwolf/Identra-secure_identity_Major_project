import User from '../models/User.js';
import Document from '../models/Document.js';

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('name email role createdAt').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function listAllDocuments(req, res, next) {
  try {
    const docs = await Document.find().select('originalFilename owner createdAt').populate('owner', 'email').lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function elevateUser(req, res, next) {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, role: user.role });
  } catch (err) {
    next(err);
  }
}

