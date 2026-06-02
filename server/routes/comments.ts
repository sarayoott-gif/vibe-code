import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/comments
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const comments = await prisma.comment.findMany({
      where: {
        task: {
          project: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            initials: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const mapped = comments.map(c => ({
      id: c.id,
      taskId: c.taskId,
      authorId: c.authorId,
      author: c.author,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// GET /api/tasks/:taskId/comments
router.get('/:taskId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id;

    // Check project membership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (task.project.members.length === 0) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            initials: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const mapped = comments.map(c => ({
      id: c.id,
      taskId: c.taskId,
      authorId: c.authorId,
      author: c.author,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/tasks/:taskId/comments
router.post('/:taskId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const authorId = req.user?.id;
    if (!authorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { taskId } = req.params;
    const schema = z.object({
      body: z.string().min(1, 'Comment body is required'),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }

    const { body } = validation.data;

    // Verify task exists and check project membership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: { userId: authorId },
            },
          },
        },
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (task.project.members.length === 0) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        taskId,
        authorId,
        body,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            initials: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create notification for assignee if assignee is not the author
    if (task.assigneeId && task.assigneeId !== authorId) {
      const author = await prisma.user.findUnique({ where: { id: authorId } });
      const snippet = body.length > 40 ? `${body.substring(0, 40)}...` : body;

      await prisma.notification.create({
        data: {
          userId: task.assigneeId,
          title: 'New Comment',
          description: `${author?.name || 'Someone'} commented on "${task.title}": "${snippet}"`,
          taskId: task.id,
          projectId: task.projectId,
        },
      });
    }

    res.status(201).json({
      id: comment.id,
      taskId: comment.taskId,
      authorId: comment.authorId,
      author: comment.author,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

export default router;
