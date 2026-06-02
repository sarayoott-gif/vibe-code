/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check } from 'lucide-react';

export const CreateProjectModal: React.FC = () => {
  const { createProjectModalOpen, setCreateProjectModalOpen, createProject } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Custom Preset Colors
  const colors = [
    '#2563EB', // Blue
    '#7C3AED', // Purple
    '#0891B2', // Cyan
    '#16A34A', // Green
    '#D97706', // Amber
    '#DC2626', // Red
    '#DB2777'  // Pink
  ];
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [error, setError] = useState('');

  if (!createProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim() === '') {
      setError('Project name is required.');
      return;
    }

    createProject(name.trim(), description.trim(), selectedColor);
    
    // Clear & Close
    setName('');
    setDescription('');
    setSelectedColor(colors[0]);
    setCreateProjectModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setCreateProjectModalOpen(false)}
      ></div>

      {/* Modal Container */}
      <div className="bg-white rounded-3xl w-full max-w-md p-6 relative z-10 border border-slate-100 shadow-2xl">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-50">
          <h3 className="text-base font-bold text-slate-900 font-display">New Project</h3>
          <button
            onClick={() => setCreateProjectModalOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Website Overhaul"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Description (Optional)</label>
            <textarea
              placeholder="Provide a brief context of what this project works towards."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Pick Color Theme</label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className="w-8 h-8 rounded-full border border-white hover:scale-115 transition-all flex items-center justify-center text-white cursor-pointer relative"
                  >
                    {isSelected && <Check className="w-4 h-4 shadow-sm" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateProjectModalOpen(false)}
              className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer focus:outline-none transition-all hover:-translate-y-0.5"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
