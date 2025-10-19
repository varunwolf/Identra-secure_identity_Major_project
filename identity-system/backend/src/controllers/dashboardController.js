import Document from '../models/Document.js';
import Activity from '../models/Activity.js';

export async function getStats(req, res, next) {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const [totalDocs, expiringSoonCount, recentActivities] = await Promise.all([
      Document.countDocuments({ owner: req.user.id }),
      Document.countDocuments({ 
        owner: req.user.id, 
        expiryDate: { $gte: now, $lte: sevenDaysFromNow } 
      }),
      Activity.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    res.json({
      documents: totalDocs,
      expiringSoon: expiringSoonCount,
      recentActivities,
    });
  } catch (err) {
    next(err);
  }
}

