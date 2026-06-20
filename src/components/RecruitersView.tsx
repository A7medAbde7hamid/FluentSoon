/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  Layers,
  Award,
  Check,
  X,
  CreditCard,
  Calendar,
  Sparkles,
  UserCheck2,
  Trash2,
  ArrowRightLeft,
  Users,
} from 'lucide-react';
import { User, Team, Candidate, CandidateStatus, AppNotification, ActivityLog, UserRole } from '../types';
import { showToast, showConfirm } from '../utils/toast';

interface RecruitersViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  teams: Team[];
  candidates: Candidate[];
  userRole: UserRole;
  recruiterFormApplicationRequests: any[];
  setRecruiterFormApplicationRequests: React.Dispatch<React.SetStateAction<any[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
}

export default function RecruitersView({
  users,
  setUsers,
  teams,
  candidates,
  userRole,
  recruiterFormApplicationRequests,
  setRecruiterFormApplicationRequests,
  setNotifications,
  setActivityLogs,
}: RecruitersViewProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<User | null>(null);

  // New Recruiter Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTeamId, setNewTeamId] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newPayment, setNewPayment] = useState('');

  // Edit Recruiter Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTeamId, setEditTeamId] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editPayment, setEditPayment] = useState('');

  // Helper to retrieve active recruiters
  const recruitersList = useMemo(() => {
    return users.filter((u) => u.role === UserRole.RECRUITER);
  }, [users]);

  // Compute stats
  const stats = useMemo(() => {
    const total = recruitersList.length;
    const active = recruitersList.filter((r) => r.active).length;
    const inactive = total - active;
    
    // Candidates assigned to recruiters
    const activeRecruiterIds = recruitersList.map((r) => r.id);
    const recruiterCandidates = candidates.filter((c) => activeRecruiterIds.includes(c.recruiterId));
    const hiredCount = recruiterCandidates.filter((c) => c.status === CandidateStatus.HIRED).length;

    // Find star recruiter (most hired candidates)
    let starRecruiterName = 'None yet';
    let maxHired = 0;
    
    recruitersList.forEach((r) => {
      const rHired = candidates.filter((c) => c.recruiterId === r.id && c.status === CandidateStatus.HIRED).length;
      if (rHired > maxHired) {
        maxHired = rHired;
        starRecruiterName = r.fullName;
      }
    });

    return { total, active, inactive, candidateCount: recruiterCandidates.length, hiredCount, starRecruiterName, starRecruiterHires: maxHired };
  }, [recruitersList, candidates]);

  // Handle Search & Filter logic
  const filteredRecruiters = useMemo(() => {
    return recruitersList.filter((rec) => {
      const matchesSearch =
        rec.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.phone.includes(searchQuery) ||
        (rec.email && rec.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rec.recruiterCode && rec.recruiterCode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTeam = teamFilter === 'ALL' ? true : rec.teamId === teamFilter;
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
          ? rec.active
          : !rec.active;

      return matchesSearch && matchesTeam && matchesStatus;
    });
  }, [recruitersList, searchQuery, teamFilter, statusFilter]);

  // Actions
  const handleToggleStatus = (rec: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === rec.id ? { ...u, active: !u.active } : u))
    );

    const log: ActivityLog = {
      id: `LOG_TOGGLE_${Date.now()}`,
      userId: 'ADMIN',
      userName: 'Administrator Node',
      action: 'RECRUITER_STATUS_TOGGLE',
      entity: 'User',
      entityId: rec.id,
      newValue: `Active: ${!rec.active}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [log, ...prev]);

    const notif: AppNotification = {
      id: `NOT_TOG_${Date.now()}`,
      title: 'Recruiter Status Changed',
      message: `${rec.fullName} is now ${!rec.active ? 'Active' : 'Suspended'}.`,
      read: false,
      type: rec.active ? 'WARNING' : 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleCreateRecruiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      showToast('Kindly provide at least the recruiter full name and phone number.', 'warning');
      return;
    }

    const proposedCode = newCode || `REC${Math.floor(100 + Math.random() * 900)}`;

    const newRec: User = {
      id: `USR_REP_${Date.now()}`,
      fullName: newName,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@fluent.com`,
      phone: newPhone,
      role: UserRole.RECRUITER,
      teamId: newTeamId || undefined,
      active: true,
      avatar: `https://images.unsplash.com/photo-${1535713875000 + Math.floor(Math.random() * 9999)}?w=150`,
      paymentMethod: newPayment || 'Vodafone Cash',
      recruiterCode: proposedCode,
      joinDate: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newRec, ...prev]);

    // Track
    const log: ActivityLog = {
      id: `LOG_ADD_REC_${Date.now()}`,
      userId: 'ADMIN',
      userName: 'Administrator Node',
      action: 'CREATE_RECRUITER_ROSTER',
      entity: 'User',
      entityId: newRec.id,
      newValue: `Created profile for ${newRec.fullName}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [log, ...prev]);

    const notif: AppNotification = {
      id: `NOT_ADD_${Date.now()}`,
      title: 'Manual Recruiter Registration',
      message: `${newRec.fullName} registered manually under code ${proposedCode}.`,
      read: false,
      type: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    // Show success toast feedback
    showToast(`Successfully registered new recruiter profile for ${newName}.`, 'success');

    // Reset fields
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewTeamId('');
    setNewCode('');
    setNewPayment('');
    setShowAddModal(false);
  };

  const handleEditClick = (rec: User) => {
    setSelectedRecruiter(rec);
    setEditName(rec.fullName);
    setEditEmail(rec.email || '');
    setEditPhone(rec.phone || '');
    setEditTeamId(rec.teamId || '');
    setEditCode(rec.recruiterCode || '');
    setEditPayment(rec.paymentMethod || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecruiter) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedRecruiter.id
          ? {
              ...u,
              fullName: editName,
              email: editEmail,
              phone: editPhone,
              teamId: editTeamId || undefined,
              recruiterCode: editCode,
              paymentMethod: editPayment,
            }
          : u
      )
    );

    const log: ActivityLog = {
      id: `LOG_UPD_REC_${Date.now()}`,
      userId: 'ADMIN',
      userName: 'Administrator',
      action: 'UPDATE_RECRUITER_ROSTER',
      entity: 'User',
      entityId: selectedRecruiter.id,
      newValue: `Updated details of recruiter ${editName}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [log, ...prev]);

    const notif: AppNotification = {
      id: `NOT_UPD_${Date.now()}`,
      title: 'Recruiter Profile Updated',
      message: `Profile parameters for ${editName} have been committed successfully.`,
      read: false,
      type: 'INFO',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    setShowEditModal(false);
    setSelectedRecruiter(null);
  };

  const handleDeleteRecruiter = (rec: User) => {
    showConfirm(
      `Are you absolutely sure you want to release recruiter ${rec.fullName} from the platform stack? This action is irreversible.`,
      () => {
        setUsers((prev) => prev.filter((u) => u.id !== rec.id));

        const log: ActivityLog = {
          id: `LOG_DEL_${Date.now()}`,
          userId: 'ADMIN',
          userName: 'Administrator Node',
          action: 'DELETE_RECRUITER_PROFILE',
          entity: 'User',
          entityId: rec.id,
          newValue: `Permanently removed ${rec.fullName}`,
          ipAddress: '197.34.201.55',
          createdAt: new Date().toISOString(),
        };
        setActivityLogs((prev) => [log, ...prev]);

        const notif: AppNotification = {
          id: `NOT_DEL_${Date.now()}`,
          title: 'Recruiter Removed',
          message: `${rec.fullName} was released from active team rosters.`,
          read: false,
          type: 'WARNING',
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notif, ...prev]);

        showToast(`Successfully released recruiter ${rec.fullName} from the platform active stack.`, 'success');
      },
      'Release Recruiter Profile'
    );
  };

  const handleApproveForm1App = (req: any) => {
    // Approve applicant Form 1
    setRecruiterFormApplicationRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'APPROVED' } : r))
    );

    const generatedCode = `REC${Math.floor(100 + Math.random() * 900)}`;

    const newRec: User = {
      id: `USR_NEW_APP_${Date.now()}`,
      fullName: req.fullName,
      email: `${req.fullName.toLowerCase().replace(/\s+/g, '')}@fluent.com`,
      phone: req.phone,
      role: UserRole.RECRUITER,
      teamId: teams[0]?.id || 'TEAM001', // Onboarding or first registered team
      active: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      paymentMethod: req.paymentMethod || 'Vodafone Cash',
      recruiterCode: generatedCode,
      joinDate: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newRec, ...prev]);

    // Track in logs and notifications
    const log: ActivityLog = {
      id: `LOG_APPROVE_${Date.now()}`,
      userId: 'ADMIN',
      userName: 'Admin Node',
      action: 'APPROVE_RECRUITER_APPLICATION',
      entity: 'User',
      entityId: newRec.id,
      newValue: `Approved application: ${newRec.fullName}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [log, ...prev]);

    const notif: AppNotification = {
      id: `NOT_APP_${Date.now()}`,
      title: 'Application Approved',
      message: `${req.fullName} registered as Recruiter with code ${generatedCode}.`,
      read: false,
      type: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Get recruiter count of candidates
  const getCandidateCount = (rId: string) => {
    return candidates.filter((c) => c.recruiterId === rId).length;
  };

  const getHiresCount = (rId: string) => {
    return candidates.filter((c) => c.recruiterId === rId && c.status === CandidateStatus.HIRED).length;
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck2 size={22} className="text-indigo-400" />
            Recruiter Network Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit codes, allocation matrices, and onboarding queues for active marketing partners.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={14} /> Add Recruiter Node
        </button>
      </div>

      {/* KPI Stats Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <UserCheck2 size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">Total Partners</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{stats.total}</div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Users size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">Active CRM Nodes</div>
            <div className="text-xl font-extrabold text-white mt-0.5">
              {stats.active} <span className="text-xs font-normal text-slate-500">/ {stats.inactive} susp.</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
            <Award size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">Total Hires (CPM)</div>
            <div className="text-xl font-extrabold text-white mt-0.5">
              {stats.hiredCount} <span className="text-xs font-normal text-slate-500">({stats.candidateCount} leads)</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Sparkles size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">Star Team Recruiter</div>
            <div className="text-xs font-bold text-white mt-0.5 truncate">{stats.starRecruiterName}</div>
            <div className="text-[9px] text-purple-300 font-mono flex items-center gap-1 mt-0.5">
              {stats.starRecruiterHires > 0 ? `${stats.starRecruiterHires} Hired leads` : '0 Hired leads'}
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter Applications from Form 1 (Onboard Stream Queue) */}
      {recruiterFormApplicationRequests.filter((r) => r.status === 'PENDING').length > 0 && (
        <div className="p-6 bg-[#0f172a]/60 border border-blue-500/20 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Recruiter Entrance Lobby (Pending Approvals)
              </h3>
              <p className="text-[10px] text-slate-400">
                Incoming candidates registered via recruitment requests. Turn their requests into full active codes.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg">
              {recruiterFormApplicationRequests.filter((r) => r.status === 'PENDING').length} applications
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recruiterFormApplicationRequests
              .filter((r) => r.status === 'PENDING')
              .map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{req.fullName}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1 truncate">
                        <Phone size={10} className="text-slate-500" /> {req.phone}
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <CreditCard size={10} className="text-slate-500" /> {req.paymentMethod}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApproveForm1App(req)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-white rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all"
                  >
                    <Check size={11} /> Onboard Roster
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Primary search & results card */}
      <div className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search recruiter name, mobile, activation code, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200 transition-all placeholder-slate-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#030712] border border-slate-800 rounded-xl px-2.5 py-1">
              <Layers size={12} className="text-slate-500" />
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="bg-transparent text-slate-300 text-xs py-1 border-none focus:outline-none focus:ring-0 max-w-[140px]"
              >
                <option value="ALL">All Teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#030712] border border-slate-800 rounded-xl px-2.5 py-1">
              <Filter size={12} className="text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-300 text-xs py-1 border-none focus:outline-none focus:ring-0"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Code</option>
                <option value="INACTIVE">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Output Grid */}
        {filteredRecruiters.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs space-y-1 bg-[#030712]/30 rounded-xl border border-dashed border-slate-800">
            <div>No matching recruiters detected.</div>
            <div className="text-[10px] text-slate-600">Try cleaning search filters or register a new agent.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecruiters.map((rec) => {
              const teamRecord = teams.find((t) => t.id === rec.teamId);
              const totalLeads = getCandidateCount(rec.id);
              const hiresCount = getHiresCount(rec.id);

              return (
                <div
                  key={rec.id}
                  className={`p-4 bg-slate-950/40 rounded-2xl border transition-all hover:border-slate-700/60 flex flex-col justify-between gap-4 ${
                    rec.active ? 'border-white/5' : 'border-red-950/40 opacity-70 bg-gradient-to-br from-slate-950/40 to-red-950/5'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header profile card info */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={rec.avatar}
                          alt={rec.fullName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-slate-800 flex-shrink-0 object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{rec.fullName}</h4>
                          <span className="text-[9px] font-mono text-slate-400">Join Date: {rec.joinDate}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {rec.active ? (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/20 uppercase font-bold">
                            Suspended
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold mt-1 shadow-sm">
                          {rec.recruiterCode || 'N/A Code'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Table Rows */}
                    <div className="p-2.5 bg-slate-900/30 rounded-xl space-y-2 border border-slate-800/50 text-[11px]">
                      {/* Team name row */}
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 font-medium">Performance Team:</span>
                        <span className="font-semibold text-slate-200">
                          {teamRecord ? teamRecord.name : 'Unassigned Pool'}
                        </span>
                      </div>

                      {/* Contact row */}
                      <div className="flex flex-col gap-1 border-t border-slate-800/60 pt-2 text-[10px] font-mono text-slate-400 mt-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone size={11} className="text-slate-600 shrink-0" />
                          <span>{rec.phone || 'No Phone'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate mt-0.5">
                          <Mail size={11} className="text-slate-600 shrink-0" />
                          <span>{rec.email || 'No Email'}</span>
                        </div>
                      </div>

                      {/* Payment Method details */}
                      <div className="border-t border-slate-800/60 pt-2 mt-1.5">
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono leading-tight bg-slate-900/50 px-2 py-1 rounded border border-slate-850">
                          <CreditCard size={10} className="text-indigo-400 shrink-0" />
                          <span className="truncate" title={rec.paymentMethod}>
                            Payout: {rec.paymentMethod || 'None saved'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Funnel Statistics display */}
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                        <div className="text-slate-500 font-bold uppercase text-[8px]">Inflow Leads</div>
                        <div className="text-xs font-bold text-slate-300 mt-0.5">{totalLeads} total</div>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                        <div className="text-slate-500 font-bold uppercase text-[8px]">Hired Results</div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">{hiresCount} hired</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer tools */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-[11px] shrink-0">
                    <button
                      onClick={() => handleToggleStatus(rec)}
                      className={`flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer text-xs ${
                        rec.active ? 'text-slate-400 hover:text-amber-400' : 'text-emerald-400'
                      }`}
                      title={rec.active ? 'Suspend Recruiter' : 'Activate Recruiter'}
                    >
                      {rec.active ? (
                        <>
                          <ToggleRight className="text-emerald-400" size={16} /> Disable
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="text-slate-500" size={16} /> Enable
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(rec)}
                        className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors text-[10px] font-bold text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 size={10} /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteRecruiter(rec)}
                        className="p-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-900/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete Recruiter Node"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Recruiter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UserPlus size={16} className="text-indigo-400" /> Register Partner Recruiter
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateRecruiter} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahmoud Rashad"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+201012345678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Custom Code</label>
                  <input
                    type="text"
                    placeholder="e.g. REC902 (or leave auto-generated)"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Platform Email</label>
                <input
                  type="email"
                  placeholder="mahmoud@fluent.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Performance Team</label>
                  <select
                    value={newTeamId}
                    onChange={(e) => setNewTeamId(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Unassigned Pool</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Disbursement Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Vodafone Cash (+201...)"
                    value={newPayment}
                    onChange={(e) => setNewPayment(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 font-bold tracking-tight cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold tracking-tight cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Recruiter Modal */}
      {showEditModal && selectedRecruiter && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit2 size={15} className="text-indigo-405" /> Edit Recruiter Profile
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRecruiter(null);
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatma Aly"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+201011122233"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Activation Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. REC401"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Email Address</label>
                <input
                  type="email"
                  placeholder="fatma@fluent.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Performance Team</label>
                  <select
                    value={editTeamId}
                    onChange={(e) => setEditTeamId(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Unassigned Pool</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Disbursement Account</label>
                  <input
                    type="text"
                    placeholder="e.g. InstaPay ID"
                    value={editPayment}
                    onChange={(e) => setEditPayment(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRecruiter(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 font-bold tracking-tight cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold tracking-tight cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
