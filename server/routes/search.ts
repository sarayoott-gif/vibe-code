import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/search?q=
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim() === '') {
      res.json([]);
      return;
    }

    const query = q.trim().toLowerCase();

    const tasks = await prisma.task.findMany({
      where: {
        project: {
          members: {
            some: {
              userId: req.user?.id,
            },
          },
        },
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    const results = tasks.filter((t) => {
      const projectName = t.project?.name.toLowerCase() || '';
      const labels = JSON.parse(t.labels) as string[];

      const matchesTitle = t.title.toLowerCase().includes(query);
      const matchesDesc = t.description.toLowerCase().includes(query);
      const matchesProject = projectName.includes(query);
      const matchesLabels = labels.some((l) => l.toLowerCase().includes(query));

      return matchesTitle || matchesDesc || matchesProject || matchesLabels;
    });

    const mapped = results.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      assignee: t.assignee,
      dueDate: t.dueDate,
      labels: JSON.parse(t.labels),
      commentCount: t._count.comments,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search workspace' });
  }
});

export default router;
