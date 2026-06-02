/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Project,
  Task,
  Comment,
  ActiveScreen,
  ToastMessage,
  AppNotification,
  TaskStatus,
} from '../types';
import { api } from '../lib/api';

interface AppContextProps {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  notifications: AppNotification[];
  toasts: ToastMessage[];
  activeScreen: ActiveScreen;
  searchQuery: string;
  projectFilter: string;
  assigneeFilter: string;
  statusFilter: string;
  priorityFilter: string;
  starredProjects: string[]; // starred project IDs
  editingTaskId: string | null;
  creatingTaskInProject: string | null; // projectId if given
  viewingTaskId: string | null;
  isSidebarCollapsed: boolean;
  createProjectModalOpen: boolean;
  darkMode: boolean;
  loading: boolean;

  // Actions
  toggleDarkMode: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  navigate: (screen: ActiveScreen) => void;
  setSearchQuery: (query: string) => void;
  setProjectFilter: (val: string) => void;
  setAssigneeFilter: (val: string) => void;
  setStatusFilter: (val: string) => void;
  setPriorityFilter: (val: string) => void;
  clearAllFilters: () => void;

  setEditingTaskId: (id: string | null) => void;
  setCreatingTaskInProject: (id: string | null) => void;
  setViewingTaskId: (id: string | null) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setCreateProjectModalOpen: (v: boolean) => void;

