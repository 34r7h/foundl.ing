<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Foundling Marketplace</h1>
      <p class="text-xl text-secondary-600 max-w-3xl mx-auto">
        Discover innovative ideas to execute or find projects to fund. AI-powered matching connects the right people with the right opportunities.
      </p>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">Category</label>
          <select v-model="filters.category" class="select">
            <option value="">All Categories</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="sustainability">Sustainability</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">Type</label>
          <select v-model="filters.type" class="select">
            <option value="">All Types</option>
            <option value="ideas">Ideas</option>
            <option value="projects">Projects</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">Status</label>
          <select v-model="filters.status" class="select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="funded">Funded</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">Search</label>
          <input 
            v-model="filters.search" 
            type="text" 
            placeholder="Search ideas or projects..."
            class="input"
          />
        </div>
      </div>
    </div>

    <!-- Create New -->
    <div v-if="blockchainStore.isConnected" class="bg-gradient-primary text-white rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-semibold mb-2">Have an Idea?</h3>
          <p class="opacity-90">Submit your idea and mint an NFT for perpetual royalties</p>
        </div>
        <button @click="showCreateIdeaModal = true" class="btn bg-white text-primary-600 hover:bg-gray-50">
          Submit Idea
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-secondary-200">
      <nav class="-mb-px flex space-x-8">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
          ]"
        >
          {{ tab.name }}
          <span class="ml-2 bg-secondary-100 text-secondary-900 py-0.5 px-2.5 rounded-full text-xs">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Content -->
    <div v-if="activeTab === 'ideas'" class="space-y-6">
      <!-- Ideas Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="idea in filteredIdeas" 
          :key="idea.id"
          class="card-hover cursor-pointer"
          @click="selectIdea(idea)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-secondary-900 mb-2">{{ idea.title }}</h3>
              <p class="text-secondary-600 text-sm mb-3 line-clamp-3">{{ idea.description }}</p>
            </div>
            <div class="ml-4">
              <div class="badge badge-primary">{{ idea.category }}</div>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm text-secondary-500 mb-4">
            <span>By {{ formatAddress(idea.creator.address) }}</span>
            <span>{{ formatDate(idea.createdAt) }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <span class="text-secondary-600">Funding:</span>
              <span class="font-semibold text-primary-600 ml-1">{{ formatEth(idea.totalFunding) }} ETH</span>
            </div>
            <div class="text-sm">
              <span class="text-secondary-600">Funders:</span>
              <span class="font-semibold text-primary-600 ml-1">{{ idea.funderCount }}</span>
            </div>
          </div>
          
          <div class="mt-4 flex space-x-2">
            <button 
              @click.stop="fundIdea(idea)"
              class="btn btn-primary flex-1"
              :disabled="!blockchainStore.isConnected"
            >
              Fund Idea
            </button>
            <button 
              @click.stop="createProjectFromIdea(idea)"
              class="btn btn-outline flex-1"
              :disabled="!blockchainStore.isConnected"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'projects'" class="space-y-6">
      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="project in filteredProjects" 
          :key="project.id"
          class="card-hover cursor-pointer"
          @click="selectProject(project)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-secondary-900 mb-2">{{ project.title }}</h3>
              <p class="text-secondary-600 text-sm mb-3 line-clamp-3">{{ project.description }}</p>
            </div>
            <div class="ml-4">
              <div :class="getStatusBadgeClass(project.status)">{{ project.status }}</div>
            </div>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-secondary-600">Creator:</span>
              <span class="text-secondary-900">{{ formatAddress(project.creator.address) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-secondary-600">Budget:</span>
              <span class="font-semibold text-primary-600">{{ formatEth(project.totalBudget) }} ETH</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-secondary-600">Milestones:</span>
              <span class="text-secondary-900">{{ project.milestones.length }}</span>
            </div>
          </div>
          
          <div class="mt-4">
            <button 
              v-if="project.status === 'open'"
              @click.stop="applyToProject(project)"
              class="btn btn-primary w-full"
              :disabled="!blockchainStore.isConnected"
            >
              Apply to Execute
            </button>
            <button 
              v-else-if="project.status === 'in-progress'"
              @click.stop="viewProjectDetails(project)"
              class="btn btn-outline w-full"
            >
              View Progress
            </button>
            <button 
              v-else
              @click.stop="viewProjectDetails(project)"
              class="btn btn-ghost w-full"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Idea Modal -->
    <div v-if="showCreateIdeaModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Submit New Idea</h3>
        
        <form @submit.prevent="submitIdea" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Title</label>
            <input v-model="newIdea.title" type="text" required class="input" placeholder="Idea title" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Description</label>
            <textarea v-model="newIdea.description" required class="textarea" rows="4" placeholder="Describe your idea"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Category</label>
            <select v-model="newIdea.category" required class="select">
              <option value="">Select category</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="sustainability">Sustainability</option>
              <option value="entertainment">Entertainment</option>
            </select>
          </div>
          
          <div class="flex space-x-3">
            <button type="button" @click="showCreateIdeaModal = false" class="btn btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary flex-1" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit Idea' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Fund Idea Modal -->
    <div v-if="showFundModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Fund Idea</h3>
        <p class="text-secondary-600 mb-4">{{ selectedIdea?.title }}</p>
        
        <form @submit.prevent="submitFunding" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Amount (ETH)</label>
            <input v-model="fundingAmount" type="number" step="0.01" min="0.01" required class="input" placeholder="0.01" />
          </div>
          
          <div class="flex space-x-3">
            <button type="button" @click="showFundModal = false" class="btn btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary flex-1" :disabled="isFunding">
              {{ isFunding ? 'Funding...' : 'Fund Idea' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore, type Idea, type Project } from '../../stores/app'
import { useBlockchainStore } from '../../stores/blockchain'

const appStore = useAppStore()
const blockchainStore = useBlockchainStore()

// State
const activeTab = ref('ideas')
const showCreateIdeaModal = ref(false)
const showFundModal = ref(false)
const selectedIdea = ref<Idea | null>(null)
const isSubmitting = ref(false)
const isFunding = ref(false)
const fundingAmount = ref('')

const newIdea = ref({
  title: '',
  description: '',
  category: ''
})

const filters = ref({
  category: '',
  type: '',
  status: '',
  search: ''
})

// Computed
const tabs = computed(() => [
  { id: 'ideas', name: 'Ideas', count: appStore.availableIdeas.length },
  { id: 'projects', name: 'Projects', count: appStore.openProjects.length }
])

const filteredIdeas = computed(() => {
  let ideas = appStore.availableIdeas
  
  if (filters.value.category) {
    ideas = ideas.filter(idea => idea.category === filters.value.category)
  }
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    ideas = ideas.filter(idea => 
      idea.title.toLowerCase().includes(search) || 
      idea.description.toLowerCase().includes(search)
    )
  }
  
  return ideas
})

const filteredProjects = computed(() => {
  let projects = appStore.openProjects
  
  if (filters.value.status) {
    projects = projects.filter(project => project.status === filters.value.status)
  }
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    projects = projects.filter(project => 
      project.title.toLowerCase().includes(search) || 
      project.description.toLowerCase().includes(search)
    )
  }
  
  return projects
})

// Methods
const selectIdea = (idea: Idea) => {
  // Navigate to idea detail or show modal
  console.log('Selected idea:', idea)
}

const selectProject = (project: Project) => {
  // Navigate to project detail
  console.log('Selected project:', project)
}

const fundIdea = (idea: Idea) => {
  selectedIdea.value = idea
  showFundModal.value = true
  fundingAmount.value = ''
}

const createProjectFromIdea = (idea: Idea) => {
  // Navigate to project creation with idea pre-filled
  console.log('Create project from idea:', idea)
}

const applyToProject = (project: Project) => {
  // Show application form
  console.log('Apply to project:', project)
}

const viewProjectDetails = (project: Project) => {
  // Navigate to project details
  console.log('View project details:', project)
}

const submitIdea = async () => {
  if (!blockchainStore.isConnected) return
  
  isSubmitting.value = true
  try {
    const tokenURI = `ipfs://${Date.now()}` // In production, upload to IPFS
    const tokenId = await blockchainStore.createIdea(
      newIdea.value.title,
      newIdea.value.description,
      newIdea.value.category,
      tokenURI
    )
    
    if (tokenId) {
      const idea: Idea = {
        id: Date.now().toString(),
        tokenId: Number(tokenId),
        title: newIdea.value.title,
        description: newIdea.value.description,
        category: newIdea.value.category,
        creator: appStore.currentUser!,
        createdAt: new Date(),
        totalFunding: 0,
        funderCount: 0,
        isActive: true,
        tags: [],
        attachments: []
      }
      
      appStore.addIdea(idea)
      appStore.addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Idea Submitted',
        message: 'Your idea has been submitted and NFT minted successfully!'
      })
      
      showCreateIdeaModal.value = false
      newIdea.value = { title: '', description: '', category: '' }
    }
  } catch (error) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Submission Failed',
      message: error instanceof Error ? error.message : 'Failed to submit idea'
    })
  } finally {
    isSubmitting.value = false
  }
}

