<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="bg-white rounded-lg p-8 shadow-sm">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-secondary-900 mb-4">Foundling Tools & AI Agents</h1>
        <p class="text-secondary-600 max-w-2xl mx-auto">
          Leverage AI-powered tools and agents to analyze ideas, match builders, discover funding opportunities, and generate investor-ready materials.
        </p>
      </div>
    </div>

    <!-- AI Agent Services -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="text-xl font-semibold mb-6">AI Agent Services</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="service in agentServices" 
          :key="service.name"
          class="border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="useAgentService(service)"
        >
          <h3 class="text-lg font-semibold text-secondary-900 mb-2">{{ service.displayName }}</h3>
          <p class="text-secondary-600 text-sm mb-4">{{ service.description }}</p>
          <div class="text-lg font-semibold text-primary-600 mb-2">{{ formatUSDC(service.pricePerUse) }} USDC</div>
          <button class="btn btn-primary w-full">Use Service</button>
        </div>
      </div>
    </div>

    <!-- Analysis Tools -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="text-xl font-semibold mb-6">Analysis Tools</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Idea Analysis -->
        <div class="border border-secondary-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Idea Feasibility Analysis</h3>
          <form @submit.prevent="analyzeIdea" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Idea Title</label>
              <input v-model="ideaAnalysis.title" type="text" required class="input" placeholder="Enter your idea title" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Description</label>
              <textarea v-model="ideaAnalysis.description" required class="textarea" rows="4" placeholder="Describe your idea in detail"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Category</label>
              <select v-model="ideaAnalysis.category" required class="select">
                <option value="">Select category</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="sustainability">Sustainability</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
            
            <button type="submit" class="btn btn-accent w-full" :disabled="isAnalyzing">
              {{ isAnalyzing ? 'Analyzing...' : 'Analyze Idea' }}
            </button>
          </form>
          
          <div v-if="ideaAnalysisResult" class="mt-6 p-4 bg-accent-50 rounded-lg">
            <h4 class="font-semibold text-accent-900 mb-2">Analysis Results</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-secondary-600">Feasibility Score:</span>
                <span class="font-semibold text-accent-600">{{ ideaAnalysisResult.feasibilityScore }}/100</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">Market Size:</span>
                <span class="font-semibold text-accent-600">{{ ideaAnalysisResult.marketSize }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">Competition Level:</span>
                <span class="font-semibold text-accent-600">{{ ideaAnalysisResult.competitionLevel }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">Development Complexity:</span>
                <span class="font-semibold text-accent-600">{{ ideaAnalysisResult.developmentComplexity }}</span>
              </div>
            </div>
            <div class="mt-3 p-3 bg-white rounded border">
              <h5 class="font-medium text-secondary-900 mb-2">Recommendations:</h5>
              <ul class="text-sm text-secondary-700 space-y-1">
                <li v-for="rec in ideaAnalysisResult.recommendations" :key="rec" class="flex items-start">
                  <span class="text-accent-500 mr-2">•</span>
                  {{ rec }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Builder Matching -->
        <div class="border border-secondary-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Builder Matching</h3>
          <form @submit.prevent="findBuilders" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Required Skills</label>
              <input v-model="builderMatching.skills" type="text" required class="input" placeholder="e.g., React, Solidity, AI/ML" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Project Budget</label>
              <input v-model="builderMatching.budget" type="number" required class="input" placeholder="Budget in ETH" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Timeline</label>
              <select v-model="builderMatching.timeline" required class="select">
                <option value="">Select timeline</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="12+ months">12+ months</option>
              </select>
            </div>
            
            <button type="submit" class="btn btn-accent w-full" :disabled="isFindingBuilders">
              {{ isFindingBuilders ? 'Searching...' : 'Find Builders' }}
            </button>
          </form>
          
          <div v-if="builderMatchingResults.length > 0" class="mt-6 space-y-3">
            <h4 class="font-semibold text-accent-900">Matching Builders</h4>
            <div v-for="builder in builderMatchingResults" :key="builder.id" class="p-3 bg-white rounded border">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-secondary-900">{{ builder.name }}</div>
                  <div class="text-sm text-secondary-600">{{ builder.skills.join(', ') }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-accent-600">{{ builder.matchScore }}% match</div>
                  <div class="text-xs text-secondary-500">{{ builder.hourlyRate }} ETH/hr</div>
                </div>
              </div>
              <button @click="contactBuilder(builder)" class="btn btn-outline btn-sm w-full mt-2">
                Contact Builder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Research Tools -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="text-xl font-semibold mb-6">Research & Intelligence</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Market Research -->
        <div class="border border-secondary-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Market Research</h3>
          <form @submit.prevent="researchMarket" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Industry/Sector</label>
              <input v-model="marketResearch.industry" type="text" required class="input" placeholder="e.g., FinTech, Healthcare AI" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Geographic Focus</label>
              <select v-model="marketResearch.geography" required class="select">
                <option value="">Select region</option>
                <option value="global">Global</option>
                <option value="north-america">North America</option>
                <option value="europe">Europe</option>
                <option value="asia-pacific">Asia Pacific</option>
                <option value="latin-america">Latin America</option>
              </select>
            </div>
            
            <button type="submit" class="btn btn-success w-full" :disabled="isResearching">
              {{ isResearching ? 'Researching...' : 'Research Market' }}
            </button>
          </form>
          
          <div v-if="marketResearchResults" class="mt-6 p-4 bg-success-50 rounded-lg">
            <h4 class="font-semibold text-success-900 mb-2">Market Insights</h4>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-secondary-600">Market Size:</span>
                <span class="font-semibold text-success-600">{{ marketResearchResults.marketSize }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">Growth Rate:</span>
                <span class="font-semibold text-success-600">{{ marketResearchResults.growthRate }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">Key Trends:</span>
                <span class="font-semibold text-success-600">{{ marketResearchResults.keyTrends }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Funding Intelligence -->
        <div class="border border-secondary-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Funding Intelligence</h3>
          <form @submit.prevent="findFunding" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Funding Stage</label>
              <select v-model="fundingIntelligence.stage" required class="select">
                <option value="">Select stage</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B</option>
                <option value="series-c">Series C</option>
                <option value="growth">Growth</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Funding Amount</label>
              <input v-model="fundingIntelligence.amount" type="text" required class="input" placeholder="e.g., $500K - $2M" />
            </div>
            
            <button type="submit" class="btn btn-success w-full" :disabled="isFindingFunding">
              {{ isFindingFunding ? 'Searching...' : 'Find Funding' }}
            </button>
          </form>
          
          <div v-if="fundingIntelligenceResults.length > 0" class="mt-6 space-y-3">
            <h4 class="font-semibold text-success-900">Funding Opportunities</h4>
            <div v-for="opportunity in fundingIntelligenceResults" :key="opportunity.id" class="p-3 bg-white rounded border">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-secondary-900">{{ opportunity.name }}</div>
                  <div class="text-sm text-secondary-600">{{ opportunity.focus }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-success-600">{{ opportunity.amount }}</div>
                  <div class="text-xs text-secondary-500">{{ opportunity.stage }}</div>
                </div>
              </div>
              <button @click="viewFundingDetails(opportunity)" class="btn btn-outline btn-sm w-full mt-2">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useBlockchainStore } from '../../stores/blockchain'

const appStore = useAppStore()
const blockchainStore = useBlockchainStore()

// State
const isAnalyzing = ref(false)
const isFindingBuilders = ref(false)
const isResearching = ref(false)
const isFindingFunding = ref(false)

// Idea Analysis
const ideaAnalysis = ref({
  title: '',
  description: '',
  category: ''
})

const ideaAnalysisResult = ref(null)

// Builder Matching
const builderMatching = ref({
  skills: '',
  budget: '',
  timeline: ''
})

const builderMatchingResults = ref([])

// Market Research
const marketResearch = ref({
  industry: '',
  geography: ''
})

const marketResearchResults = ref(null)

// Funding Intelligence
const fundingIntelligence = ref({
  stage: '',
  amount: ''
})

const fundingIntelligenceResults = ref([])

// AI Agent Services
const agentServices = ref([
  {
    name: 'idea_analysis',
    displayName: 'Idea Analysis',
    description: 'AI-powered idea feasibility analysis and scoring',
    pricePerUse: 50 * 10**6 // 50 USDC
  },
  {
    name: 'builder_matching',
    displayName: 'Builder Matching',
    description: 'AI-driven builder-executor matching algorithm',
    pricePerUse: 100 * 10**6 // 100 USDC
  },
  {
    name: 'funding_intelligence',
    displayName: 'Funding Intelligence',
    description: 'VC database analysis and funding opportunity targeting',
    pricePerUse: 200 * 10**6 // 200 USDC
  },
  {
    name: 'pitch_generation',
    displayName: 'Pitch Generation',
    description: 'AI-generated investor pitch decks and materials',
    pricePerUse: 150 * 10**6 // 150 USDC
  }
])

const useAgentService = async (service: any) => {
  if (!blockchainStore.canInteract) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Wallet Not Connected',
      message: 'Please connect your wallet to use AI agent services'
    })
    return
  }

  try {
    const amount = service.pricePerUse.toString()
    const success = await blockchainStore.useAgentService(service.name, amount)
    
    if (success) {
      appStore.addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Service Used',
        message: `Successfully used ${service.displayName} service`
      })
    }
  } catch (error) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Service Failed',
      message: error instanceof Error ? error.message : 'Failed to use service'
    })
  }
}

