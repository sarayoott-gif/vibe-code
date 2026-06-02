import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/tasks
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mappedTasks = tasks.map((t) => ({
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

    res.json(mappedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch all tasks' });
  }
});

// GET /api/projects/:projectId/tasks
router.get('/project/:projectId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const { status, assignee, priority, q } = req.query;

    // Check project membership
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: userId!,
          projectId,
        },
      },
    });
    if (!membership) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    const where: any = { projectId };

    if (status && status !== 'all') {
      where.status = status as string;
    }

    if (assignee && assignee !== 'all') {
      where.assigneeId = assignee === 'unassigned' ? null : (assignee as string);
    }

    if (priority && priority !== 'all') {
      where.priority = priority as string;
    }

    if (q && typeof q === 'string' && q.trim().length > 0) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    const mappedTasks = tasks.map((t) => ({
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

    res.json(mappedTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const t = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
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
        comments: {
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
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!t) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (t.project.members.length === 0) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    res.json({
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
      comments: t.comments.map(c => ({
        id: c.id,
        taskId: c.taskId,
        authorId: c.authorId,
        author: c.author,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const schema = z.object({
      projectId: z.string().min(1, 'Project ID is required'),
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      status: z.enum(['todo', 'in_progress', 'in_review', 'done']).default('todo'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      assigneeId: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
      labels: z.array(z.string()).default([]),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }

    const { projectId, title, description, status, priority, assigneeId, dueDate, labels } = validation.data;

    // Check project membership
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: creatorId,
          projectId,
        },
      },
    });
    if (!membership) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description: description || '',
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        labels: JSON.stringify(labels),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create notification if assigned to someone else
    if (assigneeId && assigneeId !== creatorId) {
      const creator = await prisma.user.findUnique({ where: { id: creatorId } });
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'Assigned to New Task',
          description: `${task.title} was assigned to you by ${creator?.name || 'someone'}.`,
          taskId: task.id,
          projectId: task.projectId,
        },
      });
    }

    res.status(201).json({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      assignee: task.assignee,
      dueDate: task.dueDate,
      labels: JSON.parse(task.labels),
      commentCount: 0,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const editorId = req.user?.id;
    const { id } = req.params;

    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      assigneeId: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
      labels: z.array(z.string()).default([]),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }

    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: {
              where: { userId: editorId },
            },
          },
        },
      },
    });
    if (!currentTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    if (currentTask.project.members.length === 0) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    const { title, description, status, priority, assigneeId, dueDate, labels } = validation.data;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description: description || '',
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        labels: JSON.stringify(labels),
      },
      include: {
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

    // Create notification if assignee changed and is not the editor
    if (assigneeId && assigneeId !== currentTask.assigneeId && assigneeId !== editorId) {
      const editor = await prisma.user.findUnique({ where: { id: editorId } });
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'Assigned to Task',
          description: `${updatedTask.title} was assigned to you by ${editor?.name || 'someone'}.`,
          taskId: updatedTask.id,
          projectId: updatedTask.projectId,
        },
      });
    }

    res.json({
      id: updatedTask.id,
      projectId: updatedTask.projectId,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      assigneeId: updatedTask.assigneeId,
      assignee: updatedTask.assignee,
      dueDate: updatedTask.dueDate,
      labels: JSON.parse(updatedTask.labels),
      commentCount: updatedTask._count.comments,
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// PATCH /api/tasks/:id/status
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const schema = z.object({
      status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }

    const currentTask = await prisma.task.findUnique({
      where: { id },
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
    if (!currentTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    if (currentTask.project.members.length === 0) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    const { status } = validation.data;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
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

    res.json({
      id: updatedTask.id,
      projectId: updatedTask.projectId,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      assigneeId: updatedTask.assigneeId,
      assignee: updatedTask.assignee,
      dueDate: updatedTask.dueDate,
      labels: JSON.parse(updatedTask.labels),
      commentCount: updatedTask._count.comments,
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch task status' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check membership
    const currentTask = await prisma.task.findUnique({
      where: { id },
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
    if (!currentTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    if (currentTask.project.members.length === 0) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
