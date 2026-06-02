import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import commentsRouter from './routes/comments';
import dashboardRouter from './routes/dashboard';
import notificationsRouter from './routes/notifications';
import searchRouter from './routes/search';

const app = express();
const PORT = process.env.PORT || 3001;

// Allow JSON body parsing
app.use(express.json());

// CORS configuration (Zero dependency)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Log requests
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/search', searchRouter);

// Serve static assets in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// Catch-all route to serve the React application
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // In development, the build directory might not exist yet
      res.status(404).send('Not Found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
