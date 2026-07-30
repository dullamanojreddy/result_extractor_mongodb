import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { College } from '../models/College';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password || !college) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Find or create college
    let collegeDoc = await College.findOne({ name: college });
    if (!collegeDoc) {
      collegeDoc = await College.create({ name: college, createdBy: email });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      collegeId: collegeDoc._id.toString(),
      role: 'user'
    });

    // Create JWT
    const token = jwt.sign(
      { userId: user._id.toString(), collegeId: user.collegeId, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '8h' }
    );

    // Create session
    await Session.create({
      userId: user._id.toString(),
      ipAddress: req.ip || '',
      browser: req.headers['user-agent'] || '',
      loginTime: new Date()
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        collegeName: collegeDoc.name
      }
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create JWT
    const token = jwt.sign(
      { userId: user._id.toString(), collegeId: user.collegeId, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '8h' }
    );

    // Create session
    await Session.create({
      userId: user._id.toString(),
      ipAddress: req.ip || '',
      browser: req.headers['user-agent'] || '',
      loginTime: new Date()
    });

    // Get college name
    const college = await College.findById(user.collegeId);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        collegeName: college?.name || ''
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Update latest session with logout time
    await Session.findOneAndUpdate(
      { userId: req.user?.userId, logoutTime: { $exists: false } },
      { logoutTime: new Date() },
      { sort: { loginTime: -1 } }
    );

    return res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const college = await College.findById(user.collegeId);

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      collegeName: college?.name || ''
    });
  } catch (err: any) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;