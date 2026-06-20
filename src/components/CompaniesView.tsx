import React, { useState } from 'react';
import { Building, Plus, X, Edit, Trash2, Search, ShieldCheck, Globe, MapPin, Briefcase, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Company, AppNotification, ActivityLog } from '../types';
import { showToast } from '../utils/toast';

interface CompaniesViewProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  userRole: string;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
}

export default function CompaniesView({
  companies,
  setCompanies,
  userRole,
  setNotifications,
  setActivityLogs,
}: CompaniesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formIndustry, setFormIndustry] = useState('');

  const canEdit = userRole === 'SUPER_ADMIN' || userRole === 'OWNER';

  const resetForm = () => {
    setFormName('');
    setFormLocation('');
    setFormIndustry('');
    setEditingCompany(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setFormName(company.name);
    setFormLocation(company.location);
    setFormIndustry(company.industry);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formLocation || !formIndustry) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const now = new Date().toISOString();

    if (editingCompany) {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === editingCompany.id
            ? { ...c, name: formName, location: formLocation, industry: formIndustry }
            : c
        )
      );
      const newLog: ActivityLog = {
        id: `LOG_${Date.now()}`,
        userId: 'USR001',
        userName: 'System',
        action: 'COMPANY_EDIT',
        entity: 'Company',
        entityId: editingCompany.id,
        oldValue: editingCompany.name,
        newValue: formName,
        ipAddress: '197.34.201.55',
        createdAt: now,
      };
      setActivityLogs((prev) => [newLog, ...prev]);
      showToast(`Company "${formName}" updated successfully.`, 'success');
    } else {
      const newCompany: Company = {
        id: `COMP_${Date.now()}`,
        name: formName,
        location: formLocation,
        industry: formIndustry,
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCompanies((prev) => [newCompany, ...prev]);
      const newLog: ActivityLog = {
        id: `LOG_${Date.now()}`,
        userId: 'USR001',
        userName: 'System',
        action: 'COMPANY_CREATE',
        entity: 'Company',
        entityId: newCompany.id,
        newValue: formName,
        ipAddress: '197.34.201.55',
        createdAt: now,
      };
      setActivityLogs((prev) => [newLog, ...prev]);
      showToast(`Company "${formName}" created successfully.`, 'success');
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (company: Company) => {
    window.dispatchEvent(
      new CustomEvent('app-confirm', {
        detail: {
          message: `Are you sure you want to permanently remove "${company.name}" from the company directory? This action cannot be undone.`,
          title: 'Delete Company',
          onConfirm: () => {
            setCompanies((prev) => prev.filter((c) => c.id !== company.id));
            const newLog: ActivityLog = {
              id: `LOG_${Date.now()}`,
              userId: 'USR001',
              userName: 'System',
              action: 'COMPANY_DELETE',
              entity: 'Company',
              entityId: company.id,
              oldValue: company.name,
              ipAddress: '197.34.201.55',
              createdAt: new Date().toISOString(),
            };
            setActivityLogs((prev) => [newLog, ...prev]);
            showToast(`Company "${company.name}" deleted.`, 'info');
          },
        },
      })
    );
  };

  const toggleActive = (company: Company) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? { ...c, active: !c.active } : c))
    );
    showToast(
      `Company "${company.name}" ${company.active ? 'deactivated' : 'activated'}.`,
      'success'
    );
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'USR001',
      userName: 'System',
      action: company.active ? 'COMPANY_DEACTIVATE' : 'COMPANY_ACTIVATE',
      entity: 'Company',
      entityId: company.id,
      oldValue: String(company.active),
      newValue: String(!company.active),
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const filtered = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building size={22} className="text-indigo-400" />
            Companies Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage client companies and partner organisations.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus size={14} />
            Add Company
          </button>
        )}
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Building size={14} />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Companies</span>
          </div>
          <p className="text-2xl font-bold text-white">{companies.length}</p>
        </div>
        <div className="bento-card p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Active</span>
          </div>
          <p className="text-2xl font-bold text-white">{companies.filter((c) => c.active).length}</p>
        </div>
        <div className="bento-card p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-400 mb-1">
            <X size={14} />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Inactive</span>
          </div>
          <p className="text-2xl font-bold text-white">{companies.filter((c) => !c.active).length}</p>
        </div>
        <div className="bento-card p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <MapPin size={14} />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Locations</span>
          </div>
          <p className="text-2xl font-bold text-white">{new Set(companies.map((c) => c.location)).size}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          className="w-full bg-slate-900/40 text-slate-200 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs placeholder-slate-400 focus:text-white focus:border-indigo-500/50 transition-all"
          placeholder="Search by name, location, or industry..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <div
            key={company.id}
            className="bento-card p-5 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-indigo-500/20 flex items-center justify-center">
                  <Building size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{company.name}</h3>
                  <span
                    className={`inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      company.active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {company.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(company)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-all"
                    title="Edit Company"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(company)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-all"
                    title="Delete Company"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-slate-500" />
                <span>{company.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={12} className="text-slate-500" />
                <span>{company.industry}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-slate-500" />
                <span>Since {company.createdAt}</span>
              </div>
            </div>

            {canEdit && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => toggleActive(company)}
                  className={`text-[10px] font-mono font-bold px-3 py-1 rounded-lg transition-all ${
                    company.active
                      ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                  }`}
                >
                  {company.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500">
            <Building size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No companies found</p>
            <p className="text-xs mt-1">Try adjusting your search or add a new company.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-800/85 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Building size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    {editingCompany ? 'Edit Company' : 'Register Company'}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500">
                    {editingCompany ? 'Update company details' : 'Add a new client organisation'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500/50 transition-all"
                  placeholder="e.g. Acme Corp"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500/50 transition-all"
                  placeholder="e.g. Cairo, Egypt"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500/50 transition-all"
                  placeholder="e.g. Technology, BPO, Healthcare"
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  {editingCompany ? 'Save Changes' : 'Register Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