const submitFunding = async () => {
  if (!selectedIdea.value || !blockchainStore.isConnected) return
  
  isFunding.value = true
  try {
    await blockchainStore.fundIdea(selectedIdea.value.tokenId, fundingAmount.value)
    
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Funding Successful',
      message: `Successfully funded ${fundingAmount.value} ETH to the idea!`
    })
    
    showFundModal.value = false
    selectedIdea.value = null
    fundingAmount.value = ''
  } catch (error) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Funding Failed',
      message: error instanceof Error ? error.message : 'Failed to fund idea'
    })
  } finally {
    isFunding.value = false
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'open':
      return 'badge badge-primary'
    case 'in-progress':
      return 'badge badge-warning'
    case 'completed':
      return 'badge badge-success'
    case 'cancelled':
      return 'badge badge-error'
    default:
      return 'badge badge-secondary'
  }
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const formatEth = (amount: number) => {
  return amount.toFixed(4)
}

onMounted(() => {
  // Load sample data for prototype
  if (appStore.ideas.length === 0) {
    // Add sample ideas
    const sampleIdeas: Idea[] = [
      {
        id: '1',
        tokenId: 1,
        title: 'AI-Powered Personal Finance Manager',
        description: 'An intelligent financial advisor that analyzes spending patterns and provides personalized investment recommendations using machine learning.',
        category: 'finance',
        creator: {
          id: 'user1',
          address: '0x1234...5678',
          type: 'innovator',
          name: 'Alex Chen',
          email: 'alex@example.com',
          reputation: 95,
          skills: ['AI/ML', 'Finance', 'Product Management'],
          bio: 'Experienced fintech entrepreneur with 10+ years in AI and finance.',
          createdAt: new Date()
        },
        createdAt: new Date(),
        totalFunding: 2.5,
        funderCount: 3,
        isActive: true,
        tags: ['AI', 'Finance', 'Personal'],
        attachments: []
      },
      {
        id: '2',
        tokenId: 2,
        title: 'Sustainable Urban Farming Platform',
        description: 'A blockchain-based platform connecting urban farmers with consumers, ensuring transparency in food sourcing and reducing carbon footprint.',
        category: 'sustainability',
        creator: {
          id: 'user2',
          address: '0x8765...4321',
          type: 'innovator',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          reputation: 88,
          skills: ['Sustainability', 'Blockchain', 'Agriculture'],
          bio: 'Environmental scientist passionate about sustainable food systems.',
          createdAt: new Date()
        },
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        totalFunding: 1.8,
        funderCount: 2,
        isActive: true,
        tags: ['Sustainability', 'Agriculture', 'Blockchain'],
        attachments: []
      }
    ]
    
    sampleIdeas.forEach(idea => appStore.addIdea(idea))
  }
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
