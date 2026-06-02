/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string; // hex or tailwind colored string
  memberIds: string[];
  createdAt: string;
  starred?: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  dueDate: string; // YYYY-MM-DD
  labels: string[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export type ScreenType =
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'project_board'
  | 'projects_index'
  | 'search'
  | 'settings';

export interface ActiveScreen {
  type: ScreenType;
  projectId?: string; // for project_board
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  taskId?: string;
  projectId?: string;
}
