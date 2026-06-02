/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Task, Project } from '../types';
import { Calendar, CheckCircle2, AlertCircle, Clock, Star, Play, Layers } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    tasks,
    projects,
    users,
    navigate,
    setViewingTaskId,
    toggleStarProject
  } = useApp();

  if (!currentUser) return null;

  // Filter tasks assigned to current user
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);

  // Group tasks for stats
  const todoCount = myTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length;
  const completedCount = myTasks.filter((t) => t.status === 'done').length;

  // Overdue status: Due date before June 2, 2026, and status is not done
  const todayVal = new Date('2026-06-02');
  const overdueTasks = myTasks.filter((t) => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) < todayVal;
  });

  // Calculate project statistics (Progress bar based on done tasks / total tasks)
  const getProjectStats = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projectId);
    if (projTasks.length === 0) return { percent: 0, done: 0, total: 0 };
    const done = projTasks.filter((t) => t.status === 'done').length;
    return {
      percent: Math.round((done / projTasks.length) * 105) / 1.05, // returns 0-100 rounded
      percentInt: Math.round((done / projTasks.length) * 100),
      done,
      total: projTasks.length
    };
  };

  // Sorted my tasks (Next 7 Days prioritize)
  const sortedMyTasks = [...myTasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  const getPriorityBadgeColors = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-650 border-red-105 dark:bg-red-950/25 dark:text-red-400 dark:border-red-900/40';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/25 dark:text-amber-400 dark:border-amber-900/40';
      case 'medium':
        return 'bg-blue-50 text-blue-600 border-blue-105 dark:bg-blue-950/25 dark:text-blue-450 dark:border-blue-900/45';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header welcome block */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-display">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.name}</span>. You have{' '}
            <span className="font-semibold text-brand-600 dark:text-brand-400">{overdueTasks.length + sortedMyTasks.length} pending obligations</span>.
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-400 dark:text-slate-500 font-mono hidden sm:block">
          System simulated time: <span className="font-semibold text-slate-600 dark:text-slate-400">2026-06-02</span>
        </div>
      </div>

      {/* Stats Counter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">To Do</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{todoCount}</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-750 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">In Progress</p>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">{inProgressCount}</p>
          </div>
          <div className="w-10 h-10 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100/50 dark:border-brand-900/30 rounded-xl flex items-center justify-center text-brand-500">
            <Play className="w-4 h-4 fill-brand-500 dark:fill-brand-420" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm border-l-4 border-l-red-500 flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Overdue Duty</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{overdueTasks.length}</p>
          </div>
          <div className="w-10 h-10 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-xl flex items-center justify-center text-red-500 animate-pulse">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Tasks List (Next 7 Days) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-slate-850/10">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-550" />
              <span>Assigned to Me (Upcoming & Active)</span>
            </h2>
            <span className="text-[10px] font-bold bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
              {myTasks.length - completedCount} open tasks
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedMyTasks.length > 0 ? (
              sortedMyTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < todayVal;

                return (
                  <div
                    key={task.id}
                    onClick={() => setViewingTaskId(task.id)}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-850/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                        isOverdue 
                          ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-500' 
                          : 'border-slate-300 dark:border-slate-700 text-slate-300 dark:text-slate-600 group-hover:border-brand-500 dark:group-hover:border-brand-400'
                      }`}>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {task.title}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-slate-505 dark:text-slate-400">{project?.name || 'Project'}</span>
                          <span>•</span>
                          <span className={`${isOverdue ? 'text-red-500 dark:text-red-400 font-bold' : ''}`}>
                            Due {task.dueDate} {isOverdue && '(Overdue)'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border tracking-wider ${getPriorityBadgeColors(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-350">All task assignments cleared.</p>
                <p className="text-[10px] text-slate-401 dark:text-slate-500 mt-1">Excellent! You have zero open assignments left in this sequence.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Projects Feed list */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-display">Active Projects</h2>
            <button
              onClick={() => navigate({ type: 'projects_index' })}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline cursor-pointer"
            >
              See All Index
            </button>
          </div>

          <div className="space-y-4">
            {projects.slice(0, 3).map((proj) => {
              const stats = getProjectStats(proj.id);
              const members = users.filter((u) => proj.memberIds.includes(u.id));

              return (
                <div
                  key={proj.id}
                  onClick={() => navigate({ type: 'project_board', projectId: proj.id })}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="h-2" style={{ backgroundColor: proj.color }}></div>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {proj.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                          {proj.description || 'No description listed'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStarProject(proj.id);
                        }}
                        className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
                      >
                        <Star className="w-4 h-4 text-slate-300 dark:text-slate-650 hover:text-yellow-500 transition-colors" />
                      </button>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <span>Milestones Done: {stats.done}/{stats.total}</span>
                        <span>{stats.percentInt}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${stats.percent}%`, backgroundColor: proj.color }}
                        ></div>
                      </div>
                    </div>

                    {/* Team stack */}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex -space-x-1 px-1">
                        {members.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            className="w-6.5 h-6.5 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[8px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0"
                            title={m.name}
                          >
                            {m.initials}
                          </div>
                        ))}
                        {members.length > 3 && (
                          <div className="w-6.5 h-6.5 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-[8px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                            +{members.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono">
                        View board
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
