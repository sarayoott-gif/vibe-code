import { User, Project, Task, Comment, AppNotification } from '../types';

const API_BASE = '/api';

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('taskflow_token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses or 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Check if response has content before parsing JSON
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export interface DashboardData {
  todoCount: number;
  inProgressCount: number;
  completedCount: number;
  overdueCount: number;
  upcomingTasks: Task[];
}

export interface TaskDetail extends Task {
  comments: (Comment & { author: Pick<User, 'id' | 'name' | 'initials' | 'avatarUrl'> })[];
  assignee: User | null;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (name: string, email: string, password: string) =>
      fetchAPI<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),

    me: () =>
      fetchAPI<User>('/auth/me'),

    updateProfile: (name: string, email: string) =>
      fetchAPI<User>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email }),
      }),

    updatePassword: (currentPassword: string, newPassword: string) =>
      fetchAPI<{ message: string }>('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  users: {
    list: () => fetchAPI<User[]>('/users'),
  },

  projects: {
    list: () => fetchAPI<Project[]>('/projects'),
    get: (id: string) => fetchAPI<Project>(`/projects/${id}`),
    create: (name: string, description?: string, color?: string) =>
      fetchAPI<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description, color }),
      }),
    toggleStar: (id: string) =>
      fetchAPI<{ starred: boolean }>(`/projects/${id}/star`, {
        method: 'PUT',
      }),
    delete: (id: string) =>
      fetchAPI<void>(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  tasks: {
    list: () => fetchAPI<Task[]>('/tasks'),
    listByProject: (projectId: string, filters?: { status?: string; assignee?: string; priority?: string; q?: string }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            params.append(k, String(v));
          }
        });
      }
      const query = params.toString();
      return fetchAPI<Task[]>(`/tasks/project/${projectId}${query ? `?${query}` : ''}`);
    },
    get: (id: string) => fetchAPI<TaskDetail>(`/tasks/${id}`),
    create: (data: {
      projectId: string;
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
      labels?: string[];
    }) =>
      fetchAPI<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: {
      title: string;
      description?: string;
      status: string;
      priority: string;
      assigneeId?: string | null;
      dueDate?: string | null;
      labels?: string[];
    }) =>
      fetchAPI<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      fetchAPI<Task>(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      fetchAPI<void>(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },

  comments: {
    listAll: () => fetchAPI<Comment[]>('/comments'),
    list: (taskId: string) => fetchAPI<(Comment & { author: Pick<User, 'id' | 'name' | 'initials' | 'avatarUrl'> })[]>(`/comments/${taskId}`),
    create: (taskId: string, body: string) =>
      fetchAPI<Comment & { author: Pick<User, 'id' | 'name' | 'initials' | 'avatarUrl'> }>(`/comments/${taskId}`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      }),
  },

  dashboard: {
    get: () => fetchAPI<DashboardData>('/dashboard'),
  },

  notifications: {
    list: () => fetchAPI<AppNotification[]>('/notifications'),
    markAllRead: () =>
      fetchAPI<void>('/notifications/read', {
        method: 'PUT',
      }),
  },

  search: (q: string) => fetchAPI<Task[]>(`/search?q=${encodeURIComponent(q)}`),
};
