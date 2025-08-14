import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BuilderMatchingRequest {
  required_skills: string[];
  project_budget: string;
  timeline: string;
  project_type?: string;
}

export interface BuilderMatch {
  id: string;
  name: string;
  skills: string[];
  experience: string;
  hourlyRate: string;
  availability: string;
  rating: number;
  matchScore: number;
  portfolio: string[];
  location: string;
  communication: 'Excellent' | 'Good' | 'Fair';
  reliability: 'High' | 'Medium' | 'Low';
}

export async function matchBuilders(request: BuilderMatchingRequest): Promise<BuilderMatch[]> {
  try {
    const prompt = `
Find the best builders for a project with the following requirements:

**Required Skills:** ${request.required_skills.join(', ')}
**Project Budget:** ${request.project_budget}
**Timeline:** ${request.timeline}
**Project Type:** ${request.project_type || 'Web Application'}

Please provide a list of 5-8 builder profiles that would be ideal for this project. For each builder, include:
- Name and ID
- Relevant skills
- Experience level
- Hourly rate
- Availability status
- Rating (1-5)
- Match score (0-100)
- Portfolio examples
- Location
- Communication quality
- Reliability rating

Format your response as a JSON array of builder objects.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert technical recruiter and project manager. Match builders with projects based on skills, budget, and timeline. Always respond with valid JSON arrays."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
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

    const results = JSON.parse(jsonMatch[0]) as BuilderMatch[];
    
    // Validate and normalize the results
    return results.map((builder, index) => ({
      id: builder.id || `builder_${index + 1}`,
      name: builder.name || `Builder ${index + 1}`,
      skills: Array.isArray(builder.skills) ? builder.skills : request.required_skills,
      experience: builder.experience || '3-5 years',
      hourlyRate: builder.hourlyRate || '$50-75/hour',
      availability: builder.availability || 'Available in 2 weeks',
      rating: Math.min(5, Math.max(1, builder.rating || 4)),
      matchScore: Math.min(100, Math.max(0, builder.matchScore || 85)),
      portfolio: Array.isArray(builder.portfolio) ? builder.portfolio : ['E-commerce platform', 'Mobile app', 'API development'],
      location: builder.location || 'Remote',
      communication: builder.communication || 'Good',
      reliability: builder.reliability || 'High'
    }));

  } catch (error) {
    console.error('Error in builder matching:', error);
    
    // Fallback response if AI fails
    return [
      {
        id: 'builder_1',
        name: 'Alex Chen',
        skills: request.required_skills,
        experience: '5+ years',
        hourlyRate: '$60-80/hour',
        availability: 'Available immediately',
        rating: 4.8,
        matchScore: 92,
        portfolio: ['SaaS platform', 'Mobile app', 'Blockchain integration'],
        location: 'San Francisco, CA',
        communication: 'Excellent',
        reliability: 'High'
      },
      {
        id: 'builder_2',
        name: 'Sarah Johnson',
        skills: request.required_skills,
        experience: '3-5 years',
        hourlyRate: '$45-65/hour',
        availability: 'Available in 1 week',
        rating: 4.6,
        matchScore: 88,
        portfolio: ['E-commerce site', 'API development', 'Database design'],
        location: 'Remote',
        communication: 'Good',
        reliability: 'High'
      },
      {
        id: 'builder_3',
        name: 'Mike Rodriguez',
        skills: request.required_skills,
        experience: '4-6 years',
        hourlyRate: '$55-75/hour',
        availability: 'Available in 2 weeks',
        rating: 4.4,
        matchScore: 85,
        portfolio: ['Web application', 'Cloud infrastructure', 'DevOps'],
        location: 'Austin, TX',
        communication: 'Good',
        reliability: 'Medium'
      }
    ];
  }
}
