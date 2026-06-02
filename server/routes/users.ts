import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        initials: true,
        avatarUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
