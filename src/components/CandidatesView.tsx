/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Layers,
  FileText,
  UserCheck,
  CheckCircle,
  XCircle,
  Trash2,
  X,
  Share2,
  Download,
  AlertTriangle,
  UploadCloud,
  Check,
  ClipboardList,
} from 'lucide-react';
import { Candidate, User, Team, Offer, CandidateStatus, AppNotification, ActivityLog } from '../types';
import { showToast } from '../utils/toast';

interface CandidatesViewProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  users: User[];
  teams: Team[];
  offers: Offer[];
  userRole: string;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
}

export default function CandidatesView({
  candidates,
  setCandidates,
  users,
  teams,
  offers,
  userRole,
  setNotifications,
  setActivityLogs,
}: CandidatesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTeam, setFilterTeam] = useState<string>('ALL');
  const [filterOffer, setFilterOffer] = useState<string>('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Create / Edit states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  
  // Form input states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLocation, setFormLocation] = useState('Cairo, Egypt');
  const [formLang, setFormLang] = useState('English');
  const [formLangLevel, setFormLangLevel] = useState('Fluent');
  const [formGrad, setFormGrad] = useState('Graduated');
  const [formOfferId, setFormOfferId] = useState('');
  const [formSource, setFormSource] = useState('WhatsApp');
  const [formNotes, setFormNotes] = useState('');
  
  // Custom interactive CV simulation
  const [simulatedDocName, setSimulatedDocName] = useState<string>('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Note addition state
  const [newNoteInput, setNewNoteInput] = useState('');

  // View mode toggle: table or kanban
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterTeam, filterOffer]);

  // Filtering calculations
  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch = cand.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cand.phone.includes(searchQuery) ||
                          (cand.email && cand.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'ALL' ? true : cand.status === filterStatus;
    const matchesTeam = filterTeam === 'ALL' ? true : cand.teamId === filterTeam;
    const matchesOffer = filterOffer === 'ALL' ? true : cand.offerId === filterOffer;
    
    return matchesSearch && matchesStatus && matchesTeam && matchesOffer;
  });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCheckboxes(paginatedCandidates.map((c) => c.id));
    } else {
      setSelectedCheckboxes([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCheckboxes((prev) => [...prev, id]);
    } else {
      setSelectedCheckboxes((prev) => prev.filter((item) => item !== id));
    }
  };

  // Bulk state update handler
  const handleBulkStatusChange = (newStatus: CandidateStatus) => {
    if (selectedCheckboxes.length === 0) return;

    setCandidates((prev) =>
      prev.map((c) => (selectedCheckboxes.includes(c.id) ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
    );

    // Track logs
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'USR001',
      userName: 'Youssef Mansour',
      action: 'BULK_STATUS_CHANGE',
      entity: 'Candidate',
      entityId: selectedCheckboxes.join(','),
      newValue: `Transitioned bulk of ${selectedCheckboxes.length} applicants to status: ${newStatus}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // Track notify
    const newNotif: AppNotification = {
      id: `NOT_${Date.now()}`,
      title: 'Bulk Status Altered',
      message: `${selectedCheckboxes.length} candidates status updated to ${newStatus} successfully.`,
      read: false,
      type: 'INFO',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setSelectedCheckboxes([]);
  };

  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formOfferId) {
      showToast('Kindly fill in the complete core parameters (Name, Phone, and Chosen Offer).', 'error');
      return;
    }

    const linkedOffer = offers.find((o) => o.id === formOfferId);
    
    // Construct new candidate node
    const newCand: Candidate = {
      id: `CAND_NEW_${Date.now()}`,
      fullName: formName,
      phone: formPhone,
      email: formEmail || undefined,
      location: formLocation,
      language: formLang,
      languageLevel: formLangLevel,
      graduationStatus: formGrad,
      offerId: formOfferId,
      offerName: linkedOffer ? linkedOffer.offerName : 'English Vacancy support',
      recruiterId: 'USR008', // Fatma Aly as standard
      recruiterName: 'Fatma Aly',
      teamId: 'TEAM001',
      teamName: 'Team Pola',
      status: CandidateStatus.NEW,
      source: formSource,
      notes: formNotes || undefined,
      cvUrl: simulatedDocName || undefined,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    setCandidates((prev) => [newCand, ...prev]);

    // Set activity logs
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'USR008',
      userName: 'Fatma Aly',
      action: 'ADD_CANDIDATE',
      entity: 'Candidate',
      entityId: newCand.id,
      newValue: `Registered new candidate profile: ${newCand.fullName}`,
      ipAddress: '197.35.1.20',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // Issue notification
    const newNotif: AppNotification = {
      id: `NOT_${Date.now()}`,
      title: 'Candidate Profile Created',
      message: `${newCand.fullName} matched with ${newCand.offerName} by Recruiter Fatma Aly.`,
      read: false,
      type: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Successfully registered candidate profile for ${newCand.fullName}.`, 'success');

    // Reset fields
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormNotes('');
    setSimulatedDocName('');
    setShowAddModal(false);
  };

  // Simulating drag & drop / copy upload of candidates' CV
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSimulateCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setIsUploadingDoc(true);
      setTimeout(() => {
        setSimulatedDocName(fileName);
        setIsUploadingDoc(false);
      }, 700);
    }
  };

  // Add individual manual candidate internal comments/notes
  const handleAddNewComment = (cId: string) => {
    if (!newNoteInput.trim()) return;

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === cId) {
          const updatedNotes = c.notes 
            ? `${c.notes}\n[Note - ${new Date().toLocaleDateString()}] ${newNoteInput.trim()}`
            : `[Note - ${new Date().toLocaleDateString()}] ${newNoteInput.trim()}`;
          return { ...c, notes: updatedNotes, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );

    // Update focused detail view in live sync
    if (selectedCandidate && selectedCandidate.id === cId) {
      setSelectedCandidate((prev) => prev ? {
        ...prev,
        notes: prev.notes 
          ? `${prev.notes}\n[Note - ${new Date().toLocaleDateString()}] ${newNoteInput.trim()}`
          : `[Note - ${new Date().toLocaleDateString()}] ${newNoteInput.trim()}`
      } : null);
    }

    setNewNoteInput('');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Title & Main Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Candidates CRM & Applicant Tracking
          </h2>
          <p className="text-xs text-slate-400">
            Apply multi-criteria filters, schedule interviews, view candidate timelines, and update statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download CSV */}
          <button
            onClick={() => {
              const headers = ['Full Name', 'Phone', 'Email', 'Location', 'Language', 'Level', 'Offer', 'Recruiter', 'Status', 'Source', 'Created'];
              const rows = candidates.map((c) => [
                c.fullName, c.phone, c.email || '', c.location || '', c.language, c.languageLevel,
                c.offerName, c.recruiterName, c.status, c.source || '', c.createdAt,
              ]);
              const csvContent = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n');
              const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `candidates_export_${new Date().toISOString().split('T')[0]}.csv`;
              a.click(); URL.revokeObjectURL(url);
              showToast(`Exported ${candidates.length} candidates to CSV.`, 'success');
            }}
            className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-semibold"
            title="Download CSV database payload"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            id="btn-add-candidate"
            onClick={() => {
              if (offers.length === 0) {
                showToast('Register at least one Company Offer first before adding Applicants.', 'warning');
                return;
              }
              setFormOfferId(offers[0].id);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 hover:brightness-110 shadow-lg tracking-wide"
          >
            <UserPlus size={15} /> Add Candidate Profile
          </button>
        </div>
      </div>

      {/* SEARCH AND ADVANCED FILTERS GRID */}
      <div className="p-4 bg-[#111827] border border-[#334155]/60 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 relative select-none">
        
        {/* Search Query Input with Pl-10 offset spacing to prevent symbol overlap as reported in bugs */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 border-r border-slate-800/80 pr-2">
            <Search size={14} />
          </div>
          <input
            id="crm-search-query"
            type="text"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 pl-12 pr-3 text-xs placeholder-slate-400 text-slate-200 focus:text-white"
            placeholder="Search name, phone, national ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Dropdown filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5">
          <Filter size={12} className="text-pink-400" />
          <select
            id="filter-status-select"
            className="bg-transparent text-xs text-slate-200 w-full outline-none focus:ring-0"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL" className="bg-slate-900">All Candidate Statuses</option>
            {Object.values(CandidateStatus).map((status) => (
              <option key={status} value={status} className="bg-slate-900">{status}</option>
            ))}
          </select>
        </div>

        {/* Team affiliation filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5">
          <Layers size={12} className="text-blue-400" />
          <select
            id="filter-team-select"
            className="bg-transparent text-xs text-slate-200 w-full outline-none focus:ring-0"
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
          >
            <option value="ALL" className="bg-slate-900">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>
            ))}
          </select>
        </div>

        {/* Offers matching filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5">
          <BookOpen size={12} className="text-purple-400" />
          <select
            id="filter-offer-select"
            className="bg-transparent text-xs text-slate-200 w-full outline-none focus:ring-0"
            value={filterOffer}
            onChange={(e) => setFilterOffer(e.target.value)}
          >
            <option value="ALL" className="bg-slate-900">All Job Offers</option>
            {offers.map((off) => (
              <option key={off.id} value={off.id} className="bg-slate-900">{off.offerName.substring(0, 30)}...</option>
            ))}
          </select>
        </div>

      </div>

      {/* View Toggle: Table / Kanban */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('table')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'table'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardList size={14} className="inline mr-1.5" />
          Table View
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'kanban'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={14} className="inline mr-1.5" />
          Kanban Board
        </button>
      </div>

      {/* BULK ACTION PANEL: Appears only when selections exist */}
      {selectedCheckboxes.length > 0 && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-between flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-xs text-blue-300 font-semibold font-mono">
            {selectedCheckboxes.length} applicants selected for bulk transitions:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange(CandidateStatus.CONTACTED)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 rounded-lg font-bold border border-slate-800"
            >
              Contacted
            </button>
            <button
              onClick={() => handleBulkStatusChange(CandidateStatus.HIRED)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs text-white rounded-lg font-bold"
            >
              Hire bulk
            </button>
            <button
              onClick={() => handleBulkStatusChange(CandidateStatus.FAILED)}
              className="px-2.5 py-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white text-xs rounded-lg font-bold"
            >
              Fail bulk
            </button>
            <button
              onClick={() => setSelectedCheckboxes([])}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MAIN CANDIDATES TABLE LIST VIEWS */}
      <div className="bg-[#111827] border border-[#334155]/60 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 select-none">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-500 bg-[#020617] border-slate-700"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedCheckboxes.length === paginatedCandidates.length && paginatedCandidates.length > 0}
                  />
                </th>
                <th className="p-4 font-bold">Applicant Details</th>
                <th className="p-4 font-bold">Target Vacancy</th>
                <th className="p-4 font-bold">Recruiter Node</th>
                <th className="p-4 font-bold">Interview Assessment</th>
                <th className="p-4 font-bold">Current Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/65">
              {paginatedCandidates.map((cand) => {
                const isSelected = selectedCheckboxes.includes(cand.id);
                return (
                  <tr
                    key={cand.id}
                    className={`hover:bg-slate-900/60 transition-colors ${
                      isSelected ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-blue-500 bg-[#020617] border-slate-700"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(cand.id, e.target.checked)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        {cand.fullName}
                        {cand.cvUrl && (
                          <span className="text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">CV</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{cand.phone} {cand.location ? `| ${cand.location}` : ''}</div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-300 max-w-[170px] truncate" title={cand.offerName}>
                        {cand.offerName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">Lang: {cand.language} ({cand.languageLevel})</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-300">{cand.recruiterName}</p>
                      <p className="text-[10px] text-pink-400 font-semibold font-mono">{cand.teamName || 'Onboarding team'}</p>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      {cand.status === CandidateStatus.INTERVIEW_SCHEDULED ? (
                        <div className="text-amber-400 flex items-center gap-1.5">
                          <Calendar size={13} /> {cand.interviewDate || '2026-06-20'}
                        </div>
                      ) : cand.interviewDate ? (
                        <div className="text-slate-400">{cand.interviewDate}</div>
                      ) : (
                        <span className="text-slate-600">Unscheduled</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        cand.status === CandidateStatus.HIRED
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                          : cand.status === CandidateStatus.PASSED
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : cand.status === CandidateStatus.FAILED
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : cand.status === CandidateStatus.INTERVIEW_SCHEDULED
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-700/20 text-slate-400 border border-slate-700/30'
                      }`}>
                        {cand.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCandidate(cand);
                          setShowDetailDrawer(true);
                        }}
                        className="p-1 px-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold rounded-lg transition-all"
                      >
                        Open File
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500">
                    <ClipboardList className="mx-auto mb-2 opacity-30" size={32} />
                    No applicants match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500 font-mono">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {Object.values(CandidateStatus).map((status) => {
              const columnCandidates = filteredCandidates.filter((c) => c.status === status);
              const statusColors: Record<string, string> = {
                [CandidateStatus.NEW]: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
                [CandidateStatus.CONTACTED]: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                [CandidateStatus.INTERVIEW_SCHEDULED]: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                [CandidateStatus.PASSED]: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                [CandidateStatus.FAILED]: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
                [CandidateStatus.HIRED]: 'bg-green-500/10 border-green-500/30 text-green-400',
                [CandidateStatus.REJECTED]: 'bg-red-500/10 border-red-500/30 text-red-400',
                [CandidateStatus.ON_HOLD]: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
              };
              return (
                <div key={status} className="w-64 flex-shrink-0">
                  <div className={`p-3 rounded-t-2xl border ${statusColors[status] || 'bg-slate-800/20 border-slate-700/30 text-slate-400'} flex items-center justify-between`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider">{status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono opacity-70">{columnCandidates.length}</span>
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px] bg-slate-900/20 border-x border-b border-slate-800/50 rounded-b-2xl">
                    {columnCandidates.length === 0 ? (
                      <div className="py-8 text-center text-[10px] text-slate-600 font-mono">No candidates</div>
                    ) : (
                      columnCandidates.map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => {
                            setSelectedCandidate(cand);
                            setShowDetailDrawer(true);
                          }}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/60 hover:border-indigo-500/40 cursor-pointer transition-all group"
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-100 truncate">{cand.fullName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                            <div className="truncate">{cand.offerName}</div>
                            <div className="flex items-center gap-1.5">
                              <span>{cand.recruiterName}</span>
                              <span className="text-slate-700">|</span>
                              <span>{cand.language}</span>
                            </div>
                          </div>
                          {cand.interviewDate && (
                            <div className="mt-1.5 text-[9px] font-mono text-amber-500/80 flex items-center gap-1">
                              <Calendar size={9} />
                              {cand.interviewDate}
                            </div>
                          )}
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {cand.cvUrl && (
                              <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">CV</span>
                            )}
                            <span className="text-[8px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{cand.teamName || 'Onboarding'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL WINDOW: CREATING A NEW APPLICANT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#334155] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Create Recruit Profile
            </h3>

            <form onSubmit={handleAddCandidateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    placeholder="Ahmed Abdelrahman"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    placeholder="+201011223344"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Email Address</label>
                  <input
                    type="email"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    placeholder="ahmed@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Governorate Location</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    placeholder="Maadi, Cairo"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Oral Language</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={formLang}
                    onChange={(e) => setFormLang(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">English/Language Level</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={formLangLevel}
                    onChange={(e) => setFormLangLevel(e.target.value)}
                  >
                    <option value="Fluent">Fluent (Native C1/C2)</option>
                    <option value="Advanced">Advanced (B2/C1)</option>
                    <option value="Intermediate">Intermediate (B1/B2)</option>
                    <option value="Beginner">Beginner (A1/A2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Graduation status</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={formGrad}
                    onChange={(e) => setFormGrad(e.target.value)}
                  >
                    <option value="Graduated">Graduated</option>
                    <option value="Postponed">Postponed</option>
                    <option value="Enrolled">Enrolled Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Company Project Offer *</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={formOfferId}
                    onChange={(e) => setFormOfferId(e.target.value)}
                  >
                    {offers.map((off) => (
                      <option key={off.id} value={off.id}>{off.offerName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CRM file upload simulation */}
              <div className="space-y-1.5 text-xs">
                <span className="block text-slate-300 font-semibold">Supporting CV Document (PDF / DOCX)</span>
                <div
                  className="p-4 border border-dashed border-slate-700 rounded-xl text-center bg-slate-900/50 hover:bg-slate-900 transition-all cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleSimulateCVUpload}
                  />
                  <UploadCloud className="mx-auto text-slate-500 mb-1.5" size={20} />
                  {isUploadingDoc ? (
                    <span className="text-slate-400 animate-pulse text-[11px] block">Parsing document properties...</span>
                  ) : simulatedDocName ? (
                    <span className="text-emerald-400 font-semibold font-mono text-[11px] block truncate">{simulatedDocName} uploaded</span>
                  ) : (
                    <span className="text-slate-500 text-[10px] block">Click to select CV document</span>
                  )}
                </div>
              </div>

              {/* Text note input */}
              <div className="text-xs">
                <label className="block text-slate-300 font-semibold mb-1.5">Internal Initial Notes</label>
                <textarea
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 text-xs resize-none h-14"
                  placeholder="Notes about screening, accent, soft skills..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-white shadow-lg tracking-wide rounded-xl glow-btn-primary flex items-center justify-center gap-1 mt-4"
              >
                Insert CRM File Node
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / SLIDE PANEL: CRM File and activity timeline logs */}
      {showDetailDrawer && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#111827] border-l border-slate-800 w-full max-w-xl h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            
            {/* Header Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500 shadow-sm animate-pulse"></div>
                  <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">APPLICANT PROFILE CRM</span>
                </div>
                <button
                  onClick={() => setShowDetailDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Basic Personal Profile Area */}
              <div className="pt-3">
                <h3 className="text-lg font-bold text-slate-100">{selectedCandidate.fullName}</h3>
                <p className="text-xs font-mono text-blue-400 mt-1">Ref ID: {selectedCandidate.id} | Joined: {selectedCandidate.createdAt}</p>
              </div>
            </div>

            {/* Structured Info Card Panels */}
            <div className="flex-1 my-6 space-y-5 overflow-y-auto hide-scrollbar pr-1">
              
              {/* Box 1: Core details */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-xs space-y-2">
                <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] mb-3 border-b border-slate-800 pb-1.5">
                  General candidate data
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-sans">
                  <div><span className="text-slate-400 font-semibold block">Phone Mobile:</span> <span className="font-mono text-slate-200">{selectedCandidate.phone}</span></div>
                  <div><span className="text-slate-400 font-semibold block">Email Address:</span> <span className="text-slate-200">{selectedCandidate.email || 'N/A'}</span></div>
                  <div><span className="text-slate-400 font-semibold block">Governorate:</span> <span className="text-slate-200">{selectedCandidate.location || 'N/A'}</span></div>
                  <div><span className="text-slate-400 font-semibold block">Referral Channel:</span> <span className="text-slate-200 font-mono">{selectedCandidate.source || 'Standard Referral'}</span></div>
                  <div><span className="text-slate-400 font-semibold block">Graduation:</span> <span className="text-slate-200">{selectedCandidate.graduationStatus}</span></div>
                  <div><span className="text-slate-400 font-semibold block">Language Skill:</span> <span className="text-slate-200">{selectedCandidate.language} ({selectedCandidate.languageLevel})</span></div>
                </div>
              </div>

              {/* Box 2: Core vacancy details */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] mb-2 border-b border-slate-800 pb-1.5">
                  Target job and Recruiter
                </h4>
                <div className="space-y-1.5 text-[11px]">
                  <p><span className="text-slate-400 font-semibold">Matched Job Vacancy:</span> <span className="text-purple-400 font-bold">{selectedCandidate.offerName}</span></p>
                  <p><span className="text-slate-400 font-semibold">Enrolling Recruiter:</span> <span className="text-slate-200 font-semibold">{selectedCandidate.recruiterName}</span></p>
                  <p><span className="text-slate-400 font-semibold">Associated Team:</span> <span className="text-pink-400 font-bold font-mono">{selectedCandidate.teamName || 'Onboarding team'}</span></p>
                </div>
              </div>

              {/* Box 3: Live Notes and Comments logs */}
              <div className="p-4 rounded-xl bg-slate-900 border border-[#334155]/60 text-xs space-y-3">
                <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] mb-1 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <span>Candidate notes & file comments</span>
                  <span className="text-[9px] text-[#EC4899] font-mono">Synced</span>
                </h4>
                
                {/* Visual Note text content, splitting returns into lines */}
                <div className="bg-[#020617] p-3 rounded-lg border border-slate-800 max-h-[140px] overflow-y-auto text-[11px] leading-relaxed text-slate-400 whitespace-pre-line font-serif italic">
                  {selectedCandidate.notes || 'No notes present. Enter candidate comments below.'}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs placeholder-slate-500 text-slate-200 focus:text-white"
                    placeholder="Enter interactive screen assessment comment..."
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                  />
                  <button
                    onClick={() => handleAddNewComment(selectedCandidate.id)}
                    className="p-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                  >
                    Log
                  </button>
                </div>
              </div>

              {/* Box 4: Interactive Status alter tool */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3">
                <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] border-b border-slate-800 pb-1.5">
                  Update candidate status
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(CandidateStatus).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        const updated = candidates.map((cand) =>
                          cand.id === selectedCandidate.id ? { ...cand, status, updatedAt: new Date().toISOString() } : cand
                        );
                        setCandidates(updated);
                        
                        // update drawer candidate view in real-time
                        setSelectedCandidate((old) => old ? { ...old, status } : null);

                        // add audit log
                        const newLog: ActivityLog = {
                          id: `LOG_${Date.now()}`,
                          userId: 'USR001',
                          userName: 'Youssef Mansour',
                          action: 'STATUS_TRIGGERED_DRW',
                          entity: 'Candidate',
                          entityId: selectedCandidate.id,
                          oldValue: selectedCandidate.status,
                          newValue: status,
                          ipAddress: '197.34.201.55',
                          createdAt: new Date().toISOString(),
                        };
                        setActivityLogs((prev) => [newLog, ...prev]);

                        // notification alert if marked Hired
                        if (status === CandidateStatus.HIRED) {
                          const newNotif: AppNotification = {
                            id: `NOT_HIRED_${Date.now()}`,
                            title: 'Candidate Onboarded',
                            message: `${selectedCandidate.fullName} marked as HIRED and registered in the team ledger.`,
                            read: false,
                            type: 'SUCCESS',
                            createdAt: new Date().toISOString(),
                          };
                          setNotifications((prev) => [newNotif, ...prev]);
                        }
                      }}
                      className={`p-2 rounded-xl text-[10px] font-mono font-bold tracking-tight border uppercase transition-all ${
                        selectedCandidate.status === status
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Close Actions */}
            <div className="border-t border-slate-800 pt-4 bg-slate-900/10 p-2 text-center rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">FLUENT SYSTEM SECURED DEPLOY</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
