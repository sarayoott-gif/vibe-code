/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, Priority } from '../types';
import { X, Edit, Trash2, Calendar, Flag, User, Layers, MessageSquare, Send, CornerDownRight } from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    viewingTaskId,
    setViewingTaskId,
    setEditingTaskId,
    tasks,
    projects,
    users,
    comments,
    addComment,
    deleteTask,
    updateTask,
    currentUser
  } = useApp();

  const [newCommentBody, setNewCommentBody] = useState('');

  if (!viewingTaskId) return null;

  const task = tasks.find((t) => t.id === viewingTaskId);
  if (!task) {
    setViewingTaskId(null);
    return null;
  }

  const project = projects.find((p) => p.id === task.projectId);
  const assignee = users.find((u) => u.id === task.assigneeId);
  const taskComments = comments.filter((c) => c.taskId === task.id);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentBody.trim() === '') return;

    addComment(task.id, newCommentBody.trim());
    setNewCommentBody('');
  };

  const handleFieldChange = (field: keyof typeof task, value: any) => {
    updateTask(task.id, { [field]: value });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  const handleEdit = () => {
    setViewingTaskId(null);
    setEditingTaskId(task.id);
  };

  // Human priority colors
  const getPriorityInfo = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return { bg: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500', text: 'Urgent' };
      case 'high':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', text: 'High' };
      case 'medium':
        return { bg: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500', text: 'Medium' };
      default:
        return { bg: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400', text: 'Low' };
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setViewingTaskId(null)}
      ></div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] relative z-10 border border-slate-100 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left pane: Task Info fields */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
          <div>
            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full text-slate-400">
                {project ? project.name : 'Unknown Project'}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  className="w-8 h-8 rounded-xl bg-slate-550 border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Edit Status & Data"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100/80 border border-red-100 flex items-center justify-center text-red-500 hover:text-red-700 cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="h-6 w-px bg-slate-200 mx-1"></span>
                <button
                  onClick={() => setViewingTaskId(null)}
                  className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title / Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-display text-slate-900 leading-snug">
                {task.title}
              </h2>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Description</h4>
                {task.description ? (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No description provided for this task.</p>
                )}
              </div>
            </div>

            {/* Quick Edit Board selectors */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">Status</span>
                <select
                  value={task.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white transition-colors"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">Priority</span>
                <select
                  value={task.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:bg-white transition-colors"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Metadata labels & calendar detail */}
          <div className="mt-8 pt-6 border-t border-slate-50 space-y-3 shrink-0 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 w-20 shrink-0 select-none">Assignee</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-[10px] text-slate-600 font-bold flex items-center justify-center">
                  {assignee ? assignee.initials : '?'}
                </div>
                <span className="font-medium text-slate-700">
                  {assignee ? assignee.name : 'Unassigned (Claim task)'}
                </span>
                {!assignee && (
                  <button
                    onClick={() => handleFieldChange('assigneeId', currentUser?.id)}
                    className="text-[10px] text-brand-600 hover:text-brand-700 font-bold underline ml-2"
                  >
                    Assign to Me
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 w-20 shrink-0 select-none">Due Date</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">{task.dueDate || 'No due date'}</span>
              </div>
            </div>

            {task.labels.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-slate-400 w-20 shrink-0 select-none">Labels</span>
                <div className="flex flex-wrap gap-1.5">
                  {task.labels.map((l, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] font-bold bg-brand-50 text-brand-600 rounded-full"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Comment Thread feed */}
        <div className="w-full md:w-80 bg-slate-50/70 flex flex-col justify-between h-1/2 md:h-full">
          {/* Comments Header */}
          <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-1.5 text-slate-700">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold font-display">Activity Comments</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">
              {taskComments.length} items
            </span>
          </div>

          {/* Comments History list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {taskComments.length > 0 ? (
              taskComments.map((comment) => {
                const author = users.find((u) => u.id === comment.authorId);
                const dt = new Date(comment.createdAt);
                
                // Human date format
                const timeString = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateString = dt.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <div key={comment.id} className="group text-xs flex gap-2.5 items-start">
                    <div className="w-7 h-7 bg-brand-600 text-white rounded-lg flex items-center justify-center font-bold text-[9px] shrink-0">
                      {author ? author.initials : 'US'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-slate-800">{author ? author.name : 'User'}</span>
                        <span className="text-[9px] text-slate-400">{dateString} {timeString}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-100 shadow-sm whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                <CornerDownRight className="w-5 h-5 text-slate-300 mb-1" />
                <p className="text-[11px] italic">No updates or comments log yet.</p>
                <p className="text-[9px] text-slate-400/80 mt-1 max-w-[160px]">
                  Tag details or update questions below to record collaborators notes.
                </p>
              </div>
            )}
          </div>

          {/* Comments Composer Form */}
          <form onSubmit={handleSendComment} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="Write a reply down here..."
              value={newCommentBody}
              onChange={(e) => setNewCommentBody(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={newCommentBody.trim() === ''}
              className="w-8 h-8 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all focus:outline-none"
              title="Post Comment"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
