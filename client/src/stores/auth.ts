import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Types
export interface User {
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

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name?: string
  bio?: string
  type?: 'innovator' | 'executor' | 'funder' | 'hybrid'
  address?: string
  skills?: string[]
}

// Store
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userType = computed(() => user.value?.type || 'hybrid')

  // API base URL
  const API_BASE = 'http://localhost:3001'

  // Helper function to make API calls
  async function apiCall(endpoint: string, operation: string, data: any = {}) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: operation,
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

  // Authentication actions
  async function login(credentials: LoginRequest) {
    try {
      const result = await apiCall('/auth', 'login', credentials)
      
      token.value = result.token
      user.value = {
        id: result.userId,
        email: credentials.email,
        name: 'User', // Will be loaded from profile
        bio: '',
        type: 'hybrid',
        address: '',
        skills: [],
        reputation: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Store token in localStorage
      localStorage.setItem('foundling_token', result.token)
      
      return result
    } catch (err) {
      throw err
    }
  }

  async function signup(userData: SignupRequest) {
    try {
      const result = await apiCall('/auth', 'signup', userData)
      
      // Auto-login after successful signup
      if (result.success) {
        await login({
          email: userData.email,
          password: userData.password
        })
      }
      
      return result
    } catch (err) {
      throw err
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await apiCall('/auth', 'logout', {}, token.value)
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear local state
      token.value = null
      user.value = null
      localStorage.removeItem('foundling_token')
    }
  }

  async function deleteAccount() {
    try {
      if (token.value) {
        await apiCall('/auth', 'delete', {}, token.value)
        await logout()
      }
    } catch (err) {
      throw err
    }
  }

  // Load user profile
  async function loadUserProfile() {
    if (!token.value || !user.value) return

    try {
      const response = await fetch(`${API_BASE}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({
          operation: 'getById',
          userId: user.value.id
        })
      })

      const result = await response.json()
      if (result.success) {
        user.value = result.user
      }
    } catch (err) {
      console.error('Failed to load user profile:', err)
    }
  }

  // Initialize auth state from localStorage
  function initializeAuth() {
    const storedToken = localStorage.getItem('foundling_token')
    if (storedToken) {
      token.value = storedToken
      // Note: User profile will need to be loaded separately
      // This is a simplified approach - in production you'd want to validate the token
    }
  }

  // Clear store
  function clearStore() {
    user.value = null
    token.value = null
    error.value = null
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Computed
    isAuthenticated,
    userType,
    
    // Actions
    login,
    signup,
    logout,
    deleteAccount,
    loadUserProfile,
    initializeAuth,
    clearStore
  }
})
