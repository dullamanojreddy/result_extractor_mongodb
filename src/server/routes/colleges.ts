import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { College } from '../models/College.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { db } from '../database.js';

const router = Router();

// Get all colleges (for registration dropdown)
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    let colleges: any[] = [];

    if (db.mongoDb && db.mongoConnected) {
      colleges = await db.mongoDb
        .collection('colleges')
        .find({})
        .project({ collegeName: 1, name: 1, collegeCode: 1, shortName: 1 })
        .sort({ collegeName: 1, name: 1 })
        .toArray();
    }

    if (!colleges || colleges.length === 0) {
      colleges = await College.find({}).sort({ collegeName: 1, name: 1 }).lean();
    }

    const formatted = colleges
      .map((c: any) => {
        const displayName = c.collegeName || c.name || c.shortName || '';
        return {
          id: c._id,
          name: displayName,
          collegeName: displayName,
          collegeCode: c.collegeCode || '',
          shortName: c.shortName || ''
        };
      })
      .filter(c => Boolean(c.name));

    return res.json(formatted);
  } catch (err: any) {
    console.error('Get colleges error:', err);
    return res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

// Get current user's college
router.get('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const college = db.mongoDb && db.mongoConnected
      ? await db.mongoDb.collection('colleges').findOne(
          req.user?.collegeId && ObjectId.isValid(req.user.collegeId)
            ? { _id: new ObjectId(req.user.collegeId) }
            : { _id: req.user?.collegeId as any }
        )
      : await College.findById(req.user?.collegeId);

    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    return res.json({
      id: college._id,
      name: (college as any).collegeName || (college as any).name || ''
    });
  } catch (err: any) {
    console.error('Get my college error:', err);
    return res.status(500).json({ error: 'Failed to fetch college' });
  }
});

export default router;
