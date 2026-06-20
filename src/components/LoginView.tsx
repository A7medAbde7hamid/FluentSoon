/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, CheckCircle, ShieldCheck, HelpCircle, Key, ArrowRight, Zap, X } from 'lucide-react';
import { UserRole } from '../types';

interface LoginViewProps {
  onLoginSuccess: (role: UserRole, userName: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Built-in credentials mock lists
  const credentialsMock = [
    { role: UserRole.SUPER_ADMIN, email: 'admin@fluent.com', name: 'Youssef Mansour' },
    { role: UserRole.OWNER, email: 'owner@fluent.com', name: 'Sherif El-Deeb' },
    { role: UserRole.TEAM_LEADER, email: 'pola@fluent.com', name: 'Pola Marcos (Team Pola)' },
    { role: UserRole.RECRUITER, email: 'fatma@fluent.com', name: 'Fatma Aly (Recruiter)' },
    { role: UserRole.HIRING_MANAGER, email: 'khaled@fluent.com', name: 'Khaled Amer (Hiring Mgr)' },
    { role: UserRole.DEVELOPER, email: 'developer@fluent.com', name: 'Tarek Ibrahim (Developer)' },
  ];

  const handleQuickLogin = (emailMock: string, name: string, role: UserRole) => {
    setEmail(emailMock);
    setPassword('••••••••••••');
    setErrorMessage('');
    // Simulate immediate access
    setTimeout(() => {
      onLoginSuccess(role, name);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both administrative credentials.');
      return;
    }

    // Match against mock
    const match = credentialsMock.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (match) {
      onLoginSuccess(match.role, match.name);
    } else {
      setErrorMessage('Invalid credentials. Use the developer playground chips below for instant secure logins.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] bento-dot-grid flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Neon Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#4f46e5]/5 blur-[140px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Logo Banner */}
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-[#4f46e5] to-pink-500 text-white font-black text-2xl tracking-widest shadow-2xl relative">
            F
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 border-2 border-[#030712] animate-ping"></span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">FLUENT</h1>
            <p className="text-[10px] font-mono tracking-[0.2em] text-indigo-400 font-bold uppercase mt-1">Recruitment Engine</p>
          </div>
        </div>
        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          Sign in to your dashboard
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400">
          Enter credentials or choose an administrative mock role below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bento-card sm:px-10 py-8 shadow-2xl bg-slate-900/40 border-white/5 relative overflow-hidden">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Email field with extra left layout padding */}
            <div>
              <label htmlFor="email-login" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Corporate Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 border-r border-slate-800 pr-3">
                  <Mail size={16} />
                </div>
                <input
                  id="email-login"
                  type="email"
                  required
                  className="block w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:placeholder-slate-600 focus:text-white transition-all font-sans"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password field with dynamic placement */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password-login" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Password Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 border-r border-slate-800 pr-3">
                  <Lock size={16} />
                </div>
                <input
                  id="password-login"
                  type="password"
                  required
                  className="block w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:placeholder-slate-600 focus:text-white transition-all font-sans"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Me selection container */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  id="remember-me-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-500 bg-slate-950 border-slate-800 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors select-none">
                  Remember my session
                </span>
              </label>

              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                V1.2 PRO
              </span>
            </div>

            {/* Submit layout button with full wrapper width */}
            <button
              id="login-submit-button"
              type="submit"
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-xl glow-btn-primary tracking-wide flex items-center justify-center gap-2 transition-all mt-3"
            >
              Authorize Secure Connection
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Secure details card inside the sheet */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center gap-2.5 text-slate-500 text-[10px] justify-center">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Encrypted with SHA-256 local mock authorization</span>
          </div>

        </div>

        {/* Developer Sandbox Quick-Identity Panel */}
        <div className="mt-8 bg-slate-900/20 p-5 rounded-3xl border border-white/5 text-center">
          <div className="flex items-center justify-center gap-2 mb-3.5">
            <Zap size={14} className="text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Demo Identity Playground
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 mb-4 leading-normal">
            Select one of the simulated credential node chips below to immediately authenticate and inspect custom features.
          </p>
          
          <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
            {credentialsMock.map((cred) => (
              <button
                id={`quick-login-${cred.role}`}
                key={cred.role}
                onClick={() => handleQuickLogin(cred.email, cred.name, cred.role)}
                className="p-3 rounded-2xl border border-white/5 hover:border-indigo-500/50 bg-slate-900/40 hover:bg-slate-950/80 transition-all text-left flex flex-col justify-between min-w-0 group"
              >
                <span className="text-[10px] font-bold text-slate-200 group-hover:text-indigo-300 truncate block">
                  {cred.name.split(' ')[0]} {cred.name.split(' ')[1] || ''}
                </span>
                <span className="text-[9px] font-mono text-indigo-400/80 uppercase font-bold tracking-tight block mt-1">
                  {cred.role.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-800/85 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Key size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Password Recovery</h4>
                  <p className="text-[10px] font-mono text-slate-500">Demo environment</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This is a demo system. All credentials are pre-configured. Use the credential chips below to log in instantly with any role. No password reset is required.
            </p>
            <div className="flex flex-wrap gap-2">
              {credentialsMock.map((cred) => (
                <span
                  key={cred.role}
                  className="text-[10px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                >
                  {cred.email}
                </span>
              ))}
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
