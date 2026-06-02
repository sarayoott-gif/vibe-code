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
  Priority
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS
} from '../data';

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

  // Actions
  toggleDarkMode: () => void;
  login: (email: string) => boolean;
  signup: (name: string, email: string) => boolean;
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
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentCount'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskStatus: (taskId: string, status: TaskStatus) => void;
  createProject: (name: string, description: string, color: string) => void;
  toggleStarProject: (projectId: string) => void;
  addComment: (taskId: string, body: string) => void;
  markNotificationsAsRead: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  updateProfile: (name: string, email: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage, fallback to mock data
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('taskflow_user');
    if (cached) return JSON.parse(cached);
    // Default logged in user u1 "Anira Wong" as specified by PRD
    return INITIAL_USERS[0];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const cached = localStorage.getItem('taskflow_users');
    return cached ? JSON.parse(cached) : INITIAL_USERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const cached = localStorage.getItem('taskflow_projects');
    return cached ? JSON.parse(cached) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = localStorage.getItem('taskflow_tasks');
    return cached ? JSON.parse(cached) : INITIAL_TASKS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const cached = localStorage.getItem('taskflow_comments');
    return cached ? JSON.parse(cached) : INITIAL_COMMENTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const cached = localStorage.getItem('taskflow_notifications');
    return cached ? JSON.parse(cached) : INITIAL_NOTIFICATIONS;
  });

  const [starredProjects, setStarredProjects] = useState<string[]>(() => {
    const cached = localStorage.getItem('taskflow_starred');
    return cached ? JSON.parse(cached) : ['p1'];
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>({ type: 'dashboard' });

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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('taskflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('taskflow_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('taskflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('taskflow_starred', JSON.stringify(starredProjects));
  }, [starredProjects]);

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
  const login = (email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      addToast('success', `Welcome back, ${found.name}!`);
      setActiveScreen({ type: 'dashboard' });
      return true;
    } else {
      // Allow simulation
      const initials = email.substring(0, 2).toUpperCase();
      const name = email.split('@')[0];
      const fallbackName = name.charAt(0).toUpperCase() + name.slice(1);
      const newUser: User = {
        id: 'u_' + Date.now(),
        name: fallbackName,
        email: email,
        avatarUrl: null,
        initials: initials || 'US'
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      addToast('success', `Welcome, ${fallbackName}! A new profile has been simulated.`);
      setActiveScreen({ type: 'dashboard' });
      return true;
    }
  };

  const signup = (name: string, email: string): boolean => {
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      addToast('error', 'User with this email already exists.');
      return false;
    }

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser: User = {
      id: 'u_' + Date.now(),
      name,
      email,
      avatarUrl: null,
      initials: initials || 'XX'
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast('success', `Account created successfully. Welcome, ${name}!`);
    setActiveScreen({ type: 'dashboard' });
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('info', 'Logged out safely.');
    setActiveScreen({ type: 'login' });
  };

  const navigate = (screen: ActiveScreen) => {
    setActiveScreen(screen);
    // Reset local filters when moving to a different screen type
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
  const updateProfile = (name: string, email: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name, email };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    addToast('success', 'Profile settings updated.');
  };

  // Tasks CRUD
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentCount'>) => {
    const newTask: Task = {
      ...taskData,
      id: 't_' + Date.now(),
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks((prev) => [newTask, ...prev]);
    addToast('success', `Task "${newTask.title}" added successfully.`);

    // Trigger Notification for Assignee
    if (newTask.assigneeId && newTask.assigneeId !== currentUser?.id) {
      const p = projects.find((proj) => proj.id === newTask.projectId);
      const assigneeUser = users.find((usr) => usr.id === newTask.assigneeId);
      const assignerName = currentUser?.name || 'Someone';

      const newNotif: AppNotification = {
        id: 'n_' + Date.now(),
        title: 'New Task Assigned',
        description: `"${newTask.title}" has been assigned to ${assigneeUser?.name || 'you'} by ${assignerName} in ${p?.name || 'Project'}.`,
        time: 'Just now',
        read: false,
        taskId: newTask.id,
        projectId: newTask.projectId
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          addToast('success', 'Task details updated.');
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setComments((prev) => prev.filter((c) => c.taskId !== taskId));
    addToast('info', `Task "${task?.title || 'Selected task'}" deleted.`);
    if (viewingTaskId === taskId) setViewingTaskId(null);
    if (editingTaskId === taskId) setEditingTaskId(null);
  };

  const moveTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === status) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      })
    );

    const formattedStatus = status.replace('_', ' ').toUpperCase();
    addToast('success', `Moved "${task.title}" to ${formattedStatus}`);
  };

  // Projects CRUD
  const createProject = (name: string, description: string, color: string) => {
    const newProj: Project = {
      id: 'p_' + Date.now(),
      name,
      description,
      color,
      memberIds: users.map((u) => u.id), // Add all current seed users as members for convenient assignment
      createdAt: new Date().toISOString()
    };

    setProjects((prev) => [...prev, newProj]);
    addToast('success', `Project "${name}" created.`);
  };

  const toggleStarProject = (projectId: string) => {
    setStarredProjects((prev) => {
      const isStarred = prev.includes(projectId);
      if (isStarred) {
        addToast('info', 'Project unstarred.');
        return prev.filter((id) => id !== projectId);
      } else {
        addToast('success', 'Project added to starred favorites.');
        return [...prev, projectId];
      }
    });
  };

  // Comments CRUD
  const addComment = (taskId: string, body: string) => {
    if (!currentUser) return;
    if (body.trim() === '') return;

    const newComment: Comment = {
      id: 'c_' + Date.now(),
      taskId,
      authorId: currentUser.id,
      body,
      createdAt: new Date().toISOString()
    };

    setComments((prev) => [...prev, newComment]);

    // Recalculate comment count on task
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            commentCount: t.commentCount + 1
          };
        }
        return t;
      })
    );

    addToast('success', 'Comment posted.');

    // Notify other assignees/collaborators
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.assigneeId && task.assigneeId !== currentUser.id) {
      const newNotif: AppNotification = {
        id: 'n_' + Date.now(),
        title: 'New Comment',
        description: `${currentUser.name} commented on "${task.title}": "${body.substring(0, 40)}${body.length > 40 ? '...' : ''}"`,
        time: 'Just now',
        read: false,
        taskId: task.id,
        projectId: task.projectId
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Notifications read status
  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        updateProfile
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