  // Data Actions
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentCount'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  createProject: (name: string, description: string, color: string) => Promise<void>;
  toggleStarProject: (projectId: string) => Promise<void>;
  addComment: (taskId: string, body: string) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  updateProfile: (name: string, email: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('taskflow_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [starredProjects, setStarredProjects] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>({ type: 'login' });
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQueryState] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal / Layout States
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [creatingTaskInProject, setCreatingTaskInProject] = useState<string | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('taskflow_dark_mode');
    return cached ? JSON.parse(cached) === true : false;
  });

  // Load and refresh initial data
  const fetchInitialData = async () => {
    try {
      const [fetchedUsers, fetchedProjects, fetchedTasks, fetchedComments, fetchedNotifications] = await Promise.all([
        api.users.list(),
        api.projects.list(),
        api.tasks.list(),
        api.comments.listAll(),
        api.notifications.list()
      ]);
      setUsers(fetchedUsers);
      setProjects(fetchedProjects);
      setTasks(fetchedTasks);
      setComments(fetchedComments);
      setNotifications(fetchedNotifications);

      const starredIds = fetchedProjects.filter(p => p.starred).map(p => p.id);
      setStarredProjects(starredIds);
    } catch (err: any) {
      console.error('Error fetching initial data:', err);
      addToast('error', 'Failed to load workspace data.');
    }
  };

  // Auth bootstrap
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          localStorage.setItem('taskflow_token', token);
          const user = await api.auth.me();
          setCurrentUser(user);
          setActiveScreen({ type: 'dashboard' });
          await fetchInitialData();
        } catch (err) {
          console.error('Token verification failed:', err);
          localStorage.removeItem('taskflow_token');
          setToken(null);
          setCurrentUser(null);
          setActiveScreen({ type: 'login' });
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setActiveScreen({ type: 'login' });
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem('taskflow_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Auth Operations
  const login = async (email: string, password = 'password123'): Promise<boolean> => {
    try {
      const data = await api.auth.login(email, password);
      localStorage.setItem('taskflow_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      addToast('success', `Welcome back, ${data.user.name}!`);
      return true;
    } catch (err: any) {
      addToast('error', err.message || 'Invalid email or password.');
      return false;
    }
  };

  const signup = async (name: string, email: string, password = 'password123'): Promise<boolean> => {
    try {
      const data = await api.auth.register(name, email, password);
      localStorage.setItem('taskflow_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      addToast('success', `Account created successfully. Welcome, ${name}!`);
      return true;
    } catch (err: any) {
      addToast('error', err.message || 'Failed to sign up.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    setToken(null);
    setCurrentUser(null);
    setUsers([]);
    setProjects([]);
    setTasks([]);
    setComments([]);
    setNotifications([]);
    setStarredProjects([]);
    addToast('info', 'Logged out safely.');
    setActiveScreen({ type: 'login' });
  };

  const navigate = (screen: ActiveScreen) => {
    setActiveScreen(screen);
    if (screen.type === 'project_board') {
      setStatusFilter('all');
      setAssigneeFilter('all');
      setPriorityFilter('all');
    }
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    if (query.trim() !== '') {
      setActiveScreen({ type: 'search' });
    }
  };

  const clearAllFilters = () => {
    setProjectFilter('all');
    setAssigneeFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQueryState('');
  };

  // Toast Alerts
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Profile operations
  const updateProfile = async (name: string, email: string) => {
    try {
      const updated = await api.auth.updateProfile(name, email);
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      addToast('success', 'Profile settings updated.');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update profile.');
    }
  };

  // Tasks CRUD
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentCount'>) => {
    try {
      const created = await api.tasks.create(taskData);
      setTasks((prev) => [created, ...prev]);
      addToast('success', `Task "${created.title}" added successfully.`);
      // Refresh notifications in case there are assignments
      const fetchedNotifications = await api.notifications.list();
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create task.');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const existing = tasks.find((t) => t.id === taskId);
      if (!existing) return;

      const merged = { ...existing, ...updates };
      const updated = await api.tasks.update(taskId, {
        title: merged.title,
        description: merged.description,
        status: merged.status,
        priority: merged.priority,
        assigneeId: merged.assigneeId,
        dueDate: merged.dueDate,
        labels: merged.labels,
      });

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      addToast('success', 'Task details updated.');

      const fetchedNotifications = await api.notifications.list();
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update task.');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      await api.tasks.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setComments((prev) => prev.filter((c) => c.taskId !== taskId));
      addToast('info', `Task "${task?.title || 'Selected task'}" deleted.`);
      if (viewingTaskId === taskId) setViewingTaskId(null);
      if (editingTaskId === taskId) setEditingTaskId(null);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete task.');
    }
  };

  const moveTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === status) return;

      const updated = await api.tasks.updateStatus(taskId, status);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );

      const formattedStatus = status.replace('_', ' ').toUpperCase();
      addToast('success', `Moved "${task.title}" to ${formattedStatus}`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to move task.');
    }
  };

  // Projects CRUD
  const createProject = async (name: string, description: string, color: string) => {
    try {
      const created = await api.projects.create(name, description, color);
      setProjects((prev) => [created, ...prev]);
      addToast('success', `Project "${name}" created.`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create project.');
    }
  };

  const toggleStarProject = async (projectId: string) => {
    try {
      const { starred } = await api.projects.toggleStar(projectId);
      setStarredProjects((prev) => {
        if (starred) {
          addToast('success', 'Project added to starred favorites.');
          return [...prev, projectId];
        } else {
          addToast('info', 'Project unstarred.');
          return prev.filter((id) => id !== projectId);
        }
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, starred } : p))
      );
    } catch (err: any) {
      addToast('error', err.message || 'Failed to toggle project star.');
    }
  };

  // Comments CRUD
  const addComment = async (taskId: string, body: string) => {
    if (body.trim() === '') return;

    try {
      const created = await api.comments.create(taskId, body);
      setComments((prev) => [...prev, created]);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, commentCount: t.commentCount + 1 } : t
        )
      );
      addToast('success', 'Comment posted.');

      const fetchedNotifications = await api.notifications.list();
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to post comment.');
    }
  };

  // Notifications read status
  const markNotificationsAsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err: any) {
      addToast('error', err.message || 'Failed to clear notifications.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        tasks,
        comments,
        notifications,
        toasts,
        activeScreen,
        searchQuery,
        projectFilter,
        assigneeFilter,
        statusFilter,
        priorityFilter,
        starredProjects,
        editingTaskId,
        creatingTaskInProject,
        viewingTaskId,
        isSidebarCollapsed,
        createProjectModalOpen,
        darkMode,
        loading,

        login,
        toggleDarkMode,
        signup,
        logout,
        navigate,
        setSearchQuery,
        setProjectFilter,
        setAssigneeFilter,
        setStatusFilter,
        setPriorityFilter,
        clearAllFilters,

        setEditingTaskId,
        setCreatingTaskInProject,
        setViewingTaskId,
        setSidebarCollapsed,
        setCreateProjectModalOpen,

        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        createProject,
        toggleStarProject,
        addComment,
        markNotificationsAsRead,
        addToast,
        removeToast,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
