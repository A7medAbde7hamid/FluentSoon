import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema.ts';
import {
  users,
  teams,
  companies,
  offers,
  candidates,
  courses,
  courseStudents,
  notifications,
  activityLogs,
  recruiterF1Requests
} from './schema.ts';

import {
  mockUsers,
  mockTeams,
  mockCompanies,
  mockOffers,
  mockCandidates,
  mockCourses,
  mockCourseStudents,
  mockNotifications,
  mockActivityLogs
} from '../src/data/mockData.ts';

import {
  User,
  Team,
  Company,
  Offer,
  Candidate,
  Course,
  CourseStudent,
  AppNotification,
  ActivityLog
} from '../src/types.ts';

// Data directory path for file-system fallback database
const DATA_DIR = path.join(process.cwd(), 'data', 'db');

const FILES = {
  users: 'users.json',
  teams: 'teams.json',
  companies: 'companies.json',
  offers: 'offers.json',
  candidates: 'candidates.json',
  courses: 'courses.json',
  course_students: 'course_students.json',
  notifications: 'notifications.json',
  activity_logs: 'activity_logs.json',
  recruiter_f1_requests: 'recruiter_f1_requests.json'
};

const DrizzleTables: Record<string, any> = {
  users,
  teams,
  companies,
  offers,
  candidates,
  courses,
  course_students: courseStudents,
  notifications,
  activity_logs: activityLogs,
  recruiter_f1_requests: recruiterF1Requests,
};

// Database state configuration
let db: any = null;
let pgPool: any = null;
let usePostgres = false;

// Safe lazy loading pattern for PostgreSQL connection pool
const connString = process.env.DATABASE_URL;
if (connString) {
  try {
    pgPool = new pg.Pool({
      connectionString: connString,
      connectionTimeoutMillis: 5000,
    });
    db = drizzle(pgPool, { schema });
    usePostgres = true;
    console.log('[Database Engine] Connection string verified. Utilizing Drizzle ORM + PostgreSQL relational engine!');
  } catch (error) {
    console.error('[Database Engine] Failed to initialize PostgreSQL client. Defaulting to local JSON storage engine:', error);
    usePostgres = false;
  }
} else {
  console.log('[Database Engine] No DATABASE_URL connection string provided. Defaulting to local JSON storage.');
}

// Low-level helper to write files
function writeTable<T>(tableName: keyof typeof FILES, data: T[]) {
  const filePath = path.join(DATA_DIR, FILES[tableName]);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Low-level helper to read files
function readTable<T>(tableName: keyof typeof FILES): T[] {
  const filePath = path.join(DATA_DIR, FILES[tableName]);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(fileContent) as T[];
  } catch (e) {
    console.error(`[Database Local Engine] Error parsing local table ${tableName}:`, e);
    return [];
  }
}

