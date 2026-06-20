/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Users, TrendingUp, UserPlus, ArrowRightLeft, ShieldCheck, Mail, Phone, Award, Globe, Plus, X } from 'lucide-react';
import { Team, User, Candidate, CandidateStatus, AppNotification, ActivityLog, UserRole } from '../types';
import { showToast } from '../utils/toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TeamsViewProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  candidates: Candidate[];
  userRole: string;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
}

export default function TeamsView({
  teams,
  setTeams,
  users,
  setUsers,
  candidates,
  userRole,
  setNotifications,
  setActivityLogs,
}: TeamsViewProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [transferRecruiterId, setTransferRecruiterId] = useState('');
  const [targetTeamId, setTargetTeamId] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  // Compute team aggregates
  const getTeamRoster = (tId: string) => users.filter((u) => u.teamId === tId && u.active);
  const getTeamCandidates = (tId: string) => candidates.filter((c) => c.teamId === tId);
  const getTeamHires = (tId: string) => candidates.filter((c) => c.teamId === tId && c.status === CandidateStatus.HIRED).length;

  const chartData = teams.map((team) => {
    const candidatesCount = getTeamCandidates(team.id).length;
    const activeRecruiters = getTeamRoster(team.id).length;
    const hiresCount = getTeamHires(team.id);
    return {
      name: team.name,
      candidates: candidatesCount,
      recruiterCount: activeRecruiters,
      hires: hiresCount,
    };
  });

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRecruiterId || !targetTeamId) {
      showToast('Kindly select both the targeting recruiter and destined Team.', 'error');
      return;
    }

    const rec = users.find((u) => u.id === transferRecruiterId);
    const targetTeam = teams.find((t) => t.id === targetTeamId);
    const oldTeamId = rec?.teamId;

    if (!rec || !targetTeam) return;

    // Mutate state
    setUsers((prev) =>
      prev.map((u) => (u.id === transferRecruiterId ? { ...u, teamId: targetTeamId } : u))
    );

    // Track activity audit
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'USR001',
      userName: 'Youssef Mansour',
      action: 'RECRUITER_TRANSFER',
      entity: 'User',
      entityId: transferRecruiterId,
      oldValue: `Team: ${oldTeamId}`,
      newValue: `Team: ${targetTeamId}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // Track notification alert
    const newNotif: AppNotification = {
      id: `NOT_TR_${Date.now()}`,
      title: 'Recruiter Transferred',
      message: `${rec.fullName} reallocated to ${targetTeam.name} successfully.`,
      read: false,
      type: 'INFO',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Show success feedback toast
    showToast(`Successfully transferred ${rec.fullName} to ${targetTeam.name}.`, 'success');

    setShowTransferModal(false);
    setTransferRecruiterId('');
    setTargetTeamId('');
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) {
      showToast('Kindly fill in the complete Team name parameter.', 'error');
      return;
    }

    const newTeam: Team = {
      id: `TEAM_NEW_${Date.now()}`,
      name: newTeamName,
      description: newTeamDesc || 'Coached recruitment node matching candidate pipelines',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTeams((prev) => [...prev, newTeam]);

    // Track activity audit
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'USR001',
      userName: 'Youssef Mansour',
      action: 'CREATE_TEAM',
      entity: 'Team',
      entityId: newTeam.id,
      newValue: `Formed new team: ${newTeam.name}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // Alert
    const newNotif: AppNotification = {
      id: `NOT_TEAM_${Date.now()}`,
      title: 'New Recruiter Team Created',
      message: `${newTeam.name} established under FRMS protocols. Manage and match leaders immediately.`,
      read: false,
      type: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Show success feedback toast
    showToast(`Successfully formed and registered new team: ${newTeam.name}.`, 'success');

    setNewTeamName('');
    setNewTeamDesc('');
    setShowAddTeamModal(false);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Title & Add Team actions with customized UI parameters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Teams Organiser Module
          </h2>
          <p className="text-xs text-slate-400">
            Audit team directories, horizontal recruiter counts, converted hires, and perform internal member transfers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 bg-slate-900 border border-slate-700/80 hover:border-blue-500 rounded-xl text-xs text-slate-200 transition-all flex items-center gap-1.5"
          >
            <ArrowRightLeft size={14} className="text-pink-400" /> Transfer Recruiter
          </button>

          <button
            onClick={() => setShowAddTeamModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:brightness-110 rounded-xl text-xs text-white font-bold shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> Establish Team
          </button>
        </div>
      </div>

      {/* THREE CORE TEAM CARDS STATS INDICATORS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        {teams.map((team) => {
          const rosterArr = getTeamRoster(team.id);
          const candsArr = getTeamCandidates(team.id);
          const totalHiresCount = getTeamHires(team.id);
          const successRatio = candsArr.length > 0 ? Math.round((totalHiresCount / candsArr.length) * 100) : 0;
          
          return (
            <div
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className="p-5 rounded-3xl bg-[#111827] border border-[#334155]/60 hover:border-pink-500/50 hover:bg-slate-900/60 hover:shadow-2xl hover:scale-[1.015] duration-300 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group h-60"
            >
              <div className="absolute top-0 right-0 p-2 text-[10px] text-slate-500 font-mono font-bold">
                {team.id}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-blue-500 to-pink-500 shadow-xl animate-pulse"></span>
                  <p className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {team.name}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {team.description}
                </p>
              </div>

              {/* Aggregated indicators */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3.5 mt-3 text-center">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Roster size</span>
                  <span className="text-xs font-bold font-mono text-slate-200 block mt-0.5">{rosterArr.length} Recs</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Candidates</span>
                  <span className="text-xs font-bold font-mono text-slate-200 block mt-0.5">{candsArr.length} files</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-505 uppercase block font-semibold">Conversion</span>
                  <span className="text-xs font-bold font-mono text-emerald-400 block mt-0.5">{successRatio}% Hires</span>
                </div>
              </div>

              {/* Primary action trigger */}
              <div className="w-full py-1.5 bg-slate-900 border border-slate-800/80 group-hover:border-blue-500 rounded-xl text-[10px] uppercase font-bold text-slate-300 text-center mt-4 tracking-wider transition-all group-hover:text-white">
                Inquire Roster
              </div>

            </div>
          );
        })}
      </div>

      {/* PERFORMANCE & DISTRIBUTION ANALYTICS PANEL */}
      <div className="p-6 rounded-3xl bg-[#111827] border border-[#334155]/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Candidate Load & Roster Capacity</h3>
              <p className="text-[10px] text-slate-400 mt-1">Cross-sectional analysis of assigned applicant streams mapped across team nodes.</p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
            Live Stream Distribution
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Chart visualizers */}
          <div className="lg:col-span-2 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  fontFamily="Inter"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="Inter"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0f172a]/95 border border-slate-700 p-3.5 rounded-2xl shadow-xl backdrop-blur-md">
                          <p className="text-xs font-bold text-white mb-2 font-sans">{data.name}</p>
                          <div className="space-y-1 text-[10px] font-mono">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400">Total Candidates:</span>
                              <span className="text-blue-400 font-bold">{data.candidates}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400">Active Recruiters:</span>
                              <span className="text-purple-400 font-bold">{data.recruiterCount}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400">Total Hires:</span>
                              <span className="text-emerald-400 font-bold">{data.hires}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="candidates" 
                  fill="url(#barGrad)" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={48} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick analysis cards stats */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-505 uppercase tracking-widest font-semibold block">Top Performing Node</span>
              {(() => {
                let maxHires = -1;
                let topTeam = null;
                teams.forEach((t) => {
                  const hc = getTeamHires(t.id);
                  if (hc > maxHires) {
                    maxHires = hc;
                    topTeam = t;
                  }
                });
                return topTeam ? (
                  <div className="mt-1.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-200">{topTeam.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Accelerated flow</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {maxHires} Hires
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">Data unresolved</p>
                );
              })()}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-505 uppercase tracking-widest font-semibold block">System Workload Distribution</span>
              <div className="mt-2 space-y-1.5">
                {teams.map((t) => {
                  const totalCandidates = candidates.length;
                  const teamCandidates = getTeamCandidates(t.id).length;
                  const ratio = totalCandidates > 0 ? Math.round((teamCandidates / totalCandidates) * 100) : 0;
                  return (
                    <div key={t.id} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium truncate max-w-[120px]">{t.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-pink-500 h-full rounded-full" style={{ width: `${ratio}%` }}></div>
                        </div>
                        <span className="text-slate-300 font-bold font-mono">{ratio}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED DRILLDOWN: ROSTER LIST VIEW AS INTERACTIVE OVERLAY MODAL */}
      {selectedTeam && (
        <div 
          onClick={() => setSelectedTeam(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto cursor-default"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111827] border border-slate-700/60 rounded-3xl w-full max-w-4xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-hidden"
          >
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-6 right-6 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X size={18} />
            </button>

            <div className="border-b border-slate-800 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Layers size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">{selectedTeam.name} Performance Dashboard</h3>
                  <p className="text-xs text-slate-400 mt-1">Detailed directory of active recruiters and individual candidate pipeline workloads.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                  Roster Node ID: {selectedTeam.id}
                </span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/25 px-3 py-1.5 rounded-lg font-bold">
                  {getTeamRoster(selectedTeam.id).length} Active Recruiters
                </span>
              </div>
            </div>

            {/* Quick Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Active files</span>
                <span className="text-xl font-bold font-mono text-slate-100 block mt-1">
                  {getTeamCandidates(selectedTeam.id).length} Candidate Pipelines
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-505 uppercase font-semibold block">Confirmed Hires</span>
                <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">
                  {getTeamHires(selectedTeam.id)} Success cases
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-505 uppercase font-semibold block">Cluster conversion rate</span>
                <span className="text-xl font-bold font-mono text-purple-400 block mt-1">
                  {(() => {
                    const cands = getTeamCandidates(selectedTeam.id).length;
                    const hires = getTeamHires(selectedTeam.id);
                    return cands > 0 ? Math.round((hires / cands) * 100) : 0;
                  })()}%
                </span>
              </div>
            </div>

            {/* Roster & Workload Directory Table wrapper */}
            <div className="overflow-y-auto flex-1 pr-1 bg-slate-900/20 rounded-2xl border border-slate-800/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 sticky top-0 z-10">
                  <tr>
                    <th className="p-4">Recruiter Profile</th>
                    <th className="p-4">Code Identifier</th>
                    <th className="p-4">Payout Account</th>
                    <th className="p-4">Candidate Workload Map</th>
                    <th className="p-4 text-right">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {getTeamRoster(selectedTeam.id).map((member) => {
                    const itemsCount = candidates.filter((c) => c.recruiterId === member.id).length;
                    
                    // Determine custom workload status
                    let loadText = "Idle / Idle";
                    let loadColor = "text-slate-500 bg-slate-500/10 border-slate-500/10";
                    let loadPercent = 0;

                    if (itemsCount >= 10) {
                      loadText = "Matured Capacity";
                      loadColor = "text-red-400 bg-red-400/10 border-red-400/20";
                      loadPercent = 100;
                    } else if (itemsCount >= 6) {
                      loadText = "Heavy workload";
                      loadColor = "text-amber-400 bg-amber-400/10 border-amber-400/20";
                      loadPercent = Math.min(100, Math.round((itemsCount / 10) * 100));
                    } else if (itemsCount >= 2) {
                      loadText = "Optimal speed";
                      loadColor = "text-blue-400 bg-blue-500/10 border-blue-500/15";
                      loadPercent = Math.min(100, Math.round((itemsCount / 10) * 100));
                    } else if (itemsCount > 0) {
                      loadText = "Available / Low";
                      loadColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/15";
                      loadPercent = 10;
                    }

                    return (
                      <tr key={member.id} className="hover:bg-slate-800/25 transition-all">
                        <td className="p-4">
                          <div className="font-bold text-slate-100 flex items-center gap-2">
                            {member.fullName}
                            {member.id === selectedTeam.leaderId ? (
                              <span className="text-[8px] font-mono bg-pink-500/15 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20 font-bold tracking-wider">
                                LEADER
                              </span>
                            ) : (
                              <span className="text-[8px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-700/60">
                                MEMBER
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">{member.email}</div>
                        </td>
                        <td className="p-4 font-mono text-blue-400 font-bold">{member.recruiterCode || 'N/A'}</td>
                        <td className="p-4 font-mono text-slate-400">{member.paymentMethod || 'Vodafone Cash'}</td>
                        <td className="p-4">
                          <div className="space-y-1.5 min-w-[150px]">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-200 font-bold font-mono">{itemsCount} pipelines</span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[8px] uppercase tracking-wider font-semibold border ${loadColor}`}>
                                {loadText}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-pink-500 h-full rounded-full transition-all duration-300" 
                                style={{ width: `${loadPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-mono text-slate-400">{member.joinDate}</td>
                      </tr>
                    );
                  })}

                  {getTeamRoster(selectedTeam.id).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500 font-medium my-4 select-none">
                        No active recruiters registered in this selected roster yet. Use the internal Transfer utility to populate nodes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
              <span className="text-[10px] text-slate-500">Click anywhere on the backdrop or use ESC button to dismiss overlay window.</span>
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold select-none transition-all"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: MOVE/TRANSFER RECRUITERS PROCESS */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#334155] rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowTransferModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <ArrowRightLeft size={15} className="text-pink-400 animate-pulse" />
              Transfer Recruiter Node
            </h3>
            
            <p className="text-[11px] text-slate-400 mb-5 leading-normal">
              Change team affinity directories for active recruitment matching. Form 2 applications referred will realign automatically.
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Recruiter Account</label>
                <select
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                  value={transferRecruiterId}
                  onChange={(e) => setTransferRecruiterId(e.target.value)}
                >
                  <option value="">-- Choose Recruiter --</option>
                  {users
                    .filter((u) => u.role === UserRole.RECRUITER)
                    .map((rec) => (
                      <option key={rec.id} value={rec.id}>{rec.fullName} ({rec.recruiterCode})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination Team Team</label>
                <select
                  required
                  className="w-full bg-[#111827] border border-slate-750 rounded-xl p-2.5 text-xs text-slate-100"
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(e.target.value)}
                >
                  <option value="">-- Choose Target Team --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md glow-btn-primary mt-2"
              >
                Apply Transfer Reallocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM/CREATE NEW RECRUITMENT TEAM */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#334155] rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddTeamModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Layers size={15} className="text-blue-400" />
              Establish Recruitment Team
            </h3>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div className="text-xs">
                <label className="block text-slate-300 font-semibold mb-1.5">Roster/Team Name *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  placeholder="Team Habiba, Christen etc"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="text-xs">
                <label className="block text-[#CBD5E1] font-semibold mb-1.5">Description Goal</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 h-20 resize-none text-xs"
                  placeholder="Coached language expertise, high-volume tier-1 support roles..."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md glow-btn-primary mt-2"
              >
                Assemble Team Node
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
