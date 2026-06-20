/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OWNER = 'OWNER',
  TEAM_LEADER = 'TEAM_LEADER',
  RECRUITER = 'RECRUITER',
  HIRING_MANAGER = 'HIRING_MANAGER',
  DEVELOPER = 'DEVELOPER',
}

export enum CandidateStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
}

export enum CourseStatus {
  REGISTERED = 'REGISTERED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  teamId?: string;
  active: boolean;
  avatar: string;
  paymentMethod?: string;
  recruiterCode?: string;
  joinDate: string;
}

export interface Team {
  id: string;
  name: string;
  leaderId?: string;
  leaderName?: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  location: string;
  industry: string;
  active: boolean;
  createdAt: string;
}

export interface Offer {
  id: string;
  companyId: string;
  companyName: string;
  offerName: string;
  language: string;
  englishLevel: string;
  graduationStatus: string;
  salary?: string;
  requirements: string;
  interviewType: 'ONSITE' | 'ONLINE' | 'PHONE';
  status: 'ACTIVE' | 'CLOSED' | 'ON_HOLD' | 'ACCEPTED' | 'PENDING';
  maxCandidates?: number;
  closingDate?: string;
  notifyCandidateOnStatusChange?: boolean;
  createdAt: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  location?: string;
  language: string;
  languageLevel: string;
  graduationStatus: string;
  militaryStatus?: string;
  nationalId?: string;
  offerId: string;
  offerName: string;
  recruiterId: string;
  recruiterName: string;
  teamId?: string;
  teamName?: string;
  status: CandidateStatus;
  source?: string;
  notes?: string;
  cvUrl?: string;
  interviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  interviewDate: string;
  interviewType: 'ONSITE' | 'ONLINE' | 'PHONE';
  result?: 'PASSED' | 'FAILED' | 'PENDING';
  notes?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  goal: string;
  targetPeople: string;
  dailyPlan: string;
  durationWeeks: number;
  price: number;
  createdAt: string;
}

export interface CourseStudent {
  id: string;
  fullName: string;
  phone: string;
  graduationStatus: string;
  recruiterPhone?: string;
  teamName?: string;
  courseId: string;
  courseName: string;
  status: CourseStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  dueDate?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string; // If undefined, broadcast to all
  title: string;
  message: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  createdAt: string;
}
