<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppStore } from './stores/app'
import { useBlockchainStore } from './stores/blockchain'
import { useAuthStore } from './stores/auth'
import AuthModal from './components/shared/AuthModal.vue'

const appStore = useAppStore()
const blockchainStore = useBlockchainStore()
const authStore = useAuthStore()

const showAuthModal = ref(false)

const connectWallet = async () => {
  try {
    await blockchainStore.connectWallet()
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Wallet Connected',
      message: 'Successfully connected to Base testnet'
    })
  } catch (error) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Connection Failed',
      message: error instanceof Error ? error.message : 'Failed to connect wallet'
    })
  }
}

const formatAddress = (address: string | null) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const handleAuthSuccess = () => {
  appStore.addNotification({
    id: Date.now().toString(),
    type: 'success',
    title: 'Welcome!',
    message: 'Successfully authenticated'
  })
}

onMounted(() => {
  // Initialize auth state
  authStore.initializeAuth()
  
  // Auto-connect if wallet was previously connected
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet()
  }
})
</script>

<template>
  <div id="app" class="min-h-screen bg-secondary-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm border-b border-secondary-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">F</span>
              </div>
              <span class="text-xl font-bold text-gradient">Foundling</span>
            </router-link>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <router-link 
              to="/" 
              class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-primary-600"
            >
              Home
            </router-link>
            <router-link 
              to="/marketplace" 
              class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-primary-600"
            >
              Marketplace
            </router-link>
            <router-link 
              to="/profile" 
              class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-primary-600"
            >
              Profile
            </router-link>
            <router-link 
              to="/tools" 
              class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-primary-600"
            >
              Tools
            </router-link>
          </div>

          <!-- Authentication & Wallet Connection -->
          <div class="flex items-center space-x-4">
            <!-- Auth Buttons -->
            <div v-if="!authStore.isAuthenticated" class="flex items-center space-x-3">
              <button 
                @click="showAuthModal = true"
                class="btn btn-outline"
              >
                Sign In
              </button>
              <button 
                @click="showAuthModal = true"
                class="btn btn-primary"
              >
                Sign Up
              </button>
            </div>
            
            <!-- User Menu -->
            <div v-else class="flex items-center space-x-3">
              <div class="text-sm text-secondary-600">
                {{ authStore.user?.name || 'User' }}
              </div>
              <div class="badge badge-secondary">{{ authStore.userType }}</div>
              <button 
                @click="authStore.logout"
                class="btn btn-outline text-sm"
              >
                Sign Out
              </button>
            </div>
            
            <!-- Wallet Connection -->
            <div class="border-l border-secondary-200 pl-4">
              <div v-if="blockchainStore.isConnected" class="flex items-center space-x-3">
                <div class="text-sm text-secondary-600">
                  {{ formatAddress(blockchainStore.currentAccount) }}
                </div>
                <div class="text-sm font-medium text-primary-600">
                  {{ blockchainStore.balance }} ETH
                </div>
                <button 
                  @click="blockchainStore.disconnectWallet"
                  class="btn btn-outline text-sm"
                >
                  Disconnect
                </button>
              </div>
              <button 
                v-else
                @click="connectWallet"
                class="btn btn-primary"
                :disabled="blockchainStore.isLoading"
              >
                <span v-if="blockchainStore.isLoading">Connecting...</span>
                <span v-else>Connect Wallet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-secondary-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Foundling</h3>
            <p class="text-secondary-600 text-sm">
              The Autonomous Venture Studio - Where brilliant ideas meet execution power through AI-driven matching and onchain monetization.
            </p>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-secondary-900 mb-4">Platform</h4>
            <ul class="space-y-2 text-sm text-secondary-600">
              <li><router-link to="/marketplace" class="hover:text-primary-600">Marketplace</router-link></li>
              <li><router-link to="/tools" class="hover:text-primary-600">Tools</router-link></li>
              <li><router-link to="/profile" class="hover:text-primary-600">Profiles</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-secondary-900 mb-4">Resources</h4>
            <ul class="space-y-2 text-sm text-secondary-600">
              <li><a href="https://docs.cdp.coinbase.com/" target="_blank" class="hover:text-primary-600">CDP Docs</a></li>
              <li><a href="https://base.org" target="_blank" class="hover:text-primary-600">Base Network</a></li>
              <li><a href="https://x402.org" target="_blank" class="hover:text-primary-600">x402 Protocol</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-secondary-900 mb-4">Connect</h4>
            <ul class="space-y-2 text-sm text-secondary-600">
              <li><a href="#" class="hover:text-primary-600">Discord</a></li>
              <li><a href="#" class="hover:text-primary-600">Twitter</a></li>
              <li><a href="#" class="hover:text-primary-600">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-secondary-200 text-center text-sm text-secondary-600">
          <p>&copy; 2024 Foundling. Built on Base with CDP integration.</p>
        </div>
      </div>
    </footer>

    <!-- Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div 
        v-for="notification in appStore.notifications" 
        :key="notification.id"
        class="bg-white border border-secondary-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-up"
      >
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div 
              v-if="notification.type === 'success'"
              class="w-5 h-5 text-success-500"
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div 
              v-else-if="notification.type === 'error'"
              class="w-5 h-5 text-error-500"
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div 
              v-else
              class="w-5 h-5 text-primary-500"
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-secondary-900">{{ notification.title }}</p>
            <p class="text-sm text-secondary-600">{{ notification.message }}</p>
          </div>
          <button 
            @click="appStore.removeNotification(notification.id)"
            class="flex-shrink-0 text-secondary-400 hover:text-secondary-600"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal 
      :is-open="showAuthModal"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<style scoped>
.router-link-active {
  @apply text-primary-600;
}
</style>
