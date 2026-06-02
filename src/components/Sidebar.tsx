/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckSquare,
  Plus,
  Menu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    projects,
    starredProjects,
    activeScreen,
    navigate,
    logout,
    isSidebarCollapsed,
    setSidebarCollapsed,
    setCreateProjectModalOpen
  } = useApp();

  if (!currentUser) return null;

  const menuItems = [
    { type: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { type: 'projects_index', label: 'Projects', icon: FolderKanban }
  ];

  const starredList = projects.filter((p) => starredProjects.includes(p.id));

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 relative z-30 h-screen ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-50 dark:border-slate-800">
          <button
            onClick={() => navigate({ type: 'dashboard' })}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-ring rounded-lg cursor-pointer animate-in fade-in"
          >
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-100 dark:shadow-none shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold font-display tracking-tight text-slate-900 dark:text-slate-100 text-lg">
                TaskFlow
              </span>
            )}
          </button>
 
          {/* Collapse Trigger (hidden on mobile) */}
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex w-6 h-6 items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
 
        {/* User Card inside Sidebar (when expanded) */}
        {!isSidebarCollapsed && (
          <div className="p-4 mx-3 my-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {currentUser.initials}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        )}
 
        {/* Main Navigation */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen.type === item.type;
            return (
              <button
                key={item.type}
                onClick={() => navigate({ type: item.type as any })}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-left font-medium text-sm transition-all focus:outline-none cursor-pointer ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
 
        {/* Starred Projects Section */}
        <div className="mt-8 px-3">
          <div className="flex items-center justify-between px-3.5 mb-2">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                Starred Projects
              </span>
            )}
            {!isSidebarCollapsed && (
              <button
                onClick={() => setCreateProjectModalOpen(true)}
                className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 rounded transition-colors flex items-center justify-center cursor-pointer"
                title="Create Project"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
 
          <div className="space-y-0.5">
            {starredList.map((proj) => {
              const worksOnBoard = activeScreen.type === 'project_board' && activeScreen.projectId === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => navigate({ type: 'project_board', projectId: proj.id })}
                  className={`w-full flex items-center gap-3 py-2 px-3.5 rounded-lg text-left text-xs transition-all focus:outline-none cursor-pointer ${
                    worksOnBoard
                      ? 'bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 font-semibold border-l-2 border-brand-500 rounded-l-none'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title={proj.name}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color }}
                  ></span>
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1">{proj.name}</span>
                  )}
                  {!isSidebarCollapsed && (
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0 opacity-70" />
                  )}
                </button>
              );
            })}
 
            {!isSidebarCollapsed && starredList.length === 0 && (
              <div className="px-3.5 py-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
                Star projects to see them here
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Footer Nav */}
      <div className="p-3 border-t border-slate-50 dark:border-slate-800 space-y-1">
        <button
          onClick={() => navigate({ type: 'settings' })}
          className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-left font-medium text-sm transition-all focus:outline-none cursor-pointer ${
            activeScreen.type === 'settings'
              ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
          title={isSidebarCollapsed ? 'Settings' : undefined}
        >
          <Settings className={`w-5 h-5 shrink-0 ${activeScreen.type === 'settings' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
          {!isSidebarCollapsed && <span>Settings</span>}
        </button>
 
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-left font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all focus:outline-none cursor-pointer"
          title={isSidebarCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 text-red-500 shrink-0" />
          {!isSidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
