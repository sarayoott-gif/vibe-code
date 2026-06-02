/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, Priority } from '../types';
import { Calendar, MessageSquare, Flag, ArrowRight, CornerDownRight, Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, projectId }) => {
  const { moveTaskStatus, setViewingTaskId, users, setCreatingTaskInProject } = useApp();

  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  const columns: { id: TaskStatus; title: string; color: string; ringColor: string }[] = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-100 text-slate-700', ringColor: 'border-slate-350' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50 text-brand-700', ringColor: 'border-brand-300' },
    { id: 'in_review', title: 'In Review', color: 'bg-amber-50 text-amber-800', ringColor: 'border-amber-300' },
    { id: 'done', title: 'Done', color: 'bg-emerald-50 text-emerald-800', ringColor: 'border-emerald-305' }
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setHoveredColumn(colId);
  };

  const handleDragLeave = () => {
    setHoveredColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setHoveredColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
  };

  // Helper priority stylers
  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'medium':
        return 'bg-blue-50 text-blue-600 border-blue-105';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto pb-4 h-full items-start select-none">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const isHovered = hoveredColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragEnter={(e) => handleDragEnter(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-3xl p-4 min-h-[500px] max-h-[70vh] w-full transition-all border ${
              isHovered 
                ? 'bg-slate-100/80 border-dashed border-slate-400 scale-[0.98]' 
                : 'bg-slate-50/70 border-slate-100'
            }`}
          >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100/50">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => setCreatingTaskInProject(projectId)}
                className="w-5 h-5 rounded-lg hover:bg-slate-100 hover:text-brand-600 text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
                title={`Add card to ${col.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Tasks Scrollable Container */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-10">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assigneeId);
                  
                  // Highlight overdue (due dates before today 2026-06-02)
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date('2026-06-02') && task.status !== 'done';

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => setViewingTaskId(task.id)}
                      className="group bg-white rounded-2xl p-4 border border-slate-200/50 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
                    >
                      {/* Drag slider handle visual */}
                      <div className="h-1.5 w-10 bg-slate-100 hover:bg-slate-200 rounded-full mx-auto -mt-2.5 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="space-y-3">
                        {/* Title and Badge */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-brand-600 leading-snug">
                              {task.title}
                            </h4>
                          </div>
                          {task.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.labels.slice(0, 2).map((lbl, idx) => (
                                <span key={idx} className="text-[9px] font-bold text-slate-400 px-1.5 py-px border border-slate-100 rounded-md">
                                  {lbl}
                                </span>
                              ))}
                              {task.labels.length > 2 && (
                                <span className="text-[9px] font-bold text-slate-400 px-1">
                                  +{task.labels.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Meta strip info row */}
                        <div className="flex justify-between items-center pt-3 border-t border-slate-50 text-[10px] text-slate-500">
                          {/* Left: Due Date */}
                          <div className="flex items-center gap-1">
                            <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`} />
                            <span className={`font-semibold ${isOverdue ? 'text-red-600' : ''}`}>
                              {task.dueDate ? (
                                <>
                                  {task.dueDate}
                                  {isOverdue && ' (Overdue)'}
                                </>
                              ) : (
                                'No date'
                              )}
                            </span>
                          </div>

                          {/* Priority badge */}
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Footer: Comments Count and Assignee */}
                        <div className="flex justify-between items-center pt-2">
                          {/* Comments */}
                          <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-semibold">{task.commentCount}</span>
                          </div>

                          {/* Assignee Avatar */}
                          <div className="flex items-center gap-1">
                            {assignee ? (
                              <div 
                                className="w-6 h-6 rounded-lg bg-slate-100 text-[9px] font-bold text-slate-600 flex items-center justify-center border border-slate-100"
                                title={assignee.name}
                              >
                                {assignee.initials}
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-lg border border-dashed border-slate-300 text-[9px] font-bold text-slate-400 flex items-center justify-center" title="Unassigned">
                                ?
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 border border-dashed border-slate-200/50 rounded-2xl bg-white/40">
                  <CornerDownRight className="w-4 h-4 text-slate-300 mb-1" />
                  <p className="text-[10px] italic">Lane is empty</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
