import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Types
export interface Idea {
  id: string
  creatorId: string
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
  status: 'draft' | 'active' | 'funded' | 'in-progress' | 'completed'
  nftTokenId: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  ideaId: string
  executorId: string
  title: string
  description: string
  milestones: Milestone[]
  totalFunding: number
  currentFunding: number
  status: 'funding' | 'in-progress' | 'completed' | 'cancelled'
  startDate: string
  estimatedCompletion: string
  actualCompletion?: string
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  fundingAmount: number
  status: 'pending' | 'in-progress' | 'completed' | 'paid'
  dueDate: string
  completedDate?: string
}

export interface Funding {
  id: string
  projectId: string
  funderId: string
  amount: number
  equityPercentage: number
  terms: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: string
  updatedAt: string
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
  const activeIdeas = computed(() => ideas.value.filter(idea => idea.status === 'active'))
  const fundedIdeas = computed(() => ideas.value.filter(idea => idea.status === 'funded'))
  const activeProjects = computed(() => projects.value.filter(project => project.status === 'in-progress'))
  const fundingProjects = computed(() => projects.value.filter(project => project.status === 'funding'))

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
  async function createIdea(ideaData: Omit<Idea, 'id' | 'creatorId' | 'createdAt' | 'updatedAt' | 'status' | 'nftTokenId'>, token: string) {
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

  // Project operations
  async function createProject(projectData: Omit<Project, 'id' | 'executorId' | 'createdAt' | 'updatedAt' | 'currentFunding' | 'status'>, token: string) {
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

  // Funding operations
  async function createFunding(fundingData: Omit<Funding, 'id' | 'funderId' | 'createdAt' | 'updatedAt' | 'status'>, token: string) {
    const result = await apiCall('/api/funding', 'create', fundingData, token)
    return result.fundingId
  }

  async function getProjectFunding(projectId: string, token?: string) {
    const result = await apiCall('/api/funding', 'getByProject', { projectId }, token)
    return result.fundings
  }

  async function updateFunding(fundingId: string, updates: Partial<Funding>, token: string) {
    await apiCall('/api/funding', 'update', { fundingId, updates }, token)
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
    activeIdeas,
    fundedIdeas,
    activeProjects,
    fundingProjects,
    
    // Actions
    createIdea,
    loadIdeas,
    loadUserIdeas,
    getIdeaById,
    updateIdea,
    createProject,
    loadProjects,
    loadUserProjects,
    getProjectById,
    updateProject,
    createFunding,
    getProjectFunding,
    updateFunding,
    loadUserProfile,
    updateUserProfile,
    loadUserStats,
    clearStore
  }
})
