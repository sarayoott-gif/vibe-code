import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data in correct dependency order
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.userStarredProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const users = [
    { id: 'u1', name: 'Anira Wong',    email: 'anira@taskflow.app',  avatarUrl: null, initials: 'AW', passwordHash },
    { id: 'u2', name: 'Marcus Reed',   email: 'marcus@taskflow.app', avatarUrl: null, initials: 'MR', passwordHash },
    { id: 'u3', name: 'Priya Nair',    email: 'priya@taskflow.app',  avatarUrl: null, initials: 'PN', passwordHash },
    { id: 'u4', name: 'Tom Belanger',  email: 'tom@taskflow.app',    avatarUrl: null, initials: 'TB', passwordHash },
    { id: 'u5', name: 'Sara Okafor',   email: 'sara@taskflow.app',   avatarUrl: null, initials: 'SO', passwordHash }
  ];

  for (const user of users) {
    await prisma.user.create({
      data: user
    });
  }

  // Create Projects
  const projects = [
    {
      id: 'p1',
      name: 'Website Redesign',
      description: 'Marketing site refresh for Q3 launch.',
      color: '#2563EB',
      createdAt: new Date('2026-05-01T09:00:00Z'),
    },
    {
      id: 'p2',
      name: 'Mobile App v2',
      description: 'Native app rebuild and feature parity.',
      color: '#7C3AED',
      createdAt: new Date('2026-04-12T13:30:00Z'),
    },
    {
      id: 'p3',
      name: 'Q3 Marketing Campaign',
      description: 'Multi-channel campaign for product launch.',
      color: '#0891B2',
      createdAt: new Date('2026-05-20T08:15:00Z'),
    }
  ];

  for (const project of projects) {
    await prisma.project.create({
      data: project
    });
  }

  // Create Project Memberships
  const memberships = [
    { userId: 'u1', projectId: 'p1' },
    { userId: 'u2', projectId: 'p1' },
    { userId: 'u3', projectId: 'p1' },
    { userId: 'u1', projectId: 'p2' },
    { userId: 'u4', projectId: 'p2' },
    { userId: 'u5', projectId: 'p2' },
    { userId: 'u2', projectId: 'p3' },
    { userId: 'u3', projectId: 'p3' },
    { userId: 'u5', projectId: 'p3' },
  ];

  for (const member of memberships) {
    await prisma.projectMember.create({
      data: member
    });
  }

  // Create Starred Projects
  await prisma.userStarredProject.create({
    data: {
      userId: 'u1',
      projectId: 'p1'
    }
  });

  // Create Tasks
  const tasks = [
    {
      id: 't1',
      projectId: 'p1',
      title: 'Design new homepage hero',
      description: 'Above-the-fold layout with new value prop and CTA.',
      status: 'in_progress',
      priority: 'high',
      assigneeId: 'u3',
      dueDate: '2026-06-10',
      labels: JSON.stringify(['design']),
      createdAt: new Date('2026-05-22T10:00:00Z'),
      updatedAt: new Date('2026-06-01T16:20:00Z')
    },
    {
      id: 't2',
      projectId: 'p1',
      title: 'Audit current site for broken links',
      description: 'Crawl all pages and log 404s.',
      status: 'todo',
      priority: 'medium',
      assigneeId: 'u2',
      dueDate: '2026-06-15',
      labels: JSON.stringify(['qa']),
      createdAt: new Date('2026-05-23T09:30:00Z'),
      updatedAt: new Date('2026-05-23T09:30:00Z')
    },
    {
      id: 't3',
      projectId: 'p1',
      title: 'Write launch announcement copy',
      description: 'Blog post + social snippets.',
      status: 'in_review',
      priority: 'medium',
      assigneeId: 'u1',
      dueDate: '2026-06-08',
      labels: JSON.stringify(['content']),
      createdAt: new Date('2026-05-25T11:00:00Z'),
      updatedAt: new Date('2026-06-02T08:45:00Z')
    },
    {
      id: 't4',
      projectId: 'p2',
      title: 'Set up navigation stack',
      description: 'Tab + stack navigation skeleton.',
      status: 'done',
      priority: 'high',
      assigneeId: 'u4',
      dueDate: '2026-05-28',
      labels: JSON.stringify(['frontend']),
      createdAt: new Date('2026-05-10T14:00:00Z'),
      updatedAt: new Date('2026-05-28T17:10:00Z')
    },
    {
      id: 't5',
      projectId: 'p2',
      title: 'Implement offline caching',
      description: 'Cache last-viewed tasks for offline read.',
      status: 'todo',
      priority: 'urgent',
      assigneeId: 'u5',
      dueDate: '2026-05-30',
      labels: JSON.stringify(['frontend', 'performance']),
      createdAt: new Date('2026-05-18T12:00:00Z'),
      updatedAt: new Date('2026-05-18T12:00:00Z')
    },
    {
      id: 't6',
      projectId: 'p2',
      title: 'Design empty states',
      description: 'Illustrations + copy for empty lists.',
      status: 'in_progress',
      priority: 'low',
      assigneeId: 'u1',
      dueDate: '2026-06-20',
      labels: JSON.stringify(['design']),
      createdAt: new Date('2026-05-26T09:00:00Z'),
      updatedAt: new Date('2026-06-01T10:00:00Z')
    },
    {
      id: 't7',
      projectId: 'p3',
      title: 'Draft email sequence',
      description: '3-part nurture sequence for leads.',
      status: 'todo',
      priority: 'medium',
      assigneeId: 'u5',
      dueDate: '2026-06-12',
      labels: JSON.stringify(['content']),
      createdAt: new Date('2026-05-27T15:00:00Z'),
      updatedAt: new Date('2026-05-29T09:00:00Z')
    },
    {
      id: 't8',
      projectId: 'p3',
      title: 'Book ad placements',
      description: 'Reserve social + display inventory.',
      status: 'in_progress',
      priority: 'high',
      assigneeId: 'u2',
      dueDate: '2026-06-05',
      labels: JSON.stringify(['ops']),
      createdAt: new Date('2026-05-21T13:00:00Z'),
      updatedAt: new Date('2026-06-02T07:30:00Z')
    }
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: task
    });
  }

  // Create Comments
  const comments = [
    {
      id: 'c1',
      taskId: 't1',
      authorId: 'u1',
      body: 'Can we try a darker background for contrast?',
      createdAt: new Date('2026-05-30T10:15:00Z')
    },
    {
      id: 'c2',
      taskId: 't1',
      authorId: 'u3',
      body: 'Good call — pushing a new version now.',
      createdAt: new Date('2026-06-01T16:20:00Z')
    },
    {
      id: 'c3',
      taskId: 't3',
      authorId: 'u2',
      body: 'Reviewed — small tweak to the headline suggested.',
      createdAt: new Date('2026-06-02T08:45:00Z')
    },
    {
      id: 'c4',
      taskId: 't8',
      authorId: 'u5',
      body: 'Inventory confirmed for two of three channels.',
      createdAt: new Date('2026-06-02T07:30:00Z')
    }
  ];

  for (const comment of comments) {
    await prisma.comment.create({
      data: comment
    });
  }

  // Create Notifications
  const notifications = [
    {
      id: 'bn1',
      userId: 'u1',
      title: 'Assigned to New Task',
      description: 'Design empty states was assigned to you by Marcus Reed.',
      read: false,
      taskId: 't6',
      projectId: 'p2',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: 'bn2',
      userId: 'u1',
      title: 'Comment in Site Auditing',
      description: 'Marcus Reed commented: "I will check this page tomorrow."',
      read: true,
      taskId: 't2',
      projectId: 'p1',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
