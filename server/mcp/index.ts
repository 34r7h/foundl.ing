import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool,
  TextContent,
  ImageContent,
  EmbeddedResource
} from '@modelcontextprotocol/sdk/types.js';
import { 
  validateIdeaFeasibility,
  matchBuilders,
  analyzeMarket,
  generatePitch,
  findFundingOpportunities
} from './agents/index.js';

// Initialize MCP Server
const server = new Server(
  {
    name: 'foundling-ai-agents',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools: Tool[] = [
  {
    name: 'validate_idea',
    description: 'Analyze idea feasibility and provide scoring with recommendations',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Idea title' },
        description: { type: 'string', description: 'Detailed idea description' },
        category: { type: 'string', description: 'Business category' },
        target_market: { type: 'string', description: 'Target market description' }
      },
      required: ['title', 'description', 'category']
    }
  },
  {
    name: 'match_builders',
    description: 'Find and match builders with projects based on skills and availability',
    inputSchema: {
      type: 'object',
      properties: {
        required_skills: { type: 'array', items: { type: 'string' }, description: 'Required technical skills' },
        project_budget: { type: 'string', description: 'Project budget range' },
        timeline: { type: 'string', description: 'Project timeline' },
        project_type: { type: 'string', description: 'Type of project' }
      },
      required: ['required_skills', 'project_budget', 'timeline']
    }
  },
  {
    name: 'analyze_market',
    description: 'Conduct market research and competitive analysis',
    inputSchema: {
      type: 'object',
      properties: {
        industry: { type: 'string', description: 'Industry sector' },
        geography: { type: 'string', description: 'Geographic market' },
        target_audience: { type: 'string', description: 'Target audience description' }
      },
      required: ['industry']
    }
  },
  {
    name: 'generate_pitch',
    description: 'Generate investor-ready pitch deck and materials',
    inputSchema: {
      type: 'object',
      properties: {
        idea_summary: { type: 'string', description: 'Brief idea summary' },
        target_investors: { type: 'string', description: 'Target investor types' },
        funding_amount: { type: 'string', description: 'Requested funding amount' },
        use_of_funds: { type: 'string', description: 'How funds will be used' }
      },
      required: ['idea_summary', 'target_investors', 'funding_amount']
    }
  },
  {
    name: 'find_funding',
    description: 'Discover funding opportunities and investor matches',
    inputSchema: {
      type: 'object',
      properties: {
        stage: { type: 'string', description: 'Company stage (idea, MVP, revenue, etc.)' },
        industry: { type: 'string', description: 'Industry sector' },
        funding_amount: { type: 'string', description: 'Amount needed' },
        geography: { type: 'string', description: 'Geographic preference' }
      },
      required: ['stage', 'industry', 'funding_amount']
    }
  }
];

// Handle tool calls
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result: any;
    
    switch (name) {
      case 'validate_idea':
        result = await validateIdeaFeasibility(args);
        break;
      case 'match_builders':
        result = await matchBuilders(args);
        break;
      case 'analyze_market':
        result = await analyzeMarket(args);
        break;
      case 'generate_pitch':
        result = await generatePitch(args);
        break;
      case 'find_funding':
        result = await findFundingOpportunities(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        } as TextContent
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        } as TextContent
      ]
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Foundling AI Agents MCP Server started');
