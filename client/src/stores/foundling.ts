import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Types matching the new smart contract structure
export interface ExecutionProposal {
  id: string
  executorId: string
  executor: UserProfile
  executionPlan: string
  proposedBudget: number
  estimatedDuration: number
  equityRequested: number
  proposedAt: string
  isAccepted: boolean
  isRejected: boolean
}

export interface Idea {
  id: string
  tokenId: number
  creatorId: string
  creator: UserProfile
  title: string
  description: string
  category: string
  tags: string[]
  feasibilityScore: number
  marketSize: string
  competitionLevel: string
  developmentComplexity: string
  fundingRequired: number
  equityOffered: number
  status: 'open' | 'in-execution' | 'funded' | 'completed' | 'failed'
  nftTokenId: string
  createdAt: string
  updatedAt: string
  executionProposals: ExecutionProposal[]
  acceptedProposalId?: string
  projectTokenId?: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  fundingAmount: number
  status: 'pending' | 'in-progress' | 'completed' | 'paid' | 'overdue'
  dueDate: string
  completedDate?: string
}

export interface InvestorDeal {
  id: string
  projectId: string
  investorId: string
  investor: UserProfile
  fundingAmount: number
  equityPercentage: number
  terms: string
  status: 'pending' | 'accepted' | 'rejected' | 'active'
  proposedAt: string
  fundedAt?: string
}

export interface Project {
  id: string
  tokenId: number
  ideaId: string
  idea: Idea
  executorId: string
  executor: UserProfile
  title: string
  description: string
  milestones: Milestone[]
  totalBudget: number
  currentFunding: number
  status: 'open' | 'funded' | 'in-progress' | 'completed' | 'failed' | 'cancelled'
  startDate: string
  estimatedCompletion: string
  actualCompletion?: string
  createdAt: string
  updatedAt: string
  executorEquity: number
  investorEquity: number
  creatorEquity: number
  investorDeals: InvestorDeal[]
  acceptedDealId?: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  bio: string
  type: 'innovator' | 'executor' | 'funder' | 'hybrid'
  address: string
  skills: string[]
  reputation: number
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  ideas: number
  projects: number
  funding: number
  royalties: number
}

