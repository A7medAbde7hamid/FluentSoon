/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  GraduationCap,
  FileSpreadsheet,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
  UserCheck2,
  Building,
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  userRole: UserRole;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile,
  userRole,
}: SidebarProps) {
  // Navigation elements
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: Object.values(UserRole) },
    { id: 'candidates', label: 'Candidates CRM', icon: Users, roles: Object.values(UserRole) },
    { id: 'recruiters', label: 'Recruiters', icon: UserCheck2, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.TEAM_LEADER] },
    { id: 'teams', label: 'Teams Organiser', icon: Layers, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.TEAM_LEADER] },
    { id: 'companies', label: 'Companies', icon: Building, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.TEAM_LEADER, UserRole.HIRING_MANAGER] },
    { id: 'offers', label: 'Comp Offers', icon: Briefcase, roles: Object.values(UserRole) },
    { id: 'academy', label: 'Academy & course', icon: GraduationCap, roles: [UserRole.SUPER_ADMIN, UserRole.OWNER, UserRole.TEAM_LEADER, UserRole.DEVELOPER] },
    { id: 'forms', label: 'External Web Forms', icon: FileSpreadsheet, roles: Object.values(UserRole) },
    { id: 'developer', label: 'Dev console', icon: Terminal, roles: [UserRole.SUPER_ADMIN, UserRole.DEVELOPER] },
  ];

  // Filter items matching role
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsOpenMobile(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#030712] text-slate-100 border-r border-white/5">
      {/* Brand Header */}
      <div className="h-[72px] flex items-center justify-between px-5 border-b border-white/5 bg-[#030712]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-indigo-600 to-pink-500 text-white font-bold text-lg tracking-wider shadow-inner">
            F
          </div>
          {!isCollapsed && (
            <div className="flex flex-col select-none">
              <span className="font-sans font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-indigo-300">
                FLUENT
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#6366f1] font-bold">
                RMS CORE
              </span>
            </div>
          )}
        </div>

        {/* Toggle Collapse on Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg border border-slate-800 hover:border-indigo-500 hover:bg-slate-900 transition-all text-slate-400 hover:text-slate-200"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          id="desktop-sidebar-toggle"
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Active User Small Indicator Card */}
      {!isCollapsed && (
        <div className="mx-4 mt-5 p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 p-[2px] shadow-sm">
            <div className="w-full h-full bg-[#030712] rounded-full overflow-hidden flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-400 select-none">
                {userRole.substring(0, 2)}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              Simulated Node
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                {userRole.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav Menu Lists */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto hide-scrollbar">
        {visibleItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm transition-all relative group ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 font-medium'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/30'
              }`}
            >
              <IconComponent
                size={18}
                className={`flex-shrink-0 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {(!isCollapsed || isOpenMobile) && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {/* Tooltip on Icon-only Hover state */}
              {isCollapsed && !isOpenMobile && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-950 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-xl border border-slate-800">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Academy Sponsorship Accent banner */}
      {!isCollapsed && (
        <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-tr from-purple-950/40 via-blue-950/20 to-pink-950/20 border border-purple-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1 bg-purple-500/10 rounded-bl-xl text-[9px] text-[#EC4899] font-mono">
            V1.2
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={13} className="text-pink-400" />
            <h4 className="text-xs font-bold text-pink-300">Fluent Academy</h4>
          </div>
          <p className="text-[10px] text-slate-300 leading-normal">
            Automating standard Google Sheets conversion since 2026.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Slide Panel */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden" onClick={() => setIsOpenMobile(false)}>
          <div
            className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-[#050816] shadow-2xl transition-transform duration-300 transform translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar wrapper */}
      <div
        className={`hidden lg:block h-screen fixed top-0 left-0 bottom-0 max-h-screen pt-0 select-none transition-all duration-300 z-35 ${
          isCollapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        {navContent}
      </div>
    </>
  );
}
