/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Plus, Settings, LogOut, CheckSquare, Sparkles, User, Star, Sun, Moon } from 'lucide-react';

export const Topbar: React.FC<{ onMobileToggle: () => void }> = ({ onMobileToggle }) => {
  const {
    currentUser,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationsAsRead,
    logout,
    navigate,
    setCreatingTaskInProject,
    darkMode,
    toggleDarkMode
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  if (!currentUser) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = () => {
    setNotifDropdownOpen(!notifDropdownOpen);
    setUserDropdownOpen(false);
    if (!notifDropdownOpen) {
      markNotificationsAsRead();
    }
  };

  const handleUserClick = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setNotifDropdownOpen(false);
  };

  const handleSelectNotification = (n: any) => {
    setNotifDropdownOpen(false);
    if (n.projectId) {
      navigate({ type: 'project_board', projectId: n.projectId });
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors">
      {/* Mobile Toggle & Search Group */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onMobileToggle}
          className="p-1 px-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden cursor-pointer focus:outline-none"
        >
          <span className="sr-only">Toggle Sidebar</span>
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className="h-0.5 bg-slate-600 dark:bg-slate-300 rounded-md w-full"></span>
            <span className="h-0.5 bg-slate-600 dark:bg-slate-300 rounded-md w-full"></span>
            <span className="h-0.5 bg-slate-600 dark:bg-slate-300 rounded-md w-3/4"></span>
          </div>
        </button>

        {/* Global Search */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            placeholder="Search tasks, descriptions, comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-brand-500 hover:border-slate-300 dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right Core Action Widgets */}
      <div className="flex items-center gap-4 relative">
        {/* Quick Add Task Button */}
        <button
          onClick={() => setCreatingTaskInProject('all')}
          className="flex items-center gap-1.5 py-1.5 px-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-105 dark:shadow-none cursor-pointer focus:outline-none hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        {/* Dark Mode Icon Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 border border-slate-200/80 dark:border-slate-800/80 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-4.5 h-4.5 text-amber-500 fill-amber-500/20" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-500 hover:text-slate-800" />
          )}
        </button>

        {/* Dynamic Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className={`w-9 h-9 border border-slate-200/80 dark:border-slate-800/80 rounded-xl flex items-center justify-center transition-colors cursor-pointer relative ${
              notifDropdownOpen ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-705' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-slate-900 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-semibold bg-brand-50 dark:bg-brand-950/55 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleSelectNotification(n)}
                        className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/65 hover:text-slate-900 dark:hover:text-slate-100 block transition-colors ${
                          !n.read ? 'bg-amber-50/10 dark:bg-amber-950/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-1 justify-between">
                          <span className={`text-xs font-semibold ${!n.read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-350'}`}>
                            {n.title}
                          </span>
                          {!n.read && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0"></span>}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.description}</p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 block">{n.time}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-200 dark:text-slate-700" />
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Trigger dropdown */}
        <div className="relative">
          <button
            onClick={handleUserClick}
            className={`w-9 h-9 rounded-xl font-bold text-xs ring-2 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer ${
              userDropdownOpen
                ? 'ring-brand-500 ring-offset-1'
                : 'ring-transparent hover:ring-slate-200 dark:hover:ring-slate-700 hover:ring-offset-1'
            } bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300`}
          >
            {currentUser.initials}
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-4 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{currentUser.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate({ type: 'settings' });
                  }}
                  className="w-full flex items-center gap-2.5 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl text-left cursor-pointer transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 py-2 px-3 text-xs font-semibold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-xl text-left cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