// Store
export const useFoundlingStore = defineStore('foundling', () => {
  // State
  const ideas = ref<Idea[]>([])
  const projects = ref<Project[]>([])
  const currentUser = ref<UserProfile | null>(null)
  const userStats = ref<UserStats>({
    ideas: 0,
    projects: 0,
    funding: 0,
    royalties: 0
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const openIdeas = computed(() => ideas.value.filter(idea => idea.status === 'open'))
  const inExecutionIdeas = computed(() => ideas.value.filter(idea => idea.status === 'in-execution'))
  const fundedIdeas = computed(() => ideas.value.filter(idea => idea.status === 'funded'))
  const completedIdeas = computed(() => ideas.value.filter(idea => idea.status === 'completed'))
  const failedIdeas = computed(() => ideas.value.filter(idea => idea.status === 'failed'))
  
  const openProjects = computed(() => projects.value.filter(project => project.status === 'open'))
  const fundedProjects = computed(() => projects.value.filter(project => project.status === 'funded'))
  const inProgressProjects = computed(() => projects.value.filter(project => project.status === 'in-progress'))
  const completedProjects = computed(() => projects.value.filter(project => project.status === 'completed'))
  const failedProjects = computed(() => projects.value.filter(project => project.status === 'failed'))

  // API base URL
  const API_BASE = 'http://localhost:3001'

  // Helper function to make API calls
  async function apiCall(endpoint: string, operation: string, data: any = {}, token?: string) {
    try {
      isLoading.value = true
      error.value = null

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          operation,
          ...data
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'API call failed')
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Idea operations
  async function createIdea(ideaData: Omit<Idea, 'id' | 'creatorId' | 'createdAt' | 'updatedAt' | 'status' | 'nftTokenId' | 'executionProposals' | 'acceptedProposalId' | 'projectTokenId'>, token: string) {
    const result = await apiCall('/api/ideas', 'create', ideaData, token)
    await loadIdeas(token)
    return result.ideaId
  }

  async function loadIdeas(token?: string) {
    const result = await apiCall('/api/ideas', 'getAll', {}, token)
    ideas.value = result.ideas
  }

  async function loadUserIdeas(token: string) {
    const result = await apiCall('/api/ideas', 'getByCreator', {}, token)
    ideas.value = result.ideas
  }

  async function getIdeaById(ideaId: string, token?: string) {
    const result = await apiCall('/api/ideas', 'getById', { ideaId }, token)
    return result.idea
  }

  async function updateIdea(ideaId: string, updates: Partial<Idea>, token: string) {
    await apiCall('/api/ideas', 'update', { ideaId, updates }, token)
    await loadIdeas(token)
  }

  // Execution proposal operations
  async function submitExecutionProposal(
    ideaId: string, 
    proposalData: Omit<ExecutionProposal, 'id' | 'executorId' | 'executor' | 'proposedAt' | 'isAccepted' | 'isRejected'>, 
    token: string
  ) {
    const result = await apiCall('/api/ideas/proposals', 'submit', { ideaId, ...proposalData }, token)
    await loadIdeas(token)
    return result.proposalId
  }

  async function acceptExecutionProposal(ideaId: string, proposalId: string, token: string) {
    await apiCall('/api/ideas/proposals', 'accept', { ideaId, proposalId }, token)
    await loadIdeas(token)
  }

  async function rejectExecutionProposal(ideaId: string, proposalId: string, token: string) {
    await apiCall('/api/ideas/proposals', 'reject', { ideaId, proposalId }, token)
    await loadIdeas(token)
  }

  // Project operations
  async function createProject(projectData: Omit<Project, 'id' | 'tokenId' | 'executorId' | 'executor' | 'createdAt' | 'updatedAt' | 'currentFunding' | 'status' | 'executorEquity' | 'investorEquity' | 'creatorEquity' | 'investorDeals' | 'acceptedDealId'>, token: string) {
    const result = await apiCall('/api/projects', 'create', projectData, token)
    await loadProjects(token)
    return result.projectId
  }

  async function loadProjects(token?: string) {
    const result = await apiCall('/api/projects', 'getAll', {}, token)
    projects.value = result.projects
  }

  async function loadUserProjects(token: string) {
    const result = await apiCall('/api/projects', 'getByExecutor', {}, token)
    projects.value = result.projects
  }

  async function getProjectById(projectId: string, token?: string) {
    const result = await apiCall('/api/projects', 'getById', { projectId }, token)
    return result.project
  }

  async function updateProject(projectId: string, updates: Partial<Project>, token: string) {
    await apiCall('/api/projects', 'update', { projectId, updates }, token)
    await loadProjects(token)
  }

  // Milestone operations
  async function addMilestone(projectId: string, milestoneData: Omit<Milestone, 'id' | 'status' | 'completedDate'>, token: string) {
    await apiCall('/api/projects/milestones', 'add', { projectId, ...milestoneData }, token)
    await loadProjects(token)
  }

  async function completeMilestone(projectId: string, milestoneId: string, token: string) {
    await apiCall('/api/projects/milestones', 'complete', { projectId, milestoneId }, token)
    await loadProjects(token)
  }

  async function payMilestone(projectId: string, milestoneId: string, amount: number, token: string) {
    await apiCall('/api/projects/milestones', 'pay', { projectId, milestoneId, amount }, token)
    await loadProjects(token)
  }

  // Investor deal operations
  async function submitInvestorDeal(dealData: Omit<InvestorDeal, 'id' | 'investorId' | 'investor' | 'status' | 'proposedAt' | 'fundedAt'>, token: string) {
    const result = await apiCall('/api/projects/deals', 'submit', dealData, token)
    await loadProjects(token)
    return result.dealId
  }

  async function acceptInvestorDeal(projectId: string, dealId: string, token: string) {
    await apiCall('/api/projects/deals', 'accept', { projectId, dealId }, token)
    await loadProjects(token)
  }

  async function rejectInvestorDeal(projectId: string, dealId: string, token: string) {
    await apiCall('/api/projects/deals', 'reject', { projectId, dealId }, token)
    await loadProjects(token)
  }

  // Profile operations
  async function loadUserProfile(userId: string, token?: string) {
    const result = await apiCall('/api/profiles', 'getById', { userId }, token)
    currentUser.value = result.user
    return result.user
  }

  async function updateUserProfile(updates: Partial<UserProfile>, token: string) {
    await apiCall('/api/profiles', 'update', { updates }, token)
    if (currentUser.value) {
      Object.assign(currentUser.value, updates)
    }
  }

  async function loadUserStats(token: string) {
    const result = await apiCall('/api/profiles', 'getStats', {}, token)
    userStats.value = result.stats
  }

  // Clear store
  function clearStore() {
    ideas.value = []
    projects.value = []
    currentUser.value = null
    userStats.value = {
      ideas: 0,
      projects: 0,
      funding: 0,
      royalties: 0
    }
    error.value = null
  }

  return {
    // State
    ideas,
    projects,
    currentUser,
    userStats,
    isLoading,
    error,
    
    // Computed
    openIdeas,
    inExecutionIdeas,
    fundedIdeas,
    completedIdeas,
    failedIdeas,
    openProjects,
    fundedProjects,
    inProgressProjects,
    completedProjects,
    failedProjects,
    
    // Actions
    createIdea,
    loadIdeas,
    loadUserIdeas,
    getIdeaById,
    updateIdea,
    submitExecutionProposal,
    acceptExecutionProposal,
    rejectExecutionProposal,
    createProject,
    loadProjects,
    loadUserProjects,
    getProjectById,
    updateProject,
    addMilestone,
    completeMilestone,
    payMilestone,
    submitInvestorDeal,
    acceptInvestorDeal,
    rejectInvestorDeal,
    loadUserProfile,
    updateUserProfile,
    loadUserStats,
    clearStore
  }
})
