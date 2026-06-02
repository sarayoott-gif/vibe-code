import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/dashboard
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const myTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    const todoCount = myTasks.filter((t) => t.status === 'todo').length;
    const inProgressCount = myTasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length;
    const completedCount = myTasks.filter((t) => t.status === 'done').length;

    const todayVal = new Date('2026-06-02');
    const overdueCount = myTasks.filter((t) => {
      if (!t.dueDate || t.status === 'done') return false;
      return new Date(t.dueDate) < todayVal;
    }).length;

    const upcomingTasks = myTasks
      .filter((t) => t.status !== 'done' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assigneeId: t.assigneeId,
        dueDate: t.dueDate,
        labels: JSON.parse(t.labels),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }));

    res.json({
      todoCount,
      inProgressCount,
      completedCount,
      overdueCount,
      upcomingTasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
