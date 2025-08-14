<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-secondary-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-secondary-900">
              {{ isLogin ? 'Sign In' : 'Create Account' }}
            </h3>
            <button @click="closeModal" class="text-secondary-400 hover:text-secondary-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="border-b border-secondary-200 mb-6">
            <nav class="-mb-px flex space-x-8">
              <button 
                @click="isLogin = true"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  isLogin
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                ]"
              >
                Sign In
              </button>
              <button 
                @click="isLogin = false"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  !isLogin
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                ]"
              >
                Sign Up
              </button>
            </nav>
          </div>

          <!-- Login Form -->
          <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Email</label>
              <input 
                v-model="loginForm.email" 
                type="email" 
                required 
                class="input w-full" 
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Password</label>
              <input 
                v-model="loginForm.password" 
                type="password" 
                required 
                class="input w-full" 
                placeholder="Enter your password"
              />
            </div>

            <div v-if="authStore.error" class="text-error-600 text-sm">
              {{ authStore.error }}
            </div>

            <button 
              type="submit" 
              class="btn btn-primary w-full" 
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading">Signing In...</span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <!-- Signup Form -->
          <form v-else @submit.prevent="handleSignup" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Email</label>
              <input 
                v-model="signupForm.email" 
                type="email" 
                required 
                class="input w-full" 
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Password</label>
              <input 
                v-model="signupForm.password" 
                type="password" 
                required 
                class="input w-full" 
                placeholder="Enter your password (min 6 characters)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Name</label>
              <input 
                v-model="signupForm.name" 
                type="text" 
                class="input w-full" 
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">User Type</label>
              <select v-model="signupForm.type" class="select w-full">
                <option value="hybrid">Hybrid (Innovator + Executor + Funder)</option>
                <option value="innovator">Innovator (Idea Creator)</option>
                <option value="executor">Executor (Builder)</option>
                <option value="funder">Funder (Investor)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Bio</label>
              <textarea 
                v-model="signupForm.bio" 
                class="textarea w-full" 
                rows="3" 
                placeholder="Tell us about yourself"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Skills (comma-separated)</label>
              <input 
                v-model="signupForm.skillsInput" 
                type="text" 
                class="input w-full" 
                placeholder="e.g., React, Solidity, Marketing"
              />
            </div>

            <div v-if="authStore.error" class="text-error-600 text-sm">
              {{ authStore.error }}
            </div>

            <button 
              type="submit" 
              class="btn btn-primary w-full" 
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading">Creating Account...</span>
              <span v-else>Create Account</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()

// Form state
const isLogin = ref(true)
const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  email: '',
  password: '',
  name: '',
  type: 'hybrid' as 'innovator' | 'executor' | 'funder' | 'hybrid',
  bio: '',
  skillsInput: ''
})

// Computed
const skills = computed(() => 
  signupForm.value.skillsInput
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0)
)

// Methods
const closeModal = () => {
  emit('close')
}

const handleLogin = async () => {
  try {
    await authStore.login(loginForm.value)
    emit('success')
    closeModal()
  } catch (error) {
    console.error('Login failed:', error)
  }
}

const handleSignup = async () => {
  try {
    const signupData = {
      ...signupForm.value,
      skills: skills.value
    }
    delete signupData.skillsInput
    
    await authStore.signup(signupData)
    emit('success')
    closeModal()
  } catch (error) {
    console.error('Signup failed:', error)
  }
}

// Watch for modal close to reset forms
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    loginForm.value = { email: '', password: '' }
    signupForm.value = {
      email: '',
      password: '',
      name: '',
      type: 'hybrid',
      bio: '',
      skillsInput: ''
    }
    authStore.error = null
  }
})
</script>
