import { pgTable, varchar, boolean, text, integer } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey(),
  fullName: varchar('full_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  phone: varchar('phone', { length: 64 }).notNull(),
  role: varchar('role', { length: 64 }).notNull(), // SUPER_ADMIN, OWNER, TEAM_LEADER, RECRUITER, etc.
  teamId: varchar('team_id', { length: 128 }).references(() => teams.id),
  active: boolean('active').default(true).notNull(),
  avatar: text('avatar').default('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150').notNull(),
  paymentMethod: text('payment_method'),
  recruiterCode: varchar('recruiter_code', { length: 64 }),
  joinDate: varchar('join_date', { length: 64 }).notNull(),
});

// 2. Teams Table
export const teams = pgTable('teams', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  leaderId: varchar('leader_id', { length: 128 }).references(() => users.id),
  leaderName: varchar('leader_name', { length: 256 }),
  description: text('description').notNull(),
  status: varchar('status', { length: 64 }).default('ACTIVE').notNull(), // ACTIVE, INACTIVE
  createdAt: varchar('created_at', { length: 64 }).notNull(),
});

// 3. Companies Table
export const companies = pgTable('companies', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  location: varchar('location', { length: 256 }).notNull(),
  industry: varchar('industry', { length: 256 }).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: varchar('created_at', { length: 64 }).notNull(),
});

// 4. Offers Table
export const offers = pgTable('offers', {
  id: varchar('id', { length: 128 }).primaryKey(),
  companyId: varchar('company_id', { length: 128 }).notNull().references(() => companies.id),
  companyName: varchar('company_name', { length: 256 }).notNull(),
  offerName: varchar('offer_name', { length: 256 }).notNull(),
  language: varchar('language', { length: 128 }).notNull(),
  englishLevel: varchar('english_level', { length: 128 }).notNull(),
  graduationStatus: varchar('graduation_status', { length: 128 }).notNull(),
  salary: varchar('salary', { length: 256 }),
  requirements: text('requirements').notNull(),
  interviewType: varchar('interview_type', { length: 64 }).notNull(), // ONSITE, ONLINE, PHONE
  status: varchar('status', { length: 64 }).default('ACTIVE').notNull(), // ACTIVE, CLOSED, ON_HOLD, etc.
  maxCandidates: integer('max_candidates'),
  closingDate: varchar('closing_date', { length: 64 }),
  notifyCandidateOnStatusChange: boolean('notify_candidate_on_status_change').default(false),
  createdAt: varchar('created_at', { length: 64 }).notNull(),
});

// 5. Candidates Table
export const candidates = pgTable('candidates', {
  id: varchar('id', { length: 128 }).primaryKey(),
  fullName: varchar('full_name', { length: 256 }).notNull(),
  phone: varchar('phone', { length: 64 }).notNull(),
  email: varchar('email', { length: 256 }),
  location: varchar('location', { length: 256 }),
  language: varchar('language', { length: 128 }).notNull(),
  languageLevel: varchar('language_level', { length: 128 }).notNull(),
  graduationStatus: varchar('graduation_status', { length: 128 }).notNull(),
  militaryStatus: varchar('military_status', { length: 128 }),
  nationalId: varchar('national_id', { length: 64 }),
  offerId: varchar('offer_id', { length: 128 }).notNull().references(() => offers.id),
  offerName: varchar('offer_name', { length: 256 }).notNull(),
  recruiterId: varchar('recruiter_id', { length: 128 }).notNull().references(() => users.id),
  recruiterName: varchar('recruiter_name', { length: 256 }).notNull(),
  teamId: varchar('team_id', { length: 128 }).references(() => teams.id),
  teamName: varchar('team_name', { length: 256 }),
  status: varchar('status', { length: 128 }).notNull(), // NEW, CONTACTED, INTERVIEW_SCHEDULED, PASSED, FAILED, HIRED, REJECTED, etc.
  source: varchar('source', { length: 128 }),
  notes: text('notes'),
  cvUrl: text('cv_url'),
  interviewDate: varchar('interview_date', { length: 64 }),
  createdAt: varchar('created_at', { length: 64 }).notNull(),
  updatedAt: varchar('updated_at', { length: 64 }).notNull(),
});

// 6. Courses Table
export const courses = pgTable('courses', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull(),
  goal: text('goal').notNull(),
  targetPeople: text('target_people').notNull(),
  dailyPlan: text('daily_plan').notNull(),
  durationWeeks: integer('duration_weeks').notNull(),
  price: integer('price').notNull(),
  createdAt: varchar('created_at', { length: 64 }).notNull(),
});

// 7. Course Students Table
export const courseStudents = pgTable('course_students', {
  id: varchar('id', { length: 128 }).primaryKey(),
  fullName: varchar('full_name', { length: 256 }).notNull(),
  phone: varchar('phone', { length: 64 }).notNull(),
  graduationStatus: varchar('graduation_status', { length: 128 }).notNull(),
  recruiterPhone: varchar('recruiter_phone', { length: 64 }),
  teamName: varchar('team_name', { length: 256 }),
  courseId: varchar('course_id', { length: 128 }).notNull(),
  courseName: varchar('course_name', { length: 256 }).notNull(),
  status: varchar('status', { length: 128 }).notNull(), // REGISTERED, ACTIVE, COMPLETED, DROPPED
  paymentStatus: varchar('payment_status', { length: 128 }).notNull(), // PENDING, PAID, PARTIAL, OVERDUE
  paymentAmount: integer('payment_amount').default(0).notNull(),
  dueDate: varchar('due_date', { length: 64 }),
  createdAt: varchar('created_at', { length: 64 }).notNull(),
});

// 8. Notifications Table
export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }),
  title: varchar('title', { length: 256 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  type: varchar('type', { length: 64 }).notNull(), // INFO, SUCCESS, WARNING, ALERT
  createdAt: varchar('created_at', { length: 64 }).notNull(),
});

// 9. Activity Logs Table
export const activityLogs = pgTable('activity_logs', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  userName: varchar('user_name', { length: 256 }).notNull(),
  action: varchar('action', { length: 256 }).notNull(),
  entity: varchar('entity', { length: 256 }).notNull(),
  entityId: varchar('entity_id', { length: 128 }).notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  ipAddress: varchar('ip_address', { length: 128 }).notNull(),
  createdAt: varchar('created_at', { length: 64 }).notNull(),
});

// 10. Recruiter Form 1 Requests Table
export const recruiterF1Requests = pgTable('recruiter_f1_requests', {
  id: varchar('id', { length: 128 }).primaryKey(),
  fullName: varchar('full_name', { length: 256 }).notNull(),
  phone: varchar('phone', { length: 64 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 256 }).notNull(),
  status: varchar('status', { length: 64 }).default('PENDING').notNull(),
  createdAt: varchar('created_at', { length: 64 }).notNull(),
});
