import * as db from './db.js';
import crypto from 'crypto';

// Authentication operation types
export type AuthOperation = 'login' | 'logout' | 'signup' | 'delete' | 'otp';

// Request interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
  bio?: string;
  type?: 'innovator' | 'executor' | 'funder' | 'hybrid';
  address?: string;
  skills?: string[];
}

export interface OTPRequest {
  email: string;
  action: 'generate' | 'verify';
  code?: string;
}

// Response interfaces
export interface LoginResponse {
  success: boolean;
  userId?: string;
  token?: string;
  error?: string;
}

export interface SignupResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

export interface OTPResponse {
  success: boolean;
  code?: string;
  error?: string;
}

// Utility functions
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateJWT(userId: string): string {
  // This is a simple token generation - in production, use a proper JWT library
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    userId, 
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }));
  const signature = crypto.createHash('sha256')
    .update(`${header}.${payload}`)
    .digest('hex');
  
  return `${header}.${payload}.${signature}`;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP codes temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Authentication operations
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const { email, password } = request;
    
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }
    
    // Find user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Verify password
    const hashedPassword = hashPassword(password);
    if (user.passwordHash !== hashedPassword) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Generate JWT token
    const token = generateJWT(user.id);
    
    // Save session to database
    await db.createSession(user.id, token);
    
    return {
      success: true,
      userId: user.id,
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function signup(request: SignupRequest): Promise<SignupResponse> {
  try {
    const { email, password, ...userData } = request;
    
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }
    
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }
    
    // Hash password and create user
    const passwordHash = hashPassword(password);
    const userId = await db.createUser(email, passwordHash, userData);
    
    return {
      success: true,
      userId
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function logout(token: string): Promise<LogoutResponse> {
  try {
    if (!token) {
      return { success: false, error: 'Token is required' };
    }
    
    // Delete session from database
    const deleted = await db.deleteSession(token);
    
    if (!deleted) {
      return { success: false, error: 'Invalid or expired token' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function deleteUser(token: string): Promise<DeleteResponse> {
  try {
    if (!token) {
      return { success: false, error: 'Token is required' };
    }
    
    // Authenticate user
    const userId = await db.authenticateUser(token);
    if (!userId) {
      return { success: false, error: 'Invalid or expired token' };
    }
    
    // Delete user and all associated data
    const deleted = await db.deleteUser(userId);
    
    if (!deleted) {
      return { success: false, error: 'Failed to delete user' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function handleOTP(request: OTPRequest): Promise<OTPResponse> {
  try {
    const { email, action, code } = request;
    
    if (!email || !action) {
      return { success: false, error: 'Email and action are required' };
    }
    
    if (action === 'generate') {
      // Generate new OTP
      const otpCode = generateOTP();
      const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
      
      otpStore.set(email, { code: otpCode, expiresAt });
      
      // In production, send this via email/SMS
      console.log(`OTP for ${email}: ${otpCode}`);
      
      return {
        success: true,
        code: otpCode // Remove this in production
      };
    } else if (action === 'verify') {
      // Verify OTP
      if (!code) {
        return { success: false, error: 'OTP code is required for verification' };
      }
      
      const storedOTP = otpStore.get(email);
      if (!storedOTP) {
        return { success: false, error: 'No OTP found for this email' };
      }
      
      if (Date.now() > storedOTP.expiresAt) {
        otpStore.delete(email);
        return { success: false, error: 'OTP has expired' };
      }
      
      if (storedOTP.code !== code) {
        return { success: false, error: 'Invalid OTP code' };
      }
      
      // Remove used OTP
      otpStore.delete(email);
      
      return { success: true };
    }
    
    return { success: false, error: 'Invalid action' };
  } catch (error) {
    console.error('OTP error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Main authentication handler
export async function handleAuth(operation: AuthOperation, request: any, token?: string): Promise<any> {
  switch (operation) {
    case 'login':
      return await login(request);
    
    case 'signup':
      return await signup(request);
    
    case 'logout':
      return await logout(token || '');
    
    case 'delete':
      return await deleteUser(token || '');
    
    case 'otp':
      return await handleOTP(request);
    
    default:
      return { success: false, error: 'Invalid operation' };
  }
}

// Cleanup expired OTP codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, otp] of otpStore.entries()) {
    if (now > otp.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes


