/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Candidate,
  User,
  Team,
  Company,
  Offer,
  Course,
  CourseStudent,
  AppNotification,
  ActivityLog,
} from './types';
import {
  mockUsers,
  mockTeams,
  mockCompanies,
  mockOffers,
  mockCandidates,
  mockCourses,
  mockCourseStudents,
  mockNotifications,
  mockActivityLogs,
} from './data/mockData';

// Import Modular Presentation Layouts
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CandidatesView from './components/CandidatesView';
import RecruitersView from './components/RecruitersView';
import TeamsView from './components/TeamsView';
import OffersView from './components/OffersView';
import AcademyView from './components/AcademyView';
import CompaniesView from './components/CompaniesView';
import FormsView from './components/FormsView';
import DeveloperLogsView from './components/DeveloperLogsView';
import LoginView from './components/LoginView';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const STORAGE_KEY_PREFIX = 'frms_v1_';

export default function App() {
  // Session Authentication state Gate
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth_role`);
    return saved ? (saved as UserRole) : null;
  });

  const [selectedUserName, setSelectedUserName] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}auth_name`) || 'Guest node';
  });

  // Sidebar Layout Navigation parameters
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Floating Toast Notifications & Custom Dialog states
  interface ActiveToast {
    id: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
  }
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    title?: string;
    onConfirm: () => void;
  } | null>(null);

  // Listen for global toasts and confirmation triggers from anywhere in the app
  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'warning' | 'info' | 'error' }>;
      if (!customEvent.detail) return;
      const { message, type } = customEvent.detail;
      const newId = `toast_${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev, { id: newId, message, type }]);

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newId));
      }, 4500);
    };

    const handleConfirmEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; onConfirm: () => void; title?: string }>;
      if (!customEvent.detail) return;
      setConfirmModal({
        message: customEvent.detail.message,
        title: customEvent.detail.title,
        onConfirm: customEvent.detail.onConfirm,
      });
    };

    window.addEventListener('app-toast', handleToastEvent);
    window.addEventListener('app-confirm', handleConfirmEvent);
    return () => {
      window.removeEventListener('app-toast', handleToastEvent);
      window.removeEventListener('app-confirm', handleConfirmEvent);
    };
  }, []);

  // Core CRM Datasets
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}teams`);
    return saved ? JSON.parse(saved) : mockTeams;
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}companies`);
    return saved ? JSON.parse(saved) : mockCompanies;
  });

  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}offers`);
    return saved ? JSON.parse(saved) : mockOffers;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}candidates`);
    return saved ? JSON.parse(saved) : mockCandidates;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}courses`);
    return saved ? JSON.parse(saved) : mockCourses;
  });

  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}course_students`);
    return saved ? JSON.parse(saved) : mockCourseStudents;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : mockNotifications;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activity_logs`);
    return saved ? JSON.parse(saved) : mockActivityLogs;
  });

  const [recruiterFormApplicationRequests, setRecruiterFormApplicationRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}recruiter_f1_requests`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'REQ_SEED_1',
        fullName: 'Maged El-Khawaga',
        phone: '+2010255556660',
        paymentMethod: 'Vodafone Cash',
        status: 'PENDING',
        createdAt: '2026-06-16',
      },
    ];
  });

  // System theme with toggle capability
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`);
    return (saved as 'light' | 'dark') || 'dark';
  });

  // Apply theme class to body for CSS overrides
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Master full-stack relational REST API synchronizer
  useEffect(() => {
    async function loadData() {
      try {
        const [
          resUsers,
          resTeams,
          resCompanies,
          resOffers,
          resCandidates,
          resCourses,
          resCourseStudents,
          resNotifications,
          resActivityLogs,
          resF1Requests,
        ] = await Promise.all([
          fetch('/api/users').then((r) => r.json()),
          fetch('/api/teams').then((r) => r.json()),
          fetch('/api/companies').then((r) => r.json()),
          fetch('/api/offers').then((r) => r.json()),
          fetch('/api/candidates').then((r) => r.json()),
          fetch('/api/courses').then((r) => r.json()),
          fetch('/api/course_students').then((r) => r.json()),
          fetch('/api/notifications').then((r) => r.json()),
          fetch('/api/activity_logs').then((r) => r.json()),
          fetch('/api/recruiter_f1_requests').then((r) => r.json()),
        ]);

        if (Array.isArray(resUsers)) setUsers(resUsers);
        if (Array.isArray(resTeams)) setTeams(resTeams);
        if (Array.isArray(resCompanies)) setCompanies(resCompanies);
        if (Array.isArray(resOffers)) setOffers(resOffers);
        if (Array.isArray(resCandidates)) setCandidates(resCandidates);
        if (Array.isArray(resCourses)) setCourses(resCourses);
        if (Array.isArray(resCourseStudents)) setCourseStudents(resCourseStudents);
        if (Array.isArray(resNotifications)) {
          const sorted = [...resNotifications].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setNotifications(sorted);
        }
        if (Array.isArray(resActivityLogs)) {
          const sorted = [...resActivityLogs].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setActivityLogs(sorted);
        }
        if (Array.isArray(resF1Requests)) setRecruiterFormApplicationRequests(resF1Requests);
      } catch (err) {
        console.error('Error synchronizing with local Express API:', err);
      }
    }
    loadData();
  }, []);

  // Write Broadcaster: calculates mutations and communicates with Node.js full-stack container API
  const syncDatasetToBackend = async <T extends { id: string }>(
    colName: string,
    newData: T[],
    currentData: T[]
  ) => {
    try {
      // Find deleted items
      const deleted = currentData.filter((oldItem) => !newData.some((newItem) => newItem.id === oldItem.id));
      for (const item of deleted) {
        await fetch(`/api/${colName}/${item.id}`, { method: 'DELETE' });
      }

      // Find added or updated items
      const addedOrUpdated = newData.filter((newItem) => {
        const oldItem = currentData.find((o) => o.id === newItem.id);
        return !oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem);
      });
      for (const item of addedOrUpdated) {
        await fetch(`/api/${colName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
    } catch (err) {
      console.error(`[Express REST Sync] Failed to broadcast changes for "${colName}":`, err);
    }
  };

  // Wrapped State Setters for UI components
  const setUsersAndSync = (updater: User[] | ((prev: User[]) => User[])) => {
    setUsers((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('users', nextVal, prev);
      return nextVal;
    });
  };

  const setTeamsAndSync = (updater: Team[] | ((prev: Team[]) => Team[])) => {
    setTeams((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('teams', nextVal, prev);
      return nextVal;
    });
  };

  const setCompaniesAndSync = (updater: Company[] | ((prev: Company[]) => Company[])) => {
    setCompanies((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('companies', nextVal, prev);
      return nextVal;
    });
  };

  const setOffersAndSync = (updater: Offer[] | ((prev: Offer[]) => Offer[])) => {
    setOffers((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('offers', nextVal, prev);
      return nextVal;
    });
  };

  const setCandidatesAndSync = (updater: Candidate[] | ((prev: Candidate[]) => Candidate[])) => {
    setCandidates((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('candidates', nextVal, prev);
      return nextVal;
    });
  };

  const setCoursesAndSync = (updater: Course[] | ((prev: Course[]) => Course[])) => {
    setCourses((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('courses', nextVal, prev);
      return nextVal;
    });
  };

  const setCourseStudentsAndSync = (updater: CourseStudent[] | ((prev: CourseStudent[]) => CourseStudent[])) => {
    setCourseStudents((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('course_students', nextVal, prev);
      return nextVal;
    });
  };

  const setNotificationsAndSync = (updater: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => {
    setNotifications((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('notifications', nextVal, prev);
      return nextVal;
    });
  };

  const setActivityLogsAndSync = (updater: ActivityLog[] | ((prev: ActivityLog[]) => ActivityLog[])) => {
    setActivityLogs((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('activity_logs', nextVal, prev);
      return nextVal;
    });
  };

  const setRecruiterFormApplicationRequestsAndSync = (updater: any[] | ((prev: any[]) => any[])) => {
    setRecruiterFormApplicationRequests((prev) => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      syncDatasetToBackend('recruiter_f1_requests', nextVal, prev);
      return nextVal;
    });
  };

  // Session state updates
  const handleLoginSuccess = (role: UserRole, userName: string) => {
    setUserRole(role);
    setSelectedUserName(userName);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_role`, role);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_name`, userName);

    // Track login activity
    const newLog: ActivityLog = {
      id: `LOG_AUTH_${Date.now()}`,
      userId: 'UNKNOWN',
      userName: userName,
      action: 'USER_LOGIN',
      entity: 'System',
      entityId: 'Session',
      newValue: `Authenticated as ${role}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogsAndSync((prev) => [newLog, ...prev]);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_role`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_name`);
  };

  // Add a newly approved Form 1 recruiter directly to active recruiter roster
  const handleAddNewApproveRecruiter = (newRec: User) => {
    setUsersAndSync((prev) => [newRec, ...prev]);
  };

  // Rendering Routing switch keys
  const renderViewContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardView
            userRole={userRole!}
            candidates={candidates}
            users={users}
            teams={teams}
            offers={offers}
            courseStudents={courseStudents}
            activityLogs={activityLogs}
            setCandidates={setCandidatesAndSync}
            setActivityLogs={setActivityLogsAndSync}
            setNotifications={setNotificationsAndSync}
            openSection={setActiveSection}
            recruiterFormApplicationRequests={recruiterFormApplicationRequests}
            setRecruiterFormApplicationRequests={setRecruiterFormApplicationRequestsAndSync}
            onApproveRecruiter={handleAddNewApproveRecruiter}
            theme={theme}
          />
        );
      case 'candidates':
        return (
          <CandidatesView
            candidates={candidates}
            setCandidates={setCandidatesAndSync}
            users={users}
            teams={teams}
            offers={offers}
            userRole={userRole!}
            setNotifications={setNotificationsAndSync}
            setActivityLogs={setActivityLogsAndSync}
          />
        );
      case 'recruiters':
        return (
          <RecruitersView
            users={users}
            setUsers={setUsersAndSync}
            teams={teams}
            candidates={candidates}
            userRole={userRole!}
            recruiterFormApplicationRequests={recruiterFormApplicationRequests}
            setRecruiterFormApplicationRequests={setRecruiterFormApplicationRequestsAndSync}
            setNotifications={setNotificationsAndSync}
            setActivityLogs={setActivityLogsAndSync}
          />
        );
      case 'teams':
        return (
          <TeamsView
            teams={teams}
            setTeams={setTeamsAndSync}
            users={users}
            setUsers={setUsersAndSync}
            candidates={candidates}
            userRole={userRole!}
            setNotifications={setNotificationsAndSync}
            setActivityLogs={setActivityLogsAndSync}
          />
        );
      case 'offers':
        return (
          <OffersView
            offers={offers}
            setOffers={setOffersAndSync}
            companies={companies}
            candidates={candidates}
            userRole={userRole!}
            setNotifications={setNotificationsAndSync}
            setActivityLogs={setActivityLogsAndSync}
            theme={theme}
          />
        );
      case 'academy':
        return (
          <AcademyView
            courses={courses}
            setCourses={setCoursesAndSync}
            courseStudents={courseStudents}
            setCourseStudents={setCourseStudentsAndSync}
            userRole={userRole!}
            setNotifications={setNotificationsAndSync}
            setActivityLogs={setActivityLogsAndSync}
          />
        );
      case 'companies':
        return (
          <CompaniesView
            companies={companies}
            setCompanies={setCompaniesAndSync}
            userRole={userRole!}
            setNotifications={setNotificationsAndSync}
            setActivityLogs={setActivityLogsAndSync}
          />
        );
      case 'forms':
        return (
          <FormsView
            candidates={candidates}
            setCandidates={setCandidatesAndSync}
            users={users}
            teams={teams}
            offers={offers}
            courses={courses}
            courseStudents={courseStudents}
            setCourseStudents={setCourseStudentsAndSync}
            setNotifications={setNotificationsAndSync}
            setActivityLogs={setActivityLogsAndSync}
            recruiterFormApplicationRequests={recruiterFormApplicationRequests}
            setRecruiterFormApplicationRequests={setRecruiterFormApplicationRequestsAndSync}
          />
        );
      case 'developer':
        return <DeveloperLogsView activityLogs={activityLogs} />;
      default:
        return (
          <div className="py-20 text-center text-slate-400">
            Navigation section mismatch. Re-syncing...
          </div>
        );
    }
  };

  // If user is not authenticated yet, render the Login Screen Gate
  if (!userRole) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#030712] bento-dot-grid flex font-sans">
      
      {/* 1. COLLAPSIBLE/COLLAPSING SIDEBAR DIRECTORY */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        userRole={userRole}
      />

      {/* 2. MAIN PLATFORM CONTAINER: Floating margin matches sidebar collapse offsets dynamically */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 min-h-screen ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'
        }`}
      >
        
        {/* Dynamic header tracker switches */}
        <Header
          userRole={userRole}
          setUserRole={setUserRole}
          notifications={notifications}
          setNotifications={setNotifications}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
          selectedUserName={selectedUserName}
          theme={theme}
          setTheme={setTheme}
          users={users}
        />

        {/* Primary View content mounting zone */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto overflow-y-auto relative z-10">
          {renderViewContent()}
        </main>

        {/* Global Footer bar */}
        <footer className="py-4 border-t border-white/5 bg-slate-950/20 backdrop-blur-md text-center text-[10px] text-slate-500 font-mono tracking-wider select-none flex items-center justify-between px-6 z-10">
          <span>FLUENT RECRUITMENT SYSTEMS © 2026. ALL RIGHTS RESERVED.</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="cursor-pointer hover:text-indigo-400 uppercase transition-colors" onClick={handleLogout}>
              Logout Node
            </span>
          </div>
        </footer>

      </div>

      {/* Floating Toast Notification Channel */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full p-4 pointer-events-none" id="global-toast-container">
        {toasts.map((t) => {
          let icon = <Info size={16} className="text-blue-400" />;
          let border = 'border-blue-500/30';
          let bg = 'bg-[#0f172a]/95';
          if (t.type === 'success') {
            icon = <CheckCircle2 size={16} className="text-emerald-400" />;
            border = 'border-emerald-500/30';
          } else if (t.type === 'warning') {
            icon = <AlertTriangle size={16} className="text-amber-400" />;
            border = 'border-amber-500/30';
          } else if (t.type === 'error') {
            icon = <XCircle size={16} className="text-rose-400" />;
            border = 'border-rose-500/30';
          }
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border ${border} ${bg} backdrop-blur-md shadow-2xl pointer-events-auto transition-all animate-slide-in`}
              role="alert"
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-xs text-slate-200 font-medium leading-relaxed">
                {t.message}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 hover:bg-white/5 rounded-lg"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Global Interactive Security Confirmation Modal Interface */}
      {confirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" id="global-confirm-dialog-overlay">
          <div className="bg-[#111827] border border-slate-800/85 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  {confirmModal.title || 'Security Confirmation'}
                </h4>
                <p className="text-[10px] font-mono text-slate-500">Action authorization stage</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-semibold transition-all"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/10"
              >
                Confirm release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
