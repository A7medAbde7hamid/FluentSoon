/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Link,
  ChevronRight,
  ClipboardList,
  UserPlus,
  Compass,
  Sparkles,
  Award,
  Users,
  CheckCircle,
} from 'lucide-react';
import {
  Candidate,
  User,
  Team,
  Offer,
  Course,
  CourseStudent,
  CandidateStatus,
  CourseStatus,
  PaymentStatus,
  AppNotification,
  ActivityLog,
} from '../types';

interface FormsViewProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  users: User[];
  teams: Team[];
  offers: Offer[];
  courses: Course[];
  courseStudents: CourseStudent[];
  setCourseStudents: React.Dispatch<React.SetStateAction<CourseStudent[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  recruiterFormApplicationRequests: any[];
  setRecruiterFormApplicationRequests: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function FormsView({
  candidates,
  setCandidates,
  users,
  teams,
  offers,
  courses,
  courseStudents,
  setCourseStudents,
  setNotifications,
  setActivityLogs,
  recruiterFormApplicationRequests,
  setRecruiterFormApplicationRequests,
}: FormsViewProps) {
  const [activeFormTab, setActiveFormTab] = useState('FORM2');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Form 1 input state (New Recruiter Application)
  const [f1Name, setF1Name] = useState('');
  const [f1Phone, setF1Phone] = useState('');
  const [f1Pay, setF1Pay] = useState('Vodafone Cash');

  // 2. Form 2 input state (Candidate Apply)
  const [f2Name, setF2Name] = useState('');
  const [f2Phone, setF2Phone] = useState('');
  const [f2Email, setF2Email] = useState('');
  const [f2Loc, setF2Loc] = useState('Maadi, Cairo');
  const [f2Lang, setF2Lang] = useState('English');
  const [f2Level, setF2Level] = useState('Fluent');
  const [f2Grad, setF2Grad] = useState('Graduated');
  const [f2OfferId, setF2OfferId] = useState(offers[0]?.id || '');
  const [f2RefCode, setF2RefCode] = useState('REC401');

  // 3. Form 3 input state (English Course Interested)
  const [f3Name, setF3Name] = useState('');
  const [f3Phone, setF3Phone] = useState('');
  const [f3Grad, setF3Grad] = useState('Graduated');
  const [f3CourseId, setF3CourseId] = useState(courses[0]?.id || '');
  const [f3RefCode, setF3RefCode] = useState('REC401');

  // 4. Form 4 input state (Course Registration)
  const [f4Name, setF4Name] = useState('');
  const [f4Phone, setF4Phone] = useState('');
  const [f4CourseId, setF4CourseId] = useState(courses[0]?.id || '');
  const [f4Amt, setF4Amt] = useState(courses[0]?.price || 1500);
  const [f4RefCode, setF4RefCode] = useState('REC401');

  // 5. Form 5 input state (Team Registration)
  const [f5Name, setF5Name] = useState('');
  const [f5Phone, setF5Phone] = useState('');
  const [f5TeamId, setF5TeamId] = useState(teams[0]?.id || '');

  const simulateSuccessBanner = (msg: string) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(msg);
      // alert sound simulation by logs
      console.log('🔔 [SOUND] Form submitted successfully');
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    }, 800);
  };

  // Submit operations
  const handleF1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f1Name || !f1Phone) return;

    const newReq = {
      id: `REQ_${Date.now()}`,
      fullName: f1Name,
      phone: f1Phone,
      paymentMethod: f1Pay,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRecruiterFormApplicationRequests((prev) => [newReq, ...prev]);

    // audit log
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'PUBLIC',
      userName: 'Public Web Guest',
      action: 'PUBLIC_FORM1_SUBMIT',
      entity: 'RecruiterApplication',
      entityId: newReq.id,
      newValue: `Recruiter application submitted by ${newReq.fullName}`,
      ipAddress: '197.34.1.2',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // notify Super Admin
    const newNotif: AppNotification = {
      id: `NOT_F1_${Date.now()}`,
      title: 'New Recruiter Form 1 Submitted',
      message: `${f1Name} has applied via Form 1. Review and matching team in Super Admin console.`,
      read: false,
      type: 'WARNING',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    simulateSuccessBanner('Form 1 submitted successfully! The Super Admin has received your application request.');
    setF1Name('');
    setF1Phone('');
  };

  const handleF2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f2Name || !f2Phone || !f2OfferId) return;

    const linkedOffer = offers.find((o) => o.id === f2OfferId);
    const associatedRecruiter = users.find((u) => u.recruiterCode === f2RefCode) || users[7]; // default Fatma

    const newCand: Candidate = {
      id: `CAND_FORM_${Date.now()}`,
      fullName: f2Name,
      phone: f2Phone,
      email: f2Email || undefined,
      location: f2Loc,
      language: f2Lang,
      languageLevel: f2Level,
      graduationStatus: f2Grad,
      offerId: f2OfferId,
      offerName: linkedOffer ? linkedOffer.offerName : 'UK Support support',
      recruiterId: associatedRecruiter.id,
      recruiterName: associatedRecruiter.fullName,
      teamId: associatedRecruiter.teamId || 'TEAM001',
      teamName: associatedRecruiter.teamId === 'TEAM001' ? 'Team Pola' : associatedRecruiter.teamId === 'TEAM002' ? 'Team Christen' : 'Onboarding team',
      status: CandidateStatus.NEW,
      source: 'Google Form clone',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    setCandidates((prev) => [newCand, ...prev]);

    // log
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'PUBLIC',
      userName: 'Public Web Guest',
      action: 'PUBLIC_FORM2_SUBMIT',
      entity: 'Candidate',
      entityId: newCand.id,
      newValue: `Application from ${newCand.fullName} associated to code: ${f2RefCode}`,
      ipAddress: '197.20.10.22',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // notify
    const newNotif: AppNotification = {
      id: `NOT_F2_${Date.now()}`,
      title: 'Form 2 Applicant Ingested',
      message: `${f2Name} has submitted Form 2 under tracking code ${f2RefCode}. Recruiter: ${associatedRecruiter.fullName}`,
      read: false,
      type: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    simulateSuccessBanner('Form 2 Ingested successfully into Candidates board CRM Database!');
    setF2Name('');
    setF2Phone('');
    setF2Email('');
  };

  const handleF3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f3Name || !f3Phone || !f3CourseId) return;

    const linkedCrs = courses.find((c) => c.id === f3CourseId);
    const associatedRecruiter = users.find((u) => u.recruiterCode === f3RefCode) || users[7];

    const freshStudent: CourseStudent = {
      id: `STUD_FORM3_${Date.now()}`,
      fullName: f3Name,
      phone: f3Phone,
      graduationStatus: f3Grad,
      recruiterPhone: associatedRecruiter.phone,
      teamName: 'Team Pola',
      courseId: f3CourseId,
      courseName: linkedCrs ? linkedCrs.name : 'Masterclass language coaching',
      status: CourseStatus.REGISTERED,
      paymentStatus: PaymentStatus.PENDING,
      paymentAmount: 0,
      dueDate: '2026-07-15',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCourseStudents((prev) => [freshStudent, ...prev]);

    // log
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'PUBLIC',
      userName: 'Public Web Guest',
      action: 'PUBLIC_FORM3_SUBMIT',
      entity: 'CourseStudent',
      entityId: freshStudent.id,
      newValue: `Interest declared by ${freshStudent.fullName} for ${freshStudent.courseName}`,
      ipAddress: '197.40.40.1',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // notify
    const newNotif: AppNotification = {
      id: `NOT_F3_${Date.now()}`,
      title: 'Academy Interest Registered',
      message: `${f3Name} declared interest in course ${freshStudent.courseName} via Form 3.`,
      read: false,
      type: 'INFO',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    simulateSuccessBanner('Form 3 submitted! Student interest registered under Academy Ledger.');
    setF3Name('');
    setF3Phone('');
  };

  const handleF4Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f4Name || !f4Phone || !f4CourseId) return;

    const linkedCrs = courses.find((c) => c.id === f4CourseId);
    const associatedRecruiter = users.find((u) => u.recruiterCode === f4RefCode) || users[7];

    const freshStudent: CourseStudent = {
      id: `STUD_FORM4_${Date.now()}`,
      fullName: f4Name,
      phone: f4Phone,
      graduationStatus: 'Graduated',
      recruiterPhone: associatedRecruiter.phone,
      teamName: 'Team Pola',
      courseId: f4CourseId,
      courseName: linkedCrs ? linkedCrs.name : 'Masterclass language coaching',
      status: CourseStatus.ACTIVE,
      paymentStatus: PaymentStatus.PAID,
      paymentAmount: Number(f4Amt),
      dueDate: '2026-06-25',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCourseStudents((prev) => [freshStudent, ...prev]);

    // log
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'PUBLIC',
      userName: 'Public Web Guest',
      action: 'PUBLIC_FORM4_SUBMIT',
      entity: 'CourseStudent',
      entityId: freshStudent.id,
      newValue: `Paid registration by student ${freshStudent.fullName}. Amount: ${f4Amt}`,
      ipAddress: '197.80.12.9',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // Notify
    const newNotif: AppNotification = {
      id: `NOT_F4_${Date.now()}`,
      title: 'Academy Payment Logged',
      message: `${f4Name} completed payment of ${f4Amt} EGP for ${freshStudent.courseName} via Form 4.`,
      read: false,
      type: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    simulateSuccessBanner('Form 4 completed! Student paid registration logged successfully.');
    setF4Name('');
    setF4Phone('');
  };

  return (
    <div className="space-y-6 font-sans pb-12 select-none">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">Google Forms Native Replacements</h2>
        <p className="text-xs text-slate-400 mt-1">
          Simulated web inputs. Click any form on the navigation sub-bar to submit rows directly into Candidate, Recruiter, or Academy lists.
        </p>
      </div>

      {/* FORM NAVIGATION BAR */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto hide-scrollbar pb-1">
        <button
          onClick={() => setActiveFormTab('FORM1')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeFormTab === 'FORM1' ? 'bg-[#111827] text-blue-400 border-t border-x border-[#334155]/60' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Form 1: Recruiter Join
        </button>
        <button
          onClick={() => setActiveFormTab('FORM2')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeFormTab === 'FORM2' ? 'bg-[#111827] text-blue-400 border-t border-x border-[#334155]/60' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Form 2: Candidate Apply
        </button>
        <button
          onClick={() => setActiveFormTab('FORM3')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeFormTab === 'FORM3' ? 'bg-[#111827] text-blue-400 border-t border-x border-[#334155]/60' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Form 3: English Interest
        </button>
        <button
          onClick={() => setActiveFormTab('FORM4')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeFormTab === 'FORM4' ? 'bg-[#111827] text-blue-400 border-t border-x border-[#334155]/60' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Form 4: Tuition Registration
        </button>
      </div>

      {/* SUCCESS DISPLAY BANNER */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-400 font-semibold leading-relaxed flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}

      {/* FORMS CONTAINER */}
      <div className="p-6 bg-[#111827] border border-[#334155]/60 rounded-3xl max-w-xl mx-auto shadow-xl">
        
        {/* TAB 1: FORM 1 RECRUITER REGISTRATION */}
        {activeFormTab === 'FORM1' && (
          <form onSubmit={handleF1Submit} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-2">
              <UserPlus size={16} className="text-blue-400" />
              Form 1: Recruiter Registry
            </h3>

            <div>
              <label className="block text-slate-350 font-semibold mb-1.5">Full Legal Name *</label>
              <input
                type="text"
                required
                className="w-full bg-[#020617] border border-slate-700 rounded-xl p-2.5 text-slate-100"
                placeholder="Maged El-Khawaga"
                value={f1Name}
                onChange={(e) => setF1Name(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-350 font-semibold mb-1.5">WhatsApp Mobile Number *</label>
              <input
                type="text"
                required
                className="w-full bg-[#020617] border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                placeholder="+201011335577"
                value={f1Phone}
                onChange={(e) => setF1Phone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-350 font-semibold mb-1.5">Selected Commission Payout method</label>
              <select
                className="w-full bg-[#020617] border border-slate-700 rounded-xl p-2.5 text-slate-100"
                value={f1Pay}
                onChange={(e) => setF1Pay(e.target.value)}
              >
                <option value="Vodafone Cash (+201011335577)">Vodafone Cash</option>
                <option value="InstaPay (maged@instapay)">InstaPay</option>
                <option value="CIB Bank Wire transfer">Bank Transfer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md glow-btn-primary mt-2"
            >
              {submitting ? 'Registering application...' : 'Submit Form 1 application'}
            </button>
          </form>
        )}

        {/* TAB 2: FORM 2 CANDIDATE APPLY (Tracking URL reference codes) */}
        {activeFormTab === 'FORM2' && (
          <form onSubmit={handleF2Submit} className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Compass size={16} className="text-pink-400" />
                Form 2: Candidate Application link
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                <Link size={10} /> tracking: ?ref={f2RefCode}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Applicant Full Name *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#020617] border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  placeholder="Seif Karim"
                  value={f2Name}
                  onChange={(e) => setF2Name(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Mobile Phone *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono"
                  placeholder="+201010101010"
                  value={f2Phone}
                  onChange={(e) => setF2Phone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Email Address</label>
                <input
                  type="email"
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  placeholder="seif@gmail.com"
                  value={f2Email}
                  onChange={(e) => setF2Email(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Current Location</label>
                <input
                  type="text"
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  placeholder="Dokki, Giza"
                  value={f2Loc}
                  onChange={(e) => setF2Loc(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Oral Language</label>
                <select
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  value={f2Lang}
                  onChange={(e) => setF2Lang(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Grade Level</label>
                <select
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  value={f2Level}
                  onChange={(e) => setF2Level(e.target.value)}
                >
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced (B2)</option>
                  <option value="Intermediate">Intermediate (B1)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Graduation status</label>
                <select
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  value={f2Grad}
                  onChange={(e) => setF2Grad(e.target.value)}
                >
                  <option value="Graduated">Graduated</option>
                  <option value="Postponed">Postponed</option>
                  <option value="Enrolled">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Matched Position vacancy *</label>
                <select
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:ring-1"
                  value={f2OfferId}
                  onChange={(e) => setF2OfferId(e.target.value)}
                >
                  {offers.map((off) => (
                    <option key={off.id} value={off.id}>{off.offerName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
              <label className="block text-slate-400 font-bold mb-1.5">Target Web Reference Link Code (?ref=)</label>
              <select
                className="w-full bg-[#111827] border border-slate-700 p-2 text-xs text-slate-100 rounded-lg"
                value={f2RefCode}
                onChange={(e) => setF2RefCode(e.target.value)}
              >
                <option value="REC401">REC401 (Fatma Aly - Team Pola)</option>
                <option value="REC402">REC402 (Mostafa El-Sayed - Team Pola)</option>
                <option value="REC403">REC403 (Nour Kamel - Team Christen)</option>
                <option value="REC404">REC404 (Mariam Hassan - Onboarding)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-md glow-btn-pink mt-2"
            >
              Post Form 2 Application
            </button>
          </form>
        )}

        {/* TAB 3: FORM 3 COURSE INTERESTED */}
        {activeFormTab === 'FORM3' && (
          <form onSubmit={handleF3Submit} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-2">
              <Sparkles size={16} className="text-blue-400" />
              Form 3: English course interested
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Student Legal Name *</label>
              <input
                type="text"
                required
                className="w-full bg-[#020617] border border-slate-700 rounded-xl p-2.5 text-slate-100"
                placeholder="Rania Aly"
                value={f3Name}
                onChange={(e) => setF3Name(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Contact Phone *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono"
                  placeholder="+201122334455"
                  value={f3Phone}
                  onChange={(e) => setF3Phone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Graduation level</label>
                <select
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  value={f3Grad}
                  onChange={(e) => setF3Grad(e.target.value)}
                >
                  <option value="Graduated">Graduated</option>
                  <option value="Postponed">Postponed</option>
                  <option value="Enrolled">Student</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Desired Course *</label>
                <select
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  value={f3CourseId}
                  onChange={(e) => setF3CourseId(e.target.value)}
                >
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>{crs.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Referral Recruiter Code</label>
                <select
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  value={f3RefCode}
                  onChange={(e) => setF3RefCode(e.target.value)}
                >
                  <option value="REC401">REC401 (Fatma)</option>
                  <option value="REC403">REC403 (Nour)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md glow-btn-primary mt-2"
            >
              Submit Course Interest
            </button>
          </form>
        )}

        {/* TAB 4: FORM 4 TUITION PAYMENT */}
        {activeFormTab === 'FORM4' && (
          <form onSubmit={handleF4Submit} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-2">
              <Award size={16} className="text-pink-400" />
              Form 4: Tuition paid registration
            </h3>

            <div>
              <label className="block text-slate-350 font-semibold mb-1.5">Tuition Student Legal Name *</label>
              <input
                type="text"
                required
                className="w-full bg-[#020617] border border-slate-700 rounded-xl p-2.5 text-slate-100"
                placeholder="Sherif Kamel"
                value={f4Name}
                onChange={(e) => setF4Name(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-350 font-semibold mb-1.5">Mobile Phone *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono"
                  placeholder="+201288990011"
                  value={f4Phone}
                  onChange={(e) => setF4Phone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-350 font-semibold mb-1.5">Paid Tuition Amount (EGP)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono"
                  value={f4Amt}
                  onChange={(e) => setF4Amt(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-350 font-semibold mb-1.5">Course Enrolled *</label>
                <select
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  value={f4CourseId}
                  onChange={(e) => setF4CourseId(e.target.value)}
                >
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>{crs.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-350 font-semibold mb-1.5">Recommender Code</label>
                <select
                  className="w-full bg-[#020617] border border-slate-700/80 rounded-xl p-2.5 text-slate-105"
                  value={f4RefCode}
                  onChange={(e) => setF4RefCode(e.target.value)}
                >
                  <option value="REC401">REC401 (Fatma)</option>
                  <option value="REC403">REC403 (Nour)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-md glow-btn-pink mt-2"
            >
              Submit Paid Tuition Entry
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