function initTable<T>(tableName: keyof typeof FILES, defaultData: T[]) {
  const filePath = path.join(DATA_DIR, FILES[tableName]);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

export async function initDB() {
  // Ensure the local JSON data root is established as fallback system
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Initialize all local tables
  initTable('users', mockUsers);
  initTable('teams', mockTeams);
  initTable('companies', mockCompanies);
  initTable('offers', mockOffers);
  initTable('candidates', mockCandidates);
  initTable('courses', mockCourses);
  initTable('course_students', mockCourseStudents);
  initTable('notifications', mockNotifications);
  initTable('activity_logs', mockActivityLogs);
  initTable('recruiter_f1_requests', [
    {
      id: 'REQ_SEED_1',
      fullName: 'Maged El-Khawaga',
      phone: '+2010255556660',
      paymentMethod: 'Vodafone Cash',
      status: 'PENDING',
      createdAt: '2026-06-17'
    }
  ]);

  if (usePostgres && db) {
    try {
      console.log('[Database Engine] Initializing and verifying relational datasets in PostgreSQL via Drizzle...');
      const userRows = await db.select().from(users).limit(1);
      if (userRows.length === 0) {
        console.log('[Database Engine] Empty live database detected. Populating full seeds into PostgreSQL...');
        
        // Load in correct sequential patterns
        for (const team of mockTeams) {
          await db.insert(teams).values(team).onConflictDoNothing();
        }
        for (const user of mockUsers) {
          await db.insert(users).values(user).onConflictDoNothing();
        }
        for (const company of mockCompanies) {
          await db.insert(companies).values(company).onConflictDoNothing();
        }
        for (const offer of mockOffers) {
          await db.insert(offers).values(offer).onConflictDoNothing();
        }
        for (const cand of mockCandidates) {
          await db.insert(candidates).values(cand).onConflictDoNothing();
        }
        for (const crs of mockCourses) {
          await db.insert(courses).values(crs).onConflictDoNothing();
        }
        for (const stud of mockCourseStudents) {
          await db.insert(courseStudents).values(stud).onConflictDoNothing();
        }
        for (const notif of mockNotifications) {
          await db.insert(notifications).values(notif).onConflictDoNothing();
        }
        for (const log of mockActivityLogs) {
          await db.insert(activityLogs).values(log).onConflictDoNothing();
        }
        console.log('[Database Engine] Relational database seeding complete.');
      } else {
        console.log('[Database Engine] Database contains existing schemas. Bypassing seeding.');
      }
    } catch (err) {
      console.warn('[Database Engine] Warning seeding PostgreSQL. (Table schemas may not exist yet, they can be deployed via Drizzle Kit migrations):', err);
    }
  }
}

// 1. Fetch entire table dataset
export async function getAll<T>(tableName: keyof typeof FILES): Promise<T[]> {
  if (usePostgres && db) {
    const dtable = DrizzleTables[tableName];
    if (dtable) {
      try {
        const rows = await db.select().from(dtable);
        return rows as unknown as T[];
      } catch (err) {
        console.error(`[Database Engine] PostgreSQL read failed for ${tableName}. Utilizing local JSON fallback...`, err);
      }
    }
  }
  return readTable<T>(tableName);
}

// 2. Insert or update a table row
export async function saveRow<T extends { id: string }>(tableName: keyof typeof FILES, row: T): Promise<T> {
  if (usePostgres && db) {
    const dtable = DrizzleTables[tableName];
    if (dtable) {
      try {
        const pk = dtable.id;
        const updateObj = { ...row } as any;
        delete updateObj.id; // avoid updating standard primary keys

        await db.insert(dtable)
          .values(row)
          .onConflictDoUpdate({
            target: pk,
            set: updateObj,
          });
        return row;
      } catch (err) {
        console.error(`[Database Engine] PostgreSQL write failed for ${tableName}. Utilizing local JSON fallback...`, err);
      }
    }
  }

  // File-system fallback implementation
  const table = readTable<T>(tableName);
  const idx = table.findIndex((r) => r.id === row.id);
  if (idx !== -1) {
    table[idx] = { ...table[idx], ...row };
  } else {
    table.unshift(row);
  }
  writeTable(tableName, table);
  return row;
}

// 3. Remove a row by standard key identifier
export async function deleteRow(tableName: keyof typeof FILES, id: string): Promise<boolean> {
  if (usePostgres && db) {
    const dtable = DrizzleTables[tableName];
    if (dtable) {
      try {
        await db.delete(dtable).where(eq(dtable.id, id));
        return true;
      } catch (err) {
        console.error(`[Database Engine] PostgreSQL delete failed for ${tableName}. Utilizing local JSON fallback...`, err);
      }
    }
  }

  const table = readTable<{ id: string }>(tableName);
  const filtered = table.filter((r) => r.id !== id);
  if (filtered.length !== table.length) {
    writeTable(tableName, filtered);
    return true;
  }
  return false;
}
