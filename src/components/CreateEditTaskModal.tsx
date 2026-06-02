/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, Priority } from '../types';
import { X, Calendar, Flag, User, Layers, Info } from 'lucide-react';

export const CreateEditTaskModal: React.FC = () => {
  const {
    editingTaskId,
    setEditingTaskId,
    creatingTaskInProject,
    setCreatingTaskInProject,
    projects,
    users,
    tasks,
    createTask,
    updateTask,
    currentUser
  } = useApp();

  // Mode Detection
  const isEditing = !!editingTaskId;
  const isCreating = !!creatingTaskInProject;

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [labelsInput, setLabelsInput] = useState('');

  // Local Validation Warnings
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  // Populate form if Editing or Creating with specific project context
  useEffect(() => {
    if (isEditing && editingTaskId) {
      const taskToEdit = tasks.find((t) => t.id === editingTaskId);
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description);
        setProjectId(taskToEdit.projectId);
        setAssigneeId(taskToEdit.assigneeId || 'unassigned');
        setPriority(taskToEdit.priority);
        setStatus(taskToEdit.status);
        setDueDate(taskToEdit.dueDate || '');
        setLabelsInput(taskToEdit.labels.join(', '));
      }
    } else if (isCreating && creatingTaskInProject) {
      // Reset Form for Creation
      setTitle('');
      setDescription('');
      setProjectId(creatingTaskInProject === 'all' ? (projects[0]?.id || '') : creatingTaskInProject);
      setAssigneeId('unassigned');
      setPriority('medium');
      setStatus('todo');
      
      // Default due date to 5 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 5);
      const yyyy = defaultDate.getFullYear();
      const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const dd = String(defaultDate.getDate()).padStart(2, '0');
      setDueDate(`${yyyy}-${mm}-${dd}`);
      
      setLabelsInput('');
    }
    setErrors({});
  }, [editingTaskId, creatingTaskInProject, isEditing, isCreating, projects, tasks]);

  if (!isEditing && !isCreating) return null;

  const handleClose = () => {
    if (isEditing) setEditingTaskId(null);
    if (isCreating) setCreatingTaskInProject(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // 1. Title Non-empty + Length validation
    if (title.trim() === '') {
      newErrors.title = 'Task title belongs as a mandatory field.';
    } else if (title.trim().length > 120) {
      newErrors.title = 'Task title must be under 120 characters.';
    }

    // 2. Project choice
    if (!projectId) {
      newErrors.projectId = 'Please link this task to a workspace project.';
    }

    // 3. Due date check (no days in the past)
    if (dueDate) {
      // App Time Context: 2026-06-02 as specified
      const limitDate = new Date('2026-06-02');
      const pickedDate = new Date(dueDate);
      
      // Strip hours to check dates only
      limitDate.setHours(0,0,0,0);
      pickedDate.setHours(0,0,0,0);

      if (pickedDate < limitDate) {
        newErrors.dueDate = 'Due dates cannot reside in the historical past.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus on first invalid field
      const firstErrKey = Object.keys(newErrors)[0];
      const elem = document.getElementById(`field-${firstErrKey}`);
      if (elem) elem.focus();
      return;
    }

    setSaving(true);

    // Format fields
    const parsedAssignee = assigneeId === 'unassigned' || assigneeId === '' ? null : assigneeId;
    const labels = labelsInput
      .split(',')
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l.length > 0);

    // Simulate saving spinner
    setTimeout(() => {
      const taskBody = {
        projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: parsedAssignee,
        dueDate,
        labels
      };

      if (isEditing && editingTaskId) {
        updateTask(editingTaskId, taskBody);
      } else {
        createTask(taskBody);
      }

      setSaving(false);
      handleClose();
    }, 600);
  };

  // Find members of selected project to scope the assignee picker
  const selectedProjectObj = projects.find((p) => p.id === projectId);
  const scopedUsers = selectedProjectObj 
    ? users.filter((u) => selectedProjectObj.memberIds.includes(u.id))
    : users;

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Form Card Container */}
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative z-10 border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-50 shrink-0">
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <span>{isEditing ? 'Modify Workspace Task' : 'Compose TaskFlow Task'}</span>
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body Scroll area */}
        <form onSubmit={handleFormSubmit} className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
          {/* Title Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <label className="text-slate-700">Task Title <span className="text-red-500">*</span></label>
              <span className={`text-[10px] ${title.length > 120 ? 'text-red-500' : 'text-slate-400'}`}>
                {title.length}/120
              </span>
            </div>
            <input
              id="field-title"
              type="text"
              required
              placeholder="e.g. Design app onboarding navigation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:bg-white transition-all ${
                errors.title 
                  ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
                  : 'border-slate-200 focus:border-brand-500'
              }`}
            />
            {errors.title && <p className="text-[10px] text-red-600 font-semibold">{errors.title}</p>}
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Detailed Description</label>
            <textarea
              placeholder="Break down milestones, outcomes, resources, or checklist expectations here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Select Project & Assignee row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Project Parent <span className="text-red-500">*</span></span>
              </label>
              <select
                id="field-projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:bg-white transition-all ${
                  errors.projectId ? 'border-red-500' : 'border-slate-200 focus:border-brand-500'
                }`}
              >
                <option value="" disabled>Choose target project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.projectId && <p className="text-[10px] text-red-600 font-semibold">{errors.projectId}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Task Assignee</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
              >
                <option value="unassigned">Unassigned (Open for Claim)</option>
                {scopedUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Status row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <span>Severity Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              >
                <option value="low">Low Priority (Gray)</option>
                <option value="medium">Medium Priority (Blue)</option>
                <option value="high">High Priority (Amber)</option>
                <option value="urgent">Urgent Priority (Red)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Current Status</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due date and labels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Due Date</span>
              </label>
              <input
                id="field-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:bg-white transition-all ${
                  errors.dueDate ? 'border-red-500' : 'border-slate-200 focus:border-brand-500'
                }`}
              />
              {errors.dueDate && <p className="text-[10px] text-red-600 font-semibold">{errors.dueDate}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Custom Labels <span className="text-[10px] font-normal text-slate-400">(Comma separated)</span>
              </label>
              <input
                type="text"
                placeholder="design, qa, database"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
          
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-2">
            <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 leading-normal">
              Any changes made are optimistically saved to continuous custom local storage, making lists hot-reloadable instantly.
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            disabled={saving}
            className="py-2 px-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer focus:outline-none transition-all hover:-translate-y-0.5 disabled:opacity-85 disabled:cursor-wait"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Saving...</span>
              </span>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Publish Task'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
