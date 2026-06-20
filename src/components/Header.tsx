/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Globe,
  Settings,
  ShieldCheck,
  Zap,
  Menu,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { UserRole, AppNotification, User } from '../types';

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  notifications: AppNotification[];
  setNotifications: (notifs: AppNotification[]) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  selectedUserName: string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  users?: User[];
}

export default function Header({
  userRole,
  setUserRole,
  notifications,
  setNotifications,
  isOpenMobile,
  setIsOpenMobile,
  selectedUserName,
  theme = 'dark',
  setTheme,
  users = [],
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setShowRoleDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Human-readable labels for credential switcher
  const roleLabels: { [key in UserRole]: { label: string; desc: string; color: string } } = {
    [UserRole.SUPER_ADMIN]: {
      label: 'Super Admin',
      desc: 'System Configuration',
      color: 'from-blue-500 to-indigo-500',
    },
    [UserRole.OWNER]: {
      label: 'Owner Account',
      desc: 'View Executive KPIs',
      color: 'from-purple-500 to-pink-500',
    },
    [UserRole.TEAM_LEADER]: {
      label: 'Team Leader',
      desc: 'Form approving & Performance',
      color: 'from-pink-500 to-rose-500',
    },
    [UserRole.RECRUITER]: {
      label: 'Recruiter',
      desc: 'Apply Form 2 Link tracker',
      color: 'from-sky-400 to-sky-600',
    },
    [UserRole.HIRING_MANAGER]: {
      label: 'Hiring Manager',
      desc: 'Pre-screens & calendars',
      color: 'from-amber-400 to-amber-600',
    },
    [UserRole.DEVELOPER]: {
      label: 'Developer Desk',
      desc: 'Database & System Health',
      color: 'from-emerald-400 to-teal-600',
    },
  };

  return (
    <header className="h-[72px] bg-slate-950/60 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Search Input and Mobile Menu toggle */}
      <div className="flex items-center gap-4 flex-1 max-w-md lg:max-w-lg">
        {/* Mobile Hamburger burger selector toggle */}
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          id="mobile-drawer-toggle"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        {/* Search bar with absolute spacing to prevent overlapping inputs */}
        <div className="relative w-full hidden sm:block">
          {/* Magnifying Glass Icon positioned absolutely with left spacer */}
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            id="global-search-input"
            type="text"
            className="w-full bg-slate-900/40 block text-slate-200 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs placeholder-slate-400 focus:text-white focus:placeholder-slate-500 transition-all focus:bg-slate-950"
            placeholder="Search candidates, recruiters, active offers, course students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Header Actions Panel */}
      <div className="flex items-center gap-3">
        
        {/* Fast Credential Switcher Dropdown (Playground Tool) */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            id="role-switcher-dropdown"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 focus:ring-1 focus:ring-blue-500 text-slate-100 transition-all"
            title="Demo Playground Switcher"
          >
            <Zap size={14} className="text-pink-400 animate-pulse" />
            <div className="text-left hidden md:block">
              <span className="text-[10px] block font-mono text-slate-400 leading-none">DEMO IDENTITY</span>
              <span className="text-xs font-bold text-blue-400">{roleLabels[userRole].label}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={11} className="text-pink-400" /> Choose Role Perspective
                </p>
                <p className="text-[10px] text-slate-500">Allows direct inspection of customized permissions dashboards.</p>
              </div>
              <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
                {Object.values(UserRole).map((role) => (
                  <button
                    id={`role-select-${role}`}
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 ${
                      userRole === role
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-tr ${roleLabels[role].color}`}></span>
                    <div>
                      <div className="font-semibold">{roleLabels[role].label}</div>
                      <div className="text-[10px] opacity-70 font-mono">{roleLabels[role].desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon and dropdown Drawer */}
        <div className="relative" ref={notificationRef}>
          <button
            id="notifications-bell-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 flex items-center justify-center text-slate-300 hover:text-slate-100 transition-all relative"
            title="Notifications Board"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-bold text-slate-200">Live system events</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Mark as read
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="text-[10px] font-semibold text-rose-400 hover:text-rose-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-800/80">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                    <Zap size={20} className="opacity-40" />
                    <span>No notifications yet. Let recruiters submit Form 2!</span>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 text-xs transition-all ${
                        notif.read ? 'bg-slate-900/10' : 'bg-slate-900/80 border-r-2 border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-slate-300">
                        <span className="font-bold flex items-center gap-1">
                          {notif.type === 'SUCCESS' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                          {notif.type === 'WARNING' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                          {notif.type === 'ALERT' && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                          {notif.type === 'INFO' && <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>}
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-slate-900/60 p-2.5 text-center border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">FLUENT SAAS RMS CONTROLLER</span>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            const next = theme === 'dark' ? 'light' : 'dark';
            setTheme(next);
            localStorage.setItem('frms_v1_theme', next);
          }}
          className="w-10 h-10 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 items-center justify-center text-slate-300 hover:text-slate-100 transition-all hidden sm:flex"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          id="theme-toggle"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Profile details */}
        <div
          className="flex items-center gap-2 border-l border-slate-800 pl-3 cursor-pointer hover:bg-slate-800/40 py-1 pr-2 rounded-xl transition-all"
          onClick={() => setShowProfileModal(true)}
        >
          <div className="h-9 w-9 rounded-full bg-slate-800 overflow-hidden border border-slate-700 select-none cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120"
              alt="User profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-200 leading-tight">
              {selectedUserName}
            </p>
            <p className="text-[10px] font-mono text-blue-400 capitalize">
              {userRole.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>

      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowProfileModal(false)}>
          <div className="bg-[#111827] border border-slate-800/85 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">User Profile</h4>
                  <p className="text-[10px] font-mono text-slate-500">Account details</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 p-[3px] mb-3">
                <div className="w-full h-full bg-[#030712] rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-100">{selectedUserName}</h3>
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wide mt-0.5">{userRole.replace('_', ' ')}</span>
            </div>

            <div className="space-y-3 bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Email</span>
                <span className="text-slate-200 font-mono">{(() => {
                  const u = users.find((x) => x.fullName === selectedUserName);
                  return u?.email || `${userRole.toLowerCase()}@fluent.com`;
                })()}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-800/50 pt-3">
                <span className="text-slate-400">Phone</span>
                <span className="text-slate-200 font-mono">{(() => {
                  const u = users.find((x) => x.fullName === selectedUserName);
                  return u?.phone || '+20 100 000 0000';
                })()}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-800/50 pt-3">
                <span className="text-slate-400">Role</span>
                <span className="text-slate-200 font-mono font-bold text-indigo-400">{userRole}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-800/50 pt-3">
                <span className="text-slate-400">Joined</span>
                <span className="text-slate-200 font-mono">{(() => {
                  const u = users.find((x) => x.fullName === selectedUserName);
                  return u?.joinDate || '2024-01-01';
                })()}</span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
