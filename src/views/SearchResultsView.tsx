/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Calendar, Hash, ArrowRight } from 'lucide-react';
import { TaskStatus, Priority } from '../types';

export const SearchResultsView: React.FC = () => {
  const { searchQuery, tasks, projects, users, setViewingTaskId } = useApp();

  // Search logic: Match keyword in title, description, labels, or project name
  const results = tasks.filter((task) => {
    if (searchQuery.trim() === '') return false;
    const query = searchQuery.toLowerCase();
    
    // Find project
    const project = projects.find((p) => p.id === task.projectId);
    const projectName = project ? project.name.toLowerCase() : '';

    const matchesTitle = task.title.toLowerCase().includes(query);
    const matchesDesc = task.description.toLowerCase().includes(query);
    const matchesProject = projectName.includes(query);
    const matchesLabels = task.labels.some((l) => l.toLowerCase().includes(query));

    return matchesTitle || matchesDesc || matchesProject || matchesLabels;
  });

  const getPriorityBadgeColors = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-50 text-red-650 border-red-105';
      case 'high':
        return 'bg-amber-50 text-amber-705 border-amber-105';
      case 'medium':
        return 'bg-blue-50 text-blue-650 border-blue-105';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-105';
    }
  };

  const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
          <Search className="w-6 h-6 text-slate-400" />
          <span>Workspace Search Matches</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Showing matching tasks for lookup keyword query:{' '}
          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            "{searchQuery}"
          </span>
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
          <span className="text-xs font-bold text-slate-800">Matching Tasks</span>
          <span className="text-[10px] font-bold bg-brand-50 text-brand-600 px-2.5 py-0.5 rounded-full">
            {results.length} results
          </span>
        </div>

        {results.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {results.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              const assignee = users.find((u) => u.id === task.assigneeId);
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date('2026-06-02') && task.status !== 'done';

              return (
                <div
                  key={task.id}
                  onClick={() => setViewingTaskId(task.id)}
                  className="p-6 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold text-slate-400">
                      {project && (
                        <span
                          className="px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name}
                        </span>
                      )}
                      <span>•</span>
                      <span className="uppercase tracking-wide">{statusLabels[task.status]}</span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 max-w-2xl">
                      {task.description || 'No description listed'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end text-right">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border tracking-wider mb-1 ${getPriorityBadgeColors(task.priority)}`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className={isOverdue ? 'text-red-500 font-bold' : ''}>
                          {task.dueDate || 'No due date'}
                        </span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-700">No Match Found</p>
            <p className="text-[10px] text-slate-400 mt-1">Try adapting keywords, title strings, or descriptions search scope.</p>
          </div>
        )}
      </div>
    </div>
  );
};
