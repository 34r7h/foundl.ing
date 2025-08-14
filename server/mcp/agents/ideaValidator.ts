import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface IdeaValidationRequest {
  title: string;
  description: string;
  category: string;
  target_market?: string;
}

export interface IdeaValidationResult {
  feasibilityScore: number;
  marketSize: 'Small' | 'Medium' | 'Large' | 'Massive';
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  developmentComplexity: 'Simple' | 'Moderate' | 'Complex' | 'Very Complex';
  timeToMarket: string;
  estimatedCost: string;
  recommendations: string[];
  risks: string[];
  opportunities: string[];
}

export async function validateIdeaFeasibility(request: IdeaValidationRequest): Promise<IdeaValidationResult> {
  try {
    const prompt = `
Analyze the following business idea for feasibility and provide a comprehensive assessment:

**Idea Title:** ${request.title}
**Category:** ${request.category}
**Description:** ${request.description}
${request.target_market ? `**Target Market:** ${request.target_market}` : ''}

Please provide a detailed analysis including:
1. Feasibility score (0-100)
2. Market size assessment
3. Competition level
4. Development complexity
5. Time to market estimate
6. Estimated development cost
7. Key recommendations
8. Potential risks
9. Market opportunities

Format your response as a JSON object with the exact structure specified.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert business analyst and startup consultant. Analyze business ideas objectively and provide actionable insights. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI model');
    }

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI model');
    }

    const result = JSON.parse(jsonMatch[0]) as IdeaValidationResult;
    
    // Validate and normalize the result
    return {
      feasibilityScore: Math.min(100, Math.max(0, result.feasibilityScore || 50)),
      marketSize: result.marketSize || 'Medium',
      competitionLevel: result.competitionLevel || 'Medium',
      developmentComplexity: result.developmentComplexity || 'Moderate',
      timeToMarket: result.timeToMarket || '6-12 months',
      estimatedCost: result.estimatedCost || '$50K - $200K',
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : ['Conduct market research', 'Validate with potential customers'],
      risks: Array.isArray(result.risks) ? result.risks : ['Market uncertainty', 'Competition'],
      opportunities: Array.isArray(result.opportunities) ? result.opportunities : ['First-mover advantage', 'Growing market']
    };

  } catch (error) {
    console.error('Error in idea validation:', error);
    
    // Fallback response if AI fails
    return {
      feasibilityScore: 65,
      marketSize: 'Medium',
      competitionLevel: 'Medium',
      developmentComplexity: 'Moderate',
      timeToMarket: '6-12 months',
      estimatedCost: '$50K - $200K',
      recommendations: [
        'Conduct thorough market research',
        'Validate idea with potential customers',
        'Assess technical feasibility',
        'Research competitive landscape'
      ],
      risks: [
        'Market uncertainty',
        'Competition from established players',
        'Technical challenges',
        'Resource constraints'
      ],
      opportunities: [
        'First-mover advantage in niche market',
        'Growing market demand',
        'Technology advancement opportunities',
        'Strategic partnerships'
      ]
    };
  }
}
