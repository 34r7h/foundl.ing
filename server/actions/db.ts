import { open } from 'lmdb';
import crypto from 'crypto';

// Database structure - flat, scalable design
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  bio: string;
  type: 'innovator' | 'executor' | 'funder' | 'hybrid';
  address: string;
  skills: string[];
  reputation: number;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

interface DataRecord {
  id: string;
  userId: string;
  key: string;
  value: any;
  createdAt: string;
  updatedAt: string;
}

// New interfaces for Foundling platform
interface Idea {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  feasibilityScore: number;
  marketSize: string;
  competitionLevel: string;
  developmentComplexity: string;
  fundingRequired: number;
  equityOffered: number;
  status: 'draft' | 'active' | 'funded' | 'in-progress' | 'completed';
  nftTokenId: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  ideaId: string;
  executorId: string;
  title: string;
  description: string;
  milestones: Milestone[];
  totalFunding: number;
  currentFunding: number;
  status: 'funding' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  estimatedCompletion: string;
  actualCompletion?: string;
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  fundingAmount: number;
  status: 'pending' | 'in-progress' | 'completed' | 'paid';
  dueDate: string;
  completedDate?: string;
}

interface Funding {
  id: string;
  projectId: string;
  funderId: string;
  amount: number;
  equityPercentage: number;
  terms: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Database instance
let db: any = null;
let usersDB: any = null;
let sessionsDB: any = null;
let dataDB: any = null;
let emailIndexDB: any = null;
let ideasDB: any = null;
let projectsDB: any = null;
let fundingDB: any = null;

// Initialize database with proper configuration
export async function initDB() {
  if (!db) {
    try {
      console.log('Initializing database...');
      
      // Main database environment
      db = await open({
        path: process.cwd() + '/data',
        maxDbs: 20, // Increased for more databases
        mapSize: 2 * 1024 * 1024 * 1024, // 2GB
        pageSize: 8192, // Optimized for larger databases
        compression: true, // Enable compression for better storage
        sharedStructuresKey: Symbol.for('structures'), // Enable shared structures
        overlappingSync: true, // Better performance on non-Windows
      });

      // Create separate databases for different data types
      usersDB = db.openDB('users', { 
        encoding: 'msgpack',
        cache: true // Enable caching for frequently accessed data
      });
      
      sessionsDB = db.openDB('sessions', { 
        encoding: 'msgpack',
        cache: true
      });
      
      dataDB = db.openDB('data', { 
        encoding: 'msgpack',
        cache: true
      });

      // Email index database with dupSort for efficient lookups
      emailIndexDB = db.openDB('email_index', {
        encoding: 'ordered-binary',
        dupSort: true, // Allow multiple entries per key for indexing
        // Note: dupSort cannot be combined with cache
      });

      // New databases for Foundling platform
      ideasDB = db.openDB('ideas', {
        encoding: 'msgpack',
        cache: true
      });

      projectsDB = db.openDB('projects', {
        encoding: 'msgpack',
        cache: true
      });

      fundingDB = db.openDB('funding', {
        encoding: 'msgpack',
        cache: true
      });

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }
  return db;
}

// Get database instance
export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

// Enhanced user operations
export async function createUser(email: string, passwordHash: string, userData: Partial<User>): Promise<string> {
  try {
    console.log('Creating user with email:', email);
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id: userId,
      email,
      passwordHash,
      name: userData.name || 'Anonymous User',
      bio: userData.bio || '',
      type: userData.type || 'hybrid',
      address: userData.address || '',
      skills: userData.skills || [],
      reputation: userData.reputation || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Use transaction for atomic operation
    await db.transaction(() => {
      // Store user data
      usersDB.put(userId, user);
      
      // Create email index entry
      emailIndexDB.put(email, userId);
    });

    console.log('User saved to database with index');
    return userId;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    return usersDB.get(userId);
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Use the email index for efficient lookups
    const userIds = emailIndexDB.getValues(email);
    
    // Get the first (and should be only) userId for this email
    for (const userId of userIds) {
      const user = await getUserById(userId);
      if (user) return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    if (!user) return false;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await usersDB.put(userId, updatedUser);
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return false;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    if (!user) return false;

    await db.transaction(() => {
      // Delete user data
      usersDB.remove(userId);
      
      // Remove email index
      emailIndexDB.remove(user.email, userId);
      
      // Delete all sessions for this user
      const sessions = sessionsDB.getValues(userId);
      for (const session of sessions) {
        sessionsDB.remove(userId, session);
      }
      
      // Delete all data records for this user
      const dataRecords = dataDB.getValues(userId);
      for (const record of dataRecords) {
        dataDB.remove(userId, record);
      }
    });

    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return false;
  }
}

// Session operations with proper expiration handling
export async function createSession(userId: string, token: string, expiresIn: number = 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const session: Session = {
      userId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiresIn).toISOString()
    };

    // Store session with userId as key and session data as value
    await sessionsDB.put(userId, session);
  } catch (error) {
    console.error('Error in createSession:', error);
    throw error;
  }
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  try {
    // Search through all sessions to find matching token
    // In production, consider creating a token index for better performance
    const sessions = sessionsDB.getRange();
    
    for (const { key, value } of sessions) {
      if (value.token === token && new Date(value.expiresAt) > new Date()) {
        return value;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getSessionByToken:', error);
    return null;
  }
}

export async function deleteSession(token: string): Promise<boolean> {
  try {
    const session = await getSessionByToken(token);
    if (!session) return false;

    await sessionsDB.remove(session.userId, session);
    return true;
  } catch (error) {
    console.error('Error in deleteSession:', error);
    return false;
  }
}

export async function deleteAllSessionsForUser(userId: string): Promise<void> {
  try {
    const sessions = sessionsDB.getValues(userId);
    for (const session of sessions) {
      await sessionsDB.remove(userId, session);
    }
  } catch (error) {
    console.error('Error in deleteAllSessionsForUser:', error);
  }
}

// Authentication function
export async function authenticateUser(token: string): Promise<string | null> {
  try {
    const session = await getSessionByToken(token);
    if (!session) return null;

    // Check if session is expired
    if (new Date(session.expiresAt) <= new Date()) {
      await deleteSession(token);
      return null;
    }

    return session.userId;
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return null;
  }
}

// Data operations
export async function createDataRecord(userId: string, key: string, value: any): Promise<string> {
  try {
    const recordId = `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record: DataRecord = {
      id: recordId,
      userId,
      key,
      value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dataDB.put(userId, record);
    return recordId;
  } catch (error) {
    console.error('Error in createDataRecord:', error);
    throw error;
  }
}

export async function getDataRecord(recordId: string): Promise<DataRecord | null> {
  try {
    // Search through all data records to find matching recordId
    // In production, consider creating a recordId index for better performance
    const dataRecords = dataDB.getRange();
    
    for (const { key, value } of dataRecords) {
      if (value.id === recordId) {
        return value;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getDataRecord:', error);
    return null;
  }
}

export async function getDataRecordsByUser(userId: string): Promise<DataRecord[]> {
  try {
    const records: DataRecord[] = [];
    const dataRecords = dataDB.getValues(userId);
    
    for (const record of dataRecords) {
      records.push(record);
    }
    
    return records;
  } catch (error) {
    console.error('Error in getDataRecordsByUser:', error);
    return [];
  }
}

export async function updateDataRecord(recordId: string, updates: Partial<DataRecord>): Promise<boolean> {
  try {
    const record = await getDataRecord(recordId);
    if (!record) return false;

    const updatedRecord = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await dataDB.put(record.userId, updatedRecord);
    return true;
  } catch (error) {
    console.error('Error in updateDataRecord:', error);
    return false;
  }
}

export async function deleteDataRecord(recordId: string): Promise<boolean> {
  try {
    const record = await getDataRecord(recordId);
    if (!record) return false;

    await dataDB.remove(record.userId, record);
    return true;
  } catch (error) {
    console.error('Error in deleteDataRecord:', error);
    return false;
  }
}

// Idea operations
export async function createIdea(ideaData: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const ideaId = `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const idea: Idea = {
      ...ideaData,
      id: ideaId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ideasDB.put(ideaId, idea);
    return ideaId;
  } catch (error) {
    console.error('Error in createIdea:', error);
    throw error;
  }
}

export async function getIdeaById(ideaId: string): Promise<Idea | null> {
  try {
    return ideasDB.get(ideaId);
  } catch (error) {
    console.error('Error in getIdeaById:', error);
    return null;
  }
}

export async function getIdeasByCreator(creatorId: string): Promise<Idea[]> {
  try {
    const ideas: Idea[] = [];
    const ideasRange = ideasDB.getRange();
    
    for (const { key, value } of ideasRange) {
      if (value.creatorId === creatorId) {
        ideas.push(value);
      }
    }
    
    return ideas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error in getIdeasByCreator:', error);
    return [];
  }
}

export async function getAllIdeas(): Promise<Idea[]> {
  try {
    const ideas: Idea[] = [];
    const ideasRange = ideasDB.getRange();
    
    for (const { key, value } of ideasRange) {
      ideas.push(value);
    }
    
    return ideas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error in getAllIdeas:', error);
    return [];
  }
}

export async function updateIdea(ideaId: string, updates: Partial<Idea>): Promise<boolean> {
  try {
    const idea = await getIdeaById(ideaId);
    if (!idea) return false;

    const updatedIdea = {
      ...idea,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await ideasDB.put(ideaId, updatedIdea);
    return true;
  } catch (error) {
    console.error('Error in updateIdea:', error);
    return false;
  }
}

// Project operations
export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const project: Project = {
      ...projectData,
      id: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await projectsDB.put(projectId, project);
    return projectId;
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error;
  }
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  try {
    return projectsDB.get(projectId);
  } catch (error) {
    console.error('Error in getProjectById:', error);
    return null;
  }
}

export async function getProjectsByExecutor(executorId: string): Promise<Project[]> {
  try {
    const projects: Project[] = [];
    const projectsRange = projectsDB.getRange();
    
    for (const { key, value } of projectsRange) {
      if (value.executorId === executorId) {
        projects.push(value);
      }
    }
    
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error in getProjectsByExecutor:', error);
    return [];
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const projects: Project[] = [];
    const projectsRange = projectsDB.getRange();
    
    for (const { key, value } of projectsRange) {
      projects.push(value);
    }
    
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    return [];
  }
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<boolean> {
  try {
    const project = await getProjectById(projectId);
    if (!project) return false;

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await projectsDB.put(projectId, updatedProject);
    return true;
  } catch (error) {
    console.error('Error in updateProject:', error);
    return false;
  }
}

// Funding operations
export async function createFunding(fundingData: Omit<Funding, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const fundingId = `funding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const funding: Funding = {
      ...fundingData,
      id: fundingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await fundingDB.put(fundingId, funding);
    return fundingId;
  } catch (error) {
    console.error('Error in createFunding:', error);
    throw error;
  }
}

export async function getFundingByProject(projectId: string): Promise<Funding[]> {
  try {
    const fundings: Funding[] = [];
    const fundingRange = fundingDB.getRange();
    
    for (const { key, value } of fundingRange) {
      if (value.projectId === projectId) {
        fundings.push(value);
      }
    }
    
    return fundings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error in getFundingByProject:', error);
    return [];
  }
}

export async function updateFunding(fundingId: string, updates: Partial<Funding>): Promise<boolean> {
  try {
    const funding = await fundingDB.get(fundingId);
    if (!funding) return false;

    const updatedFunding = {
      ...funding,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await fundingDB.put(fundingId, updatedFunding);
    return true;
  } catch (error) {
    console.error('Error in updateFunding:', error);
    return false;
  }
}

// Cleanup expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const now = new Date();
    const sessions = sessionsDB.getRange();
    
    for (const { key, value } of sessions) {
      if (new Date(value.expiresAt) <= now) {
        await sessionsDB.remove(key, value);
      }
    }
  } catch (error) {
    console.error('Error in cleanupExpiredSessions:', error);
  }
}

// Database statistics with proper counting
export async function getDBStats(): Promise<{ users: number; sessions: number; data: number }> {
  try {
    let users = 0;
    let sessions = 0;
    let data = 0;

    // Count users
    const userEntries = usersDB.getRange();
    for (const _ of userEntries) users++;

    // Count sessions
    const sessionEntries = sessionsDB.getRange();
    for (const _ of sessionEntries) sessions++;

    // Count data records
    const dataEntries = dataDB.getRange();
    for (const _ of dataEntries) data++;

    return { users, sessions, data };
  } catch (error) {
    console.error('Error in getDBStats:', error);
    return { users: 0, sessions: 0, data: 0 };
  }
}

// Close database
export async function closeDB(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    usersDB = null;
    sessionsDB = null;
    dataDB = null;
    emailIndexDB = null;
    ideasDB = null;
    projectsDB = null;
    fundingDB = null;
  }
}
