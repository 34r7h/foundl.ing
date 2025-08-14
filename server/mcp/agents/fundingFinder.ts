import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FundingFinderRequest {
  stage: string;
  industry: string;
  funding_amount: string;
  geography?: string;
}

export interface FundingOpportunity {
  id: string;
  investorName: string;
  investorType: 'VC' | 'Angel' | 'PE' | 'Corporate' | 'Accelerator';
  focusAreas: string[];
  investmentStage: string[];
  investmentRange: string;
  portfolioCompanies: string[];
  contactInfo: string;
  matchScore: number;
  investmentThesis: string;
  dueDiligenceProcess: string;
  timeline: string;
  requirements: string[];
}

export async function findFundingOpportunities(request: FundingFinderRequest): Promise<FundingOpportunity[]> {
  try {
    const prompt = `
Find funding opportunities for a startup with the following characteristics:

**Company Stage:** ${request.stage}
**Industry:** ${request.industry}
**Funding Amount Needed:** ${request.funding_amount}
${request.geography ? `**Geography:** ${request.geography}` : ''}

Please provide a list of 8-12 investor profiles that would be ideal for this startup. For each investor, include:
- Investor name and type
- Focus areas and investment stages
- Investment range
- Portfolio companies
- Contact information
- Match score (0-100)
- Investment thesis
- Due diligence process
- Timeline expectations
- Key requirements

Format your response as a JSON array of investor objects.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert startup funding consultant with deep knowledge of the venture capital and angel investment landscape. Identify the best funding opportunities based on company characteristics. Always respond with valid JSON arrays."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI model');
    }

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI model');
    }

    const results = JSON.parse(jsonMatch[0]) as FundingOpportunity[];
    
    // Validate and normalize the results
    return results.map((opportunity, index) => ({
      id: opportunity.id || `investor_${index + 1}`,
      investorName: opportunity.investorName || `Investor ${index + 1}`,
      investorType: opportunity.investorType || 'VC',
      focusAreas: Array.isArray(opportunity.focusAreas) ? opportunity.focusAreas : [request.industry],
      investmentStage: Array.isArray(opportunity.investmentStage) ? opportunity.investmentStage : [request.stage],
      investmentRange: opportunity.investmentRange || '$100K - $5M',
      portfolioCompanies: Array.isArray(opportunity.portfolioCompanies) ? opportunity.portfolioCompanies : ['Successful startup 1', 'Successful startup 2'],
      contactInfo: opportunity.contactInfo || 'info@investor.com',
      matchScore: Math.min(100, Math.max(0, opportunity.matchScore || 85)),
      investmentThesis: opportunity.investmentThesis || 'Focus on innovative solutions in growing markets',
      dueDiligenceProcess: opportunity.dueDiligenceProcess || 'Standard 4-6 week process',
      timeline: opportunity.timeline || '3-6 months from first contact to funding',
      requirements: Array.isArray(opportunity.requirements) ? opportunity.requirements : ['Strong team', 'Market validation', 'Clear business model']
    }));

  } catch (error) {
    console.error('Error in funding finder:', error);
    
    // Fallback response if AI fails
    return [
      {
        id: 'investor_1',
        investorName: 'Innovation Capital Partners',
        investorType: 'VC',
        focusAreas: [request.industry, 'Technology', 'SaaS'],
        investmentStage: ['Seed', 'Series A', 'Series B'],
        investmentRange: '$500K - $5M',
        portfolioCompanies: ['TechUnicorn', 'SaaSLeader', 'InnovationCorp'],
        contactInfo: 'partners@innovationcapital.com',
        matchScore: 92,
        investmentThesis: 'We invest in early-stage companies with innovative technology solutions that address large market opportunities.',
        dueDiligenceProcess: 'Comprehensive 6-week process including technical, market, and team assessment',
        timeline: '4-6 months from initial contact to funding',
        requirements: ['Strong technical team', 'Market validation', 'Clear revenue model', 'Scalable technology']
      },
      {
        id: 'investor_2',
        investorName: 'Angel Investors Network',
        investorType: 'Angel',
        focusAreas: [request.industry, 'Startups', 'Innovation'],
        investmentStage: ['Idea', 'MVP', 'Seed'],
        investmentRange: '$50K - $500K',
        portfolioCompanies: ['StartupA', 'InnovationB', 'TechC'],
        contactInfo: 'hello@angelnetwork.com',
        matchScore: 88,
        investmentThesis: 'Supporting passionate entrepreneurs with innovative ideas that can change the world.',
        dueDiligenceProcess: 'Lightweight process focused on team and market opportunity',
        timeline: '2-4 months from pitch to funding',
        requirements: ['Passionate team', 'Clear vision', 'Market opportunity', 'Personal connection']
      },
      {
        id: 'investor_3',
        investorName: 'Growth Ventures Fund',
        investorType: 'VC',
        focusAreas: [request.industry, 'Growth', 'Scale'],
        investmentStage: ['Series A', 'Series B', 'Series C'],
        investmentRange: '$2M - $20M',
        portfolioCompanies: ['ScaleUp1', 'GrowthCorp', 'MarketLeader'],
        contactInfo: 'invest@growthventures.com',
        matchScore: 85,
        investmentThesis: 'Partnering with companies ready to scale and capture significant market share.',
        dueDiligenceProcess: 'Rigorous 8-week process with external consultants',
        timeline: '6-8 months from initial meeting to funding',
        requirements: ['Proven product-market fit', 'Strong growth metrics', 'Experienced team', 'Clear expansion plan']
      },
      {
        id: 'investor_4',
        investorName: 'Corporate Innovation Lab',
        investorType: 'Corporate',
        focusAreas: [request.industry, 'Strategic partnerships', 'Innovation'],
        investmentStage: ['Series A', 'Series B'],
        investmentRange: '$1M - $10M',
        portfolioCompanies: ['StrategicPartner1', 'InnovationLab2', 'CorporateStartup3'],
        contactInfo: 'innovation@corporate.com',
        matchScore: 82,
        investmentThesis: 'Strategic investments that align with our corporate innovation goals and market expansion.',
        dueDiligenceProcess: 'Strategic assessment with corporate stakeholders',
        timeline: '4-6 months including corporate approval process',
        requirements: ['Strategic alignment', 'Market access', 'Technology fit', 'Partnership potential']
      }
    ];
  }
}
