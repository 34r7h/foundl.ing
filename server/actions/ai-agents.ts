import { getMCPClient } from '../mcp/client.js';

export interface IdeaValidationRequest {
  title: string;
  description: string;
  category: string;
  target_market?: string;
}

export interface BuilderMatchingRequest {
  required_skills: string[];
  project_budget: string;
  timeline: string;
  project_type?: string;
}

export interface MarketAnalysisRequest {
  industry: string;
  geography?: string;
  target_audience?: string;
}

export interface PitchGenerationRequest {
  idea_summary: string;
  target_investors: string;
  funding_amount: string;
  use_of_funds?: string;
}

export interface FundingFinderRequest {
  stage: string;
  industry: string;
  funding_amount: string;
  geography?: string;
}

export async function handleIdeaValidation(request: IdeaValidationRequest) {
  try {
    const mcpClient = await getMCPClient();
    const result = await mcpClient.validateIdea(request);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Idea validation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function handleBuilderMatching(request: BuilderMatchingRequest) {
  try {
    const mcpClient = await getMCPClient();
    const result = await mcpClient.matchBuilders(request);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Builder matching error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function handleMarketAnalysis(request: MarketAnalysisRequest) {
  try {
    const mcpClient = await getMCPClient();
    const result = await mcpClient.analyzeMarket(request);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Market analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function handlePitchGeneration(request: PitchGenerationRequest) {
  try {
    const mcpClient = await getMCPClient();
    const result = await mcpClient.generatePitch(request);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Pitch generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function handleFundingFinder(request: FundingFinderRequest) {
  try {
    const mcpClient = await getMCPClient();
    const result = await mcpClient.findFunding(request);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Funding finder error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function handleAIAgentOperation(type: string, requestData: any) {
  switch (type) {
    case 'validate_idea':
      return await handleIdeaValidation(requestData);
    case 'match_builders':
      return await handleBuilderMatching(requestData);
    case 'analyze_market':
      return await handleMarketAnalysis(requestData);
    case 'generate_pitch':
      return await handlePitchGeneration(requestData);
    case 'find_funding':
      return await handleFundingFinder(requestData);
    default:
      return {
        success: false,
        error: `Unknown AI agent operation: ${type}`
      };
  }
}
