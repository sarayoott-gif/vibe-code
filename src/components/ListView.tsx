/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, Priority } from '../types';
import { ArrowUpDown, MessageSquare, Calendar, ChevronDown } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
}

type SortField = 'title' | 'assignee' | 'priority' | 'status' | 'dueDate';
type SortDirection = 'asc' | 'desc';

export const ListView: React.FC<ListViewProps> = ({ tasks }) => {
  const { setViewingTaskId, users, moveTaskStatus } = useApp();

  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Priority mapping weights for sorting
  const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  const statusWeight = { todo: 1, in_progress: 2, in_review: 3, done: 4 };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Compile Sorted Tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    let valA: any = a[sortField as keyof Task] || '';
    let valB: any = b[sortField as keyof Task] || '';

    // Field override checks
    if (sortField === 'assignee') {
      const uA = users.find((user) => user.id === a.assigneeId);
      const uB = users.find((user) => user.id === b.assigneeId);
      valA = uA ? uA.name : 'zzzz';
      valB = uB ? uB.name : 'zzzz';
    } else if (sortField === 'priority') {
      valA = priorityWeight[a.priority];
      valB = priorityWeight[b.priority];
    } else if (sortField === 'status') {
      valA = statusWeight[a.status];
      valB = statusWeight[b.status];
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getPriorityBadgeColors = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-50 text-red-600 border-red-105';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-105';
      case 'medium':
        return 'bg-blue-50 text-blue-600 border-blue-105';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-150';
    }
  };

  const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done'
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-100/50">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 select-none uppercase">
              <th 
                className="py-4 px-6 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => handleSort('title')}
              >
                <span className="flex items-center gap-1">
                  Title
                  <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th 
                className="py-4 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => handleSort('assignee')}
              >
                <span className="flex items-center gap-1">
                  Assignee
                  <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th 
                className="py-4 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => handleSort('priority')}
              >
                <span className="flex items-center gap-1">
                  Priority
                  <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th 
                className="py-4 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => handleSort('status')}
              >
                <span className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th 
                className="py-4 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => handleSort('dueDate')}
              >
                <span className="flex items-center gap-1">
                  Due Date
                  <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th className="py-4 px-6 text-right">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => {
                const assignee = users.find((u) => u.id === task.assigneeId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date('2026-06-02') && task.status !== 'done';

                return (
                  <tr 
                    key={task.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    {/* Title */}
                    <td 
                      className="py-3.5 px-6 font-semibold text-slate-800"
                      onClick={() => setViewingTaskId(task.id)}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="group-hover:text-brand-600 transition-colors line-clamp-1">
                          {task.title}
                        </span>
                        {task.labels.length > 0 && (
                          <div className="flex gap-1">
                            {task.labels.map((lbl, i) => (
                              <span key={i} className="text-[9px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-1.5 rounded">
                                {lbl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Assignee Avatar */}
                    <td 
                      className="py-3.5 px-4"
                      onClick={() => setViewingTaskId(task.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 text-[9px] font-bold text-slate-600 flex items-center justify-center border border-slate-100">
                          {assignee ? assignee.initials : '?'}
                        </div>
                        <span className="text-slate-600 text-xs truncate max-w-[120px]">
                          {assignee ? assignee.name : 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td 
                      className="py-3.5 px-4"
                      onClick={() => setViewingTaskId(task.id)}
                    >
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getPriorityBadgeColors(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>

                    {/* Status Dropdown selector (inline modification!) */}
                    <td className="py-3.5 px-4">
                      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg pl-2 h-7 pr-7 py-0.5 text-[11px] font-semibold text-slate-700 cursor-pointer focus:outline-none transition-colors"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="in_review">In Review</option>
                          <option value="done">Done</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </td>

                    {/* Due date */}
                    <td 
                      className="py-3.5 px-4"
                      onClick={() => setViewingTaskId(task.id)}
                    >
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`} />
                        <span className={`font-semibold ${isOverdue ? 'text-red-600' : ''}`}>
                          {task.dueDate || 'No date'}
                          {isOverdue && <span className="text-[10px] text-red-500 ml-1">(Overdue)</span>}
                        </span>
                      </div>
                    </td>

                    {/* Comments */}
                    <td 
                      className="py-3.5 px-6"
                      onClick={() => setViewingTaskId(task.id)}
                    >
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-semibold text-[10px]">{task.commentCount}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-12 text-slate-400 italic">
                  No matching tasks currently mapped in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
