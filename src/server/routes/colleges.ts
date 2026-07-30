import { Router, Response } from 'express';
import { College } from '../models/College.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all colleges (for registration dropdown)
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const colleges = await College.find({}).sort({ name: 1 });
    return res.json(colleges.map(c => ({ id: c._id, name: c.name })));
  } catch (err: any) {
    console.error('Get colleges error:', err);
    return res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

// Get current user's college
router.get('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const college = await College.findById(req.user?.collegeId);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    return res.json({ id: college._id, name: college.name });
  } catch (err: any) {
    console.error('Get my college error:', err);
    return res.status(500).json({ error: 'Failed to fetch college' });
  }
});

export default router;