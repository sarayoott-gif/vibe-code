/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, ShieldCheck, KeyRound, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export const SettingsView: React.FC = () => {
  const { currentUser, updateProfile } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  if (!currentUser) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (name.trim() === '') {
      setProfileError('Full name is required.');
      return;
    }
    if (email.trim() === '') {
      setProfileError('Email is required.');
      return;
    }

    try {
      await updateProfile(name.trim(), email.trim());
      setProfileSuccess('Profile details successfully updated.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess('');
    setSecurityError('');

    if (!currentPassword) {
      setSecurityError('Current workspace password is required to save changes.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters.');
      return;
    }

    try {
      await api.auth.updatePassword(currentPassword, newPassword);
      setSecuritySuccess('Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to update password.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-display">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Manage your design persona profile specs, security keys and connection status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm p-6 space-y-6 transition-colors">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-105 dark:border-slate-800">
            <div className="w-9 h-9 bg-brand-50 dark:bg-brand-950/20 rounded-xl flex items-center justify-center text-brand-640 dark:text-brand-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Personal Profile</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Configure team credentials</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Status Feedback */}
            {profileSuccess && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold rounded-xl flex items-center gap-2 border border-emerald-100/50 dark:border-emerald-900/30">
                <Check className="w-4 h-4 text-emerald-650" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-[11px] font-semibold rounded-xl flex items-center gap-2 border border-red-100/50 dark:border-red-900/30">
                <AlertCircle className="w-4 h-4 text-red-650" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Full Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 block text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-550" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 block text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 hover:bg-slate-850 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
            >
              Save Profile Values
            </button>
          </form>
        </div>

        {/* Security Password Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm p-6 space-y-6 transition-colors">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-955/25 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Security & Access Keys</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-505 font-medium font-display">Manage login authentication keys</p>
            </div>
          </div>

          <form onSubmit={handleUpdateSecurity} className="space-y-4">
            {/* Security feedback status */}
            {securitySuccess && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold rounded-xl flex items-center gap-2 border border-emerald-100/50 dark:border-emerald-900/30">
                <Check className="w-4 h-4 text-emerald-650" />
                <span>{securitySuccess}</span>
              </div>
            )}
            {securityError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-[11px] font-semibold rounded-xl flex items-center gap-2 border border-red-100/50 dark:border-red-900/30">
                <AlertCircle className="w-4 h-4 text-red-650" />
                <span>{securityError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-710 rounded-xl focus:outline-none focus:border-brand-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 hover:bg-slate-850 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
