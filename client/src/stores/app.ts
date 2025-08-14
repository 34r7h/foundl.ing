import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  address: string
  type: 'innovator' | 'executor' | 'funder'
  name: string
  email: string
  avatar?: string
  reputation: number
  skills: string[]
  bio: string
  createdAt: Date
}

export interface Idea {
  id: string
  tokenId: number
  title: string
  description: string
  category: string
  creator: User
  createdAt: Date
  totalFunding: number
  funderCount: number
  isActive: boolean
  tags: string[]
  attachments: string[]
}


export interface ExecutorProposal {
  id: string
  ideaId: string
  executor: User
  plan: string
  terms: string
  milestones: Milestone[]
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}

export interface InvestorDeal {
  id: string
  projectId: string
  investor: User
  terms: string
  equityPercentage: number
  fundingAmount: number
  status: 'pending' | 'accepted' | 'rejected' | 'funded' | 'expired'
  createdAt: Date
}

export interface Project {
  id: string
  ideaId: string
  title: string
  description: string
  creator: User
  executor?: User
  totalBudget: number
  currentMilestone: number
  status: 'open' | 'in-progress' | 'completed' | 'cancelled' | 'disputed' | 'funded' | 'lost-funding'
  milestones: Milestone[]
  investorDeals: InvestorDeal[]
  nftTokenId?: number
  createdAt: Date
}

export interface Milestone {
  id: string
  title: string
  description: string
  amount: number
  deadline: Date
  isCompleted: boolean
  isPaid: boolean
  executor: User
  completedAt?: Date
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
}

export const useAppStore = defineStore('app', () => {
  // State
  const currentUser = ref<User | null>(null)
  const isConnected = ref(false)
  const isLoading = ref(false)
  const ideas = ref<Idea[]>([])
  const projects = ref<Project[]>([])
  const executorProposals = ref<ExecutorProposal[]>([])
  const notifications = ref<Notification[]>([])

  // Computed
  const userIdeas = computed(() =>
    ideas.value.filter(idea => idea.creator.id === currentUser.value?.id)
  )

  const userProjects = computed(() =>
    projects.value.filter(project =>
      project.creator.id === currentUser.value?.id ||
      project.executor?.id === currentUser.value?.id
    )
  )

  const availableIdeas = computed(() =>
    ideas.value.filter(idea => idea.isActive && idea.creator.id !== currentUser.value?.id)
  )

  const openProjects = computed(() =>
    projects.value.filter(project => project.status === 'open')
  )

  // Actions
  const setCurrentUser = (user: User | null) => {
    currentUser.value = user
    isConnected.value = !!user
  }

  // Idea actions
  const addIdea = (idea: Idea) => {
    ideas.value.unshift(idea)
  }

  const updateIdea = (id: string, updates: Partial<Idea>) => {
    const index = ideas.value.findIndex(idea => idea.id === id)
    if (index !== -1) {
      ideas.value[index] = { ...ideas.value[index], ...updates }
    }
  }

  // Executor proposal actions
  const addExecutorProposal = (proposal: ExecutorProposal) => {
    executorProposals.value.unshift(proposal)
  }

  const updateExecutorProposal = (id: string, updates: Partial<ExecutorProposal>) => {
    const index = executorProposals.value.findIndex(p => p.id === id)
    if (index !== -1) {
      executorProposals.value[index] = { ...executorProposals.value[index], ...updates }
    }
  }

  // Innovator review/accept/reject proposal
  const acceptExecutorProposal = (id: string) => {
    updateExecutorProposal(id, { status: 'accepted' })
  }
  const rejectExecutorProposal = (id: string) => {
    updateExecutorProposal(id, { status: 'rejected' })
  }

  // Project actions
  const addProject = (project: Project) => {
    projects.value.unshift(project)
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    const index = projects.value.findIndex(project => project.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...updates }
    }
  }

  // Investor deal actions
  const addInvestorDeal = (projectId: string, deal: InvestorDeal) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.investorDeals.push(deal)
    }
  }

  const updateInvestorDeal = (projectId: string, dealId: string, updates: Partial<InvestorDeal>) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const index = project.investorDeals.findIndex(d => d.id === dealId)
      if (index !== -1) {
        project.investorDeals[index] = { ...project.investorDeals[index], ...updates }
      }
    }
  }

  // Milestone enforcement
  const checkMilestoneDeadlines = () => {
    projects.value.forEach(project => {
      project.milestones.forEach(milestone => {
        if (!milestone.isCompleted && milestone.deadline < new Date()) {
          // Missed milestone
          updateProject(project.id, { status: 'open' })
        }
      })
    })
  }

  // Notification actions

  const addNotification = (notification: Notification) => {
    notifications.value.unshift(notification)
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const logout = () => {
    currentUser.value = null
    isConnected.value = false
    ideas.value = []
    projects.value = []
    notifications.value = []
  }

  return {
    // State
    currentUser,
    isConnected,
    isLoading,
    ideas,
    projects,
    executorProposals,
    notifications,

    // Computed
    userIdeas,
    userProjects,
    availableIdeas,
    openProjects,

    // Actions
    setCurrentUser,
    addIdea,
    updateIdea,
    addExecutorProposal,
    updateExecutorProposal,
    acceptExecutorProposal,
    rejectExecutorProposal,
    addProject,
    updateProject,
    addInvestorDeal,
    updateInvestorDeal,
    checkMilestoneDeadlines,
    addNotification,
    removeNotification,
    setLoading,
    logout
  }
})


