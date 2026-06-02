/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, ArrowRight, Lock, Mail, User, Sparkles } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, signup, activeScreen, navigate } = useApp();
  const isSignUp = activeScreen.type === 'signup';

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    // Short simulated delay for realistic feel
    setTimeout(() => {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Name is required.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const success = signup(name, email);
        if (!success) setLoading(false);
      } else {
        const success = login(email);
        if (!success) setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-550 relative overflow-hidden bg-slate-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-100/50 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl opacity-60"></div>
      
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-600 rounded-2xl shadow-lg ring-4 ring-brand-50 mb-4 text-white">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 flex items-center justify-center gap-1">
            TaskFlow
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isSignUp ? 'Create your workspace and start managing tasks.' : 'Centralize your team. Track progress together.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anira Wong"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <label className="text-slate-700">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert("Password recovery simulation: Ready! Simply enter any email to sign in.")}
                    className="text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 disabled:cursor-wait"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-5">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => navigate({ type: 'login' })}
                  className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Sign in instead
                </button>
              </>
            ) : (
              <>
                New to TaskFlow?{' '}
                <button
                  onClick={() => navigate({ type: 'signup' })}
                  className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Subtle quick instruction banner */}
        <div className="mt-4 text-center text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Tip: Enter any email to instantly simulate a workspace login.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
