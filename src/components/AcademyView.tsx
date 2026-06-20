/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, Landmark, CheckSquare, Plus, RefreshCw, Layers, BookOpen, Clock, Users, X, Check, Award } from 'lucide-react';
import { Course, CourseStudent, CourseStatus, PaymentStatus, AppNotification, ActivityLog } from '../types';
import { showToast } from '../utils/toast';

interface AcademyViewProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  courseStudents: CourseStudent[];
  setCourseStudents: React.Dispatch<React.SetStateAction<CourseStudent[]>>;
  userRole: string;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
}

export default function AcademyView({
  courses,
  setCourses,
  courseStudents,
  setCourseStudents,
  userRole,
  setNotifications,
  setActivityLogs,
}: AcademyViewProps) {
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  // Student Form state
  const [studName, setStudName] = useState('');
  const [studPhone, setStudPhone] = useState('');
  const [studGrad, setStudGrad] = useState('Graduated');
  const [studCourseId, setStudCourseId] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [payStatus, setPayStatus] = useState<PaymentStatus>(PaymentStatus.PAID);
  const [payAmount, setPayAmount] = useState(1500);

  // Course Form state
  const [courseNameInput, setCourseNameInput] = useState('');
  const [coursePrice, setCoursePrice] = useState(1500);
  const [courseDur, setCourseDur] = useState(4);
  const [courseDesc, setCourseDesc] = useState('');

  // Filtering calculations
  const filteredStudents = courseStudents.filter((stud) => {
    return filterCourse === 'ALL' ? true : stud.courseId === filterCourse;
  });

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studName || !studPhone || !studCourseId) {
      showToast('Kindly provide the complete core student parameters.', 'error');
      return;
    }

    const linkedCrs = courses.find((c) => c.id === studCourseId);

    const freshStudent: CourseStudent = {
      id: `STUD_NEW_${Date.now()}`,
      fullName: studName,
      phone: studPhone,
      graduationStatus: studGrad,
      recruiterPhone: recPhone || undefined,
      teamName: 'Team Pola', // default
      courseId: studCourseId,
      courseName: linkedCrs ? linkedCrs.name : 'Premium Masterclass',
      status: CourseStatus.REGISTERED,
      paymentStatus: payStatus,
      paymentAmount: payAmount,
      dueDate: '2026-07-10',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCourseStudents((prev) => [freshStudent, ...prev]);

    // Log audit
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'USR001',
      userName: 'Youssef Mansour',
      action: 'ACADEMY_REGISTER_STUDENT',
      entity: 'Student',
      entityId: freshStudent.id,
      newValue: `Enrolled student ${freshStudent.fullName} in course ${freshStudent.courseName}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // Notify info
    const newNotif: AppNotification = {
      id: `NOT_AC_${Date.now()}`,
      title: 'Academy Student Registered',
      message: `${freshStudent.fullName} registrated in ${freshStudent.courseName}. Payment status: ${payStatus}`,
      read: false,
      type: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Successfully registered academy student profile for ${freshStudent.fullName}.`, 'success');

    setStudName('');
    setStudPhone('');
    setRecPhone('');
    setShowAddStudentModal(false);
  };

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseNameInput) {
      showToast('Kindly type in the complete course name.', 'error');
      return;
    }

    const freshCrs: Course = {
      id: `CRS_NEW_${Date.now()}`,
      name: courseNameInput,
      description: courseDesc || 'Fluent coaching curriculum neutralizing language accent hurdles.',
      goal: 'Accelerate oral fluency and BPO mock testing pass rates.',
      targetPeople: 'Intermediate speakers matching corporate positions.',
      dailyPlan: 'Comprehensive module practices and assessment pre-screeners tutorials.',
      durationWeeks: courseDur,
      price: coursePrice,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCourses((prev) => [...prev, freshCrs]);

    // Log
    const newLog: ActivityLog = {
      id: `LOG_${Date.now()}`,
      userId: 'USR001',
      userName: 'Youssef Mansour',
      action: 'ACADEMY_CREATE_COURSE',
      entity: 'Course',
      entityId: freshCrs.id,
      newValue: `Created training program: ${freshCrs.name}`,
      ipAddress: '197.34.201.55',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    // Toast
    const newNotif: AppNotification = {
      id: `NOT_CRS_${Date.now()}`,
      title: 'Training Course Opened',
      message: `${freshCrs.name} launched with duration of ${freshCrs.durationWeeks} weeks. Price: ${freshCrs.price} EGP.`,
      read: false,
      type: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Successfully opened coaching training course "${freshCrs.name}".`, 'success');

    setCourseNameInput('');
    setCourseDesc('');
    setShowAddCourseModal(false);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Title & Core actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Academy Course & Student Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Coaching programs, student registries, tuition fees, and payment status tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="px-4 py-2 bg-slate-900 border border-slate-700/80 hover:border-blue-500 rounded-xl text-xs text-slate-200 transition-all flex items-center gap-1.5"
          >
            <BookOpen size={14} className="text-pink-400" /> Assemble Course Curriculum
          </button>

          <button
            onClick={() => {
              if (courses.length === 0) {
                showToast('Assemble at least one training Course curriculum first.', 'warning');
                return;
              }
              setStudCourseId(courses[0].id);
              setShowAddStudentModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:brightness-110 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1.5"
          >
            <GraduationCap size={14} /> Register Tuition Student
          </button>
        </div>
      </div>

      {/* DYNAMIC AGGREGATED COURSES SHEETS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        {courses.map((crs) => {
          const registeredCount = courseStudents.filter((s) => s.courseId === crs.id).length;
          return (
            <div
              key={crs.id}
              className="p-5 rounded-3xl bg-[#111827] border border-[#334155]/60 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-400/5 transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <GraduationCap size={16} className="text-blue-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Training program spec</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100">{crs.name}</h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Plan: {crs.description}
                </p>
              </div>

              {/* Roster details card */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-4 mt-4 text-center text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 block">Weekly Duration</span>
                  <span className="font-semibold text-slate-300 font-mono mt-0.5 block">{crs.durationWeeks} Weeks</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Tuition Price</span>
                  <span className="font-semibold text-pink-400 font-mono mt-0.5 block">{crs.price} EGP</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Active Students</span>
                  <span className="font-semibold text-emerald-400 font-mono mt-0.5 block">{registeredCount} Enrolled</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* FILTER SEARCH FIELD */}
      <div className="p-4 bg-[#111827] border border-[#334155]/60 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-755 rounded-xl px-3 py-1.5 text-xs w-full max-w-sm">
          <BookOpen className="text-purple-400" size={13} />
          <select
            className="bg-transparent text-slate-200 outline-none w-full focus:ring-0"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="ALL" className="bg-slate-900">All Course Students</option>
            {courses.map((crs) => (
              <option key={crs.id} value={crs.id} className="bg-slate-900">{crs.name}</option>
            ))}
          </select>
        </div>
        <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">Ledger ledger database</span>
      </div>

      {/* STUDENTS DIRECTORY TABLE */}
      <div className="bg-[#111827] border border-[#334155]/60 rounded-2xl overflow-hidden shadow-lg select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-slate-900/40 border-collapse">
            <thead className="bg-[#020617] text-slate-400">
              <tr className="border-b border-slate-800">
                <th className="p-4">Student Name</th>
                <th className="p-4">Training Program</th>
                <th className="p-4">Referred Recruiter Phone</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 font-mono">Recorded Tuition</th>
                <th className="p-4 text-right">Quick state change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filteredStudents.map((stud) => (
                <tr key={stud.id} className="hover:bg-slate-900/60 font-sans">
                  <td className="p-4">
                    <div className="font-bold text-slate-100">{stud.fullName}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{stud.phone}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-300">
                    <p className="truncate max-w-[170px]">{stud.courseName}</p>
                    <p className="text-[9px] text-slate-500 font-mono">Date: {stud.createdAt}</p>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{stud.recruiterPhone || 'Direct Registration'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${
                      stud.paymentStatus === PaymentStatus.PAID
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : stud.paymentStatus === PaymentStatus.PARTIAL
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {stud.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-200">
                    {stud.paymentAmount} EGP
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1.5 justify-end">
                      {stud.paymentStatus !== PaymentStatus.PAID && (
                        <button
                          onClick={() => {
                            const updated = courseStudents.map((s) =>
                              s.id === stud.id ? { ...s, paymentStatus: PaymentStatus.PAID, paymentAmount: 1500 } : s
                            );
                            setCourseStudents(updated);

                            // log
                            const newLog: ActivityLog = {
                              id: `LOG_${Date.now()}`,
                              userId: 'USR001',
                              userName: 'Youssef Mansour',
                              action: 'ACADEMY_TUITION_PAID',
                              entity: 'Student',
                              entityId: stud.id,
                              newValue: `Recorded tuition payment of 1500 EGP for student ${stud.fullName}`,
                              ipAddress: '197.34.201.55',
                              createdAt: new Date().toISOString(),
                            };
                            setActivityLogs((prev) => [newLog, ...prev]);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px]"
                        >
                          Unlock PAID
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          const updated = courseStudents.map((s) =>
                            s.id === stud.id ? { ...s, status: CourseStatus.COMPLETED } : s
                          );
                          setCourseStudents(updated);
                        }}
                        className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] rounded"
                      >
                        Graduate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-500">
                    No matching training student profiles logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: STUDENT REGISTRATION */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#334155] rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-1.5">
              <GraduationCap size={15} className="text-blue-500 animate-pulse" />
              Register Tuition Student
            </h3>

            <form onSubmit={handleCreateStudentSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Student Legal Name *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  placeholder="Yassin Ghoneim"
                  value={studName}
                  onChange={(e) => setStudName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    placeholder="+201011223344"
                    value={studPhone}
                    onChange={(e) => setStudPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Graduation Status</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={studGrad}
                    onChange={(e) => setStudGrad(e.target.value)}
                  >
                    <option value="Graduated">Graduated</option>
                    <option value="Postponed">Postponed</option>
                    <option value="Enrolled">Enrolled Student</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Enrolling Course *</label>
                  <select
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 animate-pulse"
                    value={studCourseId}
                    onChange={(e) => setStudCourseId(e.target.value)}
                  >
                    {courses.map((crs) => (
                      <option key={crs.id} value={crs.id}>{crs.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Recommender Recruiter Phone</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    placeholder="+201011122233"
                    value={recPhone}
                    onChange={(e) => setRecPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Payment tuition fee status</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={payStatus}
                    onChange={(e) => setPayStatus(e.target.value as PaymentStatus)}
                  >
                    <option value={PaymentStatus.PAID}>Paid In Full</option>
                    <option value={PaymentStatus.PARTIAL}>Partial Payment</option>
                    <option value={PaymentStatus.PENDING}>Tuple Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 font-sans">Payment Tuition Amount (EGP)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md glow-btn-primary mt-2"
              >
                Register Tuition Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSEMBLE NEW ADVANCED COURSE */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#334155] rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddCourseModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-1.5">
              <BookOpen size={15} className="text-blue-500" />
              Assemble Course Curriculum
            </h3>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Coaching Program Name *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#111827] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                  placeholder="Premium Business Language Coaching"
                  value={courseNameInput}
                  onChange={(e) => setCourseNameInput(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Curriculum Price (EGP)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-[#111827] border border-slate-705 rounded-xl p-2.5 text-slate-100"
                    placeholder="1500"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Weekly Duration</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-[#111827] border border-slate-700/80 rounded-xl p-2.5 text-slate-100"
                    placeholder="4"
                    value={courseDur}
                    onChange={(e) => setCourseDur(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CBD5E1] font-semibold mb-1.5">Plan target goal and description</label>
                <textarea
                  className="w-full bg-[#111827] border border-slate-705 rounded-xl p-2.5 text-slate-100 h-20 resize-none text-xs"
                  placeholder="Focuses on accent reduction, visual support mock interviews..."
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md glow-btn-primary mt-2"
              >
                Launch Course Curriculum
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
