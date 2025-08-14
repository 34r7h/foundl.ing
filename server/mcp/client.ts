import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import path from 'path';

export interface MCPClient {
  validateIdea: (request: any) => Promise<any>;
  matchBuilders: (request: any) => Promise<any>;
  analyzeMarket: (request: any) => Promise<any>;
  generatePitch: (request: any) => Promise<any>;
  findFunding: (request: any) => Promise<any>;
  disconnect: () => Promise<void>;
}

export class FoundlingMCPClient implements MCPClient {
  private client: Client;
  private transport: StdioClientTransport;
  private process: any;

  constructor() {
    // Spawn the MCP server process
    const serverPath = path.join(process.cwd(), 'mcp', 'server.ts');
    this.process = spawn('bun', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Create transport and client
    this.transport = new StdioClientTransport(
      this.process.stdin,
      this.process.stdout
    );
    
    this.client = new Client({
      name: 'foundling-server',
      version: '1.0.0',
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect(this.transport);
      console.log('MCP client connected successfully');
    } catch (error) {
      console.error('Failed to connect MCP client:', error);
      throw error;
    }
  }

  async validateIdea(request: any): Promise<any> {
    try {
      const result = await this.client.callTool({
        name: 'validate_idea',
        arguments: request
      });
      
      if (result.content && result.content[0]?.type === 'text') {
        return JSON.parse(result.content[0].text);
      }
      
      throw new Error('Invalid response format from MCP server');
    } catch (error) {
      console.error('Error calling validate_idea:', error);
      throw error;
    }
  }

  async matchBuilders(request: any): Promise<any> {
    try {
      const result = await this.client.callTool({
        name: 'match_builders',
        arguments: request
      });
      
      if (result.content && result.content[0]?.type === 'text') {
        return JSON.parse(result.content[0].text);
      }
      
      throw new Error('Invalid response format from MCP server');
    } catch (error) {
      console.error('Error calling match_builders:', error);
      throw error;
    }
  }

  async analyzeMarket(request: any): Promise<any> {
    try {
      const result = await this.client.callTool({
        name: 'analyze_market',
        arguments: request
      });
      
      if (result.content && result.content[0]?.type === 'text') {
        return JSON.parse(result.content[0].text);
      }
      
      throw new Error('Invalid response format from MCP server');
    } catch (error) {
      console.error('Error calling analyze_market:', error);
      throw error;
    }
  }

  async generatePitch(request: any): Promise<any> {
    try {
      const result = await this.client.callTool({
        name: 'generate_pitch',
        arguments: request
      });
      
      if (result.content && result.content[0]?.type === 'text') {
        return JSON.parse(result.content[0].text);
      }
      
      throw new Error('Invalid response format from MCP server');
    } catch (error) {
      console.error('Error calling generate_pitch:', error);
      throw error;
    }
  }

  async findFunding(request: any): Promise<any> {
    try {
      const result = await this.client.callTool({
        name: 'find_funding',
        arguments: request
      });
      
      if (result.content && result.content[0]?.type === 'text') {
        return JSON.parse(result.content[0].text);
      }
      
      throw new Error('Invalid response format from MCP server');
    } catch (error) {
      console.error('Error calling find_funding:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      if (this.process) {
        this.process.kill();
      }
      console.log('MCP client disconnected');
    } catch (error) {
      console.error('Error disconnecting MCP client:', error);
    }
  }
}

// Singleton instance
let mcpClientInstance: FoundlingMCPClient | null = null;

export async function getMCPClient(): Promise<FoundlingMCPClient> {
  if (!mcpClientInstance) {
    mcpClientInstance = new FoundlingMCPClient();
    await mcpClientInstance.connect();
  }
  return mcpClientInstance;
}

export async function disconnectMCPClient(): Promise<void> {
  if (mcpClientInstance) {
    await mcpClientInstance.disconnect();
    mcpClientInstance = null;
  }
}
