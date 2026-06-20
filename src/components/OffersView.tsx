/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Briefcase, UploadCloud, FileSpreadsheet, Building, Sparkles, Filter, ShieldCheck, CheckCircle2, ChevronRight, X, Edit, Trash2, AlertTriangle, Save, Search, TrendingUp, DollarSign } from 'lucide-react';
import { Offer, Company, AppNotification, ActivityLog, Candidate } from '../types';
import { showToast } from '../utils/toast';
import { ResponsiveContainer, AreaChart, Area, Tooltip as RechartsTooltip } from 'recharts';

interface OffersViewProps {
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  companies: Company[];
  candidates?: Candidate[];
  userRole: string;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  theme?: 'light' | 'dark';
}

export default function OffersView({
  offers,
  setOffers,
  companies,
  candidates = [],
  userRole,
  setNotifications,
  setActivityLogs,
  theme = 'dark',
}: OffersViewProps) {
  const [filterLanguage, setFilterLanguage] = useState('ALL');
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [excelPasteInput, setExcelPasteInput] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Custom vacancy addition
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOfferName, setNewOfferName] = useState('');
  const [newCompanyId, setNewCompanyId] = useState('');
  const [newLang, setNewLang] = useState('English');
  const [newLevel, setNewLevel] = useState('Fluent');
  const [newSalary, setNewSalary] = useState('');
  const [newGrad, setNewGrad] = useState('Graduated');
  const [newReq, setNewReq] = useState('');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'CLOSED' | 'ON_HOLD' | 'ACCEPTED' | 'PENDING'>('ACTIVE');
  const [newNotifyCandidate, setNewNotifyCandidate] = useState(true);

  const getStatusBadgeStyle = (status: string) => {
    const s = (status || 'ACTIVE').toUpperCase();
    if (s === 'ACTIVE' || s === 'ACCEPTED') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    } else if (s === 'PENDING' || s === 'ON_HOLD') {
      return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    } else {
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  // Inline editing state
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [inlineOfferName, setInlineOfferName] = useState('');
  const [inlineCompanyId, setInlineCompanyId] = useState('');
  const [inlineLang, setInlineLang] = useState('English');
  const [inlineLevel, setInlineLevel] = useState('Fluent');
  const [inlineSalary, setInlineSalary] = useState('');
  const [inlineGrad, setInlineGrad] = useState('Graduated');
  const [inlineReq, setInlineReq] = useState('');
  const [inlineStatus, setInlineStatus] = useState<'ACTIVE' | 'CLOSED' | 'ON_HOLD' | 'ACCEPTED' | 'PENDING'>('ACTIVE');
  const [inlineNotifyCandidate, setInlineNotifyCandidate] = useState(false);

  // Confirmation dialog state (prevents accidental deletions/edits)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'EDIT' | 'DELETE';
    offerId: string;
    offerName: string;
  } | null>(null);

  const triggerInlineEditRequest = (off: Offer) => {
    setConfirmDialog({
      isOpen: true,
      type: 'EDIT',
      offerId: off.id,
      offerName: off.offerName,
    });
  };

  const triggerDeleteRequest = (off: Offer) => {
    setConfirmDialog({
      isOpen: true,
      type: 'DELETE',
      offerId: off.id,
      offerName: off.offerName,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog) return;
    const { type, offerId } = confirmDialog;

    if (type === 'EDIT') {
      const off = offers.find((o) => o.id === offerId);
      if (off) {
        setEditingOfferId(off.id);
        setInlineOfferName(off.offerName);
        setInlineCompanyId(off.companyId);
        setInlineLang(off.language);
        setInlineLevel(off.englishLevel);
        setInlineSalary(off.salary || '');
        setInlineGrad(off.graduationStatus || 'Graduated');
        setInlineReq(off.requirements || '');
        setInlineStatus(off.status as 'ACTIVE' | 'CLOSED' | 'ON_HOLD' | 'ACCEPTED' | 'PENDING' || 'ACTIVE');
        setInlineNotifyCandidate(off.notifyCandidateOnStatusChange ?? false);
      }
    } else if (type === 'DELETE') {
      const toDelete = offers.find((o) => o.id === offerId);
      if (toDelete) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));

        // audit log
        const timestamp = new Date().toISOString();
        const newLog: ActivityLog = {
          id: `LOG_${Date.now()}`,
          userId: 'USR001',
          userName: 'Youssef Mansour',
          action: 'DELETE_OFFER',
          entity: 'Offer',
          entityId: offerId,
          newValue: `Deleted vacancy offer code: ${toDelete.offerName}`,
          ipAddress: '197.34.201.55',
          createdAt: timestamp,
        };
        setActivityLogs((prev) => [newLog, ...prev]);

        // notify
        const newNotif: AppNotification = {
          id: `NOT_OFF_DEL_${Date.now()}`,
          title: 'Company Project Offer Deleted',
          message: `Offer "${toDelete.offerName}" was deleted from active project records. font-mono`,
          read: false,
          type: 'WARNING',
          createdAt: timestamp,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    }

    setConfirmDialog(null);
  };

  const handleEditOfferSubmit = (offerId: string) => {
    const original = offers.find((o) => o.id === offerId);
    if (!original) return;

    if (!inlineOfferName || !inlineCompanyId) {
      showToast('Kindly fill in the complete core parameters.', 'error');
      return;
    }

    const linkedComp = companies.find((c) => c.id === inlineCompanyId);

    // Identify changed fields
    const changedFields: string[] = [];
    if (original.offerName !== inlineOfferName) changedFields.push('offerName');
    if (original.companyId !== inlineCompanyId) changedFields.push('companyId');
    if (original.language !== inlineLang) changedFields.push('language');
    if (original.englishLevel !== inlineLevel) changedFields.push('englishLevel');
    if (original.salary !== inlineSalary) changedFields.push('salary');
    if (original.graduationStatus !== inlineGrad) changedFields.push('graduationStatus');
    if (original.requirements !== inlineReq) changedFields.push('requirements');
    if (original.status !== inlineStatus) changedFields.push('status');
    if (original.notifyCandidateOnStatusChange !== inlineNotifyCandidate) changedFields.push('notifyCandidateOnStatusChange');

    if (changedFields.length === 0) {
      setEditingOfferId(null);
      return;
    }

    setOffers((prev) =>
      prev.map((off) =>
        off.id === offerId
          ? {
              ...off,
              companyId: inlineCompanyId,
              companyName: linkedComp ? linkedComp.name : 'Unknown Enterprise',
              offerName: inlineOfferName,
              language: inlineLang,
              englishLevel: inlineLevel,
              graduationStatus: inlineGrad,
              salary: inlineSalary || 'Confidential standard pay',
              requirements: inlineReq || 'Standard BPO requirements matching legal candidate criteria.',
              status: inlineStatus,
              notifyCandidateOnStatusChange: inlineNotifyCandidate,
            }
          : off
      )
    );

    // audit log
    const timestamp = new Date().toISOString();
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'USR001',
      userName: 'Youssef Mansour',
      action: 'OFFER_UPDATED', // Exactly as requested
      entity: 'Offer',
      entityId: offerId,
      newValue: `Updated details for '${inlineOfferName}'. Modified field(s): [${changedFields.join(', ')}]`,
      ipAddress: '197.34.201.55',
      createdAt: timestamp,
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // notify
    const newNotif: AppNotification = {
      id: `NOT_OFF_${Date.now()}`,
      title: 'Company Project Offer Updated',
      message: `The parameters for offer "${inlineOfferName}" have been updated. Modified: ${changedFields.join(', ')}.`,
      read: false,
      type: 'INFO',
      createdAt: timestamp,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Check if status changed and recruiter opted in to notify candidates
    if (original.status !== inlineStatus && inlineNotifyCandidate) {
      const associatedCandidates = (candidates || []).filter((c) => c.offerId === offerId);
      
      if (associatedCandidates.length > 0) {
        associatedCandidates.forEach((cand) => {
          // Create candidate dispatch log
          const newCandLog: ActivityLog = {
            id: `LOG_CAND_NOTIF_${Date.now()}_${cand.id}`,
            userId: 'USR001',
            userName: 'Automated Notification Bot',
            action: 'CANDIDATE_EMAIL_DISPATCHED',
            entity: 'Candidate',
            entityId: cand.id,
            newValue: `Automated email dispatched to "${cand.fullName}" <${cand.email || 'no-email@crm'}> regarding vacancy status change for "${inlineOfferName}" to [${inlineStatus}].`,
            ipAddress: '127.0.0.1',
            createdAt: timestamp,
          };
          setActivityLogs((prev) => [newCandLog, ...prev]);

          // Add notification to screen
          const candNotif: AppNotification = {
            id: `NOT_CAND_AUTO_${Date.now()}_${cand.id}`,
            title: 'Automated Candidate Email Sent',
            message: `Notified applicant "${cand.fullName}" (${cand.email || cand.phone}) about status transition of "${inlineOfferName}" to ${inlineStatus}.`,
            read: false,
            type: 'SUCCESS',
            createdAt: timestamp,
          };
          setNotifications((prev) => [candNotif, ...prev]);
        });
      } else {
        // No candidates registered for this vacancy yet
        const noCandNotif: AppNotification = {
          id: `NOT_CAND_NONE_${Date.now()}`,
          title: 'Candidate Notif Enqueued (0 Match)',
          message: `Auto-notification is enabled, but no candidate has applied to "${inlineOfferName}" yet to receive the dispatch.`,
          read: false,
          type: 'INFO',
          createdAt: timestamp,
        };
        setNotifications((prev) => [noCandNotif, ...prev]);
      }
    }

    showToast(`Successfully updated parameters for project offer "${inlineOfferName}".`, 'success');
    setEditingOfferId(null);
  };

  // Filtering calculations
  const filteredOffers = offers.filter((off) => {
    const matchesLang = filterLanguage === 'ALL' ? true : off.language === filterLanguage;
    const matchesComp = filterCompany === 'ALL' ? true : off.companyId === filterCompany;
    const matchesSearch = searchQuery.trim() === '' ? true : (
      off.offerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesLang && matchesComp && matchesSearch;
  });

  // Simulated Excel Import Processor
  const handleProcessExcelImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelPasteInput.trim()) {
      showToast('Kindly paste Excel tab-separated rows or comma columns first.', 'error');
      return;
    }

    // Advanced cell splits parser
    const lines = excelPasteInput.split('\n');
    let importedCount = 0;
    const freshOffers: Offer[] = [];

    lines.forEach((line) => {
      const parts = line.split('\t'); // tab separated
      if (parts.length >= 2 && parts[0].trim().length > 3) {
        // Construct position matching columns
        freshOffers.push({
          id: `OFF_XLS_${Date.now()}_${Math.floor(Math.random() * 900)}`,
          companyId: 'COMP001', // default to Teleperformance for simulation
          companyName: parts[2] ? parts[2].trim() : 'Teleperformance Egypt',
          offerName: parts[0].trim(),
          language: parts[1] ? parts[1].trim() : 'English',
          englishLevel: parts[3] ? parts[3].trim() : 'Fluent',
          graduationStatus: 'Graduated',
          salary: parts[4] ? parts[4].trim() : '14,000 EGP',
          requirements: parts[5] ? parts[5].trim() : 'Tabular XLS parsed requirements',
          interviewType: 'ONLINE',
          status: 'ACTIVE',
          createdAt: new Date().toISOString().split('T')[0],
        });
        importedCount++;
      }
    });

    if (freshOffers.length > 0) {
      setOffers((prev) => [...freshOffers, ...prev]);

      // Log activity
      const newLog: ActivityLog = {
        id: `LOG_${Date.now()}`,
        userId: 'USR001',
        userName: 'Youssef Mansour',
        action: 'EXCEL_IMPORT_OFFERS',
        entity: 'Offer',
        entityId: 'Bulk',
        newValue: `Imported and parsed ${freshOffers.length} corporate offers from spreadsheet clip.`,
        ipAddress: '197.34.201.55',
        createdAt: new Date().toISOString(),
      };
      setActivityLogs((prev) => [newLog, ...prev]);

      // Notify
      const newNotif: AppNotification = {
        id: `NOT_XLS_${Date.now()}`,
        title: 'Spreadsheet Ingested',
        message: `Ingested ${freshOffers.length} new vacancies successfully parsed and registered directly in CRM memory.`,
        read: false,
        type: 'SUCCESS',
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Success feedback toast
      showToast(`Successfully parsed and imported ${freshOffers.length} project vacancies directly into CRM memory.`, 'success');

      setExcelPasteInput('');
      setShowImportModal(false);
    } else {
      showToast('Could not parse any columns. Try typing: [Position Name] tab [Language] tab [Company Name]', 'error');
    }
  };

  const handleCreateOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferName || !newCompanyId) {
      showToast('Kindly fill in the complete core parameters.', 'error');
      return;
    }

    const linkedComp = companies.find((c) => c.id === newCompanyId);

    const freshOff: Offer = {
      id: `OFF_${Date.now()}`,
      companyId: newCompanyId,
      companyName: linkedComp ? linkedComp.name : 'Unknown Enterprise',
      offerName: newOfferName,
      language: newLang,
      englishLevel: newLevel,
      graduationStatus: newGrad,
      salary: newSalary || 'Confidential standard pay',
      requirements: newReq || 'Standard BPO requirements matching legal candidate criteria.',
      interviewType: 'ONLINE',
      status: newStatus,
      notifyCandidateOnStatusChange: newNotifyCandidate,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setOffers((prev) => [freshOff, ...prev]);

    // audit log
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'USR001',
      userName: 'Youssef Mansour',
      action: 'CREATE_OFFER',
      entity: 'Offer',
      entityId: freshOff.id,
      newValue: `Created vacancy offer: ${freshOff.offerName} with status: ${freshOff.status} and notifyCandidate: ${newNotifyCandidate}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // notify
    const newNotif: AppNotification = {
      id: `NOT_OFF_${Date.now()}`,
      title: 'Company Project Offer Created',
      message: `${freshOff.offerName} opened for company ${freshOff.companyName} (${freshOff.status}). Recruiters notified.`,
      read: false,
      type: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Success feedback toast
    showToast(`Successfully registered new corporate offer "${freshOff.offerName}".`, 'success');

    setNewOfferName('');
    setNewReq('');
    setNewSalary('');
    setNewStatus('ACTIVE');
    setNewNotifyCandidate(true);
    setShowAddModal(false);
  };

  // Helper to extract a single clean numeric salary from string like "16,000 EGP" or "18,500 EGP Net"
  const parseSalaryFromStr = (sStr: string | undefined): number | null => {
    if (!sStr) return null;
    const cleaned = sStr.toLowerCase().replace(/,/g, '');
    const match = cleaned.match(/\d+/);
    if (match) {
      const val = parseInt(match[0], 10);
      if (!isNaN(val) && val > 0) {
        return val;
      }
    }
    return null;
  };

  // Extract statistics for active status offers
  const activeOffersList = offers.filter((o) => (o.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
  
  const mappedActiveSalaries = activeOffersList
    .map((off, idx) => {
      const salVal = parseSalaryFromStr(off.salary);
      return {
        id: off.id,
        offerName: off.offerName,
        companyName: off.companyName,
        language: off.language,
        salaryStr: off.salary || 'Confidential',
        salNum: salVal || 0,
        createdAt: off.createdAt || '',
      };
    })
    .filter((o) => o.salNum > 0)
    .sort((a, b) => a.id.localeCompare(b.id));

  const totalWithSalaries = mappedActiveSalaries.length;
  const averageSalary = totalWithSalaries > 0
    ? Math.round(mappedActiveSalaries.reduce((acc, curr) => acc + curr.salNum, 0) / totalWithSalaries)
    : 0;

  const minSalaryVal = totalWithSalaries > 0 ? Math.min(...mappedActiveSalaries.map((o) => o.salNum)) : 0;
  const maxSalaryVal = totalWithSalaries > 0 ? Math.max(...mappedActiveSalaries.map((o) => o.salNum)) : 0;

  // Sparkline data formatted for Recharts
  const sparklineData = mappedActiveSalaries.map((item, idx) => ({
    name: item.offerName,
    company: item.companyName,
    salary: item.salNum,
    displaySalary: item.salaryStr,
    count: idx + 1,
  }));

  // Recharts Custom Tooltip
  const CustomSparklineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2.5 bg-[#0f172a]/95 border border-[#334155]/80 rounded-xl shadow-2xl text-[10px] space-y-0.5">
          <p className="font-bold text-slate-100">{data.name}</p>
          <p className="text-slate-400 font-mono text-[9px]">{data.company}</p>
          <p className="text-indigo-400 font-bold">{data.displaySalary}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Title block & dynamic Excel parse tool toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            BPO Company Offers Portal
          </h2>
          <p className="text-xs text-slate-400">
            Select vacancy roles to select in public application forms. Batch import hundreds of rows via direct spreadsheet clipping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Excel parser toggle */}
          <button
            id="btn-excel-show-modal"
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-slate-900 border border-slate-700/85 hover:border-blue-500 rounded-xl text-xs text-slate-200 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet size={15} className="text-emerald-400 animate-bounce" /> Excel Bulk Import
          </button>

          <button
            onClick={() => {
              if (companies.length === 0) {
                showToast('Add at least one enterprise Company profile first.', 'warning');
                return;
              }
              setNewCompanyId(companies[0].id);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:brightness-110 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1.5"
          >
            <Briefcase size={14} /> Open Vacancy Profile
          </button>
        </div>
      </div>

      {/* ADAPTIVE SUMMARY DASHBOARD CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="offers-summary-dashboard-grid">
        {/* Salary Sparkline Analytics Card */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-[#111827] border border-[#334155]/60 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl" id="avg-salary-analytics-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-300" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 w-full">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp size={12} className="text-indigo-400" /> Active Salary Analytics
              </span>
              <h3 className="text-2xl font-black text-slate-100 font-sans tracking-tight flex items-baseline gap-1" id="calculated-average-salary-text">
                {averageSalary > 0 ? averageSalary.toLocaleString() : 'N/A'}{' '}
                <span className="text-xs font-semibold text-slate-400">EGP / Month Avg</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Calculated across <span className="text-slate-205 font-semibold">{totalWithSalaries} active offers</span> with public salary packages.
              </p>
            </div>

            {/* Sparkline visualization */}
            <div className="w-full sm:w-56 h-12 bg-slate-950/20 rounded-xl border border-slate-800/40 p-1" id="avg-salary-sparkline-canvas">
              {sparklineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id="offersSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <RechartsTooltip 
                      content={<CustomSparklineTooltip />} 
                      cursor={{ stroke: theme === 'light' ? '#cbd5e1' : '#1e293b', strokeWidth: 1 }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="salary" 
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      fill="url(#offersSparklineGrad)" 
                      dot={{ r: 2.5, stroke: '#818cf8', strokeWidth: 1, fill: '#111827' }}
                      activeDot={{ r: 4, stroke: '#6366f1', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500 font-mono">
                  No Active Salary Configured
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Range Context Card */}
        <div className="p-5 rounded-3xl bg-[#111827] border border-[#334155]/60 flex flex-col justify-between relative overflow-hidden group hover:border-pink-500/30 transition-all shadow-xl" id="salary-range-context-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/10 transition-all duration-300" />
          
          <div className="space-y-2 z-10 w-full">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
              <DollarSign size={12} className="text-purple-400" strokeWidth={2.5} /> Live Salary Bracket
            </span>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Lowest Active</span>
                <span>Highest Active</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-205 font-mono">
                <span>{minSalaryVal > 0 ? `${minSalaryVal.toLocaleString()} EGP` : '0 EGP'}</span>
                <span>{maxSalaryVal > 0 ? `${maxSalaryVal.toLocaleString()} EGP` : '0 EGP'}</span>
              </div>
              
              {/* Custom Slider Indicator representing actual range health */}
              <div className="w-full bg-slate-950/40 border border-slate-800/60 h-2 rounded-full relative overflow-hidden mt-1 p-0.5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1 rounded-full" 
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-[9px] text-slate-400 text-center mt-1 font-sans">
                Premium multi-lingual accounts drive high-bracket yields.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH/FILTER GRID */}
      <div className="p-4 bg-[#111827] border border-[#334155]/60 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-750/80 rounded-xl px-3 py-1.5 text-xs">
          <Search className="text-indigo-400" size={13} />
          <input
            type="text"
            className="bg-transparent text-slate-200 outline-none w-full placeholder-slate-500 focus:ring-0"
            placeholder="Search job title or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-0.5 hover:text-white text-slate-500 rounded-sm"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs">
          <Filter className="text-blue-400" size={13} />
          <select
            className="bg-transparent text-slate-200 outline-none w-full focus:ring-0"
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
          >
            <option value="ALL" className="bg-slate-900">All Project Languages</option>
            <option value="English" className="bg-slate-900">English Language</option>
            <option value="German" className="bg-slate-900">German Language</option>
            <option value="French" className="bg-slate-900">French Language</option>
            <option value="Spanish" className="bg-slate-900">Spanish Language</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-755 rounded-xl px-3 py-1.5 text-xs">
          <Building className="text-pink-400" size={13} />
          <select
            className="bg-transparent text-slate-200 outline-none w-full focus:ring-0"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          >
            <option value="ALL" className="bg-slate-900">All Client Enterprises</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* OFFERS CARDS MATRIX SCREEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOffers.map((off) => {
          const isInlineEditing = editingOfferId === off.id;

          if (isInlineEditing) {
            return (
              <div
                key={off.id}
                className="p-5 rounded-3xl bg-[#0f172a] border-2 border-indigo-500/85 shadow-2xl relative flex flex-col justify-between space-y-4 animate-in fade-in duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={11} className="animate-pulse" /> Inline Editing Active
                    </span>
                    <select
                      className="bg-slate-900 text-slate-200 text-[10px] border border-slate-800 rounded-lg px-2 py-1 outline-none"
                      value={inlineStatus}
                      onChange={(e) => setInlineStatus(e.target.value as any)}
                    >
                      <option value="ACTIVE" className="text-emerald-400 bg-slate-900">ACTIVE</option>
                      <option value="ACCEPTED" className="text-emerald-400 bg-slate-900">ACCEPTED</option>
                      <option value="PENDING" className="text-amber-400 bg-slate-900">PENDING</option>
                      <option value="ON_HOLD" className="text-amber-400 bg-slate-900">ON_HOLD</option>
                      <option value="CLOSED" className="text-rose-400 bg-slate-900">CLOSED</option>
                    </select>
                  </div>

                  {/* Company Select */}
                  <div className="space-y-1 mb-3">
                    <label className="text-[9px] text-slate-500 block font-semibold uppercase">Client Enterprise Partner</label>
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800/80 rounded-xl px-2.5 py-1.5">
                      <Building size={12} className="text-slate-400" />
                      <select
                        className="bg-transparent text-slate-200 text-xs outline-none w-full border-none p-0 focus:ring-0"
                        value={inlineCompanyId}
                        onChange={(e) => setInlineCompanyId(e.target.value)}
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Position Name */}
                  <div className="space-y-1 mb-3">
                    <label className="text-[9px] text-slate-500 block font-semibold uppercase">Position Title</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 text-slate-100 text-xs border border-slate-805 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500"
                      value={inlineOfferName}
                      onChange={(e) => setInlineOfferName(e.target.value)}
                      placeholder="e.g. Senior CS Advisor"
                    />
                  </div>

                  {/* Requirements */}
                  <div className="space-y-1 mb-3">
                    <label className="text-[9px] text-slate-500 block font-semibold uppercase">Requirements Description</label>
                    <textarea
                      className="w-full bg-slate-900 text-slate-100 text-xs border border-slate-805 rounded-xl px-2.5 py-1.5 h-16 resize-none outline-none focus:border-indigo-500"
                      value={inlineReq}
                      onChange={(e) => setInlineReq(e.target.value)}
                      placeholder="Specify requirements..."
                    />
                  </div>

                  {/* Salary, Language & Level Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 block font-semibold uppercase">Simulated Salary (EGP)</label>
                      <input
                        type="text"
                        className="w-full bg-slate-900 text-slate-100 text-[11px] border border-slate-805 rounded-xl px-2.5 py-1.5 outline-none font-mono focus:border-indigo-500"
                        value={inlineSalary}
                        onChange={(e) => setInlineSalary(e.target.value)}
                        placeholder="e.g. 18,000 EGP"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 block font-semibold uppercase">Language</label>
                      <select
                        className="w-full bg-slate-900 text-slate-205 text-[11px] border border-slate-805 rounded-xl px-2 py-1 outline-none focus:border-indigo-500"
                        value={inlineLang}
                        onChange={(e) => setInlineLang(e.target.value)}
                      >
                        <option value="English">English</option>
                        <option value="German">German</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Arabic">Arabic</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 block font-semibold uppercase">Minimum Level Required</label>
                      <select
                        className="w-full bg-slate-900 text-slate-205 text-[11px] border border-slate-805 rounded-xl px-2 py-1 outline-none focus:border-indigo-500"
                        value={inlineLevel}
                        onChange={(e) => setInlineLevel(e.target.value)}
                      >
                        <option value="Fluent">Fluent (Native C1/C2)</option>
                        <option value="Advanced">Advanced (B2/C1)</option>
                        <option value="Intermediate">Intermediate (B1/B2)</option>
                        <option value="Beginner">Beginner (A1/A2)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-505 block font-semibold uppercase">Graduation Status</label>
                      <select
                        className="w-full bg-slate-900 text-slate-205 text-[11px] border border-slate-805 rounded-xl px-2 py-1 outline-none focus:border-indigo-500"
                        value={inlineGrad}
                        onChange={(e) => setInlineGrad(e.target.value)}
                      >
                        <option value="Graduated">Grads Only</option>
                        <option value="Postponed">Grads or Postponed</option>
                        <option value="Enrolled">Students Allowed</option>
                      </select>
                    </div>
                  </div>

                  {/* Candidate Notification Switch Toggle */}
                  <div className="space-y-1.5 mt-4 p-3 bg-indigo-950/20 rounded-2xl border border-indigo-500/10 flex items-center justify-between">
                    <div className="pr-4">
                      <span className="text-[10px] text-slate-205 block font-bold uppercase tracking-wider text-indigo-400">Candidate notifications</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Notify matched applicants via email/system alert when status changes.</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setInlineNotifyCandidate(!inlineNotifyCandidate)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          inlineNotifyCandidate ? 'bg-indigo-600' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            inlineNotifyCandidate ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline confirmation action buttons */}
                <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-3">
                  <button
                    onClick={() => setEditingOfferId(null)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-bold border border-slate-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditOfferSubmit(off.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Save size={11} /> Save Changes
                  </button>
                </div>
              </div>
            );
          }

          {/* Read-only normal card view */}
          return (
            <div
              key={off.id}
              className="p-5 rounded-3xl bg-[#111827] border border-[#334155]/65 hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-400/5 transition-all relative flex flex-col justify-between"
            >
              {/* Status indicators */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                {off.notifyCandidateOnStatusChange && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-semibold flex items-center gap-1" title="Candidate notifications active">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    🔔 Auto-Notif
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${getStatusBadgeStyle(off.status)}`}>
                  {off.status || 'ACTIVE'}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{off.companyName}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">{off.offerName}</h3>
                <p className="text-[10px] text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  Requirements: {off.requirements}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 mt-4 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 block">Simulated Salary</span>
                  <span className="font-semibold text-slate-300 font-mono text-[11px] block mt-0.5">{off.salary || 'Confidential'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Assessment Language</span>
                  <span className="font-semibold text-slate-300 block mt-0.5">{off.language} ({off.englishLevel})</span>
                </div>
              </div>

              {/* Action buttons inside card */}
              <div className="flex justify-end gap-2 border-t border-slate-800/40 pt-3 mt-4">
                <button
                  onClick={() => triggerInlineEditRequest(off)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] text-slate-300 font-bold hover:text-white transition-all cursor-pointer flex items-center gap-1"
                >
                  <Edit size={10} /> Edit info
                </button>
                <button
                  onClick={() => triggerDeleteRequest(off)}
                  className="px-2.5 py-1 bg-red-950/20 hover:bg-red-900/30 text-rose-400 text-[10px] font-bold rounded-lg border border-red-950 hover:border-red-500/20 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL 1: EXCEL TEXT INGEST PARSER DROPZONE */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#334155] rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FileSpreadsheet size={15} className="text-emerald-400" />
              Ingest spreadsheet clip data
            </h3>
            
            <p className="text-xs text-slate-400 mb-4 leading-normal">
              Copy standard rows from your recruitment Excel sheets (including sheet columns: Position Name, Language, Company, English Level required, Salary, Requirements) and paste them directly below to auto-classify details.
            </p>

            <form onSubmit={handleProcessExcelImport} className="space-y-4">
              <div className="text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 mb-2.5 text-slate-500 text-[10.5px] leading-snug">
                  Example paste layout:<br />
                  <span className="text-amber-500">English Customer Support [TAB] English [TAB] Sitel [TAB] Fluent [TAB] 15,000 EGP</span>
                </div>
                
                <textarea
                  required
                  className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-emerald-400 placeholder-slate-600 resize-none h-44"
                  placeholder="Paste rows directly copied from Microsoft Excel sheets..."
                  value={excelPasteInput}
                  onChange={(e) => setExcelPasteInput(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const sampleText = "UK Account Support Agent\tEnglish\tConcentrix Egypt\tFluent\t17,000 EGP\tExcellent native British pronounciation background required\nGerman Customer Liaison\tGerman\tTeleperformance Egypt\tIntermediate\t30,000 EGP\tC1 German writing and conversational efficiency minimum.";
                    setExcelPasteInput(sampleText);
                  }}
                  className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 rounded-xl"
                >
                  Load Sample Clip
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl shadow-md transition-all"
                >
                  Ingest Spreadsheet Cells
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOM FORM ENTRY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#334155] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-1.5">
              <Briefcase size={15} className="text-blue-500" />
              Open Corporate Vacancy
            </h3>

            <form onSubmit={handleCreateOfferSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Position Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    placeholder="UK Account Support Helpline"
                    value={newOfferName}
                    onChange={(e) => setNewOfferName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Client Company *</label>
                  <select
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={newCompanyId}
                    onChange={(e) => setNewCompanyId(e.target.value)}
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Assessment Language</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Minimum Level Threshold</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                  >
                    <option value="Fluent">Fluent (Native C1/C2)</option>
                    <option value="Advanced">Advanced (B2/C1)</option>
                    <option value="Intermediate">Intermediate (B1/B2)</option>
                    <option value="Beginner">Beginner (A1/A2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Minimum Salary (EGP)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    placeholder="17,500 EGP + Bonus"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Graduation Pre-requisites</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={newGrad}
                    onChange={(e) => setNewGrad(e.target.value)}
                  >
                    <option value="Graduated">Graduated Candidates Only</option>
                    <option value="Postponed">Graduated or Postponed</option>
                    <option value="Enrolled">Students permitted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Vacancy Status</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 outline-none"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                  >
                    <option value="ACTIVE" className="bg-slate-900 text-slate-100">ACTIVE</option>
                    <option value="ACCEPTED" className="bg-slate-900 text-slate-100">ACCEPTED</option>
                    <option value="PENDING" className="bg-slate-900 text-slate-100">PENDING</option>
                    <option value="ON_HOLD" className="bg-slate-900 text-slate-100">ON_HOLD</option>
                    <option value="CLOSED" className="bg-slate-900 text-slate-100">CLOSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#CBD5E1] font-semibold mb-1.5">Position Technical Requirements</label>
                <textarea
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 text-xs h-20 resize-none"
                  placeholder="Accent metrics, shift rotations, transport routes covered..."
                  value={newReq}
                  onChange={(e) => setNewReq(e.target.value)}
                />
              </div>

              {/* Candidate Notification Switch Toggle */}
              <div className="space-y-1.5 p-3.5 bg-indigo-950/20 rounded-2xl border border-indigo-500/10 flex items-center justify-between">
                <div className="pr-4">
                  <span className="text-[11px] text-slate-205 block font-bold uppercase tracking-wider text-indigo-400">Candidate notifications</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automate email and system alerts to associated candidates when status changes.</p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setNewNotifyCandidate(!newNotifyCandidate)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      newNotifyCandidate ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        newNotifyCandidate ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md glow-btn-primary mt-2"
              >
                Register Corporate Vacancy
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ACCIDENTAL MODIFICATION & DELETION CONFIRMATION DIALOG */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#334155]/80 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setConfirmDialog(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${
                confirmDialog.type === 'DELETE' 
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                <AlertTriangle size={24} />
              </div>
              
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  {confirmDialog.type === 'DELETE' ? 'Permanent Deletion Warning' : 'Transition to Inline Edit'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {confirmDialog.type === 'DELETE' ? (
                    <>Are you absolutely sure you want to delete <span className="text-rose-400 font-semibold">"{confirmDialog.offerName}"</span>? This will permanently remove the vacancy offer from all active listings and is irreversible.</>
                  ) : (
                    <>You are about to enter inline edit mode for <span className="text-indigo-400 font-semibold">"{confirmDialog.offerName}"</span>. The display fields on this card will transform directly into interactive input elements.</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-5 py-2.5 text-white font-bold rounded-xl shadow-md text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  confirmDialog.type === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-500 hover:shadow-rose-500/10'
                    : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/10'
                }`}
              >
                {confirmDialog.type === 'DELETE' ? (
                  <>Permanently Delete</>
                ) : (
                  <>Enter Edit Mode</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
