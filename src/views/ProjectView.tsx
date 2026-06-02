/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { KanbanBoard } from '../components/KanbanBoard';
import { ListView } from '../components/ListView';
import { LayoutGrid, List, Search, Plus, Filter, RefreshCcw } from 'lucide-react';
import { TaskStatus, Priority } from '../types';

export const ProjectView: React.FC = () => {
  const {
    activeScreen,
    projects,
    tasks,
    users,
    setCreatingTaskInProject,
    statusFilter,
    setStatusFilter,
    assigneeFilter,
    setAssigneeFilter,
    priorityFilter,
    setPriorityFilter,
    clearAllFilters
  } = useApp();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [localSearch, setLocalSearch] = useState('');

  // Find current project
  const projectId = activeScreen.projectId;
  const currentProject = projects.find((p) => p.id === projectId);

  if (!currentProject) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm font-semibold text-slate-800">Project Not Found</p>
        <p className="text-xs text-slate-400 mt-1">This project has either been deleted or your account does not belong to its access workspace lists right now.</p>
      </div>
    );
  }

  // Get tasks for this project
  const projectTasks = tasks.filter((t) => t.projectId === currentProject.id);

  // Apply filters (Live calculations)
  const filteredTasks = useMemo(() => {
    return projectTasks.filter((task) => {
      // 1. Text filter
      if (localSearch.trim() !== '') {
        const text = localSearch.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(text);
        const matchesDesc = task.description.toLowerCase().includes(text);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // 3. Assignee filter
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned') {
          if (task.assigneeId !== null) return false;
        } else if (task.assigneeId !== assigneeFilter) {
          return false;
        }
      }

      // 4. Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [projectTasks, localSearch, statusFilter, assigneeFilter, priorityFilter]);

  // Project members list
  const members = users.filter((u) => currentProject.memberIds.includes(u.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Project Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block"
              style={{ backgroundColor: currentProject.color }}
            ></span>
            <span>{currentProject.name}</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 max-w-2xl">
            {currentProject.description || 'No description listed for this project workspace.'}
          </p>
        </div>

        {/* View mode actions */}
        <div className="flex items-center gap-3">
          {/* Board/List Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'board'
                  ? 'bg-white text-slate-900 shadow-sm shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setCreatingTaskInProject(currentProject.id)}
            className="flex items-center gap-1.5 py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Action bar */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-4">
        {/* Row 1: Search + Quick status selectors/assignees */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks inline..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 hover:border-slate-355 transition-colors text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Quick Dropdown select filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-450 font-semibold flex items-center gap-1 text-[10px] uppercase.">
                <Filter className="w-3 h-3 text-slate-400" />
                <span>Filters:</span>
              </span>
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-205 rounded-xl px-2.5 py-1.5 text-xs text-slate-650 font-semibold focus:outline-none focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>

            {/* Assignee Select */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-205 rounded-xl px-2.5 py-1.5 text-xs text-slate-650 font-semibold focus:outline-none focus:bg-white"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {members.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            {/* Priority Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-205 rounded-xl px-2.5 py-1.5 text-xs text-slate-650 font-semibold focus:outline-none focus:bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>

            {/* Clear filters utility */}
            {(statusFilter !== 'all' || assigneeFilter !== 'all' || priorityFilter !== 'all' || localSearch !== '') && (
              <button
                onClick={() => {
                  clearAllFilters();
                  setLocalSearch('');
                }}
                className="w-8 h-8 rounded-xl hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear Filters"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Kanban Board vs List switch renders */}
      <div className="min-h-[500px]">
        {viewMode === 'board' ? (
          <KanbanBoard tasks={filteredTasks} projectId={currentProject.id} />
        ) : (
          <ListView tasks={filteredTasks} />
        )}
      </div>
    </div>
  );
};
