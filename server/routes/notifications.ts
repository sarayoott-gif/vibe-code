import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      description: n.description,
      read: n.read,
      taskId: n.taskId,
      projectId: n.projectId,
      createdAt: n.createdAt.toISOString(),
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/read
router.put('/read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;
