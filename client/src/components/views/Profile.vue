<template>
  <div class="space-y-8">
    <!-- Profile Header -->
    <div class="bg-white rounded-lg p-8 shadow-sm">
      <div class="flex items-start space-x-6">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
            <span class="text-white text-2xl font-bold">
              {{ userProfile?.name?.charAt(0) || 'U' }}
            </span>
          </div>
        </div>
        
        <!-- User Info -->
        <div class="flex-1">
          <div class="flex items-center space-x-4 mb-4">
            <h1 class="text-3xl font-bold text-secondary-900">{{ userProfile?.name || 'Anonymous User' }}</h1>
            <div class="badge badge-primary">{{ userProfile?.type || 'User' }}</div>
            <div class="flex items-center space-x-2">
              <span class="text-secondary-600">Reputation:</span>
              <span class="font-semibold text-primary-600">{{ userProfile?.reputation || 0 }}</span>
            </div>
          </div>
          
          <p class="text-secondary-600 mb-4">{{ userProfile?.bio || 'No bio available' }}</p>
          
          <div class="flex items-center space-x-6 text-sm">
            <div>
              <span class="text-secondary-600">Address:</span>
              <span class="font-mono text-secondary-900 ml-2">{{ formatAddress(userProfile?.address) }}</span>
            </div>
            <div>
              <span class="text-secondary-600">Member since:</span>
              <span class="text-secondary-900 ml-2">{{ formatDate(userProfile?.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex-shrink-0">
          <button 
            v-if="!isOwnProfile"
            @click="contactUser"
            class="btn btn-primary"
          >
            Contact
          </button>
          <button 
            v-else
            @click="showEditModal = true"
            class="btn btn-outline"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>

    <!-- Skills and Expertise -->
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h2 class="text-xl font-semibold mb-4">Skills & Expertise</h2>
      <div class="flex flex-wrap gap-2">
        <span 
          v-for="skill in userProfile?.skills" 
          :key="skill"
          class="badge badge-secondary"
        >
          {{ skill }}
        </span>
        <span v-if="!userProfile?.skills?.length" class="text-secondary-500">
          No skills listed
        </span>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg p-6 shadow-sm text-center">
        <div class="text-3xl font-bold text-primary-600 mb-2">{{ userStats.ideas }}</div>
        <div class="text-secondary-600">Ideas Created</div>
      </div>
      
      <div class="bg-white rounded-lg p-6 shadow-sm text-center">
        <div class="text-3xl font-bold text-accent-600 mb-2">{{ userStats.projects }}</div>
        <div class="text-secondary-600">Projects Executed</div>
      </div>
      
      <div class="bg-white rounded-lg p-6 shadow-sm text-center">
        <div class="text-3xl font-bold text-success-600 mb-2">{{ userStats.funding }}</div>
        <div class="text-secondary-600">Total Funding (ETH)</div>
      </div>
      
      <div class="bg-white rounded-lg p-6 shadow-sm text-center">
        <div class="text-3xl font-bold text-warning-600 mb-2">{{ userStats.royalties }}</div>
        <div class="text-secondary-600">Royalties Earned (ETH)</div>
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

    <!-- Tab Content -->
    <div v-if="activeTab === 'ideas'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-semibold">Ideas Created</h3>
        <button 
          v-if="isOwnProfile"
          @click="showCreateIdeaModal = true"
          class="btn btn-primary"
        >
          Create New Idea
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="idea in userIdeas" 
          :key="idea.id"
          class="card-hover cursor-pointer"
          @click="viewIdea(idea)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-secondary-900 mb-2">{{ idea.title }}</h4>
              <p class="text-secondary-600 text-sm mb-3 line-clamp-3">{{ idea.description }}</p>
            </div>
            <div class="ml-4">
              <div class="badge badge-primary">{{ idea.category }}</div>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm text-secondary-500 mb-4">
            <span>{{ formatDate(idea.createdAt) }}</span>
            <span class="text-primary-600 font-semibold">{{ formatEth(idea.totalFunding) }} ETH</span>
          </div>
          
          <div class="flex space-x-2">
            <button 
              @click.stop="editIdea(idea)"
              class="btn btn-outline flex-1"
              v-if="isOwnProfile"
            >
              Edit
            </button>
            <button 
              @click.stop="viewIdea(idea)"
              class="btn btn-primary flex-1"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'projects'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-semibold">Projects</h3>
        <button 
          v-if="isOwnProfile"
          @click="showCreateProjectModal = true"
          class="btn btn-primary"
        >
          Create New Project
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="project in userProjects" 
          :key="project.id"
          class="card-hover cursor-pointer"
          @click="viewProject(project)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-secondary-900 mb-2">{{ project.title }}</h4>
              <p class="text-secondary-600 text-sm mb-3 line-clamp-3">{{ project.description }}</p>
            </div>
            <div class="ml-4">
              <div :class="getStatusBadgeClass(project.status)">{{ project.status }}</div>
            </div>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-secondary-600">Budget:</span>
              <span class="font-semibold text-primary-600">{{ formatEth(project.totalBudget) }} ETH</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-secondary-600">Milestones:</span>
              <span class="text-secondary-900">{{ project.milestones.length }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-secondary-600">Created:</span>
              <span class="text-secondary-900">{{ formatDate(project.createdAt) }}</span>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button 
              @click.stop="editProject(project)"
              class="btn btn-outline flex-1"
              v-if="isOwnProfile && project.creator.id === userProfile?.id"
            >
              Edit
            </button>
            <button 
              @click.stop="viewProject(project)"
              class="btn btn-primary flex-1"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'activity'" class="space-y-6">
      <h3 class="text-xl font-semibold">Recent Activity</h3>
      
      <div class="space-y-4">
        <div 
          v-for="activity in userActivity" 
          :key="activity.id"
          class="bg-white rounded-lg p-4 shadow-sm"
        >
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-secondary-900">{{ activity.description }}</p>
              <p class="text-sm text-secondary-500">{{ formatDate(activity.timestamp) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Edit Profile</h3>
        
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Name</label>
            <input v-model="editForm.name" type="text" required class="input" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Bio</label>
            <textarea v-model="editForm.bio" class="textarea" rows="4"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Skills (comma-separated)</label>
            <input v-model="editForm.skills" type="text" class="input" placeholder="AI/ML, Finance, Product Management" />
          </div>
          
          <div class="flex space-x-3">
            <button type="button" @click="showEditModal = false" class="btn btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary flex-1" :disabled="isUpdating">
              {{ isUpdating ? 'Updating...' : 'Update Profile' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showCreateIdeaModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Create New Idea</h3>
        
        <form @submit.prevent="createIdea" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Title</label>
            <input v-model="newIdea.title" type="text" required class="input" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Description</label>
            <textarea v-model="newIdea.description" required class="textarea" rows="4"></textarea>
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
            <button type="submit" class="btn btn-primary flex-1" :disabled="isCreating">
              {{ isCreating ? 'Creating...' : 'Create Idea' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore, type Idea, type Project } from '../../stores/app'
import { useBlockchainStore } from '../../stores/blockchain'

const route = useRoute()
const appStore = useAppStore()
const blockchainStore = useBlockchainStore()

// State
const activeTab = ref('ideas')
const showEditModal = ref(false)
const showCreateIdeaModal = ref(false)
const showCreateProjectModal = ref(false)
const isUpdating = ref(false)
const isCreating = ref(false)

const editForm = ref({
  name: '',
  bio: '',
  skills: ''
})

const newIdea = ref({
  title: '',
  description: '',
  category: ''
})

// Computed
const userId = computed(() => route.params.id as string || appStore.currentUser?.id)
const isOwnProfile = computed(() => userId.value === appStore.currentUser?.id)

const userProfile = computed(() => {
  if (userId.value === appStore.currentUser?.id) {
    return appStore.currentUser
  }
  // In a real app, fetch user by ID from API
  return {
    id: userId.value,
    address: '0x' + '0'.repeat(40),
    type: 'innovator' as const,
    name: 'Sample User',
    email: 'user@example.com',
    reputation: 85,
    skills: ['AI/ML', 'Blockchain', 'Product Management'],
    bio: 'Passionate innovator with expertise in emerging technologies.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  }
})

const userIdeas = computed(() => {
  if (isOwnProfile.value) {
    return appStore.userIdeas
  }
  // Filter ideas by user ID
  return appStore.ideas.filter(idea => idea.creator.id === userId.value)
})

const userProjects = computed(() => {
  if (isOwnProfile.value) {
    return appStore.userProjects
  }
  // Filter projects by user ID
  return appStore.projects.filter(project => 
    project.creator.id === userId.value || project.executor?.id === userId.value
  )
})

const userStats = computed(() => {
  const ideas = userIdeas.value.length
  const projects = userProjects.value.length
  const funding = userIdeas.value.reduce((sum, idea) => sum + idea.totalFunding, 0)
  const royalties = funding * 0.05 // 5% royalties
  
  return { ideas, projects, funding, royalties }
})

const tabs = computed(() => [
  { id: 'ideas', name: 'Ideas', count: userIdeas.value.length },
  { id: 'projects', name: 'Projects', count: userProjects.value.length },
  { id: 'activity', name: 'Activity', count: userActivity.value.length }
])

const userActivity = ref([
  {
    id: '1',
    description: 'Created new idea: AI-Powered Personal Finance Manager',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '2',
    description: 'Received funding of 1.5 ETH for Sustainable Urban Farming Platform',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: '3',
    description: 'Completed milestone: Market Research for FinTech App',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  }
])

// Methods
const updateProfile = async () => {
  isUpdating.value = true
  try {
    // In a real app, call API to update profile
    const skills = editForm.value.skills.split(',').map(s => s.trim()).filter(Boolean)
    
    if (appStore.currentUser) {
      appStore.setCurrentUser({
        ...appStore.currentUser,
        name: editForm.value.name,
        bio: editForm.value.bio,
        skills
      })
    }
    
    showEditModal.value = false
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully!'
    })
  } catch (error) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Update Failed',
      message: error instanceof Error ? error.message : 'Failed to update profile'
    })
  } finally {
    isUpdating.value = false
  }
}

const createIdea = async () => {
  if (!blockchainStore.isConnected) return
  
  isCreating.value = true
  try {
    const tokenURI = `ipfs://${Date.now()}`
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
        title: 'Idea Created',
        message: 'Your idea has been created and NFT minted successfully!'
      })
      
      showCreateIdeaModal.value = false
      newIdea.value = { title: '', description: '', category: '' }
    }
  } catch (error) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Creation Failed',
      message: error instanceof Error ? error.message : 'Failed to create idea'
    })
  } finally {
    isCreating.value = false
  }
}

const viewIdea = (idea: Idea) => {
  // Navigate to idea detail
  console.log('View idea:', idea)
}

const editIdea = (idea: Idea) => {
  // Show edit idea modal
  console.log('Edit idea:', idea)
}

const viewProject = (project: Project) => {
  // Navigate to project detail
  console.log('View project:', project)
}

const editProject = (project: Project) => {
  // Show edit project modal
  console.log('Edit project:', project)
}

const contactUser = () => {
  // Show contact modal or navigate to contact page
  console.log('Contact user:', userProfile.value?.name)
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
  if (!address) return 'Unknown'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const formatEth = (amount: number) => {
  return amount.toFixed(4)
}

onMounted(() => {
  // Initialize edit form with current user data
  if (appStore.currentUser) {
    editForm.value = {
      name: appStore.currentUser.name,
      bio: appStore.currentUser.bio,
      skills: appStore.currentUser.skills.join(', ')
    }
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
