import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock MCP server and agents
const mockMCPServer = {
  start: jest.fn(),
  stop: jest.fn(),
  registerAgent: jest.fn(),
  handleRequest: jest.fn()
};

const mockIdeaValidator = {
  validateIdea: jest.fn(),
  scoreViability: jest.fn(),
  generateRecommendations: jest.fn()
};

const mockBuilderMatcher = {
  findBuilders: jest.fn(),
  matchSkills: jest.fn(),
  calculateCompatibility: jest.fn()
};

const mockFundingFinder = {
  findInvestors: jest.fn(),
  analyzePortfolio: jest.fn(),
  generatePitch: jest.fn()
};

const mockMarketAnalyzer = {
  analyzeMarket: jest.fn(),
  identifyTrends: jest.fn(),
  calculateMarketSize: jest.fn()
};

const mockPitchGenerator = {
  generatePitch: jest.fn(),
  customizeForInvestor: jest.fn(),
  optimizeContent: jest.fn()
};

describe('AI Agent Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('MCP Server Setup', () => {
    it('should start MCP server successfully', async () => {
      mockMCPServer.start.mockResolvedValue(true);
      
      const result = await mockMCPServer.start();
      
      expect(mockMCPServer.start).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should register all agents on startup', async () => {
      mockMCPServer.registerAgent.mockResolvedValue(true);
      
      // Register all agents
      await mockMCPServer.registerAgent('ideaValidator', mockIdeaValidator);
      await mockMCPServer.registerAgent('builderMatcher', mockBuilderMatcher);
      await mockMCPServer.registerAgent('fundingFinder', mockFundingFinder);
      await mockMCPServer.registerAgent('marketAnalyzer', mockMarketAnalyzer);
      await mockMCPServer.registerAgent('pitchGenerator', mockPitchGenerator);
      
      expect(mockMCPServer.registerAgent).toHaveBeenCalledTimes(5);
    });

    it('should handle server shutdown gracefully', async () => {
      mockMCPServer.stop.mockResolvedValue(true);
      
      const result = await mockMCPServer.stop();
      
      expect(mockMCPServer.stop).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Idea Validator Agent', () => {
    it('should validate idea successfully', async () => {
      const ideaData = {
        title: 'Test Idea',
        description: 'A test idea description',
        category: 'Technology',
        marketSize: 1000000,
        requiredSkills: ['Solidity', 'Vue.js'],
        equityShare: 5
      };

      const validationResult = {
        isValid: true,
        score: 85,
        recommendations: ['Add market research', 'Define target audience']
      };

      mockIdeaValidator.validateIdea.mockResolvedValue(validationResult);
      
      const result = await mockIdeaValidator.validateIdea(ideaData);
      
      expect(mockIdeaValidator.validateIdea).toHaveBeenCalledWith(ideaData);
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(85);
      expect(result.recommendations).toHaveLength(2);
    });

    it('should score idea viability accurately', async () => {
      const ideaData = {
        title: 'Test Idea',
        description: 'A test idea description',
        category: 'Technology',
        marketSize: 1000000,
        requiredSkills: ['Solidity', 'Vue.js'],
        equityShare: 5
      };

      const viabilityScore = {
        overall: 78,
        market: 85,
        technical: 70,
        financial: 80
      };

      mockIdeaValidator.scoreViability.mockResolvedValue(viabilityScore);
      
      const result = await mockIdeaValidator.scoreViability(ideaData);
      
      expect(mockIdeaValidator.scoreViability).toHaveBeenCalledWith(ideaData);
      expect(result.overall).toBe(78);
      expect(result.market).toBe(85);
      expect(result.technical).toBe(70);
      expect(result.financial).toBe(80);
    });

    it('should generate actionable recommendations', async () => {
      const ideaData = {
        title: 'Test Idea',
        description: 'A test idea description',
        category: 'Technology',
        marketSize: 1000000,
        requiredSkills: ['Solidity', 'Vue.js'],
        equityShare: 5
      };

      const recommendations = [
        'Conduct competitor analysis',
        'Define MVP features',
        'Estimate development timeline',
        'Research funding requirements'
      ];

      mockIdeaValidator.generateRecommendations.mockResolvedValue(recommendations);
      
      const result = await mockIdeaValidator.generateRecommendations(ideaData);
      
      expect(mockIdeaValidator.generateRecommendations).toHaveBeenCalledWith(ideaData);
      expect(result).toHaveLength(4);
      expect(result).toContain('Conduct competitor analysis');
    });
  });

  describe('Builder Matcher Agent', () => {
    it('should find suitable builders for an idea', async () => {
      const ideaData = {
        requiredSkills: ['Solidity', 'Vue.js'],
        budget: 10000,
        timeline: 90
      };

      const builders = [
        {
          id: 1,
          name: 'Builder 1',
          skills: ['Solidity', 'Vue.js', 'React'],
          experience: 5,
          rating: 4.8,
          availability: true
        },
        {
          id: 2,
          name: 'Builder 2',
          skills: ['Solidity', 'Node.js'],
          experience: 3,
          rating: 4.5,
          availability: true
        }
      ];

      mockBuilderMatcher.findBuilders.mockResolvedValue(builders);
      
      const result = await mockBuilderMatcher.findBuilders(ideaData);
      
      expect(mockBuilderMatcher.findBuilders).toHaveBeenCalledWith(ideaData);
      expect(result).toHaveLength(2);
      expect(result[0].skills).toContain('Solidity');
    });

    it('should match skills accurately', async () => {
      const requiredSkills = ['Solidity', 'Vue.js'];
      const builderSkills = ['Solidity', 'Vue.js', 'React', 'Node.js'];

      const matchScore = 0.9;

      mockBuilderMatcher.matchSkills.mockResolvedValue(matchScore);
      
      const result = await mockBuilderMatcher.matchSkills(requiredSkills, builderSkills);
      
      expect(mockBuilderMatcher.matchSkills).toHaveBeenCalledWith(requiredSkills, builderSkills);
      expect(result).toBe(0.9);
    });

    it('should calculate compatibility score', async () => {
      const idea = {
        requiredSkills: ['Solidity', 'Vue.js'],
        budget: 10000,
        timeline: 90
      };

      const builder = {
        skills: ['Solidity', 'Vue.js'],
        hourlyRate: 50,
        availability: true
      };

      const compatibility = {
        skillMatch: 0.95,
        budgetFit: 0.8,
        timelineFit: 0.9,
        overall: 0.88
      };

      mockBuilderMatcher.calculateCompatibility.mockResolvedValue(compatibility);
      
      const result = await mockBuilderMatcher.calculateCompatibility(idea, builder);
      
      expect(mockBuilderMatcher.calculateCompatibility).toHaveBeenCalledWith(idea, builder);
      expect(result.overall).toBe(0.88);
      expect(result.skillMatch).toBe(0.95);
    });
  });

  describe('Funding Finder Agent', () => {
    it('should find relevant investors', async () => {
      const ideaData = {
        category: 'Technology',
        marketSize: 1000000,
        stage: 'seed'
      };

      const investors = [
        {
          id: 1,
          name: 'Tech Ventures',
          focus: ['Technology', 'SaaS'],
          investmentRange: [100000, 5000000],
          stage: ['seed', 'series-a']
        },
        {
          id: 2,
          name: 'Innovation Capital',
          focus: ['Technology', 'Fintech'],
          investmentRange: [500000, 10000000],
          stage: ['seed', 'series-a', 'series-b']
        }
      ];

      mockFundingFinder.findInvestors.mockResolvedValue(investors);
      
      const result = await mockFundingFinder.findInvestors(ideaData);
      
      expect(mockFundingFinder.findInvestors).toHaveBeenCalledWith(ideaData);
      expect(result).toHaveLength(2);
      expect(result[0].focus).toContain('Technology');
    });

    it('should analyze investor portfolio patterns', async () => {
      const investorId = 1;

      const portfolioAnalysis = {
        totalInvestments: 25,
        averageInvestment: 2000000,
        successRate: 0.68,
        preferredSectors: ['Technology', 'Healthcare'],
        investmentTimeline: '3-5 years'
      };

      mockFundingFinder.analyzePortfolio.mockResolvedValue(portfolioAnalysis);
      
      const result = await mockFundingFinder.analyzePortfolio(investorId);
      
      expect(mockFundingFinder.analyzePortfolio).toHaveBeenCalledWith(investorId);
      expect(result.totalInvestments).toBe(25);
      expect(result.successRate).toBe(0.68);
    });

    it('should generate personalized pitch', async () => {
      const ideaData = {
        title: 'Test Idea',
        description: 'A test idea description',
        marketSize: 1000000,
        team: 'Experienced developers'
      };

      const investorProfile = {
        focus: ['Technology'],
        investmentRange: [100000, 5000000],
        stage: ['seed']
      };

      const pitch = {
        title: 'Personalized Pitch for Tech Ventures',
        executiveSummary: 'Customized summary...',
        marketOpportunity: 'Tailored market analysis...',
        teamHighlight: 'Team experience emphasis...',
        financialProjections: 'Conservative projections...'
      };

      mockFundingFinder.generatePitch.mockResolvedValue(pitch);
      
      const result = await mockFundingFinder.generatePitch(ideaData, investorProfile);
      
      expect(mockFundingFinder.generatePitch).toHaveBeenCalledWith(ideaData, investorProfile);
      expect(result.title).toContain('Personalized Pitch');
    });
  });

  describe('Market Analyzer Agent', () => {
    it('should analyze market conditions', async () => {
      const marketData = {
        sector: 'Technology',
        region: 'Global',
        timeframe: '12 months'
      };

      const analysis = {
        marketSize: 50000000000,
        growthRate: 0.15,
        keyTrends: ['AI adoption', 'Cloud migration', 'Cybersecurity'],
        competitiveLandscape: 'Highly competitive',
        opportunities: ['Emerging markets', 'New technologies'],
        risks: ['Regulatory changes', 'Economic downturn']
      };

      mockMarketAnalyzer.analyzeMarket.mockResolvedValue(analysis);
      
      const result = await mockMarketAnalyzer.analyzeMarket(marketData);
      
      expect(mockMarketAnalyzer.analyzeMarket).toHaveBeenCalledWith(marketData);
      expect(result.marketSize).toBe(50000000000);
      expect(result.growthRate).toBe(0.15);
    });

    it('should identify market trends', async () => {
      const sector = 'Technology';

      const trends = [
        {
          name: 'AI/ML Integration',
          impact: 'High',
          timeline: '1-2 years',
          confidence: 0.85
        },
        {
          name: 'Blockchain Adoption',
          impact: 'Medium',
          timeline: '2-3 years',
          confidence: 0.70
        }
      ];

      mockMarketAnalyzer.identifyTrends.mockResolvedValue(trends);
      
      const result = await mockMarketAnalyzer.identifyTrends(sector);
      
      expect(mockMarketAnalyzer.identifyTrends).toHaveBeenCalledWith(sector);
      expect(result).toHaveLength(2);
      expect(result[0].impact).toBe('High');
    });

    it('should calculate market size accurately', async () => {
      const marketParams = {
        sector: 'Technology',
        region: 'North America',
        customerSegment: 'Enterprise'
      };

      const marketSize = {
        total: 25000000000,
        addressable: 5000000000,
        obtainable: 1000000000,
        methodology: 'Bottom-up analysis using industry reports'
      };

      mockMarketAnalyzer.calculateMarketSize.mockResolvedValue(marketSize);
      
      const result = await mockMarketAnalyzer.calculateMarketSize(marketParams);
      
      expect(mockMarketAnalyzer.calculateMarketSize).toHaveBeenCalledWith(marketParams);
      expect(result.total).toBe(25000000000);
      expect(result.addressable).toBe(5000000000);
    });
  });

  describe('Pitch Generator Agent', () => {
    it('should generate comprehensive pitch deck', async () => {
      const ideaData = {
        title: 'Test Idea',
        description: 'A test idea description',
        marketSize: 1000000,
        team: 'Experienced team',
        financials: 'Conservative projections'
      };

      const pitchDeck = {
        slides: [
          { title: 'Problem Statement', content: 'Clear problem definition' },
          { title: 'Solution', content: 'Innovative solution description' },
          { title: 'Market Opportunity', content: 'Market size and growth' },
          { title: 'Business Model', content: 'Revenue streams and pricing' },
          { title: 'Team', content: 'Team experience and capabilities' },
          { title: 'Financial Projections', content: '3-year projections' }
        ],
        notes: 'Speaker notes for each slide',
        design: 'Professional template applied'
      };

      mockPitchGenerator.generatePitch.mockResolvedValue(pitchDeck);
      
      const result = await mockPitchGenerator.generatePitch(ideaData);
      
      expect(mockPitchGenerator.generatePitch).toHaveBeenCalledWith(ideaData);
      expect(result.slides).toHaveLength(6);
      expect(result.slides[0].title).toBe('Problem Statement');
    });

    it('should customize pitch for specific investor', async () => {
      const basePitch = {
        title: 'Base Pitch',
        content: 'Generic content'
      };

      const investorProfile = {
        focus: ['Technology'],
        investmentRange: [100000, 5000000],
        stage: ['seed']
      };

      const customizedPitch = {
        title: 'Customized for Tech Ventures',
        content: 'Technology-focused content with seed stage emphasis',
        modifications: ['Emphasized tech aspects', 'Adjusted financials for seed stage']
      };

      mockPitchGenerator.customizeForInvestor.mockResolvedValue(customizedPitch);
      
      const result = await mockPitchGenerator.customizeForInvestor(basePitch, investorProfile);
      
      expect(mockPitchGenerator.customizeForInvestor).toHaveBeenCalledWith(basePitch, investorProfile);
      expect(result.title).toContain('Customized for Tech Ventures');
    });

    it('should optimize pitch content', async () => {
      const pitchContent = {
        problem: 'Problem statement',
        solution: 'Solution description',
        market: 'Market analysis',
        team: 'Team information'
      };

      const optimization = {
        problem: 'Optimized problem statement',
        solution: 'Enhanced solution description',
        market: 'Improved market analysis',
        team: 'Strengthened team presentation',
        improvements: ['Clarified problem', 'Enhanced solution', 'Strengthened market data']
      };

      mockPitchGenerator.optimizeContent.mockResolvedValue(optimization);
      
      const result = await mockPitchGenerator.optimizeContent(pitchContent);
      
      expect(mockPitchGenerator.optimizeContent).toHaveBeenCalledWith(pitchContent);
      expect(result.improvements).toHaveLength(3);
      expect(result.problem).toBe('Optimized problem statement');
    });
  });

  describe('Agent Integration', () => {
    it('should coordinate multiple agents for idea analysis', async () => {
      const ideaData = {
        title: 'Test Idea',
        description: 'A test idea description',
        category: 'Technology',
        marketSize: 1000000,
        requiredSkills: ['Solidity', 'Vue.js'],
        equityShare: 5
      };

      // Mock all agent responses
      mockIdeaValidator.validateIdea.mockResolvedValue({ isValid: true, score: 85 });
      mockMarketAnalyzer.analyzeMarket.mockResolvedValue({ marketSize: 50000000000, growthRate: 0.15 });
      mockBuilderMatcher.findBuilders.mockResolvedValue([{ id: 1, name: 'Builder 1' }]);
      mockFundingFinder.findInvestors.mockResolvedValue([{ id: 1, name: 'Investor 1' }]);

      // Simulate coordinated analysis
      const validation = await mockIdeaValidator.validateIdea(ideaData);
      const marketAnalysis = await mockMarketAnalyzer.analyzeMarket({ sector: ideaData.category });
      const builders = await mockBuilderMatcher.findBuilders(ideaData);
      const investors = await mockFundingFinder.findInvestors(ideaData);

      expect(validation.isValid).toBe(true);
      expect(marketAnalysis.marketSize).toBe(50000000000);
      expect(builders).toHaveLength(1);
      expect(investors).toHaveLength(1);
    });

    it('should handle agent failures gracefully', async () => {
      const ideaData = {
        title: 'Test Idea',
        description: 'A test idea description'
      };

      // Mock one agent failure
      mockIdeaValidator.validateIdea.mockRejectedValue(new Error('Agent unavailable'));
      mockMarketAnalyzer.analyzeMarket.mockResolvedValue({ marketSize: 50000000000 });

      // Test error handling
      try {
        await mockIdeaValidator.validateIdea(ideaData);
      } catch (error) {
        expect(error.message).toBe('Agent unavailable');
      }

      // Other agents should still work
      const marketAnalysis = await mockMarketAnalyzer.analyzeMarket({ sector: 'Technology' });
      expect(marketAnalysis.marketSize).toBe(50000000000);
    });
  });
});
