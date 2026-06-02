/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Star, Layers, Calendar, Group } from 'lucide-react';

export const ProjectsIndexView: React.FC = () => {
  const {
    projects,
    tasks,
    users,
    starredProjects,
    toggleStarProject,
    navigate,
    setCreateProjectModalOpen
  } = useApp();

  const getProjectStats = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projectId);
    if (projTasks.length === 0) return { percent: 0, completed: 0, total: 0 };
    const completed = projTasks.filter((t) => t.status === 'done').length;
    return {
      percent: Math.round((completed / projTasks.length) * 100),
      completed,
      total: projTasks.length
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-205">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Workspace Projects</h1>
          <p className="text-slate-500 text-xs mt-1">
            Review status, timeline thresholds and check lists of active team initiatives.
          </p>
        </div>
        <button
          onClick={() => setCreateProjectModalOpen(true)}
          className="flex items-center gap-1.5 py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const isStarred = starredProjects.includes(proj.id);
          const stats = getProjectStats(proj.id);
          const projectMembers = users.filter((u) => proj.memberIds.includes(u.id));

          return (
            <div
              key={proj.id}
              onClick={() => navigate({ type: 'project_board', projectId: proj.id })}
              className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group overflow-hidden"
            >
              <div>
                {/* Horizontal color bar */}
                <div className="h-2.5" style={{ backgroundColor: proj.color }}></div>

                <div className="p-6 space-y-4">
                  {/* Title and Favoriting Star */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                        {proj.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {proj.description || 'No description listed for this project.'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStarProject(proj.id);
                      }}
                      className="p-1 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-4.5 h-4.5 transition-colors ${
                          isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-slate-350 hover:text-yellow-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Task counts status summary badge */}
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{stats.total} Tasks</span>
                    </div>
                    <span>•</span>
                    <div className="text-emerald-600">
                      {stats.completed} Completed
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress and members footer */}
              <div className="px-6 pb-6 pt-2 space-y-4 border-t border-slate-50">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Performance</span>
                    <span>{stats.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${stats.percent}%`, backgroundColor: proj.color }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Assigned Staff ({projectMembers.length})
                  </span>
                  {/* Member avatars list */}
                  <div className="flex -space-x-1.5">
                    {projectMembers.map((m) => (
                      <div
                        key={m.id}
                        className="w-6.5 h-6.5 rounded-full bg-slate-50 text-[9px] font-bold text-slate-700 ring-2 ring-white border border-slate-200 flex items-center justify-center shrink-0"
                        title={m.name}
                      >
                        {m.initials}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
