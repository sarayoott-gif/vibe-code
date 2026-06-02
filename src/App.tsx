/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AuthView } from './views/AuthView';
import { Dashboard } from './views/Dashboard';
import { ProjectView } from './views/ProjectView';
import { ProjectsIndexView } from './views/ProjectsIndexView';
import { SearchResultsView } from './views/SearchResultsView';
import { SettingsView } from './views/SettingsView';
import { CreateProjectModal } from './components/CreateProjectModal';
import { CreateEditTaskModal } from './components/CreateEditTaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';

export default function App() {
  const { currentUser, activeScreen, loading } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Render centered spinner screen while loading tokens and bootstrapping workspace data
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin dark:border-slate-800 dark:border-t-brand-400"></div>
          <p className="mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 animate-pulse tracking-widest uppercase font-display">
            Initializing Workspace...
          </p>
        </div>
      </div>
    );
  }

  // If there is no authenticated user, render full screen auth view
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
        <AuthView />
      </div>
    );
  }

  // Determine active main screen component
  const renderActiveScreen = () => {
    switch (activeScreen.type) {
      case 'dashboard':
        return <Dashboard />;
      case 'project_board':
        return <ProjectView />;
      case 'projects_index':
        return <ProjectsIndexView />;
      case 'search':
        return <SearchResultsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-800 dark:text-slate-100 antialiased font-sans transition-colors">
      {/* Sidebar - Desktop Layout always stays on sidebar state; mobile layout can toggle */}
      <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block shrink-0`}>
        {/* Backdrop overlay for mobile screen drawer */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}
        <div className="fixed lg:sticky top-0 left-0 z-40 h-screen">
          <Sidebar />
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Content canvas padding */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Context Mode modals triggers */}
      <CreateProjectModal />
      <CreateEditTaskModal />
      <TaskDetailModal />
    </div>
  );
}
