import { serve } from "bun";
import { initDB, authenticateUser, getUserById, getUserByEmail, updateUserProfile, createDataRecord, getDataRecord, getDataRecordsByUser, updateDataRecord, deleteDataRecord, getDBStats, cleanupExpiredSessions } from "./actions/db.js";
import { handleAuth } from "./actions/auth.js";
import { handleIdeaOperation, handleProjectOperation, handleFundingOperation, handleProfileOperation } from "./actions/foundling.js";
import { handleAIAgentOperation } from "./actions/ai-agents.js";
import { initializeCDP, checkCDPHealth } from "./actions/cdp.js";
import type { AuthOperation } from "./actions/auth.js";

// Initialize database and CDP integration on startup
Promise.all([
  initDB(),
  initializeCDP()
]).then(([dbResult, cdpResult]) => {
  console.log("Database initialized successfully");
  if (cdpResult) {
    console.log("CDP integration initialized successfully");
  } else {
    console.log("CDP integration initialization failed - continuing without CDP");
  }
}).catch((error) => {
  console.error("Failed to initialize services:", error);
  process.exit(1);
});

const server = serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Set CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json"
    };
    
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }
    
    try {
      // Health endpoint
      if (url.pathname === "/health") {
        return new Response(JSON.stringify({
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }), {
          headers: corsHeaders
        });
      }

      // CDP endpoints
      if (url.pathname === "/cdp/health") {
        const cdpHealth = await checkCDPHealth();
        return new Response(JSON.stringify({
          status: "cdp-health",
          cdp: cdpHealth,
          timestamp: new Date().toISOString()
        }), {
          headers: corsHeaders
        });
      }

      if (url.pathname === "/cdp/stream" && req.method === "POST") {
        try {
          const body = await req.json();
          const { recipient, amount, duration, tokenAddress } = body;
          
          if (!recipient || !amount || !duration) {
            return new Response(JSON.stringify({
              success: false,
              error: "Missing required fields: recipient, amount, duration"
            }), {
              status: 400,
              headers: corsHeaders
            });
          }

          // Import the function here to avoid circular dependencies
          const { createX402Stream } = await import("./actions/cdp.js");
          const result = await createX402Stream(recipient, amount, duration, tokenAddress);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("CDP stream creation error:", error);
          return new Response(JSON.stringify({
            success: false,
            error: "Failed to create x402 stream"
          }), {
            status: 500,
            headers: corsHeaders
          });
        }
      }

      if (url.pathname === "/cdp/config") {
        const { getCDPConfig } = await import("./actions/cdp.js");
        const config = getCDPConfig();
        return new Response(JSON.stringify({
          success: true,
          config,
          timestamp: new Date().toISOString()
        }), {
          headers: corsHeaders
        });
      }
      
      // Authentication endpoint
      if (url.pathname === "/auth") {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Method not allowed" 
          }), { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        
        try {
          const body = await req.json();
          const { type, ...requestData } = body;
          
          if (!type || !['login', 'logout', 'signup', 'delete', 'otp'].includes(type)) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: "Invalid operation type" 
            }), { 
              status: 400, 
              headers: corsHeaders 
            });
          }
          
          // Extract token from Authorization header for operations that need it
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          const result = await handleAuth(type as AuthOperation, requestData, token);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("Auth endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }
      }
      
      // Database operations endpoint
      if (url.pathname === "/db") {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Method not allowed" 
          }), { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        
        try {
          const body = await req.json();
          const { type, ...requestData } = body;
          
          // Extract token for authentication
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          // Authenticate user for protected operations
          let userId: string | null = null;
          if (token) {
            userId = await authenticateUser(token);
          }
          
          // Handle different database operations
          let result: any;
          
          switch (type) {
            case 'getUserById':
              if (!requestData.userId) {
                result = { success: false, error: 'userId is required' };
                break;
              }
              result = { success: true, user: await getUserById(requestData.userId) };
              break;
              
            case 'getUserByEmail':
              if (!requestData.email) {
                result = { success: false, error: 'email is required' };
                break;
              }
              result = { success: true, user: await getUserByEmail(requestData.email) };
              break;
              
            case 'updateUser':
              if (!userId) {
                result = { success: false, error: 'Authentication required' };
                break;
              }
              if (!requestData.updates) {
                result = { success: false, error: 'updates are required' };
                break;
              }
              result = { success: await updateUserProfile(userId, requestData.updates) };
              break;
              
            case 'createDataRecord':
              if (!userId) {
                result = { success: false, error: 'Authentication required' };
                break;
              }
              if (!requestData.key || requestData.value === undefined) {
                result = { success: false, error: 'key and value are required' };
                break;
              }
              const recordId = await createDataRecord(userId, requestData.key, requestData.value);
              result = { success: true, recordId };
              break;
              
            case 'getDataRecord':
              if (!requestData.recordId) {
                result = { success: false, error: 'recordId is required' };
                break;
              }
              const record = await getDataRecord(requestData.recordId);
              if (record && userId && record.userId !== userId) {
                result = { success: false, error: 'Access denied' };
              } else {
                result = { success: true, record };
              }
              break;
              
            case 'getDataRecordsByUser':
              if (!userId) {
                result = { success: false, error: 'Authentication required' };
                break;
              }
              const records = await getDataRecordsByUser(userId);
              result = { success: true, records };
              break;
              
            case 'updateDataRecord':
              if (!userId) {
                result = { success: false, error: 'Authentication required' };
                break;
              }
              if (!requestData.recordId || requestData.updates === undefined) {
                result = { success: false, error: 'recordId and updates are required' };
                break;
              }
              const recordToUpdate = await getDataRecord(requestData.recordId);
              if (!recordToUpdate || recordToUpdate.userId !== userId) {
                result = { success: false, error: 'Access denied' };
              } else {
                result = { success: await updateDataRecord(requestData.recordId, requestData.updates) };
              }
              break;
              
            case 'deleteDataRecord':
              if (!userId) {
                result = { success: false, error: 'Authentication required' };
                break;
              }
              if (!requestData.recordId) {
                result = { success: false, error: 'recordId is required' };
                break;
              }
              const recordToDelete = await getDataRecord(requestData.recordId);
              if (!recordToDelete || recordToDelete.userId !== userId) {
                result = { success: false, error: 'Access denied' };
              } else {
                result = { success: await deleteDataRecord(requestData.recordId) };
              }
              break;
              
            case 'getDBStats':
              result = { success: true, stats: await getDBStats() };
              break;
              
            case 'cleanupExpiredSessions':
              await cleanupExpiredSessions();
              result = { success: true, message: 'Expired sessions cleaned up' };
              break;
              
            default:
              result = { success: false, error: 'Invalid operation type' };
          }
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("DB endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }
      }

      // Foundling platform endpoints
      if (url.pathname === "/api/ideas") {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Method not allowed" 
          }), { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        
        try {
          const body = await req.json();
          const { operation, ...requestData } = body;
          
          // Extract token for authentication
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          // Authenticate user for protected operations
          let userId: string | null = null;
          if (token) {
            userId = await authenticateUser(token);
          }
          
          const result = await handleIdeaOperation(operation, requestData, userId);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("Ideas endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }
      }

      if (url.pathname === "/api/projects") {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Method not allowed" 
          }), { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        
        try {
          const body = await req.json();
          const { operation, ...requestData } = body;
          
          // Extract token for authentication
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          // Authenticate user for protected operations
          let userId: string | null = null;
          if (token) {
            userId = await authenticateUser(token);
          }
          
          const result = await handleProjectOperation(operation, requestData, userId);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("Projects endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }
      }

      if (url.pathname === "/api/funding") {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Method not allowed" 
          }), { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        
        try {
          const body = await req.json();
          const { operation, ...requestData } = body;
          
          // Extract token for authentication
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          // Authenticate user for protected operations
          let userId: string | null = null;
          if (token) {
            userId = await authenticateUser(token);
          }
          
          const result = await handleFundingOperation(operation, requestData, userId);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("Funding endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }
      }

      if (url.pathname === "/api/profiles") {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Method not allowed" 
          }), { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        
        try {
          const body = await req.json();
          const { operation, ...requestData } = body;
          
          // Extract token for authentication
          let token: string | undefined;
          const authHeader = req.headers.get("Authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }
          
          // Authenticate user for protected operations
          let userId: string | null = null;
          if (token) {
            userId = await authenticateUser(token);
          }
          
          const result = await handleProfileOperation(operation, requestData, userId);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("Profiles endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }
      }

      // AI Agent endpoints
      if (url.pathname === "/api/ai-agents") {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Method not allowed" 
          }), { 
            status: 405, 
            headers: corsHeaders 
          });
        }
        
        try {
          const body = await req.json();
          const { type, ...requestData } = body;
          
          if (!type) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: "AI agent type is required" 
            }), { 
              status: 400, 
              headers: corsHeaders 
            });
          }
          
          const result = await handleAIAgentOperation(type, requestData);
          
          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: corsHeaders
          });
        } catch (error) {
          console.error("AI Agents endpoint error:", error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid request body" 
          }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }
      }
      
      // Default response for unknown endpoints
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Endpoint not found" 
      }), { 
        status: 404, 
        headers: corsHeaders 
      });
      
    } catch (error) {
      console.error("Server error:", error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Internal server error" 
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  },
});

console.log(`Server running on http://localhost:${server.port}`);
console.log(`Health endpoint available at http://localhost:${server.port}/health`);
console.log(`Auth endpoint available at http://localhost:${server.port}/auth`);
console.log(`Database endpoint available at http://localhost:${server.port}/db`);
console.log(`Ideas API available at http://localhost:${server.port}/api/ideas`);
console.log(`Projects API available at http://localhost:${server.port}/api/projects`);
console.log(`Funding API available at http://localhost:${server.port}/api/funding`);
console.log(`Profiles API available at http://localhost:${server.port}/api/profiles`);
console.log(`AI Agents API available at http://localhost:${server.port}/api/ai-agents`);