import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/projects
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                initials: true,
                avatarUrl: true,
              },
            },
          },
        },
        starredBy: {
          where: { userId },
        },
        tasks: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mappedProjects = projects.map((p) => {
      const total = p.tasks.length;
      const completed = p.tasks.filter((t) => t.status === 'done').length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        createdAt: p.createdAt.toISOString(),
        starred: p.starredBy.length > 0,
        memberIds: p.members.map((m) => m.userId),
        members: p.members.map((m) => m.user),
        taskStats: {
          total,
          completed,
          percent,
        },
      };
    });

    res.json(mappedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const p = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                initials: true,
                avatarUrl: true,
              },
            },
          },
        },
        starredBy: {
          where: { userId },
        },
        tasks: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!p) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const isMember = p.members.some((m) => m.userId === userId);
    if (!isMember) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    const total = p.tasks.length;
    const completed = p.tasks.filter((t) => t.status === 'done').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      createdAt: p.createdAt.toISOString(),
      starred: p.starredBy.length > 0,
      memberIds: p.members.map((m) => m.userId),
      members: p.members.map((m) => m.user),
      taskStats: {
        total,
        completed,
        percent,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const schema = z.object({
      name: z.string().min(1, 'Project name is required'),
      description: z.string().optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }

    const { name, description, color } = validation.data;

    // Create project and add current user as member in a transaction
    const newProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          description: description || '',
          color: color || '#2563EB',
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId,
        },
      });

      return project;
    });

    // Fetch user details for response
    const memberUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        initials: true,
        avatarUrl: true,
      },
    });

    res.status(201).json({
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      color: newProject.color,
      createdAt: newProject.createdAt.toISOString(),
      starred: false,
      memberIds: [userId],
      members: memberUser ? [memberUser] : [],
      taskStats: {
        total: 0,
        completed: 0,
        percent: 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id/star (Toggle star status)
router.put('/:id/star', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check project exists and get membership
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId },
        },
      },
    });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.members.length === 0) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    const star = await prisma.userStarredProject.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: id,
        },
      },
    });

    if (star) {
      await prisma.userStarredProject.delete({
        where: {
          userId_projectId: {
            userId,
            projectId: id,
          },
        },
      });
      res.json({ starred: false });
    } else {
      await prisma.userStarredProject.create({
        data: {
          userId,
          projectId: id,
        },
      });
      res.json({ starred: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle project star status' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check membership
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: userId!,
          projectId: id,
        },
      },
    });
    if (!membership) {
      res.status(403).json({ error: 'Forbidden: You are not a member of this project' });
      return;
    }

    // Delete project (cascades memberships, starred, tasks, comments due to schema onDelete: Cascade)
    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