const analyzeIdea = async () => {
  isAnalyzing.value = true
  
  try {
    const response = await fetch('http://localhost:3001/api/ai-agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'validate_idea',
        title: ideaAnalysis.value.title,
        description: ideaAnalysis.value.description,
        category: ideaAnalysis.value.category
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      ideaAnalysisResult.value = result.data
      appStore.addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Idea Analysis Complete',
        message: 'Your idea has been analyzed by AI successfully!'
      })
    } else {
      throw new Error(result.error || 'Analysis failed')
    }
  } catch (error) {
    console.error('Idea analysis error:', error)
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Analysis Failed',
      message: error instanceof Error ? error.message : 'Failed to analyze idea. Please try again.'
    })
  } finally {
    isAnalyzing.value = false
  }
}

const findBuilders = async () => {
  isFindingBuilders.value = true
  
  try {
    const response = await fetch('http://localhost:3001/api/ai-agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'match_builders',
        required_skills: builderMatching.value.skills.split(',').map(s => s.trim()),
        project_budget: builderMatching.value.budget,
        timeline: builderMatching.value.timeline
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      builderMatchingResults.value = result.data
      appStore.addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Builders Found',
        message: `Found ${builderMatchingResults.value.length} matching builders using AI`
      })
    } else {
      throw new Error(result.error || 'Builder search failed')
    }
  } catch (error) {
    console.error('Builder search error:', error)
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Search Failed',
      message: error instanceof Error ? error.message : 'Failed to find builders. Please try again.'
    })
  } finally {
    isFindingBuilders.value = false
  }
}

