# Foundling AI Agents MCP Server

This directory contains the Model Context Protocol (MCP) server implementation for Foundling's AI agents.

## Overview

The MCP server provides AI-powered tools for:
- **Idea Validation**: Analyze idea feasibility and provide scoring
- **Builder Matching**: Find and match builders with projects
- **Market Analysis**: Conduct market research and competitive analysis
- **Pitch Generation**: Create investor-ready pitch materials
- **Funding Discovery**: Find funding opportunities and investor matches

## Architecture

```
mcp/
├── server.ts          # Main MCP server entry point
├── client.ts          # MCP client for server integration
├── agents/            # AI agent implementations
│   ├── index.ts       # Agent exports
│   ├── ideaValidator.ts
│   ├── builderMatcher.ts
│   ├── marketAnalyzer.ts
│   ├── pitchGenerator.ts
│   └── fundingFinder.ts
└── README.md          # This file
```

## Setup

1. Install dependencies:
```bash
cd server
bun install
```

2. Set environment variables:
```bash
# Create .env file
cp .env.example .env

# Add your OpenAI API key
OPENAI_API_KEY=your_api_key_here
```

3. Start the MCP server:
```bash
bun run mcp
```

## Usage

### Standalone MCP Server

Run the MCP server independently:
```bash
bun run mcp
```

### Server Integration

The MCP server is automatically integrated with the main server via the `/api/ai-agents` endpoint.

### API Endpoints

#### POST /api/ai-agents

**Request Body:**
```json
{
  "type": "validate_idea",
  "title": "AI-Powered Personal Finance Manager",
  "description": "An intelligent app that helps users manage finances",
  "category": "technology",
  "target_market": "Young professionals"
}
```

**Available Types:**
- `validate_idea` - Idea feasibility analysis
- `match_builders` - Builder matching
- `analyze_market` - Market research
- `generate_pitch` - Pitch deck generation
- `find_funding` - Funding opportunities

## AI Agent Capabilities

### 1. Idea Validator
- Feasibility scoring (0-100)
- Market size assessment
- Competition analysis
- Development complexity
- Risk assessment
- Recommendations

### 2. Builder Matcher
- Skill-based matching
- Experience evaluation
- Availability checking
- Portfolio analysis
- Match scoring

### 3. Market Analyzer
- Industry analysis
- Competitive landscape
- Market trends
- Target audience insights
- Strategic recommendations

### 4. Pitch Generator
- Executive summary
- Problem-solution fit
- Market opportunity
- Business model
- Financial projections
- Investor materials

### 5. Funding Finder
- Investor matching
- Investment criteria
- Portfolio companies
- Contact information
- Due diligence process

## Error Handling

All agents include fallback responses if the AI model fails, ensuring the system remains functional even during API outages.

## Security

- API keys are stored in environment variables
- Input validation on all endpoints
- Error messages don't expose sensitive information

## Performance

- Agents use GPT-4 for high-quality analysis
- Fallback responses for reliability
- Efficient JSON parsing and validation

## Integration

The MCP server integrates seamlessly with:
- Main server API
- Client-side Tools view
- Smart contract x402 integration
- CDP wallet functionality