const contactBuilder = (builder: any) => {
  appStore.addNotification({
    id: Date.now().toString(),
    type: 'info',
    title: 'Contact Builder',
    message: `Contact form for ${builder.name} will be implemented`
  })
}

const researchMarket = async () => {
  isResearching.value = true
  
  try {
    // Simulate market research
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    marketResearchResults.value = {
      marketSize: '$12.5B',
      growthRate: '23.4% annually',
      keyTrends: 'AI integration, mobile-first, sustainability focus'
    }
    
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Market Research Complete',
      message: 'Market analysis has been completed successfully!'
    })
  } catch (error) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Research Failed',
      message: 'Failed to complete market research. Please try again.'
    })
  } finally {
    isResearching.value = false
  }
}

const findFunding = async () => {
  isFindingFunding.value = true
  
  try {
    // Simulate funding search
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    fundingIntelligenceResults.value = [
      {
        id: '1',
        name: 'TechVentures Capital',
        focus: 'AI/ML, FinTech, SaaS',
        amount: '$500K - $2M',
        stage: 'Seed'
      },
      {
        id: '2',
        name: 'Innovation Fund',
        focus: 'Healthcare, EdTech, CleanTech',
        amount: '$1M - $5M',
        stage: 'Series A'
      },
      {
        id: '3',
        name: 'Growth Partners',
        focus: 'B2B, Enterprise, Mobile',
        amount: '$2M - $10M',
        stage: 'Series B'
      }
    ]
    
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Funding Found',
      message: `Found ${fundingIntelligenceResults.value.length} funding opportunities`
    })
  } catch (error) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Search Failed',
      message: 'Failed to find funding opportunities. Please try again.'
    })
  } finally {
    isFindingFunding.value = false
  }
}

const viewFundingDetails = (opportunity: any) => {
  appStore.addNotification({
    id: Date.now().toString(),
    type: 'info',
    title: 'Funding Details',
    message: `Detailed view for ${opportunity.name} will be implemented`
  })
}

const formatUSDC = (amount: number) => {
  return (amount / 10**6).toFixed(2)
}
</script>

<style scoped>
.card-hover {
  transition: all 0.2s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
</style>
